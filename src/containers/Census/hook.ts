const token = localStorage.getItem('token');
import config from '@beda.software/emr-config';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

import { formatHumanDate, renderHumanName, resolveReference } from '@beda.software/emr/utils';
import { Patient, Location, Encounter, Condition, Organization, Bundle } from 'fhir/r4b';
import { parseFHIRDateTime } from '@beda.software/fhir-react';
import { getPatientDNRCode } from 'src/utils-frontend/patient';
import { getStatusPRM, getReasonNotSeen, getProvider, getTypeOfVisit, getStatusAudit } from 'src/utils-frontend/encounter';
import { getPractitionerID } from 'src/utils-frontend/practitioner';

const baseURL = config.baseURL;
enum EncounterStatus {
    IN_PROGRESS = 'in-progress',
    PLANNED = 'planned',
    ARRIVED = 'arrived',
    TRIAGED = 'triaged',
    ONLEAVE = 'onleave',
    FINISHED = 'finished',
    CANCELLED = 'cancelled',
    ENTERINERROR = 'enter-in-error',
    UNKNOWN = 'unknown',
}

export const getUserRol = async () => {
    try {
        const response = await fetch(`${baseURL}/auth/userinfo`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response?.statusText}`);
        }
        const data = await response.json();
        return data.role[0]?.name;
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};

const getName = (resource: any, bundle: any) => {
    const patient = resolveReference<Patient>(bundle, resource.subject!)!;
    const result = renderHumanName(patient?.name?.[0]);
    return result;
};

const getBirthDay = (resource: any, bundle: any) => {
    const patient = resolveReference<Patient>(bundle, resource.subject!)!;
    return patient?.birthDate ? formatHumanDate(patient?.birthDate) : null;
};

const getDOS = (resource: any) => {
    const startDateTime = resource.period!.start!;
    if (!startDateTime) return null;
    const [year, month, day] = startDateTime.split('-');
    const formattedDate = `${month}/${day}/${year}`;
    return formattedDate;
};

const getFacility = (resource: any, bundle: any) => {
    const organizationRef = resource.serviceProvider;
    if (!organizationRef) {
        return null;
    }
    const organization = resolveReference(bundle, organizationRef) as Organization | undefined;
    if (!organization) {
        return null;
    }
    return organization?.name;
};

const getRoom = (resource: any, bundle: any) => {
    const locationRef = resource.location?.[0]?.location;
    if (!locationRef) {
        return null;
    }
    const location = resolveReference(bundle, locationRef) as Location | undefined;
    if (!location) {
        return null;
    }
    return location?.name;
};

const getDiagnosis = (resource: any, bundle: any) => {
    const admissionEncounter = resolveReference<Encounter>(bundle, resource.partOf!)!;
    const conditionRefs = admissionEncounter.diagnosis
        ?.filter((diagnosis: any) => diagnosis.use?.coding?.[0]?.code === 'AD')
        .map((diagnosis: any) => diagnosis.condition);
    return conditionRefs
        ?.map((conditionRef: any) => resolveReference<Condition>(bundle, conditionRef)?.code?.coding?.[0]?.code)
        .filter((x: string | undefined) => !!x)
        .join(', ');
};

const getCPT = (resource: any, bundle: any) => {
    const conditionRefs = resource.diagnosis
        ?.filter((diagnosis: any) => diagnosis.use?.coding?.[0]?.code === 'billing')
        .map((diagnosis: any) => diagnosis.condition);
    return conditionRefs
        ?.map((conditionRef: any) => resolveReference<Condition>(bundle, conditionRef)?.code?.coding?.[0]?.code)
        .filter((x: string | undefined) => !!x)
        .join(', ');
};

const getTypeOfCare = (resource: any, bundle: any) => {
    const admissionEncounter = resolveReference<Encounter>(bundle, resource.partOf!)!;
    return admissionEncounter.type?.[0]?.coding?.[0]?.display;
};

const getTime = (resource: any) => {
    const startDateTime = resource.participant?.[0]?.period?.start;
    if (startDateTime) {
        return parseFHIRDateTime(startDateTime).format('HH:mm');
    }
    return '';
};

const getChiefComplaint = (resource: any) => {
    return resource.reasonCode?.[0]?.text ?? '';
};

const getCodeStatus = (resource: any, bundle: any) => {
    const patient = resolveReference<Patient>(bundle, resource.subject!)!;
    return getPatientDNRCode(patient);
};

const getObservation = (resource: any) => {
    if (resource?.statusHistory) {
        return getReasonNotSeen(resource);
    }
};

const getStatusPrm = (resource: any) => {
    if (resource?.statusHistory) {
        return getStatusPRM(resource);
    }
};

const getStatusAUDIT = (resource: any) => {
    return getStatusAudit(resource);
};

const getStatus = (resource: any) => {
    let statusText;
    switch (resource.status) {
        case 'cancelled':
            statusText = 'Not seen';
            break;
        case 'finished':
            statusText = 'Complete';
            break;
        case 'planned':
            statusText = 'Scheduled';
            break;
        case 'in-progress':
            statusText = 'Bad Imput';
            break;
        default:
            statusText = 'Unknown Status';
            break;
    }
    return statusText;
};

const changeStatusPRMtoReportExported = async (resource: any) => {
    if (resource.statusHistory) {
        const filter = resource.statusHistory.filter(
            (statusHistory: any) => statusHistory?.extension[0]?.url == 'https://example.com/extensions/statusPRM',
        );
        if (filter.length != 0) {
            const indexStatusPRM = resource.statusHistory.indexOf(filter[0]);
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            console.log(indexStatusPRM);
            if (indexStatusPRM == 0) {
                const body = {
                    statusHistory: [
                        {
                            period: {
                                start: formattedDate,
                                extension: [
                                    {
                                        url: 'https://example.com/extensions/periodStatusPRM',
                                        valueString: 'Exported',
                                    },
                                ],
                            },
                            status: filter[0].status,
                            extension: [
                                {
                                    url: 'https://example.com/extensions/statusPRM',
                                    valueString: filter[0]?.extension[0]?.valueString,
                                },
                            ],
                        },
                    ],
                };
                try {
                    const response = await fetch(`${baseURL}/fhir/Encounter/${resource.id}`, {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body),
                    });
                    if (!response.ok) {
                        throw new Error(`Error fetching data: ${response.statusText}`);
                    }
                } catch (error) {
                    console.error('Error fetching practitioners:', error);
                    throw new Error('Failed to fetch practitioners');
                }
            } else if (indexStatusPRM == 1) {
                const filterReasonNotSee = resource.statusHistory.filter(
                    (statusHistory: any) =>
                        statusHistory?.extension[0]?.url == 'https://example.com/extensions/reasonNotSeen',
                );
                const body = {
                    statusHistory: [
                        {
                            period: {
                                start: filterReasonNotSee[0].period.start,
                                extension: [
                                    {
                                        url: 'https://example.com/extensions/periodReasonNotSeen',
                                        valueString: 'Extra info',
                                    },
                                ],
                            },
                            status: filterReasonNotSee[0].status,
                            extension: [
                                {
                                    url: 'https://example.com/extensions/reasonNotSeen',
                                    valueString: filterReasonNotSee[0]?.extension[0]?.valueString,
                                },
                            ],
                        },
                        {
                            period: {
                                start: formattedDate,
                                extension: [
                                    {
                                        url: 'https://example.com/extensions/periodStatusPRM',
                                        valueString: 'Exported',
                                    },
                                ],
                            },
                            status: resource.status,
                            extension: [
                                {
                                    url: 'https://example.com/extensions/statusPRM',
                                    valueString: resource.statusHistory[1]?.extension[0]?.valueString,
                                },
                            ],
                        },
                    ],
                };
                try {
                    const response = await fetch(`${baseURL}/fhir/Encounter/${resource.id}`, {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body),
                    });
                    if (!response.ok) {
                        throw new Error(`Error fetching data: ${response.statusText}`);
                    }
                } catch (error) {
                    console.error('Error fetching practitioners:', error);
                    throw new Error('Failed to fetch practitioners');
                }
            }
        } else {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');
            const formattedDate = `${year}-${month}-${day}`;
            const body = {
                statusHistory: [
                    {
                        period: {
                            start: resource.statusHistory[0].period.start,
                            extension: [
                                {
                                    url: 'https://example.com/extensions/periodReasonNotSeen',
                                    valueString: 'Extra info',
                                },
                            ],
                        },
                        status: resource.status,
                        extension: [
                            {
                                url: 'https://example.com/extensions/reasonNotSeen',
                                valueString: resource.statusHistory[0]?.extension?.valueString,
                            },
                        ],
                    },
                    {
                        period: {
                            start: formattedDate,
                            extension: [
                                {
                                    url: 'https://example.com/extensions/periodStatusPRM',
                                    valueString: 'Exported',
                                },
                            ],
                        },
                        status: resource.status,
                        extension: [
                            {
                                url: 'https://example.com/extensions/statusPRM',
                                valueString: '',
                            },
                        ],
                    },
                ],
            };
            try {
                const response = await fetch(`${baseURL}/fhir/Encounter/${resource.id}`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });
                if (!response.ok) {
                    throw new Error(`Error fetching data: ${response.statusText}`);
                }
            } catch (error) {
                console.error('Error fetching practitioners:', error);
                throw new Error('Failed to fetch practitioners');
            }
        }
    } else {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        const day = String(today.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        const body = {
            statusHistory: [
                {
                    period: {
                        start: formattedDate,
                        extension: [
                            {
                                url: 'https://example.com/extensions/periodStatusPRM',
                                valueString: 'Exported',
                            },
                        ],
                    },
                    status: resource.status,
                    extension: [
                        {
                            url: 'https://example.com/extensions/statusPRM',
                            valueString: '',
                        },
                    ],
                },
            ],
        };
        try {
            const response = await fetch(`${baseURL}/fhir/Encounter/${resource.id}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching practitioners:', error);
            throw new Error('Failed to fetch practitioners');
        }
    }
};

