import { Coverage } from 'fhir/r4b';

const authorizationExtensionUrl = 'https://nexushealthproject.com/extension/authorization-status';
const payerSorcePoliceNumber = 'https://nexushealthproject.com/extension/payer-source-policy-number';
const secondaryPayerSorcePolicyNumber = 'https://nexushealthproject.com/extension/secondary-payer-source-policy-number';
const medicaidPayerSouce = 'https://nexushealthproject.com/extension/medicaid-payer-source';
const medicarePoliceNumber = 'https://nexushealthproject.com/extension/medicare-policy-number';
const admissionAutorizationNumber = 'https://nexushealthproject.com/extension/admission-autorization-number';

export function getCoverageAuthorizationStatus(patient: Coverage) {
    return patient?.extension?.find(({ url }) => url === authorizationExtensionUrl)?.valueCoding;
}

export function getPayerSorcePolicyNumber(patient: Coverage) {
    return patient?.extension?.find(({ url }) => url === payerSorcePoliceNumber)?.valueString || '-';
}

export function getSecondaryPayerSorcePoliceNumber(patient: Coverage) {
    return patient?.extension?.find(({ url }) => url === secondaryPayerSorcePolicyNumber)?.valueString || '-';
}

export function getMedicaidPayerSouce(patient: Coverage) {
    return patient?.extension?.find(({ url }) => url === medicaidPayerSouce)?.valueString || '-';
}

export function getMedicarePoliceNumber(patient: Coverage) {
    return patient?.extension?.find(({ url }) => url === medicarePoliceNumber)?.valueString || '-';
}

export function getSecondaryPayerSource(patient: Coverage) {
    return patient?.payor[1]?.display || '-';
}

export function getAdmissionAutorizationNumber(patient: Coverage) {
    return patient?.extension?.find(({ url }) => url === admissionAutorizationNumber)?.valueString || '-';
}

export function getMCRMCD(patient: Coverage): string {
    const result = patient?.type?.coding?.map((item: any) => {
        return item?.display || [];
    });
    if (!result) {
        return '-';
    } else {
        if (result.includes('N/A')) {
            return 'N/A';
        } else {
            return result.join(', ');
        }
    }
}
