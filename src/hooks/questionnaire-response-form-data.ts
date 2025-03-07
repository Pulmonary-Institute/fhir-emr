import {
    QuestionnaireResponse as FHIRQuestionnaireResponse,
    Patient,
    Parameters,
    ParametersParameter,
    Questionnaire as FHIRQuestionnaire,
    Bundle,
    Resource,
    OperationOutcome,
} from 'fhir/r4b';
import moment from 'moment';
import {
    mapFormToResponse,
    mapResponseToForm,
    QuestionnaireResponseFormData,
    calcInitialContext,
    removeDisabledAnswers,
    toFirstClassExtension,
    fromFirstClassExtension,
} from 'sdc-qrf';

import {
    QuestionnaireResponse as FCEQuestionnaireResponse,
    ParametersParameter as FCEParametersParameter,
} from '@beda.software/aidbox-types';
import config from '@beda.software/emr-config';
import { formatFHIRDateTime, getReference, useService } from '@beda.software/fhir-react';
import { RemoteDataResult, failure, isFailure, isSuccess, mapSuccess, success } from '@beda.software/remote-data';

import { saveFHIRResource, service } from 'src/services/fhir';

export type { QuestionnaireResponseFormData } from 'sdc-qrf';

export type QuestionnaireResponseFormSaveResponse<R extends Resource = any> = {
    questionnaireResponse: FHIRQuestionnaireResponse;
    extracted: boolean;
    extractedBundle: Bundle<R>[];
    extractedError: OperationOutcome;
};

export interface QuestionnaireResponseFormProps {
    questionnaireLoader: QuestionnaireLoader;
    initialQuestionnaireResponse?: Partial<FHIRQuestionnaireResponse>;
    launchContextParameters?: ParametersParameter[];
    questionnaireResponseSaveService?: QuestionnaireResponseSaveService;
}

interface QuestionnaireServiceLoader {
    type: 'service';
    questionnaireService: () => Promise<RemoteDataResult<FHIRQuestionnaire>>;
}

interface QuestionnaireIdLoader {
    type: 'id';
    questionnaireId: string;
}

interface QuestionnaireIdWOAssembleLoader {
    type: 'raw-id';
    questionnaireId: string;
}

type QuestionnaireLoader = QuestionnaireServiceLoader | QuestionnaireIdLoader | QuestionnaireIdWOAssembleLoader;

type QuestionnaireResponseSaveService = (
    qr: FHIRQuestionnaireResponse,
) => Promise<RemoteDataResult<FHIRQuestionnaireResponse>>;

export const inMemorySaveService: QuestionnaireResponseSaveService = (qr: FHIRQuestionnaireResponse) =>
    Promise.resolve(success(qr));
export const persistSaveService: QuestionnaireResponseSaveService = (qr: FHIRQuestionnaireResponse) =>
    saveFHIRResource(qr);

export function questionnaireServiceLoader(
    questionnaireService: QuestionnaireServiceLoader['questionnaireService'],
): QuestionnaireServiceLoader {
    return {
        type: 'service',
        questionnaireService,
    };
}

export function questionnaireIdLoader(questionnaireId: string): QuestionnaireIdLoader {
    return {
        type: 'id',
        questionnaireId,
    };
}

export function questionnaireIdWOAssembleLoader(questionnaireId: string): QuestionnaireIdWOAssembleLoader {
    return {
        type: 'raw-id',
        questionnaireId,
    };
}

export function toQuestionnaireResponseFormData(
    questionnaire: FHIRQuestionnaire,
    questionnaireResponse: FHIRQuestionnaireResponse,
    launchContextParameters: ParametersParameter[] = [],
): QuestionnaireResponseFormData {
    return {
        context: {
            // TODO: we can't change type inside qrf utils
            questionnaire: toFirstClassExtension(questionnaire),
            questionnaireResponse: toFirstClassExtension(questionnaireResponse),
            launchContextParameters: launchContextParameters || [],
        },
        formValues: mapResponseToForm(
            toFirstClassExtension(questionnaireResponse),
            toFirstClassExtension(questionnaire),
        ),
    };
}

