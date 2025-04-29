import { AlertOutlined } from '@ant-design/icons';
import { t } from '@lingui/macro';
import { Condition } from 'fhir/r4b';
import { extractExtension } from 'sdc-qrf';

import { DashboardCard, DashboardCardTable, Spinner } from '@beda.software/emr/components';
import type { ContainerProps } from '@beda.software/emr/dist/components/Dashboard/types';
import type { OverviewCard } from '@beda.software/emr/dist/containers/PatientDetails/PatientOverviewDynamic/components/StandardCard/types';
import { formatHumanDate } from '@beda.software/emr/utils';
import { RenderRemoteData } from '@beda.software/fhir-react';

import { useAdmissionEncounter } from './hooks';
import { UpdateModal } from './UpdateModal';

export function DiagnosesWidget({ patient }: ContainerProps) {
    const { response } = useAdmissionEncounter(patient);

    const getCard = (conditions: Condition[]): OverviewCard<Condition> => ({
        title: t`Diagnoses`,
        key: 'diagnoses',
        icon: <AlertOutlined />,
        data: conditions,
        getKey: (r: Condition) => `condition-${r.id!}`,
        columns: [
            {
                title: t`Code`,
                key: 'code',
                width: '40%',
                render: (resource: Condition) => resource.code?.coding?.[0]?.code || '-',
            },
            {
                title: t`Date`,
                key: 'date',
                render: (r: Condition) => {
                    const createdAt = extractExtension(r.meta?.extension, 'ex:createdAt');

                    return createdAt ? formatHumanDate(r.recordedDate || createdAt) : null;
                },
                width: '60%',
            },
        ],
    });

    return (
        <RenderRemoteData remoteData={response} renderLoading={Spinner}>
            {({ currentAdmissionEncounter, currentAdmissionConditions }) => {
                const card = getCard(currentAdmissionConditions);

                return (
                    <DashboardCard
                        title={card.title}
                        icon={card.icon}
                        extra={
                            <UpdateModal
                                title={t`Edit Diagnoses`}
                                questionnaireId="admission-diagnoses-edit"
                                launchContextParameters={[
                                    {
                                        name: 'Encounter',
                                        resource: currentAdmissionEncounter,
                                    },
                                ]}
                            />
                        }
                    >
                        <DashboardCardTable
                            title={card.title}
                            data={card.data}
                            columns={card.columns}
                            getKey={card.getKey}
                        />
                    </DashboardCard>
                );
            }}
        </RenderRemoteData>
    );
}

