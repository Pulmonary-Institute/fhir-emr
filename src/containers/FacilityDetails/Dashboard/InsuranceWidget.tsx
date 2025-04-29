import { FileOutlined } from '@ant-design/icons';
import { t } from '@lingui/macro';
import { Coverage, Organization } from 'fhir/r4b';

import { DashboardCard, DashboardCardTable, Spinner } from '@beda.software/emr/components';
import type { ContainerProps } from '@beda.software/emr/dist/components/Dashboard/types';
import type { OverviewCard } from '@beda.software/emr/dist/containers/PatientDetails/PatientOverviewDynamic/components/StandardCard/types';
import { RenderRemoteData } from '@beda.software/fhir-react';

import { getCoverageAuthorizationStatus } from 'src/utils-frontend/coverage';

import { useAdmissionEncounter } from './hooks';
import { UpdateModal } from './UpdateModal';

export function InsuranceWidget({ patient }: ContainerProps) {
    const { response } = useAdmissionEncounter(patient);

    const getCard = (coverage: Coverage, organization: Organization): OverviewCard<Coverage> => ({
        title: t`Insurance`,
        key: 'insurance',
        icon: <FileOutlined />,
        data: [coverage],
        getKey: (r: Coverage) => `insurance-${r.id!}`,
        columns: [
            {
                title: t`Payer source`,
                key: 'payer source',
                width: '40%',
                render: () => organization.name || '-',
            },
            {
                title: t`MCR/MCD`,
                key: 'mcr-mcd',
                width: '20%',
                render: (r: Coverage) => r.type?.coding?.[0]?.display || '-',
            },
            {
                title: t`Insurance Authorization`,
                key: 'insurance-authorization',
                width: '40%',
                render: () => getCoverageAuthorizationStatus(coverage)?.display || '-',
            },
        ],
    });

    return (
        <RenderRemoteData remoteData={response} renderLoading={Spinner}>
            {({ coverage, organization }) => {
                if (!coverage) {
                    return <></>;
                }

                const card = getCard(coverage, organization);

                return (
                    <DashboardCard
                        title={card.title}
                        icon={card.icon}
                        extra={
                            <UpdateModal
                                title={t`Update Insurance`}
                                questionnaireId="coverage-edit"
                                launchContextParameters={[
                                    {
                                        name: 'Coverage',
                                        resource: coverage,
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
