const token = localStorage.getItem("token")
import config from '@beda.software/emr-config';
const baseURL=config.baseURL
import { getIdProvider } from '../AssignedPatients/hooks'

//const getEncounterByID = async (id: string) => {
    //try {
       // const response = await fetch(`${baseURL}/fhir/Encounter/${id}`, {
           // method: 'GET',
           // headers: {
                //'Authorization': `Bearer ${token}`,
                //'Content-Type': 'application/json',
            //},
        //});
        //if (!response.ok) {
           // throw new Error(`Error fetching data: ${response.statusText}`);
        //}
        //const data = await response.json();
        //const result = {
         //   facility: data.serviceProvider.display,
           // idFacility: data.serviceProvider.reference.split('/')[1],
            //status: data.status
        //}
       // return result
   // } catch (error) {
       // console.error('Error fetching practitioners:', error);
        //throw new Error('Failed to fetch practitioners');
    //}
//}
//get reference task by id(Obtengo la task que hace referencia al encuentro y tiene el status asignado por el Scriber, QA y billing)
const getReferenceTaskByID = async (idTask: string) => {
    try {
        const response = await fetch(`${baseURL}/fhir/Task/${idTask}`, {
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
        return data.businessStatus.coding[0].display
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
}
//
const getAllTaskByScriber = async (practitionerId: String) => {
    try {
        const response = await fetch(`${baseURL}/fhir/Task`, {
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

        const filteredTask = data.entry
            .map((entry: any) => entry.resource)
            .filter((resource: any) => resource.hasOwnProperty('owner'))
            .filter((task: any) => task.owner.reference === `Practitioner/${practitionerId}`)

        const status = await Promise.all(filteredTask.map(async (item: any) => {
            return await getReferenceTaskByID(item.partOf[0].reference.split('/')[1])
        }))
        const grouped = status.reduce((acc, status) => {
            const existing = acc.find((item: any) => item.status === status);
            if (existing) {
                existing.quantity++;
            } else {
                acc.push({ status, quantity: 1 });
            }
            return acc;
        }, [] as { status: string; quantity: number }[]);
        const result = calculateProgress(grouped, filteredTask.length)
        return result
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
}
//calculate progress
const calculateProgress = (array: [{}], total: number) => {
    const result = [{ quantity: 0, progress: 0 }, { quantity: 0, progress: 0 }, { quantity: 0, progress: 0 }, { quantity: 0, progress: 0 }, { quantity: 0, progress: 0 }]
   
    array.map((item: any) => {
        if (item.status === 'QA Approved') {
            result[0] = {
                quantity: item.quantity,
                progress: Math.round(item.quantity * 100 / total)
            }
        }
        if (item.status === 'Not completed') {
            result[1] = {
                quantity: item.quantity,
                progress: item.quantity * 100 / total
            }
        }
        if (item.status === 'Feedback to handle') {
            result[2] = {
                quantity: item.quantity,
                progress: item.quantity * 100 / total
            }
        }
        if (item.status === 'For QA') {
            result[3] = {
                quantity: item.quantity,
                progress: item.quantity * 100 / total
            }
        }

    })
    return result
}


export const dataMobthlySymmary = async () => {
    const idScriber = await getIdProvider()
    const taskByScriber = await getAllTaskByScriber(idScriber)
    return taskByScriber
}