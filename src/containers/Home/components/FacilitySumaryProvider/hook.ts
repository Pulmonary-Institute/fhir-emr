const token = localStorage.getItem('token');
import config from '@beda.software/emr-config';
const baseURL = config.baseURL;
import { getIdProvider } from '../AssignedPatients/hooks';

const getFacilitySummary = async () => {
    const idProvider = await getIdProvider();
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
            .map((entry: any) => entry.resource)
            .filter(
                (resource: any) =>
                    resource.status === 'planned' &&
                    resource.participant[0].individual.reference == `Practitioner/${idProvider}`,
            );
        const groupedData = filteredEncounters.reduce((acc: any, item: any) => {
            const facility = item.serviceProvider.display;
            if (!acc[facility]) {
                acc[facility] = {
                    facility,
                    patients: 0,
                    providers: new Set(),
                };
            }

            // Incrementar el conteo de pacientes
            if (item.subject.reference) {
                acc[facility].patients += 1;
            }
            //cont the unique provider
            if (item.participant) {
                item.participant.forEach((participant: any) => {
                    const providerReference = participant.individual?.reference;
                    if (providerReference && !Array.from(acc[facility].providers).includes(providerReference)) {
                        acc[facility].providers.add(providerReference);
                    }
                });
            }

            return acc;
        }, {});

        const result = Object.values(groupedData).map((group: any) => ({
            facility: group.facility,
            patients: group.patients,
            providers: group.providers.size, // Convertir el Set a tamaño
        }));
        return result;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//
const getEncounterByProvider = async (idProvider: String) => {
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
            .map((entry: any) => entry.resource)
            .filter(
                (resource: any) =>
                    resource.status === 'finished' &&
                    resource.participant[0].individual.reference == `Practitioner/${idProvider}`,
            );
        return filteredEncounters;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//

const getPatientById = async (idPatient: String) => {
    try {
        const response = await fetch(`${baseURL}/fhir/Patient/${idPatient}`, {
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
        const lastUpdated = data.meta?.extension?.[0]?.valueInstant;
        const month = getMonthInitials(lastUpdated);

        return month;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//
const getEncounterDischarged = async () => {
    const idProvider = await getIdProvider();
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
            .map((entry: any) => entry.resource)
            .filter(
                (resource: any) =>
                    resource.status === 'finished' &&
                    resource.participant[0].individual.reference == `Practitioner/${idProvider}`,
            )
            .filter((resource: any) => resource.hasOwnProperty('hospitalization'));
        const result = filteredEncounters.map((encounter: any) => {
            const lastUpdated = encounter.period.end;
            const month = getMonthInitials(lastUpdated);
            return { month };
        });
        return result.reduce((acc: any, item: any) => {
            const { month } = item;
            if (month) {
                const existing = acc.find((group: any) => group.month === month);
                if (existing) {
                    existing.count++;
                } else {
                    acc.push({ month, count: 1 });
                }
            }
            return acc;
        }, []);
        // return
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//
const getMonthInitials = (dateString: string) => {
    const date = new Date(dateString);
    const monthFormatter = new Intl.DateTimeFormat('en-US', { month: 'short' });
    const monthInitials = monthFormatter.format(date).toUpperCase();
    return monthInitials;
};

export const dataFacilitySummary = async () => {
    const data = await getFacilitySummary();
    return data;
};
//
export const getEncounterSummary = async () => {
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

export const dataTotalPatientGraphic = async () => {
    const idProvider = await getIdProvider();
    const encounter = await getEncounterByProvider(idProvider);
    const promises = encounter.map(async (encounter: any) => {
        const patientId = encounter.subject.reference.split('/')[1];
        const month = await getPatientById(patientId);
        return { month };
    });
    const result = await Promise.all(promises);
    return result.reduce((acc: any, item: any) => {
        const { month } = item;
        if (month) {
            const existing = acc.find((group: any) => group.month === month);
            if (existing) {
                existing.count++;
            } else {
                acc.push({ month, count: 1 });
            }
        }
        return acc;
    }, []);
};
export const dataDischergedPatient = async () => {
    return await getEncounterDischarged();
};
