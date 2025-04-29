const token = localStorage.getItem("token")
import config from '@beda.software/emr-config';
const baseURL=config.baseURL
//return IDProvider
export const getIdProvider = async () => {
    try {
        const response = await fetch(`${baseURL}/auth/userinfo`, {
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
        return data.role[0].links.practitioner.id
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
}

const getEncountersByProvider = async (practitionerId: String) => {
    try {
        const response = await fetch(`${baseURL}/fhir/Encounter?status=planned`, {
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
        const filteredEncounters = data.entry.filter((encounter:any) =>
           encounter.resource.participant.some((participant:any ) => participant.individual?.reference === `Practitioner/${practitionerId}`))
           return filteredEncounters.map((item:any)=>({
              facility:item.resource.serviceProvider.display,
              dos:item.resource.period.start
           }))    
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
}
export const getAssignedPatientsList = async () => {
    const IdProvider = await getIdProvider()
    const encounters = await getEncountersByProvider(IdProvider)
    const result = [];

  // Usa un mapa para agrupar por facility y DOS
  const grouped = encounters.reduce((acc:any, item:any) => {
    const key = `${item.facility}_${item.dos}`;
    if (!acc[key]) {
      acc[key] = { facility: item.facility, dos: item.dos, count: 0 };
    }
    acc[key].count += 1;
    return acc;
  }, {});

  // Convierte el mapa en un arreglo
  for (const key in grouped) {
    result.push(grouped[key]);
  }
    return result
}