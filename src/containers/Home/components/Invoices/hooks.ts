import config from '@beda.software/emr-config';
const baseURL=config.baseURL
//get all invoices
export const getAllInvoices=async()=>{
    const token = localStorage.getItem("token")
    const response = await fetch(`${baseURL}/fhir/Invoice`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });
    const data = await response.json();
    return data.entry.map((item: any) => ({
        id: item.resource.id,
        status: item.resource.status
    }));
}