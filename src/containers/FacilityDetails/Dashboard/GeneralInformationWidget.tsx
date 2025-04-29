import { UserOutlined } from '@ant-design/icons';
import { t } from '@lingui/macro';
import { Patient } from 'fhir/r4b';

import { DashboardCard, DashboardCardTable } from '@beda.software/emr/components';
import type { ContainerProps } from '@beda.software/emr/dist/components/Dashboard/types';
import type { OverviewCard } from '@beda.software/emr/dist/containers/PatientDetails/PatientOverviewDynamic/components/StandardCard/types';
import { formatHumanDate, getPersonAge, renderHumanName } from '@beda.software/emr/utils';

import { getPatientDNRCode, getPatientMRN } from 'src/utils-frontend/patient';

import { UpdateModal } from './UpdateModal';

export function GeneralInformationWidget({ patient }: ContainerProps) {
    const info: OverviewCard<Patient> = {
        title: t`Patient`,
        key: 'patient-details',
        icon: <UserOutlined />,
        data: [patient],
        getKey: (r: Patient) => `patient-details-${r.id!}`,
        columns: [
            {
                title: t`Name`,
                key: 'name',
                width: '20%',
                render: (resource: Patient) => renderHumanName(resource.name?.[0]) || '-',
            },
            {
                title: 'Birth date',
                key: 'birth-date',
                width: '20%',
                render: (resource: Patient) =>
                    resource.birthDate
                        ? `${formatHumanDate(resource.birthDate)} • ${getPersonAge(resource.birthDate)}`
                        : '-',
            },
            {
                title: 'MRN',
                key: 'mrn',
                width: '15%',
                render: (resource: Patient) => getPatientMRN(resource) || '-',
            },
            {
                title: 'Code',
                key: 'code',
                width: '10%',
                render: (resource: Patient) => getPatientDNRCode(resource),
            },
            {
                title: 'Address',
                key: 'address',
                width: '25%',
                render: (resource: Patient) => resource.address?.[0]?.text || '-',
            },
        ],
    };

    return (
        <DashboardCard
            title={info.title}
            icon={info.icon}
            extra={
                <UpdateModal
                    title={t`Update Patient`}
                    questionnaireId="patient-edit"
                    launchContextParameters={[
                        {
                            name: 'Patient',
                            resource: patient,
                        },
                    ]}
                />
            }
        >
            <DashboardCardTable title={info.title} data={info.data} columns={info.columns} getKey={info.getKey} />
        </DashboardCard>
    );
}
