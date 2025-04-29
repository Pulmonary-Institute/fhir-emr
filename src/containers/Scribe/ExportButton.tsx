import { Trans } from '@lingui/macro';
import { Patient, Task } from 'fhir/r4b';
import { Link } from 'react-router-dom';
import { fromFHIRReference } from 'sdc-qrf';

import { getGeneratedNoteQRRef } from 'src/utils-frontend/task';

import { S } from './styles';

interface Props {
    task: Task;
    patient: Patient;
}

export function ExportButton(props: Props) {
    const { task, patient } = props;
    const patientId = patient?.id;
    const qrRef = getGeneratedNoteQRRef(task);
    const qrId = qrRef ? fromFHIRReference(qrRef)?.id ?? undefined : undefined;

    if (!qrId) {
        return null;
    }

    return (
        <Link to={`/print-patient-document/${patientId}/${qrId}`} target="_blank">
            <S.Button type="link" role="none">
                <Trans>Export</Trans>
            </S.Button>
        </Link>
    );
}
