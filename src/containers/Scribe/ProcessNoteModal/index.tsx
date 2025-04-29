import { Trans } from '@lingui/macro';
import { QuestionnaireResponse } from 'fhir/r4b';
import { useEffect, useState } from 'react';
import { fromFHIRReference } from 'sdc-qrf';
import { ModalTrigger, QuestionnaireResponseForm, Spinner } from '@beda.software/emr/components';
import { questionnaireIdLoader } from '@beda.software/emr/hooks';
import { RenderRemoteData } from '@beda.software/fhir-react';
import { getVisitQuestionnaireRef } from 'src/utils-frontend/task';
import { ExtractTextFromAudio } from 'src/utils-frontend/extracttext';
import { Props, useProcessNoteModal, useModalContentHight } from './hooks';
import s from './ProcessNoteModal.module.scss';
import { S } from './styles';
import { EnhancedReadonlyForm } from 'src/containers/Scribe/ProcessNoteModal/EnhancedReadonlyForm';
import config from '@beda.software/emr-config';

const whisperApiUrl = config.whisperApiUrl;

// Define the Gemini API response interface
interface GeminiResponse {
    candidates?: [
        {
            content?: {
                parts?: [
                    {
                        text?: string;
                    },
                ];
            };
        },
    ];
}

interface Prompt {
    id: number;
    prompt: string;
    type: string;
}

interface FormData {
    Patient?: string;
    Facility?: string;
    Room?: string;
    AddNewRoom?: boolean;
    NewRoomNumber?: string;
    TimeOfService?: string;
    CPT?: string;
    ICD10?: string;
    HPI?: string;
    PhysicalExam?: string;
    Plan?: string;
    BPM?: string;
    RespiratoryRate?: string;
    BloodPressure?: string;
    RadiologyLaboratory?: string;
    transcription?: string;
}

export function ProcessNoteModal(props: Props) {
    const [open, setOpen] = useState(false);
    return (
        <ModalTrigger
            title={<Trans>Process note</Trans>}
            trigger={
                <S.Button type="link">
                    <Trans>Process note</Trans>
                </S.Button>
            }
            modalProps={{
                width: 1080,
                afterOpenChange: (v) => setOpen(v),
                rootClassName: s.processNoteModal,
            }}
        >
            {({ closeModal }) => <>{open && <ProcessNoteModalContent {...props} closeModal={closeModal} />}</>}
        </ModalTrigger>
    );
}

interface ProcessNoteModalContentProps extends Props {
    closeModal: () => void;
}