/*
    Hook uses for:
    On mount:
    1. Loads Questionnaire resource: either from service (assembled with subquestionnaires) or from id 
    2. Populates QuestionnaireResponse for that Questionnaire with passed
       launch context parameters
    3. Converts QuestionnaireRespnse data to initial form values and returns back


    handleSave:
    4. Uploads files attached to QuestionnaireResponse in AWS
    5. Validate questionnaireResponse with constraint operation
    6. Saves or stays in memory updated QuestionnaireResponse data from form values
    7. Applies related with Questionnaire mappers for extracting updated data to
       resources specified in the mappers
    8. Returns updated QuestionnaireResponse resource and extract result
**/
export async function loadQuestionnaireResponseFormData(props: QuestionnaireResponseFormProps) {
    const { launchContextParameters, questionnaireLoader, initialQuestionnaireResponse } = props;

    const fetchQuestionnaire = () => {
        if (questionnaireLoader.type === 'raw-id') {
            return service<FHIRQuestionnaire>({
                method: 'GET',
                url: `/Questionnaire/${questionnaireLoader.questionnaireId}`,
            });
        }
        if (questionnaireLoader.type === 'id') {
            return service<FHIRQuestionnaire>({
                method: 'GET',
                url: `/Questionnaire/${questionnaireLoader.questionnaireId}/$assemble`,
            });
        }

        return questionnaireLoader.questionnaireService();
    };

    const questionnaireRemoteData = await fetchQuestionnaire();

    if (isFailure(questionnaireRemoteData)) {
        return questionnaireRemoteData;
    }

    const params: Parameters = {
        resourceType: 'Parameters',
        parameter: [
            { name: 'questionnaire', resource: questionnaireRemoteData.data },
            ...(launchContextParameters || []),
        ],
    };

    let populateRemoteData: RemoteDataResult<FHIRQuestionnaireResponse>;
    if (initialQuestionnaireResponse?.id) {
        populateRemoteData = success(initialQuestionnaireResponse as FHIRQuestionnaireResponse);
    } else {
        populateRemoteData = await service<FHIRQuestionnaireResponse>({
            ...(config.sdcBackendUrl ? { baseURL: config.sdcBackendUrl } : {}),
            method: 'POST',
            url: '/Questionnaire/$populate',
            data: params,
        });
    }

    return mapSuccess(populateRemoteData, (populatedQR) => {
        const questionnaire = questionnaireRemoteData.data;
        const questionnaireResponse = {
            ...initialQuestionnaireResponse,
            ...populatedQR,
        };

        return toQuestionnaireResponseFormData(questionnaire, questionnaireResponse, launchContextParameters);
    });
}

