import { Trans } from '@lingui/macro';
import { ColumnsType } from 'antd/lib/table';
import { Patient } from 'fhir/r4b';

import { EncountersTable, StatusBadge } from '@beda.software/emr/components';
import type { EncounterData } from '@beda.software/emr/dist/components/EncountersTable/types';
import { useEncounterList } from '@beda.software/emr/dist/containers/EncounterList/hooks';
import { formatHumanDate, renderHumanName } from '@beda.software/emr/utils';
import { SearchParams } from '@beda.software/fhir-react';

interface Props {
    patient: Patient;
    searchParams?: SearchParams;
    hideCreateButton?: boolean;
}

const columns: ColumnsType<EncounterData> = [
    {
        title: <Trans>Practitioner</Trans>,
        dataIndex: 'practitioner',
        key: 'practitioner',
        render: (_text: any, resource: EncounterData) => renderHumanName(resource.practitioner?.name?.[0]),
    },
    {
        title: <Trans>Status</Trans>,
        dataIndex: 'status',
        key: 'status',
        render: (_text: any, resource: EncounterData) => {
            return <StatusBadge status={resource.status} />;
        },
    },
    {
        title: <Trans>Date</Trans>,
        dataIndex: 'date',
        key: 'date',
        width: 250,
        render: (_text: any, resource: EncounterData) =>
            resource.period?.start ? formatHumanDate(resource.period.start) : '-',
    },
];

export const PatientEncounters = ({ patient, searchParams }: Props) => {
    const { encounterDataListRD, handleTableChange, pagination } = useEncounterList(undefined, {
        ...{
            subject: patient.id,
            class: 'ACUTE,NONAC',
        },
        ...searchParams,
    });

    return (
        <EncountersTable
            columns={columns}
            remoteData={encounterDataListRD}
            handleTableChange={handleTableChange}
            pagination={pagination}
        />
    );
};