function ProcessNoteModalContent(props: ProcessNoteModalContentProps) {
    const { closeModal, task, encounter, patient, reload } = props;
    const { response } = useProcessNoteModal(props);
    const { height } = useModalContentHight();
    const [updatedResponse, setUpdatedResponse] = useState<any>(response);
    const [loading, setLoading] = useState<boolean>(false);
    const [selectedPrompt, setSelectedPrompt] = useState<string>('');

    useEffect(() => {
        if (response.status == 'Success') {
            setLoading(true);
        }
    }, [response]);

    useEffect(() => {
        getTextFromAudio(response);
    }, [loading]);

    const getTextFromAudio = async (response: any) => {
        const formValues = response.data?.practitionerNoteFormData?.formValues;
        const questionData = formValues?.['audio-recording'];
        const serviceType =
            response.data?.practitionerNoteFormData?.context?.launchContextParameters?.[0]?.resource?.serviceType
                ?.coding?.[0]?.code;

        if (formValues) {
            const getString = (key: string, subKey: string = 'string') => formValues[key]?.[0]?.value?.[subKey] ?? '-';

            const getBool = (key: string) => formValues[key]?.[0]?.value?.boolean ?? false;

            const getVitalSign = (key: string) => {
                const items = formValues['vital-signs-group']?.items?.[key];
                return Array.isArray(items) && items.length > 0 ? (items[0]?.value?.string ?? '-') : '-';
            };

            const formData = {
                Patient: getString('patient-name'),
                Facility: getString('organization-name'),
                Room: getString('location-reference', 'Reference')?.display ?? '-',
                AddNewRoom: getBool('add-new-room'),
                NewRoomNumber: getString('new-room-number'),
                TimeOfService: getString('time-of-service', 'dateTime'),
                CPT: formValues?.['procedure-codes']?.[0]?.value?.Coding?.code ?? '-',
                ICD10: formValues?.['admission-diagnoses']?.[0]?.value?.Coding?.code ?? '-',
                HPI: getString('HPI'),
                PhysicalExam: getString('physical-exam'),
                Plan: getString('plan'),
                OxygenSaturation: getVitalSign('oxygen-saturacion'),
                BPM: getVitalSign('bpm'),
                RespiratoryRate: getVitalSign('respiratory-rate'),
                BloodPressure: getVitalSign('blood-pressure'),
                RadiologyLaboratory: getString('radiology-laboratory'),
            };

            // Fetch and set the prompt
            if (serviceType) {
                try {
                    const promptResponse = await fetch(`${whisperApiUrl}/prompts`);
                    const { prompts = [] } = await promptResponse.json();
                    const filteredPrompts = prompts.filter((p: Prompt) => p?.type === serviceType);
                    setSelectedPrompt(filteredPrompts[0]?.prompt);
                } catch (e) {
                    console.error('Error fetching prompts:', e);
                }
            }

            let transcription = '';

            try {
                if (questionData) {
                    transcription = await ExtractTextFromAudio(questionData);
                }

                const formDataWithTranscript = {
                    ...formData,
                    transcription,
                };

                // Get AI summary
                let aiSummary = '';
                try {
                    const geminiResult = await callGeminiApi(formDataWithTranscript);
                    aiSummary = geminiResult.organizedText;
                } catch (geminiError) {
                    aiSummary = 'Error retrieving AI summary. See console for details.';
                }

                // Update formData with AI and transcription
                const updatedFormData = updateFormDataWithTranscription(response, transcription, aiSummary);
                const updatedResponseData = {
                    ...response,
                    data: {
                        ...response.data,
                        practitionerNoteFormData: updatedFormData,
                    },
                };

                setUpdatedResponse(updatedResponseData);
            } catch (error) {
                console.error('Processing Error:', error);
            } finally {
                setLoading(false);
            }
        } else {
            setLoading(false);
        }
    };

    // call GeminiAPI
    const callGeminiApi = async (updateFormData: FormData): Promise<{ organizedText: string }> => {
        const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
        const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

        const convertToString = JSON.stringify(updateFormData);

        const requestBody = {
            model: 'gemini-pro',
            contents: [
                {
                    role: 'user',
                    parts: [
                        {
                            text: `${selectedPrompt}
                        Here's the encounter text:
                        ${convertToString}`,
                        },
                    ],
                },
            ],
            generation_config: {
                temperature: 0.3,
                max_output_tokens: 500,
            },
        };

        const response = await fetch(`${apiUrl}?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.log(errorData);
        }

        const responseData: GeminiResponse = await response.json();
        let organizedText = responseData?.candidates?.[0]?.content?.parts?.[0]?.text ?? 'No organized text returned.';

        // Don't call formatMarkdownForFHIR - keep original markdown
        return { organizedText };
    };

    // Update Formdata for transcription
    const updateFormDataWithTranscription = (response: any, transcription: string, aiSummary: string) => {
        // Create AI Summary item with markdown support
        const aiSummaryItem = {
            initialExpression: {
                language: 'text/fhirpath',
                expression:
                    "%VisitRelatedData.entry.resource.entry.resource.where(type='Audio').repeat(item).where(linkId='AISummary').answer.valueString",
            },
            linkId: 'AISummary',
            text: 'AI Summary',
            type: 'text',
            extension: [
                {
                    url: 'http://hl7.org/fhir/StructureDefinition/rendering-markdown',
                    valueBoolean: true,
                },
                {
                    url: 'http://hl7.org/fhir/StructureDefinition/questionnaire-itemControl',
                    valueCodeableConcept: {
                        coding: [
                            {
                                system: 'http://hl7.org/fhir/questionnaire-item-control',
                                code: 'text-box',
                            },
                        ],
                    },
                },
            ],
        };

        // Filter out any existing AISummary items to avoid duplication
        const filteredItems = response.data.practitionerNoteFormData.context.questionnaire.item.filter(
            (item: any) => item.linkId !== 'AISummary',
        );

        return {
            ...response.data.practitionerNoteFormData,
            formValues: {
                ...response.data.practitionerNoteFormData.formValues,
                AudioToText: [
                    {
                        question: 'AudioToText',
                        value: { string: transcription },
                        items: {},
                    },
                ],
                AISummary: [
                    {
                        question: 'AISummary',
                        value: { string: aiSummary },
                        items: {},
                    },
                ],
            },
            context: {
                ...response.data.practitionerNoteFormData.context,
                questionnaire: {
                    ...response.data.practitionerNoteFormData.context.questionnaire,
                    item: [
                        ...filteredItems,
                        {
                            initialExpression: {
                                language: 'text/fhirpath',
                                expression:
                                    "%VisitRelatedData.entry.resource.entry.resource.where(type='Audio').repeat(item).where(linkId='AudioToText').answer.valueString",
                            },
                            linkId: 'AudioToText',
                            text: 'Audio Transcription',
                            type: 'text',
                        },
                        aiSummaryItem,
                    ],
                },
            },
        };
    };

    const visitQuestionnaireId = fromFHIRReference(getVisitQuestionnaireRef(task))?.id ?? '';
    const initialQR: Partial<QuestionnaireResponse> = {
        resourceType: 'QuestionnaireResponse',
        encounter: {
            reference: `Encounter/${encounter.id}`,
        },
        subject: encounter.subject,
        source: task.requester,
        questionnaire: visitQuestionnaireId,
    };

    return (
        <RenderRemoteData remoteData={updatedResponse} renderLoading={Spinner}>
            {(data: { practitionerNoteFormData: any; generatedNoteQR: any }) => (
                <>
                    {loading ? (
                        <Spinner />
                    ) : (
                        <S.Container>
                            <S.ReadonlyFormColumn $height={height}>
                                {loading ? (
                                    <Spinner />
                                ) : (
                                    <>
                                        {/* Replace the standard form with your enhanced form */}
                                        <EnhancedReadonlyForm formData={data.practitionerNoteFormData} />
                                    </>
                                )}
                            </S.ReadonlyFormColumn>

                            <S.GeneratedNoteColumn $height={height}>
                                <QuestionnaireResponseForm
                                    questionnaireLoader={questionnaireIdLoader(visitQuestionnaireId)}
                                    launchContextParameters={[
                                        { name: 'Task', resource: task },
                                        { name: 'Patient', resource: patient },
                                    ]}
                                    initialQuestionnaireResponse={data.generatedNoteQR ?? initialQR}
                                    onSuccess={() => {
                                        closeModal();
                                        reload();
                                    }}
                                    onCancel={closeModal}
                                />
                            </S.GeneratedNoteColumn>
                        </S.Container>
                    )}
                </>
            )}
        </RenderRemoteData>
    );
}
