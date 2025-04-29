import { Patient } from 'fhir/r4b';

const typeSystem = 'http://terminology.hl7.org/CodeSystem/v2-0203';

export function getPatientMRN(patient: Patient) {
    return patient.identifier?.find(
        ({ type }) => type?.coding?.[0].system === typeSystem && type?.coding?.[0].code === 'MR',
    )?.value;
}

export function getPatientSSN(patient: Patient) {
    return patient.identifier?.find(
        ({ type }) => type?.coding?.[0].system === typeSystem && type?.coding?.[0].code === 'SSN',
    )?.value;
}
const dnrCodeExtensionUrl = 'https://nexushealthproject.com/extension/dnr-code';
export function getPatientDNRCode(patient: Patient) {
    const extension = patient?.extension;
    const result = extension
        ?.map((extension) => {
            if (extension?.url === dnrCodeExtensionUrl) {
                return extension?.valueCoding?.display;
            }
        })
        .filter((x) => !!x)
        .join(', ');
    return result;
}
