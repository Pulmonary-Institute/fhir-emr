import { Organization, Patient, Practitioner } from 'fhir/r4b';

import { User } from '@beda.software/aidbox-types';
import {
    sharedAuthorizedOrganization,
    sharedAuthorizedPractitioner,
    sharedAuthorizedUser,
} from '@beda.software/emr/sharedState';
import { WithId } from '@beda.software/fhir-react';

export enum Role {
    Admin = 'admin',
    Practitioner = 'practitioner',
    Census = 'census',
    Scriber = 'scriber',
    QA = 'qa',
    Billing = 'billing',
    Admin1 = 'subAdmin',
    Prm = 'PRM',
    Audit = 'Audit'

}

export function selectUserRole<T>(user: User, options: { [role in Role]: T }): T {
    const userRole = user.role![0]!.name as Role;
    return options[userRole];
}

export function matchCurrentUserRole<T>(options: {
    [Role.Admin]: (organization: WithId<Organization>) => T;
    [Role.Practitioner]: (practitioner: WithId<Practitioner>) => T;
    [Role.Census]: (practitioner: WithId<Practitioner>) => T;
    [Role.Scriber]: (practitioner: WithId<Practitioner>) => T;
    [Role.QA]: (practitioner: WithId<Practitioner>) => T;
    [Role.Billing]: (practitioner: WithId<Practitioner>) => T;
    [Role.Admin1]: (practitioner: WithId<Practitioner>) => T;
    [Role.Prm]: (practitioner: WithId<Practitioner>) => T;
    [Role.Audit]: (practitioner: WithId<Practitioner>) => T;
}): T {
    return selectUserRole(sharedAuthorizedUser.getSharedState()!, {
        [Role.Admin]: () => options[Role.Admin](sharedAuthorizedOrganization.getSharedState()!),
        [Role.Practitioner]: () => options[Role.Practitioner](sharedAuthorizedPractitioner.getSharedState()!),
        [Role.Census]: () => options[Role.Census](sharedAuthorizedPractitioner.getSharedState()!),
        [Role.Scriber]: () => options[Role.Scriber](sharedAuthorizedPractitioner.getSharedState()!),
        [Role.QA]: () => options[Role.QA](sharedAuthorizedPractitioner.getSharedState()!),
        [Role.Billing]: () => options[Role.Billing](sharedAuthorizedPractitioner.getSharedState()!),
        [Role.Admin1]: () => options[Role.Admin1](sharedAuthorizedPractitioner.getSharedState()!),
        [Role.Prm]: () => options[Role.Prm](sharedAuthorizedPractitioner.getSharedState()!),
        [Role.Audit]: () => options[Role.Audit](sharedAuthorizedPractitioner.getSharedState()!),
    })();
}

export function selectCurrentUserRoleResource(): WithId<Patient> | WithId<Practitioner> | WithId<Organization> {
    return matchCurrentUserRole<WithId<Patient> | WithId<Practitioner> | WithId<Organization>>({
        [Role.Admin]: (organization) => organization,
        [Role.Practitioner]: (practitioner) => practitioner,
        [Role.Census]: (practitioner) => practitioner,
        [Role.Scriber]: (practitioner) => practitioner,
        [Role.QA]: (practitioner) => practitioner,
        [Role.Billing]: (practitioner) => practitioner,
        [Role.Admin1]: (practitioner) => practitioner,
        [Role.Prm]: (practitioner) => practitioner,
        [Role.Audit]: (practitioner) => practitioner,
    });
}
