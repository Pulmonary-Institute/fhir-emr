const token = localStorage.getItem('token');
import config from '@beda.software/emr-config';
const baseURL = config.baseURL;
const getCountPatientsByFacility = async (idFacility: string) => {
    try {
        const response = await fetch(`${baseURL}/fhir/Encounter?_summary=count&service-provider=Organization/${idFacility}&status=in-progress`, {
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
        return data.total
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
}
const getFacilitySummary = async () => {
    try {
        const facility = await fetch(`${baseURL}/fhir/Organization?type=dept`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });

        if (!facility.ok) {
            throw new Error(`Error fetching data: ${facility.statusText}`);
        }
        const dataFacility = await facility.json()
        const newResult = await Promise.all(
            dataFacility.entry.map(async (item: any) => {
                const count = await getCountPatientsByFacility(item.resource.id);
                return {
                    facility: item.resource.name,
                    providers: 0,
                    patients: count,
                };
            })
        );
        return newResult
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
//
const getAllPatients = async () => {
    try {
        let patients: any[] = [];
        let nextUrl: string | null = `/fhir/Patient?active=true&_count=1000`;
        while (nextUrl) {
            const response: any = await fetch(`${baseURL}${nextUrl}`, {
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
            if (data.entry) {
                patients = [...patients, ...data.entry];
            }
            const nextLink = data.link?.find((link: any) => link.relation === 'next');
            nextUrl = nextLink ? nextLink.url : null;
        }

        const result = patients.map((patient: any) => {
            const lastUpdated = patient.resource.meta?.extension?.[0]?.valueInstant;
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
    } catch (error) {
        console.error('Error fetching patients:', error);
        throw new Error('Failed to fetch patients');
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
            .map((entry: any) => entry.resource) // Accedemos a los recursos directamente
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
    const data = await getFacilitySummary();
    return data;
};

export const dataTotalPatientGraphic = async () => {
    return await getAllPatients();
};
export const dataDischergedPatient = async () => {
    return await getEncounterDischarged();
};
