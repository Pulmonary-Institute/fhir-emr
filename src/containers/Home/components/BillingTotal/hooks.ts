const token = localStorage.getItem('token');
import config from '@beda.software/emr-config';
const baseURL = config.baseURL;
//total encounters
const getTotalEncounter = async () => {
    try {
        const response = await fetch(`${baseURL}/fhir/Encounter?status=finished`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        return data.total;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//total facilities
const getTotalFacility = async () => {
    try {
        const response = await fetch(`${baseURL}/fhir/Organization`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        const filteredOrganization = data.entry
            .map((entry: any) => entry.resource)
            .filter((resource: any) => resource.hasOwnProperty('type'))
            .filter((resource: any) => resource.type[0].coding[0].code === 'dept');
        return filteredOrganization.length;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};

//total provider
const getTotalPractitioner = async (practitioner: string) => {
    try {
        const response = await fetch(`${baseURL}/fhir/PractitionerRole`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();
        const filterPractitioner = data.entry
            .map((entry: any) => entry.resource)
            .filter((resource: any) => resource.code[0].coding[0].code === practitioner);
        return filterPractitioner.length;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
export const getDataBillingSummary = async () => {
    const totalEncounter = await getTotalEncounter();
    const totalFacility = await getTotalFacility();
    const totalProvider = await getTotalPractitioner('practitioner');
    const totalScriber = await getTotalPractitioner('scriber');
    return {
        totalEncounter: totalEncounter,
        totalFacility: totalFacility,
        totalProvider: totalProvider,
        totalScriber: totalScriber,
    };
};
