import { Bundle, Location, Organization } from 'fhir/r4b';

import { compileAsArray } from '@beda.software/emr/utils';

export const extractLocationsByOrganization = (organization: Organization) =>
    compileAsArray<Bundle, Location>(
        `Bundle.entry.resource.where(
            resourceType = 'Location' 
                and managingOrganization.reference = 'Organization/${organization.id}'
        )`,
    );