export async function handleFormDataSave(
    props: QuestionnaireResponseFormProps & {
        formData: QuestionnaireResponseFormData;
    },
): Promise<RemoteDataResult<QuestionnaireResponseFormSaveResponse>> {
    const { formData, questionnaireResponseSaveService = persistSaveService, launchContextParameters } = props;
    const { formValues, context } = formData;
    const { questionnaireResponse, questionnaire } = context;
    const itemContext = calcInitialContext(formData.context, formValues);
    const enabledQuestionsFormValues = removeDisabledAnswers(questionnaire, formValues, itemContext);

    const finalFCEQuestionnaireResponse: FCEQuestionnaireResponse = {
        ...questionnaireResponse,
        ...mapFormToResponse(enabledQuestionsFormValues, questionnaire),
        status: 'completed',
        authored: formatFHIRDateTime(moment()),
    };
    const finalFHIRQuestionnaireResponse: FHIRQuestionnaireResponse =
        fromFirstClassExtension(finalFCEQuestionnaireResponse);
    const fhirQuestionnaire: FHIRQuestionnaire = fromFirstClassExtension(questionnaire);

    // Handle the case where questionnaireId is 'visit-encounter-batch-create'
    const sendData = async () => {
        const constraintRemoteData = await service({
            ...(config.sdcBackendUrl ? { baseURL: config.sdcBackendUrl } : {}),
            url: '/QuestionnaireResponse/$constraint-check',
            method: 'POST',
            data: {
                resourceType: 'Parameters',
                parameter: [
                    { name: 'Questionnaire', resource: fhirQuestionnaire },
                    { name: 'QuestionnaireResponse', resource: finalFHIRQuestionnaireResponse },
                    ...(launchContextParameters || []),
                ],
            },
        });

        if (isFailure(constraintRemoteData)) {
            return constraintRemoteData;
        }

        const saveQRRemoteData = await questionnaireResponseSaveService(finalFHIRQuestionnaireResponse);
        if (isFailure(saveQRRemoteData)) {
            return saveQRRemoteData;
        }

        const extractRemoteData = await service<any>({
            ...(config.sdcBackendUrl ? { baseURL: config.sdcBackendUrl } : {}),
            method: 'POST',
            url: '/Questionnaire/$extract',
            data: {
                resourceType: 'Parameters',
                parameter: [
                    { name: 'questionnaire', resource: fhirQuestionnaire },
                    { name: 'questionnaire_response', resource: saveQRRemoteData.data },
                    ...(launchContextParameters || []),
                ],
            },
        });

        return success({
            questionnaireResponse: saveQRRemoteData.data,
            extracted: isSuccess(extractRemoteData),
            extractedError: isFailure(extractRemoteData) ? extractRemoteData.error : undefined,
            extractedBundle: isSuccess(extractRemoteData) ? extractRemoteData.data : undefined,
        });
    };

    // Safe handling of questionnaireId with optional chaining
    const questionnaireId = itemContext.questionnaire.mapping?.[0]?.id;

    if (questionnaireId === 'visit-encounter-delete-extract') {
        const patient = launchContextParameters?.[0]?.resource;
        const resource = itemContext.resource;

        deletePatientLocalStorage(resource, patient);
    }

    if (questionnaireId === 'visit-encounter-batch-create-extract') {
        const resource = itemContext.resource;
        const patient = launchContextParameters?.[0]?.resource;

        const availableCensus = await availableEncounter(resource, patient);
        if (!availableCensus.success) {
            return failure({ error: availableCensus.message });
        }
        return sendData();
    } else {
        return sendData();
    }
}

export function useQuestionnaireResponseFormData(props: QuestionnaireResponseFormProps, deps: any[] = []) {
    const [response] = useService<QuestionnaireResponseFormData>(async () => {
        const r = await loadQuestionnaireResponseFormData(props);

        return mapSuccess(r, ({ context, formValues }) => {
            const result: QuestionnaireResponseFormData = {
                formValues,
                context: {
                    launchContextParameters: context.launchContextParameters as unknown as FCEParametersParameter[],
                    questionnaire: context.questionnaire,
                    questionnaireResponse: context.questionnaireResponse,
                },
            };
            return result;
        });
    }, [props, ...deps]);

    const handleSave = async (
        qrFormData: QuestionnaireResponseFormData,
    ): Promise<RemoteDataResult<QuestionnaireResponseFormSaveResponse>> =>
        handleFormDataSave({
            ...props,
            formData: qrFormData,
        });

    return { response, handleSave };
}

type PatientQuestionnaireResponseFormProps = QuestionnaireResponseFormProps & {
    patient: Patient;
};

export function usePatientQuestionnaireResponseFormData(
    props: PatientQuestionnaireResponseFormProps,
    deps: any[] = [],
) {
    const { initialQuestionnaireResponse, patient, questionnaireLoader, launchContextParameters } = props;

    return useQuestionnaireResponseFormData(
        {
            initialQuestionnaireResponse: {
                resourceType: 'QuestionnaireResponse',
                subject: getReference(patient),
                source: getReference(patient),
                ...initialQuestionnaireResponse,
            },
            questionnaireLoader,
            launchContextParameters: [
                ...(launchContextParameters || []),
                {
                    name: 'LaunchPatient',
                    resource: patient,
                },
            ],
        },
        deps,
    );
}

/**
 * Function to check if the patient can have an encounter recorded.
 * - Ensures patient status is 'in-progress'
 * - Checks duplicate visit types for the same day
 * - Prevents conflicting visit types (Pulmonary vs Acute Care Response)
 * - Updates existing entry if user submits data on a different date
 */
