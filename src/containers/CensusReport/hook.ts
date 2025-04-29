import { formatHumanDate, resolveReference } from '@beda.software/emr/utils';
import { Practitioner, Encounter } from 'fhir/r4b';
import config from'@beda.software/emr-config';
const baseURL = config.baseURL
const token = localStorage.getItem("token")

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { resolveDocumentDownloaded } from '../Census/hook'
import { getRolByUserID } from 'src/utils-frontend/practitioner';

export const getDateAuditEvent = (resource: any) => {
    const date = new Date(resource?.recorded);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    return `${formatHumanDate(resource?.recorded)}  ${formattedTime}`
}
export const getCreatedByAuditEvent = (resource: any, bundle: any) => {
    const practitioner = resolveReference<Practitioner>(bundle, resource.agent?.[0].who!)!;
    return `${practitioner.name?.[0]?.given?.[0] ?? ''}  ${practitioner.name?.[0]?.family ?? ''}`
}
export const buildDataEncounters = async (resource: any, bundle: any) => {
    const referenceEncounter = resource?.entity.map((entity: any) => {
        return entity?.what
    })
    const data = await Promise.all(
        referenceEncounter.map(async (referenceEncounter: any) => {
            return {
                bundle: await getResourceEncounter(referenceEncounter?.reference.split('/')[1]),
                resource: resolveReference<Encounter>(bundle, referenceEncounter)
            }
        }))
    const rol = await getRolByUserID(resource.agent[0].who.reference.split("/")[1])
    exportToExcel(data, rol)
}

const getResourceEncounter = async (encounterId: string) => {
    const url = new URL(`${baseURL}/fhir/Encounter`);
    url.searchParams.append('_id', encounterId);
    url.searchParams.append('_include', 'Encounter:part-of:Encounter');
    url.searchParams.append('_include', 'Encounter:location');
    url.searchParams.append('_include', 'Encounter:patient');
    url.searchParams.append('_include', 'Encounter:diagnosis:Condition');
    url.searchParams.append('_include', 'Encounter:account:Account');
    url.searchParams.append('_include', 'Encounter:service-provider');
    url.searchParams.append('_include', 'Encounter:participant');
    try {
        const response = await fetch(url.toString(), {
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
        return data
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
}
const exportToExcel = (data: any, rol: string) => {
    const worksheet = XLSX.utils.json_to_sheet(resolveDocumentDownloaded(data, rol));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${month}-${day}-${year}`;
    const fileName = `Census-Document-${formattedDate}.xlsx`;
    saveAs(blob, fileName);
};