import { Organization, Patient, Practitioner } from 'fhir/r4b';

import { User } from '@beda.software/aidbox-types';
import { WithId } from '@beda.software/fhir-react';

import {
    sharedAuthorizedOrganization,
    sharedAuthorizedPatient,
    sharedAuthorizedPractitioner,
    sharedAuthorizedUser,
} from 'src/sharedState';

export enum Role {
    Patient = 'patient',
    Admin = 'admin',
    Practitioner = 'practitioner',
    Receptionist = 'receptionist',
    Scriber = 'scriber',
    Census = 'census',
    Admin1 = 'subAdmin',
    Prm = 'PRM'
}

export function selectUserRole<T>(user: User, options: { [role in Role]: T }): T {
    const userRole = user.role![0]!.name;
    return options[userRole];
}
export function matchCurrentUserRole<T>(options: {
    [Role.Patient]: (patient: WithId<Patient>) => T;
    [Role.Admin]: (organization: WithId<Organization>) => T;
    [Role.Practitioner]: (practitioner: WithId<Practitioner>) => T;
    [Role.Receptionist]: (practitioner: WithId<Practitioner>) => T;
    [Role.Scriber]: (practitioner: WithId<Practitioner>) => T;
    [Role.Census]: (practitioner: WithId<Practitioner>) => T;
    [Role.Admin1]: (practitioner: WithId<Practitioner>) => T;
    [Role.Prm]: (practitioner: WithId<Practitioner>) => T;
}): T {
    return selectUserRole(sharedAuthorizedUser.getSharedState()!, {
        [Role.Patient]: () => options[Role.Patient](sharedAuthorizedPatient.getSharedState()!),
        [Role.Admin]: () => options[Role.Admin](sharedAuthorizedOrganization.getSharedState()!),
        [Role.Practitioner]: () => options[Role.Practitioner](sharedAuthorizedPractitioner.getSharedState()!),
        [Role.Receptionist]: () => options[Role.Receptionist](sharedAuthorizedPractitioner.getSharedState()!),
        [Role.Scriber]: () => options[Role.Scriber](sharedAuthorizedPractitioner.getSharedState()!),
        [Role.Census]: () => options[Role.Census](sharedAuthorizedPractitioner.getSharedState()!),
        [Role.Admin1]: () => options[Role.Admin1](sharedAuthorizedPractitioner.getSharedState()!),
        [Role.Prm]: () => options[Role.Prm](sharedAuthorizedPractitioner.getSharedState()!),
    })();
}

export function selectCurrentUserRoleResource(): WithId<Patient> | WithId<Practitioner> | WithId<Organization> {
    return matchCurrentUserRole<WithId<Patient> | WithId<Practitioner> | WithId<Organization>>({
        [Role.Patient]: (patient) => patient,
        [Role.Admin]: (organization) => organization,
        [Role.Practitioner]: (practitioner) => practitioner,
        [Role.Receptionist]: (practitioner) => practitioner,
        [Role.Scriber]: (practitioner) => practitioner,
        [Role.Census]: (practitioner) => practitioner,
        [Role.Admin1]: (practitioner) => practitioner,
        [Role.Prm]: (practitioner) => practitioner,
    });
}
