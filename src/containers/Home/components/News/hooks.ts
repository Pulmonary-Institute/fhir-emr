import config from '@beda.software/emr-config';
const baseURL = config.baseURL;
export const saveBroadcast = async (previewData: any) => {
    const token = localStorage.getItem('token');
    try {
        const result = await fetch(`${baseURL}/fhir/Basic`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                Prefer: 'return=representation',
            },
            body: JSON.stringify({
                resourceType: 'Basic',
                code: {
                    text: 'Description of the basic resource',
                },
                extension: [
                    { url: previewData.url, valueUrl: previewData.url },
                    { url: previewData.url, valueString: previewData.title },
                    { url: previewData.url, valueString: previewData.description },
                    { url: previewData.url, valueUrl: previewData.image },
                ],
            }),
        });
        if (result.ok) {
            const broadcast = await result.json();
            return broadcast;
        } else {
            const error = await result.json();
            console.error('Error creating Broadcast:', error);
        }
    } catch (err) {
        console.error('Error:', err);
    }
};
//get all broadcasts
export const getAllBroadcast = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch(`${baseURL}/Basic`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return data.entry.map((item: any) => ({
        id: item.resource.id,
        url: item.resource?.extension[0].value.url,
        title: item.resource?.extension[1].value.string,
        description: item.resource?.extension[2].value.string,
        image: item.resource?.extension[3].value.url,
    }));
};
//delete broadcast
export const deleteBroadcast = async (id: String) => {
    const token = localStorage.getItem('token');
    try {
        const response = await fetch(`${baseURL}/Basic/${id}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            console.log('Delete Succesfull');
        } else {
            const errorResponse = await response.json();
            console.error('Error deleting resource:', errorResponse);
        }
    } catch (err) {
        console.log(err);
    }
};