const changeStatusAudittoReportExported = async (resource: any) => {
    if (resource?.extension) {
        if (resource?.extension.length == 2) {
            const body = {
                extension: [
                    {
                        url: resource?.extension[0]?.url,
                        valueString: resource?.extension[0]?.valueString,
                    },
                    {
                        url: 'https://moxie-link.com/fhir/StructureDefinition/status-export',
                        valueString: 'Exported',
                    },
                ],
            };
            try {
                const response = await fetch(`${baseURL}/fhir/Encounter/${resource.id}`, {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(body),
                });
                if (!response.ok) {
                    throw new Error(`Error fetching data: ${response.statusText}`);
                }
            } catch (error) {
                console.error('Error fetching practitioners:', error);
                throw new Error('Failed to fetch practitioners');
            }
        } else {
            if (resource?.extension[0]?.url === 'https://moxie-link.com/fhir/StructureDefinition/status-audit') {
                const body = {
                    extension: [
                        {
                            url: resource?.extension[0]?.url,
                            valueString: resource?.extension[0]?.valueString,
                        },
                        {
                            url: 'https://moxie-link.com/fhir/StructureDefinition/status-export',
                            valueString: 'Exported',
                        },
                    ],
                };
                try {
                    const response = await fetch(`${baseURL}/fhir/Encounter/${resource?.id}`, {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body),
                    });
                    if (!response.ok) {
                        throw new Error(`Error fetching data: ${response?.statusText}`);
                    }
                } catch (error) {
                    console.error('Error fetching practitioners:', error);
                    throw new Error('Failed to fetch practitioners');
                }
            } else {
                const body = {
                    extension: [
                        {
                            url: 'https://moxie-link.com/fhir/StructureDefinition/status-export',
                            valueString: 'Exported',
                        },
                    ],
                };
                try {
                    const response = await fetch(`${baseURL}/fhir/Encounter/${resource.id}`, {
                        method: 'PATCH',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(body),
                    });
                    if (!response.ok) {
                        throw new Error(`Error fetching data: ${response.statusText}`);
                    }
                } catch (error) {
                    console.error('Error fetching practitioners:', error);
                    throw new Error('Failed to fetch practitioners');
                }
            }
        }
    } else {
        const body = {
            extension: [
                {
                    url: 'https://moxie-link.com/fhir/StructureDefinition/status-export',
                    valueString: 'Exported',
                },
            ],
        };
        try {
            const response = await fetch(`${baseURL}/fhir/Encounter/${resource.id}`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new Error(`Error fetching data: ${response.statusText}`);
            }
        } catch (error) {
            console.error('Error fetching practitioners:', error);
            throw new Error('Failed to fetch practitioners');
        }
    }
};
const addAuditEvent = async (data: any) => {
    const idEncounters = data.map((data: any) => {
        return data.resource?.id;
    });
    const entity = idEncounters.map((idEncounters: any) => {
        return {
            what: {
                reference: `Encounter/${idEncounters}`,
            },
            role: {
                system: 'http://terminology.hl7.org/CodeSystem/object-role',
                code: '4',
                display: 'Domain Resource',
            },
        };
    });
    const userID = await getPractitionerID();
    const date = new Date().toISOString().split('.')[0] + 'Z';
    const body = {
        resourceType: 'AuditEvent',
        type: {
            system: 'http://terminology.hl7.org/CodeSystem/audit-event-type',
            code: 'export',
            display: 'Export Data',
        },
        recorded: date,
        agent: [
            {
                who: {
                    reference: `Practitioner/${userID}`,
                },
                requestor: true,
            },
        ],
        source: {
            site: 'My System',
            observer: {
                reference: 'Organization/beda-emr',
            },
        },
        entity: entity,
    };
    try {
        const response = await fetch(`${baseURL}/fhir/AuditEvent`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            throw new Error(`Error fetching data: ${response.statusText}`);
        }
    } catch (error) {
        console.error('Error fetching practitioners:', error);
        throw new Error('Failed to fetch practitioners');
    }
};
const getNextLink = (bundle: Bundle): string | undefined =>
    bundle.link?.find((link) => link.relation === 'next')?.url;
