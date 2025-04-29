import { Trans } from '@lingui/macro';
import { Button } from 'antd';
import { ParametersParameter } from 'fhir/r4b';

import { ModalTrigger, QuestionnaireResponseForm } from '@beda.software/emr/components';
import { questionnaireIdLoader } from '@beda.software/emr/hooks';

interface Props {
    title: string;
    questionnaireId: string;
    launchContextParameters?: ParametersParameter[];
}

export function DischargeModal(props: Props) {
    const { title, launchContextParameters, questionnaireId } = props;

    return (
        <ModalTrigger
            title={title}
            trigger={
                <Button type="primary">
                    <Trans>Discharge</Trans>
                </Button>
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
