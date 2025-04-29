import { t } from '@lingui/macro';
import { notification } from 'antd';
import { Location, Organization } from 'fhir/r4b';
import { ReactElement } from 'react';

import { ModalTrigger, QuestionnaireResponseForm } from '@beda.software/emr/components';
import { questionnaireIdLoader } from '@beda.software/emr/hooks';

interface Props {
    location: Location;
    organization: Organization;
    onSuccess: () => void;
    trigger: ReactElement;
}

export function EditRoomModal(props: Props) {
    const { onSuccess, organization, location, trigger } = props;

    return (
        <ModalTrigger title={t`Edit Room`} trigger={trigger}>
            {({ closeModal }) => (
                <QuestionnaireResponseForm
                    questionnaireLoader={questionnaireIdLoader('room-edit')}
                    launchContextParameters={[
                        { name: 'Organization', resource: organization },
                        { name: 'Location', resource: location },
                    ]}
                    onSuccess={() => {
                        closeModal();
                        notification.success({ message: t`Room successfully updated` });
                        onSuccess();
                    }}
                    onCancel={closeModal}
                />
            )}
        </ModalTrigger>
    );
}
