import { PlusOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { Button, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
import { SortOrder } from 'antd/es/table/interface';
import { Patient, Location, Encounter, Condition } from 'fhir/r4b';
import _ from 'lodash';
import { Link } from 'react-router-dom';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';



import { SearchBarColumn, SearchBarColumnType } from '../../../dist/components/SearchBar/types';
import { questionnaireAction, ResourceListPage } from '@beda.software/emr/uberComponents';
import { formatHumanDate, getYears, renderHumanName, resolveReference } from '@beda.software/emr/utils';
import { getUserRol } from './utils';
import {
    admissionEncounterClassCode,
    extractAdmissionEncounters,
    extractAdmissionEncountersEmpty,
    extractVisitEncountersByAdmission,
    getDaysInTheFacility,
} from 'src/utils-frontend/encounter';
import { getPatientDNRCode, getPatientMRN } from 'src/utils-frontend/patient';
import { getAuthorizationStatus, getPayerSource } from './utils';

interface RecordType<T> {
    resource: T;
    bundle: any;
}




class QueryCache {
    private cache: Map<string, any>;
    private maxSize: number;
    private keys: string[];

    constructor(maxSize = 10) {
        this.cache = new Map();
        this.maxSize = maxSize;
        this.keys = [];
    }

    has(key: string): boolean {
        return this.cache.has(key);
    }

    get(key: string): any {

        this.keys = this.keys.filter(k => k !== key);
        this.keys.push(key);
        return this.cache.get(key);
    }

    set(key: string, value: any): void {
        if (this.keys.length >= this.maxSize && !this.cache.has(key)) {

            const oldestKey = this.keys.shift();
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }


        if (!this.cache.has(key)) {
            this.keys.push(key);
        } else {

            this.keys = this.keys.filter(k => k !== key);
            this.keys.push(key);
        }

        this.cache.set(key, value);
    }

    clear(): void {
        this.cache.clear();
        this.keys = [];
    }

    public clearEntry(key: string): void {
        this.cache.delete(key);
        this.keys = this.keys.filter(k => k !== key);
    }
}


const queryCache = new QueryCache(15);

export function PatientList() {
    const [role, setRole] = useState<string>('');
    const [isFacilitySelected, setIsFacilitySelected] = useState(false)
    const [sortField, _setSortField] = useState<string>('patient-name');
    const [sortOrder, _setSortOrder] = useState<'ascend' | 'descend'>('ascend');

    const isMounted = useRef<boolean>(true);



    useEffect(() => {
        loadRole();
        return () => {
            isMounted.current = false;
        };
    }, []);

    const loadRole = async (): Promise<void> => {
        setRole(await getUserRol());
    };
    const handleFacilityFilterChange = (value: boolean) => {
        setIsFacilitySelected(value);
    }
    const createCacheKey = useCallback((params: any): string => {

        const ordered = Object.keys(params).sort().reduce(
            (obj: any, key: string) => {
                obj[key] = params[key];
                return obj;
            },
            {}
        );
        return JSON.stringify(ordered);
    }, []);


    const getCurrentSearchParams = useCallback((): any => {

        const sortPrefix = sortOrder === 'descend' ? '-' : '';

        return {
            _revinclude: ['Encounter:part-of:Encounter'],
            _include: [
                'Encounter:location',
                'Encounter:patient',
                'Encounter:diagnosis:Condition',
                'Encounter:account:Account',
                'Account:coverage:Coverage',
                'Coverage:payor:Organization',
            ],
            class: admissionEncounterClassCode,
            _sort: `${sortPrefix}${sortField}`,
            _count: 500,
            _total: 'accurate',
        };
    }, [sortField, sortOrder]);


    const invalidateCache = useCallback((action: 'all' | 'current-page' = 'all'): void => {
        if (action === 'all') {
            queryCache.clear();
        } else if (action === 'current-page') {
            const currentParams = getCurrentSearchParams();
            const cacheKey = createCacheKey(currentParams);

            if (queryCache.has(cacheKey)) {
                queryCache.clearEntry(cacheKey);
            }
        }
    }, [createCacheKey, getCurrentSearchParams]);

    const tableColumns = useMemo<ColumnsType<RecordType<Encounter>>>(() => [
        {
            title: <Trans>Patient</Trans>,
            dataIndex: 'patient-name',
            key: 'patient-name',
            width: 160,
            defaultSortOrder: 'ascend' as SortOrder,
            sorter: () => 1,
            sortDirections: ['ascend', 'descend'],
            render: (_text: any, { resource, bundle }: RecordType<Encounter>) => {
                const patient = resolveReference<Patient>(bundle, resource.subject!)!;
                return (
                    <Link to={`/patients/${patient.id}`}>
                        <Button style={{ padding: 0 }} type="link">
                            {renderHumanName(patient.name?.[0])}
                        </Button>
                    </Link>
                );
            },
        },
        {
            title: <Trans>MRN</Trans>,
            dataIndex: 'patient-identifier',
            key: 'patient-identifier',
            render: (_text: any, { resource, bundle }: any) => {
                const patient = resolveReference<Patient>(bundle, resource.subject!)!;
                return getPatientMRN(patient);
            },
        },
        {
            title: <Trans>DOB</Trans>,
            dataIndex: 'patient-birthDate',
            key: 'patient-birthDate',
            width: 110,
            render: (_text: any, { resource, bundle }: any) => {
                const patient = resolveReference<Patient>(bundle, resource.subject!)!;
                return patient.birthDate ? formatHumanDate(patient.birthDate) : null;
            },
        },
        {
            title: <Trans>Age</Trans>,
            dataIndex: 'patient-age',
            key: 'patient-age',
            width: 54,
            render: (_text: any, { resource, bundle }: any) => {
                const patient = resolveReference<Patient>(bundle, resource.subject!)!;
                return patient.birthDate ? getYears(patient.birthDate) : null;
            },
        },
        {
            title: <Trans>Room</Trans>,
            dataIndex: 'encounter-location',
            key: 'encounter-location',
            width: 100,
            render: (_text: any, { resource, bundle }: any) => {
                const locationRef = resource.location?.[0]?.location;
                if (!locationRef) {
                    return null;
                }

                const location = resolveReference(bundle, locationRef) as Location | undefined;
                if (!location) {
                    return null;
                }

                return location.name;
            },
        },
        {
            title: <Trans>Date of last consult</Trans>,
            dataIndex: 'last-visit-date',
            key: 'last-visit-date',
            width: 120,
            render: (_text: any, { resource, bundle }: any) => {
                const completedVisitEncounters = extractVisitEncountersByAdmission(resource)(bundle).filter(
                    (visitEncounter: any) => visitEncounter.status === 'finished',
                );
                const visitEncounterDates = completedVisitEncounters
                    .map((visitEncounter: any) => visitEncounter.period?.start)
                    .filter((x: any) => !!x);
                const lastVisitEncounterDate = _.max(visitEncounterDates);
                return lastVisitEncounterDate ? formatHumanDate(lastVisitEncounterDate) : '-';
            },
        },
        {
            title: <Trans>Facility</Trans>,
            dataIndex: 'facility',
            key: 'facility',
            width: 132,
            render: (_text: any, { resource }: any) => {
                return resource.serviceProvider?.display;
            },
        },
        {
            title: <Trans>Days in facility</Trans>,
            dataIndex: 'admission-encounter-age',
            key: 'admission-encounter-age',
            width: 92,
            render: (_text: any, { resource }: any) => {
                return getDaysInTheFacility(resource) ?? '-';
            },
        },
        {
            title: <Trans>Diagnoses</Trans>,
            dataIndex: 'admission-encounter-conditions',
            key: 'admission-encounter-conditions',
            render: (_text: any, { resource, bundle }: any) => {
                const conditionRefs = resource.diagnosis
                    ?.filter((diagnosis: any) => diagnosis.use?.coding?.[0]?.code === 'AD')
                    .map((diagnosis: any) => diagnosis.condition);

                return conditionRefs
                    ?.map(
                        (conditionRef: any) =>
                            resolveReference<Condition>(bundle, conditionRef)?.code?.coding?.[0]?.code,
                    )
                    .filter((x: any) => !!x)
                    .join(', ');
            },
        },
        {
            title: <Trans>Code Status</Trans>,
            dataIndex: 'patient-dnr',
            key: 'patient-dnr',
            width: 54,
            render: (_text: any, { resource, bundle }: any) => {
                const patient = resolveReference<Patient>(bundle, resource.subject!)!;
                return getPatientDNRCode(patient);
            },
        },
        {
            title: <Trans>Payer source</Trans>,
            dataIndex: 'payer-source',
            key: 'payer-source',
            render: (_text: any, { resource, bundle }: any) => getPayerSource(resource, bundle)?.name,
        },
        {
            title: <Trans>Insurance Authorization</Trans>,
            dataIndex: 'insurance-authorization',
            key: 'insurance-authorization',
            width: 130,
            render: (_text: any, { resource, bundle }: any) => getAuthorizationStatus(resource, bundle),
        },
        {
            title: <Trans>Type of Care</Trans>,
            dataIndex: 'admission-encounter-type',
            key: 'admission-encounter-type',
            width: 90,
            render: (_text: any, { resource }: any) => {
                return resource.type?.[0]?.coding?.[0]?.display;
            },
        },
    ], []);


    const filters = useMemo<SearchBarColumn[]>(() => [
        {
            id: 'service-provider',
            searchParam: 'service-provider',
            type: SearchBarColumnType.REFERENCE,
            placeholder: t`Choose the facility`,
            expression: 'Organization?type=dept',
            path: 'name',
        },
        {
            id: 'admission-encounter-type',
            searchParam: 'type',
            type: SearchBarColumnType.CHOICE,
            placeholder: t`Choose type of care`,
            options: [
                {
                    value: {
                        Coding: {
                            code: 'SKILLED',
                            display: 'Skilled',
                        },
                    },
                },
                {
                    value: {
                        Coding: {
                            code: 'LTC',
                            display: t`LTC`,
                        },
                    },
                },
                {
                    value: {
                        Coding: {
                            code: 'HOSPICE',
                            display: 'Hospice',
                        },
                    },
                },
                {
                    value: {
                        Coding: {
                            code: 'VETERAN',
                            display: 'Veteran',
                        },
                    },
                },
                {
                    value: {
                        Coding: {
                            code: 'N/A',
                            display: 'N/A',
                        },
                    },
                },
            ],
        },
        {
            id: 'custom-status',
            searchParam: 'custom-status',
            type: SearchBarColumnType.SOLIDCHOICE,
            placeholder: t`Status`,
            options: [
                {
                    code: 'without-visits',
                    display: t`New`,
                },
                {
                    code: 'in-progress',
                    display: t`Active`,
                },
                {
                    code: 'finished',
                    display: t`Discharged`,
                },
            ],
            defaultValue: {
                code: 'without-visits',
                display: t`New`,
            },
        },
        {
            id: 'patient-name',
            searchParam: 'patient',
            type: SearchBarColumnType.REFERENCE,
            placeholder: t`Choose patient`,
            expression: 'Patient',
            path: `name.given.first() + ' ' + name.family.first()`,
        },
        {
            id: 'patient-identifier',
            searchParam: 'patient:Patient.identifier',
            type: SearchBarColumnType.STRING,
            placeholder: t`Enter mrn`,
        },
        {
            id: 'patient-birthDate',
            searchParam: 'patient:Patient.birthdate',
            type: SearchBarColumnType.SINGLEDATE,
            placeholder: t`Birth date`,
        },
        {
            id: 'encounter-location',
            searchParam: 'location',
            type: SearchBarColumnType.REFERENCE,
            placeholder: t`Choose room`,
            expression: 'Location',
            path: `alias.first()`,
        },
        {
            id: 'payer-source',
            searchParam: 'account:Account.coverage:Coverage.payor:Organization.id',
            type: SearchBarColumnType.REFERENCE,
            placeholder: t`Choose payer source`,
            path: 'name',
            expression: 'Organization?type=ins',
        },
        {
            id: 'patient-dnr',
            searchParam: 'patient-dnr-code',
            type: SearchBarColumnType.CHOICE,
            placeholder: t`Choose code status`,
            options: [
                {
                    value: {
                        Coding: {
                            code: 'DNR',
                            display: 'DNR',
                        },
                    },
                },
                {
                    value: {
                        Coding: {
                            code: 'full',
                            display: 'Full',
                        },
                    },
                },
                {
                    value: {
                        Coding: {
                            code: 'dni',
                            display: 'DNI',
                        },
                    },
                },
            ],
        },
        {
            id: 'insurance-authorization',
            searchParam: 'coverage-authorization-status',
            type: SearchBarColumnType.CHOICE,
            placeholder: t`Choose Insurance Authorization`,
            options: [
                {
                    value: {
                        Coding: {
                            code: 'to-be-requested',
                            display: 'To be requested',
                        },
                    },
                },
                {
                    value: {
                        Coding: {
                            code: 'requested',
                            display: 'Requested',
                        },
                    },
                },
                {
                    value: {
                        Coding: {
                            code: 'approved',
                            display: 'Approved',
                        },
                    },
                },
                {
                    value: {
                        Coding: {
                            code: 'denied',
                            display: 'Denied',
                        },
                    },
                },
            ],
        },
    ], [invalidateCache]);


    const batchActions = useCallback(() => [
        {
            ...questionnaireAction(t`Send to census`, 'visit-encounter-batch-create'),
            onComplete: () => {

                invalidateCache('current-page');
                message.success('Successfully sent to census');
            }
        }
    ], [invalidateCache]);

    const headerActions = useCallback(() => [
        {
            ...questionnaireAction(t`Add patient`, 'admission-encounter-create', { icon: <PlusOutlined /> }),
            onComplete: () => {

                invalidateCache();
                message.success('Patient added successfully');
            }
        }
    ], [invalidateCache]);



    return (
        <ResourceListPage<Encounter>
            headerTitle={t`Patients`}
            maxWidth="100%"
            resourceType="Encounter"
            extractPrimaryResources={isFacilitySelected ? extractAdmissionEncounters : extractAdmissionEncountersEmpty}
            searchParams={getCurrentSearchParams()}
            getTableColumns={() => tableColumns}
            getFilters={() => filters}

            {...(['admission-encounter-age', 'patient-birthDate'].includes(sortField) ? {
                showPagination: false,
                pagination: false
            } : {

                paginationProps: {
                    pageSizeOptions: ['10', '20', '50', '100'],
                    defaultPageSize: 20,
                    showSizeChanger: true,
                }
            })}
            {...(role === 'subAdmin' || role === 'admin' ? {
                getRecordActions: () => [
                    {
                        ...questionnaireAction(t`Remove`, 'admission-encounter-delete'),
                        onComplete: () => invalidateCache('current-page')
                    }
                ]
            } : {})}
            getHeaderActions={headerActions}
            getBatchActions={batchActions}
            handleFacilityFilterChange={handleFacilityFilterChange}
            filterID='service-provider'
        />
    );
}