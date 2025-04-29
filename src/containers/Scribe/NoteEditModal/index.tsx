import { Trans } from '@lingui/macro';
import { QuestionnaireResponse } from 'fhir/r4b';
import { useState } from 'react';
import { fromFHIRReference } from 'sdc-qrf';
import { ModalTrigger, Spinner, NoteEditResponseForm } from '@beda.software/emr/components';

import { questionnaireIdLoader } from '@beda.software/emr/hooks';
import { RenderRemoteData } from '@beda.software/fhir-react';

import { getGeneratedNoteQRRef, getVisitQuestionnaireRef } from 'src/utils-frontend/task';
import { Props, useNoteEditModal, useModalContentHight } from './hooks';

import s from './NoteEditModal.module.scss';
import { S } from './styles';

export function NoteEditModal(props: Props) {
    const [open, setOpen] = useState(false);

    const { task } = props;
    const qrRef = getGeneratedNoteQRRef(task);
    const qrId = qrRef ? fromFHIRReference(qrRef)?.id : undefined;

    if (!qrId) {
        return null;
    }

    return (
        <ModalTrigger
            title={<Trans>Process Note Editor</Trans>}
            trigger={
                <S.Button type="link">
                    <Trans>Note Edit</Trans>
                </S.Button>
            }
            modalProps={{
                width: 1080,
                afterOpenChange: (v) => setOpen(v),
                rootClassName: s.noteEditModal,
            }}
        >
            {({ closeModal }) => <>{open && <NoteEditModalContent {...props} closeModal={closeModal} />}</>}
        </ModalTrigger>
    );
}

interface NoteEditModalContentProps extends Props {
    closeModal: () => void;
}

function NoteEditModalContent(props: NoteEditModalContentProps) {
    const { closeModal, task, encounter, patient, reload } = props;
    const { response } = useNoteEditModal(props);
    const { height } = useModalContentHight();

    const visitQuestionnaireId = fromFHIRReference(getVisitQuestionnaireRef(task)).id;
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
        <RenderRemoteData remoteData={response} renderLoading={Spinner}>
            {(data: { practitionerNoteFormData: any; generatedNoteQR: any }) => (
                <>
                    <S.Container>
                        <S.GeneratedNoteColumn $height={height}>
                            <NoteEditResponseForm
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
                </>
            )}
        </RenderRemoteData>
    );
}
