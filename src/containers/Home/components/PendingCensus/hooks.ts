//const token = localStorage.getItem("token")
//import { getIdProvider } from '../AssignedPatients/hooks'
//
//const getAllTaskByScriber = async (practitionerId: String) => {
    //try {
       // const response = await fetch(`${baseURL}/fhir/Task`, {
           // method: 'GET',
           // headers: {
                //'Authorization': `Bearer ${token}`,
                //'Content-Type': 'application/json',
            //},
       // });
       // if (!response.ok) {
         //   throw new Error(`Error fetching data: ${response.statusText}`);
       // }
        //const data = await response.json();

        //const filteredTask = data.entry
           // .map((entry: any) => entry.resource)
            //.filter((resource: any) => resource.hasOwnProperty('owner'))
            //.filter((task: any) => task.owner.reference === `Practitioner/${practitionerId}`)

      //const result=filteredTask.map(async(item: any) => {{  item.encounter.reference.split('/')[1]}})
        //console.log(filteredTask)
  



    //} catch (error) {
       // console.error('Error fetching practitioners:', error);
       // throw new Error('Failed to fetch practitioners');
    //}
//}


export const dataPendingCensus = async () => {
    //const id=await getIdProvider()
   //console.log(await getAllTaskByScriber(id)) 
}