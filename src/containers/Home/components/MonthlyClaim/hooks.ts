const token = localStorage.getItem('token');
import config from '@beda.software/emr-config';
const baseURL = config.baseURL;
export const getSumaryCoverage = async () => {
    try {
        const response = await fetch(`${baseURL}/fhir/Coverage?status=active`, {
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

        return data;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
// Update getSummaryFacilities
export const getSummaryFacilities = async () => {
    try {
        const response = await fetch(`${baseURL}/fhir/Encounter`, {
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

        const filteredEncounters = data.entry
            .map((entry: any) => entry.resource) // Accedemos a los recursos directamente
            .filter((resource: any) => resource.status === 'in-progress');

        return filteredEncounters;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};

//
const getMonthlyClaim = async () => {
    try {
        const response = await fetch(`${baseURL}/fhir/Task`, {
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

        const filteredTask = data.entry
            .map((entry: any) => entry.resource)
            .filter((resource: any) => resource.hasOwnProperty('businessStatus'));

        return filteredTask;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};

export const dataMonthlyClaim = async () => {
    return await getMonthlyClaim();
};
