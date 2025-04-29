import { Bundle, Encounter, Practitioner, Organization, Location } from 'fhir/r4b';
import { useState, useEffect } from 'react';
import { compileAsArray, getDays, resolveReference, formatHumanDate } from '../../dist/utils/';
export const admissionEncounterClassCode = 'IMP';
export const valueNull = null;
import { getPractitionerID } from '../utils-frontend/practitioner';


export type ReferenceObject = {
    display?: string;
    reference: string;
};


export const extractAdmissionEncounters = compileAsArray<Bundle, Encounter>(
    `Bundle.entry.resource.where(
        resourceType = 'Encounter' and class.code = '${admissionEncounterClassCode}'
    )`,
);
export const extractAdmissionEncountersEmpty = compileAsArray<Bundle, Encounter>(
    `Bundle.entry.resource.where(
        resourceType = 'Encounter' and class.code = '${valueNull}'
    )`,
);

export const extractVisitEncounters = compileAsArray<Bundle, Encounter>(
    `Bundle.entry.resource.where(
            resourceType = 'Encounter' 
                and class.code != '${admissionEncounterClassCode}' 
                and partOf.exists()
                and (status in 'entered-in-error').not()
        )`,
);
export const extractVisitEncountersByAdmission = (parentEncounter: Encounter) =>
    compileAsArray<Bundle, Encounter>(
        `Bundle.entry.resource.where(
            resourceType = 'Encounter' 
                and class.code != '${admissionEncounterClassCode}' 
                and partOf.reference = 'Encounter/${parentEncounter.id}'
                and (status in 'entered-in-error').not()
        )`,
    );

export function getDaysInTheFacility(encounter: Encounter) {
    return encounter.period?.start ? getDays(encounter.period.start) + 1 : undefined;
}

export function getStatusPRM(encounter: Encounter) {
    if (encounter.statusHistory?.length == 2) {
        return encounter?.statusHistory?.[1]?.extension?.[0]?.valueString;
    } else if (
        encounter.statusHistory?.length == 1 &&
        encounter?.statusHistory?.[0]?.extension?.[0]?.url == 'https://example.com/extensions/statusPRM'
    ) {
        return encounter?.statusHistory?.[0]?.extension?.[0]?.valueString;
    } else return null;
}
export function getReasonNotSeen(encounter: Encounter) {
    if (encounter.statusHistory?.length == 2) {
        return encounter?.statusHistory?.[0]?.extension?.[0]?.valueString;
    } else if (
        encounter.statusHistory?.length == 1 &&
        encounter?.statusHistory?.[0]?.extension?.[0]?.url == 'https://example.com/extensions/reasonNotSeen'
    ) {
        return encounter?.statusHistory?.[0]?.extension?.[0]?.valueString;
    } else return null;
}

export function getReportType(encounter: Encounter) {
    if (encounter.statusHistory?.length == 2) {
        if (!encounter?.statusHistory?.[1]?.period?.extension?.[0]?.valueString) {
            return 'Pending';
        }
        return encounter?.statusHistory?.[1]?.period?.extension?.[0].valueString;
    } else if (
        encounter.statusHistory?.length == 1 &&
        encounter?.statusHistory?.[0]?.period?.extension?.[0]?.url == 'https://example.com/extensions/periodStatusPRM'
    ) {
        if (!encounter?.statusHistory?.[0]?.period?.extension?.[0].valueString) {
            return 'Pending';
        }
        return encounter?.statusHistory?.[0]?.period?.extension?.[0]?.valueString;
    } else return 'Pending';
}

export function getProvider(resource: any, bundle: any) {
    const practitioner = resolveReference<Practitioner>(bundle, resource.participant?.[0].individual!)!;
    if (practitioner?.name?.[0]) {
        const name = practitioner.name[0];
        const givenName = name.given?.[0];
        const familyName = name.family;
        if (givenName && familyName) {
            return `${givenName} ${familyName}`;
        } else if (givenName) {
            return givenName;
        } else if (familyName) {
            return familyName;
        }
    }
    return null;
}

export function getTypeOfVisit(resource: any) {
    const result = resource?.serviceType?.coding?.[0]?.display;
    if (!result) {
        return '';
    }
    return result;
}

export async function getDates(resource: any, bundle: any) {
    const auditEventFiltersFromBundle = bundle.entry.filter((item: any) => item.resource.resourceType == 'AuditEvent');
    const filterEvents = auditEventFiltersFromBundle.filter((item: any) =>
        item.resource.entity?.some((entity: any) => entity.what?.reference === `Encounter/${resource.id}`),
    );
    const practitionerId = await getPractitionerID();
    const filterByProvider = filterEvents.filter(
        (data: any) => data.resource.agent[0].who?.reference === `Practitioner/${practitionerId}`,
    );
    const dates = filterByProvider.map((data: any) => {
        const date = new Date(data.resource.recorded);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const formattedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
        return `${formatHumanDate(data.resource.recorded)}  ${formattedTime}`;
    });
    return dates.join(', ');
}
export function DateExported({ resource, bundle }: { resource: any; bundle: any }) {
    const [dates, setDates] = useState(null);

    useEffect(() => {
        const fetchDates = async () => {
            const result = await getDates(resource, bundle);
            setDates(result);
        };
        fetchDates();
    }, [resource, bundle]);

    return dates;
}

export function getStatusAudit(encounter: Encounter) {
    if (encounter?.extension) {
        const filter = encounter?.extension.filter(
            (item: any) => item.url == 'https://moxie-link.com/fhir/StructureDefinition/status-audit',
        );
        if (filter.length > 0) {
            return filter?.[0]?.valueString;
        } else return null;
    } else return null;
}
export function getReportTypeAudit(encounter: Encounter) {
    if (encounter?.extension) {
        const filter = encounter?.extension.filter(
            (item: any) => item.url == 'https://moxie-link.com/fhir/StructureDefinition/status-export',
        );
        if (filter.length > 0) {
            return filter?.[0]?.valueString;
        } else return 'Pending';
    } else return 'Pending';
}

export function getFacilityFromEncounterAddPatientNotAssigned(encounterRef: ReferenceObject, bundle: Bundle): string | null {
    const encounterAdmission = resolveReference(bundle, encounterRef) as Encounter | undefined;
    const serviceProviderRef = encounterAdmission?.serviceProvider;
    if (!serviceProviderRef) return null;
    const organization = resolveReference(bundle, serviceProviderRef) as Organization | undefined
    return organization?.name ?? null
}

export function getRoomFromEncounterAddPatientNotAssigned(encounterRef: ReferenceObject, bundle: Bundle): string | null {
    const encounterAdmission = resolveReference(bundle, encounterRef) as Encounter | undefined;
    const locationRef = encounterAdmission?.location?.[0]?.location;
    if (!locationRef) return null;
    const location = resolveReference(bundle, locationRef) as Location | undefined
    return location?.name ?? null
}
