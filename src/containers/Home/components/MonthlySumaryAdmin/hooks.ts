import config from '@beda.software/emr-config';
const baseURL=config.baseURL
export const getCountOrganizationByCode = async (code: String) => {
    const token = localStorage.getItem("token")
    try {
        const response = await fetch(`${baseURL}/fhir/Organization`, {
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
        const organizations = data.entry || [];
        const count = organizations.reduce((total: number, entry: any) => {
            const hasInsuranceType = entry.resource?.type?.some((type: any) =>
                type.coding?.some((coding: any) => coding.code === code)
            );
            return hasInsuranceType ? total + 1 : total;
        }, 0);

        return count
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
}
//
export const getCountProviders = async () => {
    const token = localStorage.getItem("token")
    try {
        const response = await fetch(`${baseURL}/fhir/PractitionerRole`, {
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
        let count=0
        data.entry.map((item:any)=>{
            if(item.resource.code[0].coding[0].code==='practitioner')
                count=count+1
        })
        
        return count;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
}
//
export const getCountActivePatients = async () => {
    const token = localStorage.getItem("token")
    try {
        const response = await fetch(`${baseURL}/fhir/Patient?_summary=count&active=true`, {
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
        return data.total || 0;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
}

//
export const getCountNews = async () => {
    const token = localStorage.getItem("token")
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
        const encounters = data.entry?.map((entry: any) => entry.resource) || [];
        // Separar en dos arreglos según el status
        const inProgress = encounters.filter((encounter: any) => encounter.status === 'in-progress');
        const planned = encounters.filter((encounter: any) => encounter.status === 'planned');
        
        const referencedIds = new Set(
            planned
                .flatMap((encounter: any) => encounter.partOf || [])
                .map((ref: any) => ref.reference.replace("Encounter/", ""))
        );

        const unreferencedInProgress = inProgress.filter(
            (encounter: any) => !referencedIds.has(encounter.id)
        )
        return unreferencedInProgress.length
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
}

