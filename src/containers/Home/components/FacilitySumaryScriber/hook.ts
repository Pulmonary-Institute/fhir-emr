import config from '@beda.software/emr-config';
const baseURL = config.baseURL;
//import { getIdProvider } from '../AssignedPatients/hooks'
const getIdProvider = async () => {
    try {
        const response = await fetch(`${baseURL}/auth/userinfo`, {
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
        return data.role[0].links.practitioner.id;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
const token = localStorage.getItem('token');

//
const getAllTaskByScriber = async () => {
    const practitionerId = await getIdProvider();
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
            .filter((resource: any) => resource.hasOwnProperty('owner'))
            .filter((task: any) => task.owner.reference === `Practitioner/${practitionerId}`);

        const faciliesStatus = await Promise.all(
            filteredTask.map(async (item: any) => {
                const facility = await getReferenceEncounterID(item.encounter.reference.split('/')[1]);
                return {
                    facility: facility,
                    status: await getStatusTask(item.partOf[0].reference.split('/')[1]),
                };
            }),
        );
        const agroupByFacilityStatus = groupByFacilityAndStatus(faciliesStatus);
        const result = await Promise.all(
            agroupByFacilityStatus.map(async (item: any) => ({
                ...item,
                total: await getTotalEncounterByFacility(item.facility),
            })),
        );
        return result;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//group by facility and Status completed and not-completed
function groupByFacilityAndStatus(items: any) {
    const grouped = items.reduce((acc: any, item: any) => {
        // Busca si ya existe un grupo para la facility actual
        const existing = acc.find((group: any) => group.facility === item.facility);

        if (existing) {
            // Incrementa los contadores según el status
            if (item.status === 'completed') {
                existing.completed++;
            } else if (item.status === 'not-completed') {
                existing.notCompleted++;
            }
        } else {
            // Crea un nuevo grupo para la facility actual
            acc.push({
                facility: item.facility,
                completed: item.status === 'completed' ? 1 : 0,
                notCompleted: item.status === 'not-completed' ? 1 : 0,
            });
        }

        return acc;
    }, []);

    return grouped;
}

//get total Encounter by facility
const getTotalEncounterByFacility = async (facility: String) => {
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
        const resultFilterEncounter = data.entry
            .map((entry: any) => entry.resource)
            .filter((resource: any) => resource.serviceProvider.display === facility)
            .filter((resource: any) => resource.status === 'finished');
        return resultFilterEncounter.length;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//get Status Task
const getStatusTask = async (isTask: string) => {
    try {
        const response = await fetch(`${baseURL}/fhir/Task/${isTask}`, {
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
        return data.businessStatus.coding[0].code;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//get Reference Encounters
const getReferenceEncounterID = async (isEncounter: string) => {
    try {
        const response = await fetch(`${baseURL}/fhir/Encounter/${isEncounter}`, {
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
        return data.serviceProvider.display;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//
const getEncounter = async () => {
    const idScriber = await getIdProvider();
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
            .filter((resource: any) => resource.hasOwnProperty('owner'))
            .filter((task: any) => task.owner.reference === `Practitioner/${idScriber}`);
        //return console.log(filteredTask)
        const faciliesStatus = await Promise.all(
            filteredTask.map(async (item: any) => {
                const facility = await getReferenceEncounterID(item.encounter.reference.split('/')[1]);
                return {
                    facility: facility,
                    status: await getStatusTask(item.partOf[0].reference.split('/')[1]),
                };
            }),
        );
        const agroupByFacilityStatus = groupByFacilityAndStatus(faciliesStatus);
        const result = await Promise.all(
            agroupByFacilityStatus.map(async (item: any) => ({
                ...item,
                total: await getTotalEncounterByFacility(item.facility),
            })),
        );
        return result;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//
const getEncounterDischarged = async () => {
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
            .filter((resource: any) => resource.status === 'finished')
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
    return await getAllTaskByScriber();
};

export const dataTotalEncountersGraphic = async () => {
    await getEncounter();
};
export const dataDischergedPatient = async () => {
    return await getEncounterDischarged();
};
