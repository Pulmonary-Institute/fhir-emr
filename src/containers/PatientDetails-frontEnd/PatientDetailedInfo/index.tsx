import { CalendarOutlined, FileTextOutlined, IdcardOutlined } from '@ant-design/icons';
import { Encounter, Patient } from 'fhir/r4b';

import { Text } from '@beda.software/emr/components';
import { formatHumanDate, getPersonAge } from '@beda.software/emr/utils';

import { getPatientMRN } from 'src/utils-frontend/patient';

import { S } from './styles';

export function PatientDetailedInfo(props: { patient: Patient; encounter: Encounter }) {
    const { patient, encounter } = props;

    const data = [
        {
            icon: <CalendarOutlined />,
            key: 'name',
            value: patient.birthDate
                ? `${formatHumanDate(patient.birthDate)} • ${getPersonAge(patient.birthDate)}`
                : '-',
        },
        {
            icon: <FileTextOutlined />,
            key: 'type-of-care',
            value: encounter.type?.[0]?.coding?.[0]?.display || '-',
        },
        {
            icon: <CalendarOutlined />,
            key: 'facility',
            value: encounter.serviceProvider?.display || '-',
        },
        {
            icon: <CalendarOutlined />,
            key: 'room',
            value: encounter.location?.[0]?.location.display || '-',
        },
        {
            icon: <IdcardOutlined />,
            key: 'mrn',
            value: getPatientMRN(patient) || '-',
        },
    ];

    return (
        <S.Details>
            {data.map(({ key, value, icon }) => (
                <S.DetailsItem key={`data-${key}`}>
                    <S.Icon>{icon}</S.Icon>
                    <Text>{value}</Text>
                </S.DetailsItem>
            ))}
        </S.Details>
    );
}
