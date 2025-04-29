const token = localStorage.getItem("token")
import config from '@beda.software/emr-config';
const baseURL=config.baseURL
type Item = {
    facility: string;
    status: "finished" | "planned" | "cancelled";
}
import { getIdProvider } from '../AssignedPatients/hooks'

const getEncountersByProvider = async (practitionerId: String) => {

    try {
        const response = await fetch(`${baseURL}/fhir/Encounter`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
        const data = await response.json();

        const filteredEncounters = data.entry
            .map((entry: any) => entry.resource)
            .filter((resource: any) => resource.participant.some((participant: any) => participant.individual.reference === `Practitioner/${practitionerId}`))
            .filter((resource: any) => resource.status === "cancelled" || resource.status === "planned" || resource.status === "finished")
        return filteredEncounters.map((item: any) => ({
            facility: item.serviceProvider.display,
            status: item.status
        }))
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
}

export const getMonthlySumary = async () => {
    const providerID = await getIdProvider()
    const encounters: Item[] = await getEncountersByProvider(providerID)
    //group by facility
    const grouped = encounters.reduce<Record<string, Item[]>>((acc, item) => {
        if (!acc[item.facility]) {
            acc[item.facility] = [];
        }
        acc[item.facility].push(item);
        return acc;
    }, {});
   
    //calculate porcentaje
    const result= Object.entries(grouped).map(([facility, items]) => {
        const total = items.length;
        // Contar ocurrencias de cada `status`
        const statusCounts = items.reduce<Record<string, number>>(
            (acc, item) => {
                acc[item.status] = (acc[item.status] || 0) + 1;
                return acc;
            },
            { finished: 0, planned: 0, cancelled: 0 }
        );
        // Convertir a porcentajes
        return {
            facility,
            finished: `${(statusCounts.finished / total) * 100}%`,
            planned: `${(statusCounts.planned / total) * 100}%`,
            cancelled: `${(statusCounts.cancelled / total) * 100}%`,
        };
    })

    return result
}
