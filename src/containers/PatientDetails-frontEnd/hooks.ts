import { CarePlan, Encounter, Patient } from 'fhir/r4b';

import { getFHIRResources } from '@beda.software/emr/services';
import { WithId, extractBundleResources, useService } from '@beda.software/fhir-react';
import { mapSuccess, resolveMap } from '@beda.software/remote-data';

import { admissionEncounterClassCode } from 'src/utils-frontend/encounter';

export interface PatientInformation {
    patient: WithId<Patient>;
    carePlans: WithId<CarePlan>[];
    encounter: WithId<Encounter>;
}

export function usePatientResource(config: { id: string }) {
    return useService(
        async () =>
            mapSuccess(
                await resolveMap({
                    bundle: getFHIRResources<Patient | CarePlan>('Patient', {
                        _id: config.id,
                        _revinclude: ['CarePlan:subject'],
                    }),
                    encounterBundle: getFHIRResources<Encounter>('Encounter', {
                        patient: config.id,
                        class: [admissionEncounterClassCode],
                        _sort: ['-createdAt'],
                        _count: 1,
                    }),
                }),
                ({ bundle, encounterBundle }): PatientInformation => {
                    const { Patient, CarePlan } = extractBundleResources(bundle);
                    const encounter = extractBundleResources(encounterBundle).Encounter[0];
                    if (!encounter) {
                        throw new Error('Encounter not found for the given patient ID');
                    }
    
                    return { patient: Patient[0]!, carePlans: CarePlan, encounter };
                },
            ),
        [config.id],
    );
}
