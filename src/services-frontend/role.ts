import { User } from '@beda.software/aidbox-types';
import { getFHIRResource, getFHIRResources } from '@beda.software/emr/services';
import {
    sharedAuthorizedOrganization,
    sharedAuthorizedPractitioner,
    sharedAuthorizedPractitionerRoles,
    sharedAuthorizedUser,
} from '@beda.software/emr/sharedState';
import { extractBundleResources } from '@beda.software/fhir-react';
import { isSuccess } from '@beda.software/remote-data';
import { Organization, Practitioner, PractitionerRole } from 'fhir/r4b';
import { Role, selectUserRole } from 'src/utils-frontend/role';

export async function populateUserInfoSharedState(user: User) {
    sharedAuthorizedUser.setSharedState(user);

    if (!user.role) {
        return Promise.resolve();
    }

    const loadPractitioner = async () => {
        const practitionerId = user.role![0]!.links!.practitioner!.id;
        const practitionerResponse = await getFHIRResource<Practitioner>({
            reference: `Practitioner/${practitionerId}`,
        });
        if (isSuccess(practitionerResponse)) {
            sharedAuthorizedPractitioner.setSharedState(practitionerResponse.data);
        } else {
            console.error(practitionerResponse.error);
        }

        const practitionerRolesResponse = await getFHIRResources<PractitionerRole>('PractitionerRole', {
            practitioner: `Practitioner/${practitionerId}`,
        });

        if (isSuccess(practitionerRolesResponse)) {
            const practitionerRoles = extractBundleResources(practitionerRolesResponse.data).PractitionerRole;
            sharedAuthorizedPractitionerRoles.setSharedState(practitionerRoles);
        } else {
            console.error(practitionerRolesResponse.error);
        }
    };

    const loadOrganization = async () => {
        const organizationId = user.role![0]!.links!.organization!.id;
        const organizationResponse = await getFHIRResource<Organization>({
            reference: `Organization/${organizationId}`,
        });

        if (isSuccess(organizationResponse)) {
            sharedAuthorizedOrganization.setSharedState(organizationResponse.data);
        } else {
            console.error(organizationResponse.error);
        }
    };

    const fetchUserRoleDetails = selectUserRole(user, {
        [Role.Admin]: loadOrganization,
        [Role.Practitioner]: loadPractitioner,
        [Role.Census]: loadPractitioner,
        [Role.Scriber]: loadPractitioner,
        [Role.QA]: loadPractitioner,
        [Role.Billing]: loadPractitioner,
        [Role.Admin1]: loadPractitioner,
        [Role.Prm]: loadPractitioner,
        [Role.Audit]: loadPractitioner,
    });

    await fetchUserRoleDetails();
}
