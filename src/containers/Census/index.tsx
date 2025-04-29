import { PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { t, Trans } from '@lingui/macro';
import { Button } from 'antd';
import { Patient, Location, Encounter, Condition, Organization } from 'fhir/r4b';
import _ from 'lodash';
import moment from 'moment';
import { useCallback, useState, useEffect, useRef, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SortOrder as AntSortOrder } from 'antd/es/table/interface';

import { SearchBarColumn, SearchBarColumnType } from '@beda.software/emr/dist/components/SearchBar/types';
import { questionnaireAction, ResourceListPage, exportAction } from '@beda.software/emr/uberComponents';
import { formatHumanDate, renderHumanName, resolveReference } from '@beda.software/emr/utils';
import { parseFHIRDateTime } from '@beda.software/fhir-react';
import { 
    getFacilityFromEncounterAddPatientNotAssigned, 
    getRoomFromEncounterAddPatientNotAssigned 
} from 'src/utils-frontend/encounter'
import { stringFormatDateTime } from 'src/utils-frontend/date';
import {
    admissionEncounterClassCode,
    extractVisitEncounters,
    getStatusPRM,
    getReasonNotSeen,
    getReportType,
    getProvider,
    getTypeOfVisit,
    getStatusAudit,
    getReportTypeAudit,
    DateExported,
} from 'src/utils-frontend/encounter';
import { getPatientDNRCode } from 'src/utils-frontend/patient';
import { matchCurrentUserRole, Role } from 'src/utils-frontend/role';
import { getUserRol, exportToExcelPRM, exportToExcelAudit } from './hook';

// Defining an enum for the sort order values
enum SortOrder {
    ASCEND = 'ascend',
    DESCEND = 'descend',
}

function sortByFieldParser(field: string, sortOrder: SortOrder) {
    return sortOrder === SortOrder.ASCEND ? `${field}` : `-${field}`;
}

export function Census() {
    const [rol, setRol] = useState('');
    const [rolPRM, setRolPRM] = useState<boolean>(false);

    const selectedResourceRef = useRef<Encounter | null>(null);
    const [sortField, setSortField] = useState<string>('patient-name');
    const [sortOrder, setSortOrder] = useState<SortOrder>(SortOrder.ASCEND);

    const defaultPractitionerRef = matchCurrentUserRole({
        [Role.Admin]: () => undefined,
        [Role.Census]: () => undefined,
        [Role.Practitioner]: (practitioner) => ({
            id: practitioner?.id,
            resourceType: 'Practitioner',
            display: renderHumanName(practitioner?.name![0]),
        }),
        [Role.Scriber]: () => undefined,
        [Role.QA]: () => undefined,
        [Role.Billing]: () => undefined,
        [Role.Admin1]: () => undefined,
        [Role.Prm]: () => undefined,
        [Role.Audit]: () => undefined,
    });

    const onHeaderCellClick = useCallback(
        (field: string) => {
            return () => {
                const newOrder =
                    field === sortField && sortOrder === SortOrder.ASCEND ? SortOrder.DESCEND : SortOrder.ASCEND;
                setSortField(field);
                setSortOrder(newOrder);
            };
        },
        [sortField, sortOrder, setSortField, setSortOrder],
    );

    useEffect(() => {
        const fetchRole = async () => {
            const role = await getUserRol();
            setRol(role);
            setRolPRM(role === 'PRM');
        };
        fetchRole();
    }, []);

    const storeSelectedResource = (resource: Encounter) => {
        selectedResourceRef.current = resource;
    };

    const searchBarColumns = useMemo(() => {
        return [
            {
                id: 'service-provider',
                searchParam: 'service-provider',
                type: SearchBarColumnType.REFERENCE,
                placeholder: t`Choose the facility`,
                expression: 'Organization?type=dept',
                path: 'name',
                placement: ['modal'],
            },
            defaultPractitionerRef === undefined
                ? {
                    id: 'participant',
                    searchParam: 'participant',
                    type: SearchBarColumnType.REFERENCE,
                    placeholder: t`Choose the practitioner`,
                    expression: 'Practitioner?_has:PractitionerRole:practitioner:role=practitioner',
                    path: `name.given.first() + ' ' + name.family.first()`,
                    defaultValue: defaultPractitionerRef,
                    placement: ['modal'],
                }
                : {
                    id: 'participant-only',
                    searchParam: 'participant',
                    type: SearchBarColumnType.REFERENCE,
                    placeholder: t`Choose the practitioner`,
                    expression: defaultPractitionerRef?.id
                        ? `Practitioner?_has:PractitionerRole:practitioner:role=practitioner&_id=${defaultPractitionerRef?.id}`
                        : 'Practitioner?_has:PractitionerRole:practitioner:role=practitioner',
                    path: `name.given.first() + ' ' + name.family.first()`,
                    defaultValue: defaultPractitionerRef,
                    placement: ['modal'],
                },
            {
                id: 'service-type',
                searchParam: 'service-type',
                type: SearchBarColumnType.CHOICE,
                placeholder: t`Choose type of visit`,
                valueSet: 'https://nexushealthproject.com/ValueSet/visit-type-codes',
                placement: ['modal'],
            },
            {
                id: 'date',
                searchParam: 'date',
                type: SearchBarColumnType.SINGLEDATE,
                placeholder: t`Date`,
                defaultValue: moment(),
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
                placement: ['modal'],
            },
            {
                id: 'status',
                searchParam: 'status',
                type: SearchBarColumnType.CHOICE,
                placeholder: t`Choose Status`,
                options: [
                    {
                        value: {
                            Coding: {
                                code: 'planned',
                                display: 'Scheduled',
                            },
                        },
                    },
                    {
                        value: {
                            Coding: {
                                code: 'finished',
                                display: 'Completed',
                            },
                        },
                    },
                    {
                        value: {
                            Coding: {
                                code: 'cancelled',
                                display: 'Not seen',
                            },
                        },
                    },
                    {
                        value: {
                            Coding: {
                                code: 'in-progress',
                                display: 'Note in Progress',
                            },
                        },
                    },
                ],
            },
            {
                id: 'status-prm',
                searchParam: 'statusPRM',
                type: SearchBarColumnType.CHOICE,
                placeholder: t`Choose status PRM`,
                options: [
                    {
                        value: {
                            Coding: {
                                code: 'Claim Sent',
                                display: 'Claim Sent',
                            },
                        },
                    },
                    {
                        value: {
                            Coding: {
                                code: 'Claim Approved',
                                display: 'Claim Approved',
                            },
                        },
                    },
                    {
                        value: {
                            Coding: {
                                code: 'Claim Rejected',
                                display: 'Claim Rejected',
                            },
                        },
                    },
                    {
                        value: {
                            Coding: {
                                code: 'Unable to Claim',
                                display: 'Unable to Claim',
                            },
                        },
                    },
                    {
                        value: {
                            Coding: {
                                code: 'Pending Claim',
                                display: 'Pending Claim',
                            },
                        },
                    },
                ],
            },

            rolPRM && {
                id: 'export-status',
                searchParam: 'exportStatus',
                type: SearchBarColumnType.CHOICE,
                placeholder: t`Choose export status PRM`,
                options: [
                    {
                        value: {
                            Coding: {
                                code: 'Pending',
                                display: 'Pending',
                            },
                        },
                    },
                    {
                        value: {
                            Coding: {
                                code: 'Exported',
                                display: 'Exported',
                            },
                        },
                    },
                ],
            },
        ].filter(Boolean) as SearchBarColumn[];
    }, [rolPRM]);

    return rol == '' ? (
        <></>
    ) : (
        <ResourceListPage<Encounter>
            headerTitle={t`Census`}
            maxWidth={'100%'}
            resourceType="Encounter"
            extractPrimaryResources={extractVisitEncounters}
            searchParams={{
                status: 'planned,finished,cancelled',
                _include: [
                    'Encounter:part-of:Encounter',
                    'Encounter:location',
                    'Encounter:patient',
                    'Encounter:diagnosis:Condition',
                    'Encounter:account:Account',
                    'Encounter:service-provider',
                    'Encounter:practitioner:Practitioner',
                ],
                _revinclude: ['AuditEvent:entity:Encounter'],
                'class:not': admissionEncounterClassCode,
                'part-of:missing': false,
                _sort: sortByFieldParser(sortField === 'encounter-location' ? 'location' : 'patient-name', sortOrder),
            }}
            getTableColumns={() => [
                {
                    title: <Trans>Patient</Trans>,
                    dataIndex: 'patient-name',
                    key: 'patient-name',
                    width: 160,
                    defaultSortOrder: 'ascend' as AntSortOrder,
                    sorter: true,
                    sortDirections: ['ascend', 'descend'],
                    onHeaderCell: () => ({
                        onClick: onHeaderCellClick('patient-name'),
                    }),

                    render: (_text: any, { resource, bundle }: { resource: any; bundle: any }) => {
                        const patient = resolveReference<Patient>(bundle, resource.subject!)!;
                        return (
                            <Link to={`/patients/${patient?.id}`}>
                                <Button style={{ padding: 0 }} type="link">
                                    {renderHumanName(patient?.name?.[0])}
                                </Button>
                            </Link>
                        );
                    },
                },
                {
                    title: <Trans>Birth date</Trans>,
                    dataIndex: 'patient-birthDate',
                    key: 'patient-birthDate',
                    width: 130,
                    render: (_text: any, { resource, bundle }: { resource: any; bundle: any }) => {
                        const patient = resolveReference<Patient>(bundle, resource.subject!)!;
                        return patient?.birthDate ? formatHumanDate(patient?.birthDate) : null;
                    },
                },
                {
                    title: <Trans>DOS</Trans>,
                    dataIndex: 'visit-encounter-date',
                    key: 'visit-encounter-date',
                    width: 90,
                    render: (_text: any, { resource }: { resource: any }) => {
                        const startDateTime = resource.period!.start!;
                        return stringFormatDateTime(startDateTime);
                    },
                },
                {
                    title: <Trans>Facility</Trans>,
                    dataIndex: 'encounter-organization',
                    key: 'encounter-organization',
                    render: (_text: any, { resource, bundle }: { resource: any; bundle: any }) => {
                        const organizationRef = resource.serviceProvider;
                        if (!organizationRef) {
                            return getFacilityFromEncounterAddPatientNotAssigned(resource.partOf, bundle);
                        }
                        const organization = resolveReference(bundle, organizationRef) as Organization | undefined;
                        if (!organization) {
                            return null;
                        }
                        return organization?.name;
                    },
                },
                {
                    title: <Trans>Room</Trans>,
                    dataIndex: 'encounter-location',
                    key: 'encounter-location',
                    sorter: true,
                    sortDirections: [SortOrder.ASCEND, SortOrder.DESCEND],
                    onHeaderCell: () => ({
                        onClick: onHeaderCellClick('encounter-location'),
                    }),
                    render: (_text: any, { resource, bundle }: { resource: any; bundle: any }) => {
                        const locationRef = resource.location?.[0]?.location;
                        if (!locationRef) {
                            return getRoomFromEncounterAddPatientNotAssigned(resource.partOf, bundle);
                        }
                        const location = resolveReference(bundle, locationRef) as Location | undefined;

                        if (!location) {
                            return null;
                        }

                        return location?.name;
                    },
                },
                {
                    title: <Trans>Problem List</Trans>,
                    dataIndex: 'admission-encounter-diagnoses',
                    key: 'admission-encounter-diagnoses',
                    render: (_text: any, { resource, bundle }: { resource: any; bundle: any }) => {
                        const admissionEncounter = resolveReference<Encounter>(bundle, resource.partOf!)!;

                        const conditionRefs = admissionEncounter?.diagnosis
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
                    title: <Trans>Assessment</Trans>,
                    dataIndex: 'visit-encounter-procedure-codes',
                    key: 'visit-encounter-procedure-codes',
                    render: (_text: any, { resource, bundle }: { resource: any; bundle: any }) => {
                        const conditionRefs = resource?.diagnosis
                            ?.filter((diagnosis: any) => diagnosis.use?.coding?.[0]?.code === 'assessment')
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
                    title: <Trans>CPT</Trans>,
                    dataIndex: 'visit-encounter-procedure-cpt-code',
                    key: 'visit-encounter-procedure-cpt-code',
                    render: (_text: any, { resource, bundle }: { resource: any; bundle: any }) => {
                        const conditionRefs = resource?.diagnosis
                            ?.filter((diagnosis: any) => diagnosis.use?.coding?.[0]?.code === 'billing')
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
                    title: <Trans>Type of care</Trans>,
                    dataIndex: 'admission-encounter-type',
                    key: 'admission-encounter-type',
                    render: (_text: any, { resource, bundle }: { resource: any; bundle: any }) => {
                        const admissionEncounter = resolveReference<Encounter>(bundle, resource.partOf!)!;
                        return admissionEncounter?.type?.[0]?.coding?.[0]?.display;
                    },
                },

                {
                    title: <Trans>Time</Trans>,
                    dataIndex: 'visit-encounter-participant-time',
                    key: 'visit-encounter-participant-time',
                    width: 90,
                    render: (_text: any, { resource }: { resource: any }) => {
                        const startDateTime = resource.participant?.[0]?.period?.start;

                        if (startDateTime) {
                            return parseFHIRDateTime(startDateTime).format('HH:mm');
                        }

                        return '';
                    },
                },
                {
                    title: <Trans>Code Status</Trans>,
                    dataIndex: 'patient-dnr',
                    key: 'patient-dnr',
                    render: (_text: any, { resource, bundle }: { resource: any; bundle: any }) => {
                        const patient = resolveReference<Patient>(bundle, resource.subject!)!;
                        return getPatientDNRCode(patient);
                    },
                },
                {
                    title: <Trans>Chief complaint</Trans>,
                    dataIndex: 'visit-encounter-reason-code',
                    key: 'visit-encounter-reason-code',
                    render: (_text: any, { resource }: { resource: any }) => {
                        return resource.reasonCode?.[0]?.text ?? '';
                    },
                },
                {
                    title: <Trans>Observations</Trans>,
                    dataIndex: 'visit-encounter-reason-code-obervation',
                    key: 'visit-encounter-reason-code-obervation',
                    width: '10%',
                    render: (_text: any, { resource }: { resource: any }) => {
                        if (resource?.statusHistory) {
                            return getReasonNotSeen(resource);
                        }
                    },
                },
                {
                    title: <Trans>Status</Trans>,
                    dataIndex: 'status',
                    key: 'status',
                    render: (_text: any, { resource }: { resource: any }) => {
                        let statusText;
                        switch (resource.status) {
                            case 'cancelled':
                                statusText = 'Not seen';
                                break;
                            case 'finished':
                                statusText = 'Complete';
                                break;
                            case 'planned':
                                statusText = 'Scheduled';
                                break;
                            case 'in-progress':
                                statusText = 'Note in Progress';
                                break;
                            default:
                                statusText = 'Unknown Status';
                                break;
                        }
                        return statusText;
                    },
                },
                ...(rol == 'PRM'
                    ? [
                        {
                            title: <Trans>Provider</Trans>,
                            dataIndex: 'provider',
                            key: 'name',
                            width: '10%',
                            render: (_text: any, { resource, bundle }: { resource: any; bundle: any }) => {
                                return getProvider(resource, bundle);
                            },
                        },
                        {
                            title: <Trans>Type of visit </Trans>,
                            dataIndex: 'provider',
                            key: 'provider',
                            width: '10%',
                            render: (_text: any, { resource }: { resource: any }) => {
                                return getTypeOfVisit(resource);
                            },
                        },
                        {
                            title: <Trans>Status PRM</Trans>,
                            dataIndex: 'status-prm',
                            key: 'status-prm',
                            width: '10%',
                            render: (_text: any, { resource }: { resource: any }) => {
                                if (resource?.statusHistory) {
                                    return getStatusPRM(resource);
                                }
                            },
                        },
                        {
                            title: <Trans>Export Status</Trans>,
                            dataIndex: 'export-status',
                            key: 'export-status',
                            width: '10%',
                            render: (_text: any, { resource }: { resource: any }) => {
                                return getReportType(resource);
                            },
                        },
                        {
                            title: <Trans>Export Date</Trans>,
                            dataIndex: 'export-date',
                            key: 'export-date',
                            width: '10%',
                            render: (_text: any, { resource, bundle }: { resource: any; bundle: any }) => (
                                <DateExported resource={resource} bundle={bundle} />
                            ),
                        },
                    ]
                    : []),
                ...(rol == 'Audit'
                    ? [
                        {
                            title: <Trans>Provider</Trans>,
                            dataIndex: 'provider',
                            key: 'provider',
                            width: '10%',
                            render: (_text: any, { resource, bundle }: { resource: any; bundle: any }) => {
                                return getProvider(resource, bundle);
                            },
                        },
                        {
                            title: <Trans>Type of visit </Trans>,
                            dataIndex: 'provider',
                            key: 'provider',
                            width: '10%',
                            render: (_text: any, { resource }: { resource: any }) => {
                                return getTypeOfVisit(resource);
                            },
                        },
                        {
                            title: <Trans>Status Audit</Trans>,
                            dataIndex: 'status-prm',
                            key: 'status-prm',
                            width: '10%',
                            render: (_text: any, { resource }: { resource: any }) => {
                                return getStatusAudit(resource);
                            },
                        },
                        {
                            title: <Trans>Export Status</Trans>,
                            dataIndex: 'prm-export-status',
                            key: 'prm-export-status',
                            width: '10%',
                            render: (_text: any, { resource }: { resource: any }) => {
                                return getReportTypeAudit(resource);
                            },
                        },
                        {
                            title: <Trans>Export Date</Trans>,
                            dataIndex: 'export-date',
                            key: 'export-date',
                            width: '10%',
                            render: (_text: any, { resource, bundle }: { resource: any; bundle: any }) => (
                                <DateExported resource={resource} bundle={bundle} />
                            ),
                        },
                    ]
                    : []),
            ]}

            getFilters={() => searchBarColumns}

            {...(rol !== 'scriber' &&
                rol !== 'PRM' &&
                rol != 'Audit' && {
                getRecordActions: ({ resource }) => {
                    storeSelectedResource(resource);

                    return [
                        questionnaireAction(t`Remove`, 'visit-encounter-delete'),
                        questionnaireAction(t`Update status`, 'visit-encounter-status-edit'),
                        questionnaireAction(t`Update CPT`, 'visit-encounter-cpt-edit'),
                        questionnaireAction(t`Add note`, 'practitioner-note-create'),
                    ];
                },
            })}
            {...(rol !== 'scriber' &&
                rol !== 'PRM' &&
                rol != 'Audit' && {
                getHeaderActions: () => [
                    questionnaireAction(t`Add patient not assigned`, 'admission-encounter-create-not-assigned', {
                        icon: <PlusOutlined />,
                    }),
                ],
            })}
            {...(rol == 'PRM' && {
                getHeaderActions: () => [
                    exportAction(t`Export to Excel`, 'export-excel', exportToExcelPRM, {
                        icon: <DownloadOutlined />,
                    }),
                ],
            })}
            {...(rol == 'Audit' && {
                getHeaderActions: () => [
                    exportAction(t`Export to Excel`, 'export-excel', exportToExcelAudit, {
                        icon: <DownloadOutlined />,
                    }),
                ],
            })}
            getReportColumns={(bundle: any) => [
                {
                    title: t`Total number of Patients`,
                    value: bundle.total ?? 0,
                },
            ]}
            {...(rol == 'Audit' && {
                getBatchActions: () => [
                    questionnaireAction(t`Change status`, 'visit-encounter-change-status-audit-bulk'),
                ],
            })}
            {...(rol == 'PRM' && {
                getBatchActions: () => [
                    questionnaireAction(t`Change status`, 'visit-encounter-change-status-prm-bulk'),
                ],
            })}
            {...((rol === 'admin' || rol === 'census') && {
                getBatchActions: () => [
                    questionnaireAction(t`Assign to a different provider`, 'visit-encounter-batch-create-new-provider'),
                ],
            })}
            {...((rol === 'PRM' || rol === 'Audit') && { defaultPageSize: 50 })}
        ></ResourceListPage>
    );
}