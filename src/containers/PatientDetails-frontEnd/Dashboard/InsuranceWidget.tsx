import { FileOutlined } from '@ant-design/icons';
import { t } from '@lingui/macro';
import { Coverage, Organization } from 'fhir/r4b';

import { DashboardCardVertical, DashboardCardTableVertical, Spinner } from '@beda.software/emr/components';
import type { ContainerProps } from '@beda.software/emr/dist/components/Dashboard/types';
import type { OverviewCard } from '@beda.software/emr/dist/containers/PatientDetails/PatientOverviewDynamic/components/StandardCard/types';
import { RenderRemoteData } from '@beda.software/fhir-react';
import {
    getCoverageAuthorizationStatus,
    getPayerSorcePolicyNumber,
    getMedicaidPayerSouce,
    getMedicarePoliceNumber,
    getSecondaryPayerSource,
    getSecondaryPayerSorcePoliceNumber,
    getAdmissionAutorizationNumber,
    getMCRMCD
} from 'src/utils-frontend/coverage';

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
                width: '10%',
                render: () => organization.name || '-',
            },
            {
                title: t`Payer Source Policy Number`,
                key: 'payer-source-policy-number',
                width: '10%',
                render: () => getPayerSorcePolicyNumber(coverage) || '-',
            },
            {
                title: t`Secondary Payer source`,
                key: ' secondary-payer-source',
                width: '10%',
                render: () => getSecondaryPayerSource(coverage) || '-',
            },
            {
                title: t`Secondary Payer Source Policy Number`,
                key: 'payer-source-policy-number',
                width: '10%',
                render: () => getSecondaryPayerSorcePoliceNumber(coverage) || '-',
            },
            {
                title: t`MCR/MCD`,
                key: 'mcr-mcd',
                width: '10%',
                render: () => getMCRMCD(coverage) || '-',
            },
            {
                title: t`Medicaid Payer Souce`,
                key: 'payer-source-policy-number',
                width: '15%',
                render: () => getMedicaidPayerSouce(coverage) || '-',
            },
            {
                title: t`Medicare Police Number`,
                key: 'payer-source-policy-number',
                width: '15%',
                render: () => getMedicarePoliceNumber(coverage) || '-',
            },
            {
                title: t`Admission Authorization Number`,
                key: 'payer-source-policy-number',
                width: '15%',
                render: () => getAdmissionAutorizationNumber(coverage) || '-',
            },
            {
                title: t`Insurance Authorization`,
                key: 'insurance-authorization',
                width: '15%',
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
                    <DashboardCardVertical
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
                        <DashboardCardTableVertical
                            title={card.title}
                            data={card.data}
                            columns={card.columns}
                            getKey={card.getKey}
                        />
                    </DashboardCardVertical>
                );
            }}
        </RenderRemoteData>
    );
}
