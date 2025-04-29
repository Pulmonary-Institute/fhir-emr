import { useState, useEffect } from 'react';
import { Practitioner } from 'fhir/r4b';
import { Trans } from '@lingui/macro';
import { ColumnsType } from 'antd/lib/table';
import { Patient } from 'fhir/r4b';
import { Select } from 'antd';

import { EncountersTable, StatusBadge } from '@beda.software/emr/components';
import type { EncounterData } from '@beda.software/emr/dist/components/EncountersTable/types';
import { useEncounterList } from '@beda.software/emr/dist/containers/EncounterList/hooks';
import { formatHumanDate, renderHumanName } from '@beda.software/emr/utils';
import { SearchParams } from '@beda.software/fhir-react';
import { getAllPractitioner } from 'src/utils-frontend/practitioner'


interface Props {
    patient: Patient;
    searchParams?: SearchParams;
    hideCreateButton?: boolean;
}





export const PatientEncounters = ({ patient, searchParams }: Props) => {
    const [practitioners, setPractitioners] = useState<Practitioner[]>([]);

    useEffect(() => {
        getAllPractitioner()
            .then((data) => setPractitioners(data ?? []))
            .catch(console.error);
    }, []);
    const encounterTypeOptions = [
        { label: 'Pulmonary', value: 'pulmonary' },
        { label: 'Cardiovascular', value: 'cardiovascular' },
        { label: 'Acute Care Response', value: 'acute-care-response' },
        { label: 'Ventilation Management', value: 'ventilation-management' },
        { label: 'Infectious Disease', value: 'infectious-disease' },
    ];
    const statusOptions = [
        { label: 'Schedule', value: 'planned' },
        { label: 'Completed', value: 'finished' },
        { label: 'Not seen', value: 'cancelled' },
    ]
    const practitionerOptions = [
        practitioners.map((practitioner) => {
            return {
                label: renderHumanName(practitioner?.name?.[0]),
                value: renderHumanName(practitioner?.name?.[0])
            }
        })
    ]
    console.log(statusOptions)
    const columns: ColumnsType<EncounterData> = [
        {
            title: <Trans>Practitioner</Trans>,
            dataIndex: 'practitioner',
            key: 'practitioner',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                <Select
                    style={{ width: 200 }}
                    placeholder="Select Type"
                    options={practitionerOptions[0]}
                    value={selectedKeys[0]}
                    allowClear
                    onChange={(value) => {
                        setSelectedKeys(value ? [value] : []);
                        confirm();
                    }}
                />
            ),
            onFilter: (value, record) => renderHumanName(record.practitioner?.name?.[0]) === value,
            render: (_text: any, resource: EncounterData) => renderHumanName(resource.practitioner?.name?.[0]),
        },
        {
            title: <Trans>Encounter Type</Trans>,
            dataIndex: 'serviceType',
            key: 'serviceType',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                <Select
                    style={{ width: 200 }}
                    placeholder="Select Type"
                    options={encounterTypeOptions}
                    value={selectedKeys[0]}
                    allowClear
                    onChange={(value) => {
                        setSelectedKeys(value ? [value] : []);
                        confirm();
                    }}
                />
            ),
            onFilter: (value: any, record: any) => record?.serviceType?.[0].code === value,
            render: (_text: any, resource: any) => resource?.serviceType?.[0].display,
        },
        {
            title: <Trans>Status</Trans>,
            dataIndex: 'status',
            key: 'status',
            filterDropdown: ({ setSelectedKeys, selectedKeys, confirm }) => (
                <Select
                    style={{ width: 200 }}
                    placeholder="Select Status"
                    options={statusOptions}
                    value={selectedKeys[0]}
                    allowClear
                    onChange={(value) => {
                        setSelectedKeys(value ? [value] : []);
                        confirm();
                    }}
                />
            ),
            onFilter: (value, record) => record.status === value,
            render: (_text: any, resource: EncounterData) => {
                return <StatusBadge status={resource.status} />;
            },
        },
        {
            title: <Trans>Date</Trans>,
            dataIndex: 'date',
            key: 'date',
            width: 250,
            sorter: (a: any, b: any) => new Date(a.period?.start).getTime() - new Date(b.period?.start).getTime(),
            render: (_text: any, resource: EncounterData) =>
                resource.period?.start ? formatHumanDate(resource.period.start) : '-',
        },
    ];

    const { encounterDataListRD, handleTableChange, pagination } = useEncounterList(undefined, {
        ...{
            subject: patient.id,
            class: 'ACUTE,NONAC',
        },
        ...searchParams,
    });
    console.log(encounterDataListRD)
    return (
        <EncountersTable
            columns={columns}
            remoteData={encounterDataListRD}
            handleTableChange={handleTableChange}
            pagination={pagination}
        />
    );
};
