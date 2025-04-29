import { Trans } from '@lingui/macro';
import { ParametersParameter } from 'fhir/r4b';

import { ModalTrigger, QuestionnaireResponseForm } from '@beda.software/emr/components';
import { questionnaireIdLoader } from '@beda.software/emr/hooks';

import { S } from './styles';

interface Props {
    title: string;
    questionnaireId: string;
    launchContextParameters?: ParametersParameter[];
}

export function NewAdmissionModal(props: Props) {
    const { title, launchContextParameters, questionnaireId } = props;

    return (
        <ModalTrigger
            title={title}
            trigger={
                <S.Button type="link">
                    <Trans>New admission</Trans>
                </S.Button>
            }
        >
            {({ closeModal }) => (
                <QuestionnaireResponseForm
                    questionnaireLoader={questionnaireIdLoader(questionnaireId)}
                    launchContextParameters={launchContextParameters}
                    onSuccess={() => {
                        closeModal();
                        location.reload();
                    }}
                    onCancel={closeModal}
                />
            )}
        </ModalTrigger>
    );
}
