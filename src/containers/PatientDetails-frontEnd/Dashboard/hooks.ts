import { Account, Condition, Coverage, Encounter, Organization, Patient } from 'fhir/r4b';

import { getFHIRResources } from '@beda.software/emr/services';
import { extractBundleResources, useService } from '@beda.software/fhir-react';
import { mapSuccess } from '@beda.software/remote-data';

import { admissionEncounterClassCode } from 'src/utils-frontend/encounter';

export function useAdmissionEncounter(patient: Patient) {
    const [response] = useService(async () =>
        mapSuccess(
            await getFHIRResources<Encounter | Condition | Coverage | Organization | Account>('Encounter', {
                patient: patient.id,
                class: [admissionEncounterClassCode],
                _sort: ['-createdAt'],
                _include: [
                    'Encounter:diagnosis:Condition',
                    'Encounter:account:Account',
                    'Account:coverage:Coverage',
                    'Coverage:payor:Organization',
                ],
            }),
            (bundle) => {
                const currentAdmissionEncounter = extractBundleResources(bundle).Encounter[0];
                const conditions = extractBundleResources(bundle).Condition;
                const accounts = extractBundleResources(bundle).Account;
                const coverages = extractBundleResources(bundle).Coverage;
                const organizations = extractBundleResources(bundle).Organization;

                const currentAdmissionConditions = conditions.filter(
                    (c) => c.encounter?.reference === `Encounter/${currentAdmissionEncounter.id}`,
                );
                const currentAdmissionAccount = accounts.filter(
                    (a) => `Account/${a.id}` === currentAdmissionEncounter.account?.[0].reference,
                )[0];
                const currentAdmissionCoverage = coverages.filter(
                    (c) => `Coverage/${c.id}` === currentAdmissionAccount.coverage?.[0].coverage.reference,
                )[0];
                const currentAdmissionOrganization = organizations.filter(
                    (o) => `Organization/${o.id}` === currentAdmissionCoverage.payor?.[0].reference,
                )[0];

                return {
                    currentAdmissionEncounter,
                    currentAdmissionConditions,
                    coverage: currentAdmissionCoverage,
                    encounters: extractBundleResources(bundle).Encounter,
                    organization: currentAdmissionOrganization,
                };
            },
        ),
    );

    return { response };
}