const fetchAllData = async (initialData: { bundle: any; resource: any }[]) => {
    if (initialData.length === 0) {
        throw new Error('initialData is empty');
    }
    let allData = [...initialData];
    let nextLink = getNextLink(allData[0]?.bundle);
    try {
        while (nextLink) {
            const response = await fetch(`${baseURL}${nextLink}`, {
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
            const filteredResources = extractPrimaryResource('Encounter', data).filter(
                (resource) => (resource as any)?.status !== EncounterStatus.IN_PROGRESS
            );

            const newValues = filteredResources.map((resource) => ({ resource, bundle: data }));
            allData = [...allData, ...newValues];
            nextLink = getNextLink(data);
        }
        return allData
    }
    catch (error) {
        console.error('Error fetching All Data:', error);
        throw new Error('Failed to fetch data');
    }

}
const extractPrimaryResource = (resourceType: string, bundle: Bundle) => {
    const filteredResources = (bundle.entry ?? [])
        .filter((entry) => {
            const isMatchingType = entry.resource?.resourceType === resourceType;

            return isMatchingType;
        })
        .map((entry) => entry.resource);

    return filteredResources;
}
export const resolveDataToExport = async (data: any, statusUserColumn: string, funtionGetStatus: any) => {
    const allData = await fetchAllData(data)
    addAuditEvent(allData);
    const result = allData.map((data: any) => {
        if (statusUserColumn === 'Status PRM') {
            changeStatusPRMtoReportExported(data.resource);
        } else {
            changeStatusAudittoReportExported(data.resource);
        }
        return {
            Patient: getName(data.resource, data.bundle),
            'Birth date': getBirthDay(data.resource, data.bundle),
            DOS: getDOS(data.resource),
            Facility: getFacility(data.resource, data.bundle),
            Room: getRoom(data.resource, data.bundle),
            Diagnosis: getDiagnosis(data.resource, data.bundle),
            CPT: getCPT(data.resource, data.bundle),
            'Type of care': getTypeOfCare(data.resource, data.bundle),
            Time: getTime(data.resource),
            'Code Status': getCodeStatus(data.resource, data.bundle),
            'Chief complaint': getChiefComplaint(data.resource),
            [statusUserColumn]: funtionGetStatus(data.resource),
            Observations: getObservation(data.resource),
            Status: getStatus(data.resource),
            Provider: getProvider(data.resource, data.bundle),
            'Type of Visit': getTypeOfVisit(data.resource),
        };
    });
    return result;
};
export const resolveDocumentDownloaded = (data: any, rol: string) => {
    const result = data.map((data: any) => {
        const statusKey = `Status ${rol}`;
        const statusValue = rol === 'PRM' ? getStatusPrm(data.resource) : getStatusAUDIT(data.resource);
        return {
            Patient: getName(data.resource, data.bundle),
            'Birth date': getBirthDay(data.resource, data.bundle),
            DOS: getDOS(data.resource),
            Facility: getFacility(data.resource, data.bundle),
            Room: getRoom(data.resource, data.bundle),
            Diagnosis: getDiagnosis(data.resource, data.bundle),
            CPT: getCPT(data.resource, data.bundle),
            'Type of care': getTypeOfCare(data.resource, data.bundle),
            Time: getTime(data.resource),
            'Code Status': getCodeStatus(data.resource, data.bundle),
            'Chief complaint': getChiefComplaint(data.resource),
            [statusKey]: statusValue,
            Observations: getObservation(data.resource),
            Status: getStatus(data.resource),
            Provider: getProvider(data.resource, data.bundle),
            'Type of Visit': getTypeOfVisit(data.resource),
        };
    });
    return result;
};
export const exportToExcelPRM = async (data: any) => {
    const statusUserColumn = 'Status PRM';
    const worksheet = XLSX.utils.json_to_sheet(await resolveDataToExport(data.data, statusUserColumn, getStatusPrm));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${month}-${day}-${year}`;
    const fileName = `Census-${formattedDate}.xlsx`;
    saveAs(blob, fileName);
};

export const exportToExcelAudit = async (data: any) => {
    const statusUserColumn = 'Status Audit';
    const worksheet = XLSX.utils.json_to_sheet(await resolveDataToExport(data.data, statusUserColumn, getStatusAUDIT));
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const year = today.getFullYear();
    const formattedDate = `${month}-${day}-${year}`;
    const fileName = `Census-${formattedDate}.xlsx`;
    saveAs(blob, fileName);
};
