import { Trans } from '@lingui/macro';
import { useState } from 'react';

import { ModalTrigger, Spinner } from '@beda.software/emr/components';
import { RenderRemoteData } from '@beda.software/fhir-react';

import { Props, useStatusHistoryModal } from './hooks';
import { S } from './styles';

export function StatusHistoryModal(props: Props) {
    const [open, setOpen] = useState(false);
    return (
        <ModalTrigger
            title={<Trans>History</Trans>}
            trigger={
                <S.Button type="link">
                    <Trans>History</Trans>
                </S.Button>
            }
            modalProps={{
                width: 520,
                afterOpenChange: (v) => setOpen(v),
            }}
        >
            {() => <>{open && <ModalContent {...props} />}</>}
        </ModalTrigger>
    );
}

function ModalContent(props: Props) {
    const { task } = props;
    const { response } = useStatusHistoryModal(props);

    return (
        <RenderRemoteData remoteData={response} renderLoading={Spinner}>
            {({ changesHistory }) => <S.ChangesDiff id={task.id!} changes={changesHistory} />}
        </RenderRemoteData>
    );
}
