const token = localStorage.getItem('token');
import config from '@beda.software/emr-config';
import { getIdProvider } from '../AssignedPatients/hooks';
const baseURL = config.baseURL;
export const getSumaryStatusEncounters = async () => {
    const idProvider = await getIdProvider();
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
            .filter((resource: any) => resource.hasOwnProperty('businessStatus'))
            .filter((resource: any) => resource.requester.reference == `Practitioner/${idProvider}`);

        return filteredTask;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//
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
//select 3th mor count and calculate %
const selectTopPorcentage = (coverage: any) => {
    const totalCoverage = coverage.reduce((total: any, item: any) => total + (item.count || 0), 0);
    const sortedArray = coverage.sort((a: any, b: any) => b.count - a.count);
    const topThree = sortedArray.slice(0, 3);
    const result = topThree.map((item: any) => {
        const porcent = Number((item.count * 100) / totalCoverage);
        return {
            x: item.name,
            y: Math.round(porcent),
        };
    });
    while (result.length < 3) {
        result.push({ x: '', y: 0 });
    }
    return result;
};

//
const getMonthlyClaim = async (idProvider: string) => {
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
            .filter((resource: any) => resource.hasOwnProperty('businessStatus'))
            .filter((resource: any) => resource.requester.reference == `Practitioner/${idProvider}`);

        return filteredTask;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//
export const dataStatusEncounter = async () => {
    const groupCoverage = await getSumaryStatusEncounters();
    return selectTopPorcentage(groupCoverage);
};

export const dataMonthlyClaim = async () => {
    const idProvider = await getIdProvider();
    return await getMonthlyClaim(idProvider);
};
