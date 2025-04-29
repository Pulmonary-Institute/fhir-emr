import { Bundle, Task, Encounter, Patient } from 'fhir/r4b';

import { compileAsArray, compileAsFirst, resolveReference, renderHumanName } from '@beda.software/emr/utils';
export const processNoteTaskCode = 'process-note';
export const qaNoteTaskCode = 'qa-note';
export const scribeNoteTaskCode = 'scribe-note';

export const visitQuestionnaireTypeCode = 'visit-questionnaire';
export const generatedNoteQRTypeCode = 'generated-note-qr';

const rawExtractProcessNoteTasks = compileAsArray<Bundle, Task>(
    `Bundle.entry.resource.where(
        resourceType = 'Task' 
        and code.coding.code = '${processNoteTaskCode}' 
        and partOf.exists().not()
    )`,
);
export const extractProcessNoteTasks = (bundle: Bundle): Task[] => {
    const tasks = rawExtractProcessNoteTasks(bundle);

    return tasks.sort((a: Task, b: Task) => {
        const nameA = getPatientFromTask(bundle, a);
        const nameB = getPatientFromTask(bundle, b);
        return nameA.localeCompare(nameB);
    });
};
const encounterCache = new Map<string, Encounter>();
const patientCache = new Map<string, Patient>();

export function getPatientFromTask(bundle: Bundle, task: Task): string {
    const encounterRef = task.encounter?.reference;
    if (!encounterRef) return '';

    let encounter = encounterCache.get(encounterRef);
    if (!encounter) {
        encounter = resolveReference<Encounter>(bundle, task.encounter!);
        if (encounter) {
            encounterCache.set(encounterRef, encounter);
        } else {
            return '';
        }
    }
    const patientRef = encounter.subject?.reference;
    if (!patientRef) return '';

    let patient = patientCache.get(patientRef);
    if (!patient) {
        patient = resolveReference<Patient>(bundle, encounter.subject!);
        if (patient) {
            patientCache.set(patientRef, patient);
        } else {
            return '';
        }
    }
    return patient.name?.[0]
        ? renderHumanName(patient.name[0])?.toLowerCase() ?? ''
        : '';
}
export const extractTaskByParentTask = (parentTask: Task, code: string) => {
    if (!parentTask.id) return undefined;
    return buildTaskByParent(code, parentTask.id);
};
export const buildTaskByParent = (code: string, parentTaskId: string) =>
    compileAsFirst<Bundle, Task>(
        `Bundle.entry.resource.where(
                resourceType = 'Task' 
                and code.coding.code = '${code}' 
                and partOf.reference = 'Task/${parentTaskId}'
            )`
    );

export function getVisitQuestionnaireRef(task: Task) {
    const output = task.input?.find((o) => o.type.coding?.[0]?.code === visitQuestionnaireTypeCode);

    return output?.valueReference;
}

export function getGeneratedNoteQRRef(task: Task) {
    const output = task.output?.find((o) => o.type.coding?.[0]?.code === generatedNoteQRTypeCode);

    return output?.valueReference;
}