async function availableEncounter(resource: any, patient: any) {
    const patientId = patient?.entry?.[0]?.resource?.id;
    const type = patient?.entry?.[0]?.resource?.resourceType;
    if (!patientId) return { success: false, message: 'Invalid patient ID.' };

    // Extract patient status
    const patientStatus = patient?.entry?.[0]?.resource?.status;
    if (patientStatus !== 'in-progress') {
        return { success: false, message: 'Only patients with status "in-progress" can have encounters recorded.' };
    }

    // Extract visit details
    const newVisitType = resource.item?.[3]?.answer?.[0]?.value?.Coding?.code?.toLowerCase();
    const newDisplay = resource.item?.[3]?.answer?.[0]?.value?.Coding?.display;
    const visitDate = resource.item?.[1]?.answer?.[0]?.value?.date;

    // Construct practitioner object
    const newEntry = {
        id: type + '/' + patientId,
        status: patientStatus,
        visitType: [newVisitType],
        display: [newDisplay],
        date: visitDate,
    };

    // Retrieve existing data from localStorage
    const storedData = localStorage.getItem(`patient_${type + '/' + patientId}`);
    let existingEntries: any[] = storedData ? JSON.parse(storedData) : [];

    // Filter existing entries by date
    const sameDayEntries = existingEntries.filter((entry: any) => entry.date === visitDate);

    // Check for duplicate visit type on the same day
    if (sameDayEntries.some((entry: any) => entry.visitType.includes(newVisitType))) {
        return { success: false, message: 'Duplicate visit type for the same patient on the same day is not allowed.' };
    }

    // Check for conflicting visit types on the same day
    const visitTypesSet = new Set(sameDayEntries.flatMap((entry: any) => entry.visitType));

    if (
        (newVisitType === 'pulmonary' && visitTypesSet.has('acute-care-response')) ||
        (newVisitType === 'acute-care-response' && visitTypesSet.has('pulmonary'))
    ) {
        return {
            success: false,
            message: "Cannot submit 'Pulmonary' and 'Acute Care Response' for the same patient on the same day.",
        };
    }

    // Check for duplicate visit type and display combination
    if (
        sameDayEntries.some(
            (entry: any) => entry.visitType.includes(newVisitType) && entry.display.includes(newDisplay),
        )
    ) {
        return {
            success: false,
            message: 'Same visit type and display already exist for this patient on the same day.',
        };
    }

    // Update existing entry if patient already exists, otherwise add a new entry
    const existingPatient = existingEntries.find((entry: any) => entry.date === visitDate);
    if (existingPatient) {
        existingPatient.visitType.push(newVisitType);
        existingPatient.display.push(newDisplay);
    } else {
        existingEntries.push(newEntry);
    }

    // Save updated data back to localStorage
    localStorage.setItem(`patient_${type + '/' + patientId}`, JSON.stringify(existingEntries));

    return { success: true, message: 'Send to Census successfully.' };
}

// Delete localStorage Patient Data
function deletePatientLocalStorage(resource: any, patient: any) {
    const patientId = patient?.partOf?.reference;
    const serviceDisplay = patient?.serviceType?.coding?.[0]?.display;
    const serviceType = patient?.serviceType?.coding?.[0]?.code;

    // Retrieve existing patient data from localStorage
    const existingPatientData = JSON.parse(localStorage.getItem(`patient_${patientId}`) || '[]');

    // Find the patient data by ID
    const updatedEntries = existingPatientData.map((entry: any) => {
        if (entry.id === patientId) {
            // Remove serviceDisplay from the display array
            entry.display = entry.display.filter((display: string) => display !== serviceDisplay);

            // Remove serviceType from the visitType array
            entry.visitType = entry.visitType.filter((type: string) => type !== serviceType);
        }
        return entry;
    });

    // If the entries have been updated, save the updated data back to localStorage
    localStorage.setItem(`patient_${patientId}`, JSON.stringify(updatedEntries));
}
