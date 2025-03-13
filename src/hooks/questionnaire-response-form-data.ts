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

const baseURL = config.baseURL;

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
    const reference = type + '/' + patientId;

    const token = localStorage.getItem('token');

    const response = await fetch(`${baseURL}/fhir/Encounter?_sort=last-visit-date`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
        },
    });

    const data = await response.json();
    console.log('data:', { data }, { reference });
    // Filter encounters where partOf.reference matches the generated reference
    const filteredEncounters = data?.entry?.filter((entry: any) => entry?.resource?.partOf?.reference === reference);
    console.log('filteredEncounters:', filteredEncounters);
    // Extract patient status
    const patientStatus = patient?.entry?.[0]?.resource?.status;
    if (patientStatus !== 'in-progress') {
        return { success: false, message: 'Only patients with status "in-progress" can have encounters recorded.' };
    }

    // Extract visit details from the new resource
    const newVisitType = resource.item?.[3]?.answer?.[0]?.value?.Coding?.code;
    const newDisplay = resource.item?.[3]?.answer?.[0]?.value?.Coding?.display;
    const visitDate = resource.item?.[1]?.answer?.[0]?.value?.date;

    if (!newVisitType || !newDisplay || !visitDate) {
        return { success: false, message: 'Invalid encounter data.' };
    }

    // Define restricted visit types
    const pulmonaryType = 'pulmonary';
    const acuteCareType = 'acute-care-response';

    // Find encounters with the same date
    const sameDayEncounters = filteredEncounters.filter((entry: any) => entry?.resource?.period?.start === visitDate);
    console.log('filter same day filter:', sameDayEncounters, newVisitType);
    // Rule 1: Can't submit the same Type of visit on the same day
    if (
        sameDayEncounters.some(
            (entry: any) =>
                entry?.resource?.serviceType?.coding?.[0]?.code === newVisitType &&
                // entry?.resource?.status == 'planned',
                entry?.resource?.status !== 'entered-in-error',
        )
    ) {
        return {
            success: false,
            message: `You cannot submit the same visit type (${newDisplay}) twice on the same day.`,
        };
    }

    // Rule 2: Can't submit "Pulmonary" and "Acute Care Response" together on the same day
    const hasPulmonary = sameDayEncounters.some(
        (entry: any) => entry?.resource?.serviceType?.coding?.[0]?.code === pulmonaryType,
    );
    const hasAcuteCare = sameDayEncounters.some(
        (entry: any) => entry?.resource?.serviceType?.coding?.[0]?.code === acuteCareType,
    );

    if ((newVisitType === pulmonaryType && hasAcuteCare) || (newVisitType === acuteCareType && hasPulmonary)) {
        return {
            success: false,
            message: `You cannot submit both "Pulmonary" and "Acute Care Response" on the same day.`,
        };
    }

    // Rule 3: "Pulmonary" or any other type + "Cardiology" or any other type is allowed
    if ((hasPulmonary || newVisitType === pulmonaryType) && (hasAcuteCare || newVisitType === acuteCareType)) {
        return { success: false, message: `Only one of "Pulmonary" or "Acute Care Response" is allowed per day.` };
    }

    return { success: true, message: 'Encounter can be recorded.' };
}
