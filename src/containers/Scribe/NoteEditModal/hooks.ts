import { Encounter, Patient, QuestionnaireResponse, Task } from 'fhir/r4b';
import { useEffect, useState } from 'react';
import { fromFHIRReference } from 'sdc-qrf';

import { loadQuestionnaireResponseFormData, questionnaireIdLoader } from '@beda.software/emr/hooks';
import { getFHIRResource } from '@beda.software/emr/services';
import { useService } from '@beda.software/fhir-react';
import { isSuccess, mapSuccess, resolveMap, success } from '@beda.software/remote-data';

// import { AudioToText } from 'src/utils/extracttext';
import { getGeneratedNoteQRRef } from 'src/utils-frontend/task';

export interface Props {
    task: Task;
    encounter: Encounter;
    patient: Patient;
    reload: () => void;
}

export function useNoteEditModal(props: Props) {
    const { task, encounter } = props;
    const [response] = useService(async () => {
        const generatedNoteRef = getGeneratedNoteQRRef(task); //get referense to QuestionnaireResponse

        const practitionerNoteQRResponse = await getFHIRResource<QuestionnaireResponse>({
            reference: task.focus?.reference,
        });

        if (isSuccess(practitionerNoteQRResponse)) {
            const qr = practitionerNoteQRResponse.data;
            const qrId = fromFHIRReference(generatedNoteRef)?.id;
            return mapSuccess(
                await resolveMap({
                    generatedNoteQR:
                        qrId && generatedNoteRef
                            ? getFHIRResource<QuestionnaireResponse>(generatedNoteRef)
                            : Promise.resolve(success(null)),
                    practitionerNoteFormData: loadQuestionnaireResponseFormData({
                        questionnaireLoader: questionnaireIdLoader('practitioner-note-create'),
                        launchContextParameters: [
                            {
                                name: 'Encounter',
                                resource: encounter,
                            },
                        ],
                        initialQuestionnaireResponse: qr,
                    }),
                }),
                ({ practitionerNoteFormData, generatedNoteQR }) => {
                    return {
                        practitionerNoteFormData,
                        generatedNoteQR,
                    };
                },
            );
        }
        return practitionerNoteQRResponse;
    }, [task]);
    return { response };
}

export function useModalContentHight() {
    const [height, setHeight] = useState(0);

    const updateHeight = () => {
        const modalContentEl = document.getElementsByClassName('ant-modal-content')[0];
        const modalHeaderEl = document.getElementsByClassName('ant-modal-header')[0];
        const modalContentHeight = modalContentEl ? modalContentEl.getBoundingClientRect().height : 0;
        const modalHeaderHeight = modalHeaderEl ? modalHeaderEl.getBoundingClientRect().height : 0;
        const resultHeight = modalContentHeight - modalHeaderHeight;
        setHeight(resultHeight);
    };

    useEffect(() => {
        updateHeight();

        window.addEventListener('resize', updateHeight);

        return () => {
            window.removeEventListener('resize', updateHeight);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return { height };
}
