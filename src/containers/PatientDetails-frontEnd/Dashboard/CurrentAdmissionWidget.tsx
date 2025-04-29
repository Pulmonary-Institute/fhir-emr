import { FileOutlined } from '@ant-design/icons';
import { t } from '@lingui/macro';
import { Encounter } from 'fhir/r4b';

import { DashboardCard, DashboardCardTable, Spinner } from '@beda.software/emr/components';
import type { ContainerProps } from '@beda.software/emr/dist/components/Dashboard/types';
import type { OverviewCard } from '@beda.software/emr/dist/containers/PatientDetails/PatientOverviewDynamic/components/StandardCard/types';
import { formatHumanDate } from '@beda.software/emr/utils';
import { RenderRemoteData } from '@beda.software/fhir-react';

import { getDaysInTheFacility } from 'src/utils-frontend/encounter';

import { DischargeModal } from './DischargeModal';
import { useAdmissionEncounter } from './hooks';
import { NewAdmissionModal } from './NewAdmissionModal';
import { S } from './styles';
import { UpdateModal } from './UpdateModal';

export function CurrentAdmissionWidget({ patient }: ContainerProps) {
    const { response } = useAdmissionEncounter(patient);

    const getCard = (encounters: Encounter[], showPreviousAdmissions: boolean): OverviewCard<Encounter> => ({
        title: t`Current admission`,
        key: 'current-admission',
        icon: <FileOutlined />,
        data: encounters,
        getKey: (r: Encounter) => `current-admission-${r.id!}`,
        columns: [
            {
                title: t`Facility`,
                key: 'facility',
                width: showPreviousAdmissions ? '16%' : '30%',
                render: (resource: Encounter) => resource.serviceProvider?.display || '-',
            },
            {
                title: t`Room`,
                key: 'room',
                width: showPreviousAdmissions ? '7%' : '10%',
                render: (resource: Encounter) => resource.location?.[0]?.location.display || '-',
            },
            {
                title: t`Type of care`,
                key: 'type-of-care',
                width: showPreviousAdmissions ? '13%' : '20%',
                render: (resource: Encounter) => resource.type?.[0]?.coding?.[0]?.display || '-',
            },
            {
                title: t`Admission date`,
                key: 'admission-date',
                width: showPreviousAdmissions ? '13%' : '20%',
                render: (resource: Encounter) =>
                    resource.period?.start ? formatHumanDate(resource.period.start) : '-',
            },
            {
                title: t`Days in the facility`,
                key: 'days-in-the-facility',
                width: showPreviousAdmissions ? '14%' : '20%',
                render: (resource: Encounter) => getDaysInTheFacility(resource) ?? '-',
            },
            ...(showPreviousAdmissions
                ? [
                      {
                          title: t`Discharge date`,
                          key: 'discharge-date',
                          width: '13%',
                          render: (resource: Encounter) =>
                              resource.period?.end ? formatHumanDate(resource.period.end) : '-',
                      },
                      {
                          title: t`Discharged to`,
                          key: 'discharge-to',
                          width: '12%',
                          render: (resource: Encounter) => resource.hospitalization?.destination?.display || '-',
                      },
                      {
                          title: t`Discharge note`,
                          key: 'discharge-note',
                          width: '12%',
                          render: (resource: Encounter) => resource.hospitalization?.dischargeDisposition?.text || '-',
                      },
                  ]
                : []),
        ],
    });

    return (
        <RenderRemoteData remoteData={response} renderLoading={Spinner}>
            {({ encounters, currentAdmissionEncounter }) => {
                const isCurrentAdmissionFinished = currentAdmissionEncounter.status === 'finished';
                const showPreviousAdmissions = isCurrentAdmissionFinished || encounters.length > 1;
                const card = getCard(encounters, showPreviousAdmissions);

                return (
                    <DashboardCard
                        title={card.title}
                        icon={card.icon}
                        extra={
                            isCurrentAdmissionFinished ? (
                                <NewAdmissionModal
                                    title={t`New admission`}
                                    questionnaireId="re-admission-encounter-create"
                                    launchContextParameters={[
                                        {
                                            name: 'Patient',
                                            resource: patient,
                                        },
                                    ]}
                                />
                            ) : (
                                <S.Buttons>
                                    <UpdateModal
                                        title={t`Edit Current Admission`}
                                        questionnaireId="current-admission-edit"
                                        launchContextParameters={[
                                            {
                                                name: 'Encounter',
                                                resource: currentAdmissionEncounter,
                                            },
                                        ]}
                                    />
                                    <DischargeModal
                                        title={t`Discharge`}
                                        questionnaireId="admission-encounter-discharge"
                                        launchContextParameters={[
                                            {
                                                name: 'Encounter',
                                                resource: currentAdmissionEncounter,
                                            },
                                        ]}
                                    />
                                </S.Buttons>
                            )
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
