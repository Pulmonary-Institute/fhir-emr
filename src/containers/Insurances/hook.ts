// const token = localStorage.getItem('token');
// import config from '@beda.software/emr-config';
// const baseURL = config.baseURL;

// //total facilities
// const getTotalFacility = async () => {
//     try {
//         const response = await fetch(`${baseURL}/fhir/Organization`, {
//             method: 'GET',
//             headers: {
//                 Authorization: `Bearer ${token}`,
//                 'Content-Type': 'application/json',
//             },
//         });
//         if (!response.ok) {
//             throw new Error(`Error fetching data: ${response.statusText}`);
//         }
//         const data = await response.json();
//         const filteredOrganization = data.entry
//             .map((entry: any) => entry.resource)
//             .filter((resource: any) => resource.hasOwnProperty('type'))
//             .filter((resource: any) => resource.type[0].coding[0].code === 'dept');
//         return filteredOrganization.length;
//     } catch (error) {
//         console.error('Error fetching practitioners:', error);
//         throw new Error('Failed to fetch practitioners');
//     }
// };
