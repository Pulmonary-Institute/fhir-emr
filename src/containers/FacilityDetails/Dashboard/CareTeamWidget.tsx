import { HeartOutlined } from '@ant-design/icons';
import { t } from '@lingui/macro';
import { Encounter, EncounterParticipant } from 'fhir/r4b';

import { DashboardCard, DashboardCardTable, Spinner } from '@beda.software/emr/components';
import type { ContainerProps } from '@beda.software/emr/dist/components/Dashboard/types';
import type { OverviewCard } from '@beda.software/emr/dist/containers/PatientDetails/PatientOverviewDynamic/components/StandardCard/types';
import { RenderRemoteData } from '@beda.software/fhir-react';

import { useAdmissionEncounter } from './hooks';
import { UpdateModal } from './UpdateModal';

export function CareTeamWidget({ patient }: ContainerProps) {
    const { response } = useAdmissionEncounter(patient);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getCard = (encounter: Encounter): OverviewCard<any> => ({
        title: t`Care team`,
        key: 'care-team',
        icon: <HeartOutlined />,
        data: encounter.participant || [],
        getKey: (r: EncounterParticipant) => `care-team-${JSON.stringify(r.individual)}`,
        columns: [
            {
                title: t`Speciality`,
                key: 'speciality',
                width: '40%',
                render: (resource: EncounterParticipant) => resource.type?.[0]?.coding?.[0].display || '-',
            },
            {
                title: t`Name`,
                key: 'name',
                width: '60%',
                render: (resource: EncounterParticipant) => resource.individual?.display || '-',
            },
        ],
    });

    return (
        <RenderRemoteData remoteData={response} renderLoading={Spinner}>
            {({ currentAdmissionEncounter }) => {
                const card = getCard(currentAdmissionEncounter);

                return (
                    <DashboardCard
                        title={card.title}
                        icon={card.icon}
                        extra={
                            <UpdateModal
                                title={t`Edit Care Team`}
                                questionnaireId='care-team-edit'
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
