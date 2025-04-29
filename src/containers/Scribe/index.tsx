import { t, Trans } from '@lingui/macro';
import { Encounter, Practitioner, Task, Organization, Patient, Bundle } from 'fhir/r4b';
//import moment from 'moment';
import { useEffect, useState } from 'react';
import moment from 'moment';

import { SearchBarColumnType } from '@beda.software/emr/dist/components/SearchBar/types';
import { customAction, questionnaireAction, ResourceListPage } from '@beda.software/emr/uberComponents';
import { renderHumanName, resolveReference } from '@beda.software/emr/utils';
import { getPatientFromTask } from '../../utils-frontend/task'
//import { parseFHIRDate } from '@beda.software/fhir-react';

import {
    extractProcessNoteTasks,
    processNoteTaskCode,
    scribeNoteTaskCode,
    extractTaskByParentTask,
    qaNoteTaskCode,
} from 'src/utils-frontend/task';

import { ExportButton } from './ExportButton';
import { getUserRol, getUserRolWithoutEvent, changeStatusEncounterByUser } from './hooks';
import { ProcessNoteModal } from './ProcessNoteModal';
import { StatusHistoryModal } from './StatusHistoryModal';
//import { S } from './styles';
import { stringFormatDateTime } from 'src/utils-frontend/date';
import { NoteEditModal } from './NoteEditModal';
interface TaskRow {
    resource: Task;
    bundle: Bundle;
}
export function Scribe() {
    const [formProcessStatusEdit, setFormProcessStatusEdit] = useState('');
    const [formProcessStatusEditBulk, setFormProcessStatusEditBulk] = useState('');
    const [rol, setRol] = useState('');

    useEffect(() => {
        loadFormProcessStatusEdit();
    }, []);
    const loadFormProcessStatusEdit = async () => {
        setFormProcessStatusEdit(await getUserRol());
        setFormProcessStatusEditBulk(await changeStatusEncounterByUser());
        setRol(await getUserRolWithoutEvent());
    };

    return (
        <ResourceListPage<Task>
            headerTitle={t`Scribe`}
            resourceType="Task"
            extractPrimaryResources={extractProcessNoteTasks}
            searchParams={{
                code: processNoteTaskCode,
                _revinclude: ['Task:part-of:Task'],
                _include: [
                    'Task:owner:Practitioner',
                    'Task:encounter:Encounter',
                    'Task:requester:Practitioner',
                    'Encounter:service-provider:Organization',
                    'Encounter:patient:Patient',
                ],
                'encounter:Encounter.status': 'finished',
            }}
            getTableColumns={() => [
                //{
                //title: <Trans>Due date</Trans>,
                //dataIndex: 'restriction-period',
                //key: 'restriction-period',
                //width: 132,
                //render: (_text, { resource }) => {
                //const dueDate = resource.restriction?.period?.end;
                //const isFinished = resource.businessStatus?.coding?.[0]?.code === 'completed';
                //const isOutdated =
                //!isFinished && !!dueDate && moment().isAfter(parseFHIRDate(dueDate).add(1, 'day'));
                // return dueDate ? <S.DueDate $outdated={isOutdated}>{formatHumanDate(dueDate)}</S.DueDate> : '';
                //},
                // },
                {
                    title: <Trans>DOS</Trans>,
                    dataIndex: 'visit-encounter-date',
                    key: 'visit-encounter-date',
                    width: 132,
                    render: (_text, { resource, bundle }) => {
                        if (!resource?.encounter) return null;

                        const visitEncounter = resolveReference<Encounter>(bundle, resource.encounter);
                        if (!visitEncounter?.period?.start) return null;

                        return stringFormatDateTime(visitEncounter.period.start);
                    },
                },
                {
                    title: <Trans>Patient</Trans>,
                    dataIndex: 'patient-name',
                    key: 'patient-name',
                    width: 132,
                    render: (_text, { resource, bundle }) => {
                        if (!resource?.encounter) return null;
                        const visitEncounter = resolveReference<Encounter>(bundle, resource.encounter);
                        if (!visitEncounter?.subject) return null;

                        const patient = resolveReference<Patient>(bundle, visitEncounter.subject);
                        if (!patient?.name?.length) return null;

                        return renderHumanName(patient.name[0]);
                    },
                    sorter: (a: TaskRow, b: TaskRow) => {
                        const nameA = getPatientFromTask(a.bundle, a.resource);
                        const nameB = getPatientFromTask(b.bundle, b.resource);
                        return nameA.localeCompare(nameB);
                    },
                },
                {
                    title: <Trans>DOB</Trans>,
                    dataIndex: 'dob',
                    key: 'dob',
                    width: 132,
                    render: (_text, { resource, bundle }) => {
                        if (!resource?.encounter) return null;

                        const visitEncounter = resolveReference<Encounter>(bundle, resource.encounter);
                        if (!visitEncounter?.subject) return null;

                        const patient = resolveReference<Patient>(bundle, visitEncounter.subject);
                        return patient?.birthDate || null;
                    },
                },
                {
                    title: <Trans>Provider</Trans>,
                    dataIndex: 'requester',
                    key: 'requester',
                    width: 132,
                    render: (_text, { resource, bundle }) => {
                        if (!resource?.requester) {
                            return null;
                        }

                        const practitioner = resolveReference<Practitioner>(bundle, resource.requester);

                        if (!practitioner || !practitioner.name?.length) {
                            return null;
                        }

                        return renderHumanName(practitioner.name[0]);
                    },
                },
                {
                    title: <Trans>Encounter Type</Trans>,
                    dataIndex: 'service-type',
                    key: 'service-type',
                    width: 132,
                    render: (_text, { resource, bundle }) => {
                        if (!resource?.encounter) return null;

                        const visitEncounter = resolveReference<Encounter>(bundle, resource.encounter);
                        return visitEncounter?.serviceType?.coding?.[0]?.display || null;
                    },
                },
                {
                    title: <Trans>Facility</Trans>,
                    dataIndex: 'encounter-service-provider',
                    key: 'encounter-service-provider',
                    width: 132,
                    render: (_text, { resource, bundle }) => {
                        if (!resource?.encounter) return null;

                        const visitEncounter = resolveReference<Encounter>(bundle, resource.encounter);
                        if (!visitEncounter?.serviceProvider) return null;

                        const organization = resolveReference<Organization>(bundle, visitEncounter.serviceProvider);
                        return organization?.name || null;
                    },
                },
                {
                    title: <Trans>Scriber</Trans>,
                    dataIndex: 'scribe-note-task-owner',
                    key: 'scribe-note-task-owner',
                    width: 132,
                    render: (_text, { resource, bundle }) => {
                        const scribeNoteTask = extractTaskByParentTask(resource, scribeNoteTaskCode)?.(bundle);
                        if (!scribeNoteTask?.owner) return null;

                        const practitioner = resolveReference<Practitioner>(bundle, scribeNoteTask.owner);
                        return practitioner?.name?.[0] ? renderHumanName(practitioner.name[0]) : null;
                    },
                },
                {
                    title: <Trans>QA</Trans>,
                    dataIndex: 'qa-note-task-owner',
                    key: 'qa-note-task-owner',
                    width: 132,
                    render: (_text, { resource, bundle }) => {
                        const qaNoteTask = extractTaskByParentTask(resource, qaNoteTaskCode)?.(bundle);
                        if (!qaNoteTask?.owner) return null;

                        const practitioner = resolveReference<Practitioner>(bundle, qaNoteTask.owner);
                        return practitioner?.name?.[0] ? renderHumanName(practitioner.name[0]) : null;
                    },
                },
            ]}
            getFilters={() => [
                {
                    id: 'business-status',
                    searchParam: 'business-status',
                    type: SearchBarColumnType.CHOICE,
                    placeholder: t`Choose status`,
                    options: [
                        {
                            code: 'new',
                            display: 'New',
                        },
                        {
                            code: 'for-qa',
                            display: 'For QA',
                        },
                        {
                            code: 'feedback-to-handle',
                            display: 'Feedback to handle',
                        },
                        {
                            code: 'completed',
                            display: 'Completed',
                        },
                        {
                            code: 'not-completed',
                            display: 'Not completed',
                        },
                    ].map(({ code, display }) => ({
                        value: {
                            Coding: {
                                code,
                                display,
                            },
                        },
                    })),
                    defaultValue: {
                        value: {
                            Coding: {
                                code: 'new',
                                display: 'New',
                            },
                        },
                    },
                },
                {
                    id: 'date',
                    searchParam: 'encounter:Encounter.date',
                    type: SearchBarColumnType.SINGLEDATE,
                    placeholder: t`Date`,
                    defaultValue: moment(),
                },
                {
                    id: 'restriction-period',
                    searchParam: 'due-date',
                    type: SearchBarColumnType.SINGLEDATE,
                    placeholder: t`Due date`,
                },
                {
                    id: 'patient-name',
                    searchParam: 'encounter:Encounter.patient:Patient.id',
                    type: SearchBarColumnType.REFERENCE,
                    placeholder: t`Choose patient`,
                    expression: 'Patient',
                    path: `name.given.first() + ' ' + name.family.first()`,
                },
                {
                    id: 'requester',
                    searchParam: 'requester',
                    type: SearchBarColumnType.REFERENCE,
                    placeholder: t`Choose practitioner`,
                    expression: 'Practitioner?_has:PractitionerRole:practitioner:role=practitioner',
                    path: `name.given.first() + ' ' + name.family.first()`,
                },
                {
                    id: 'encounter-service-provider',
                    searchParam: 'encounter:Encounter.service-provider:Organization.id',
                    type: SearchBarColumnType.REFERENCE,
                    placeholder: t`Choose facility`,
                    expression: 'Organization?type=dept',
                    path: `name`,
                },
                {
                    id: 'scribe-note-task-owner',
                    searchParam: 'scribe-note-task-owner',
                    type: SearchBarColumnType.REFERENCE,
                    placeholder: t`Choose scriber`,
                    expression: 'Practitioner?_has:PractitionerRole:practitioner:role=scriber',
                    path: `name.given.first() + ' ' + name.family.first()`,
                },
                {
                    id: 'qa-note-task-owner',
                    searchParam: 'qa-note-task-owner',
                    type: SearchBarColumnType.REFERENCE,
                    placeholder: t`Choose qa`,
                    expression: 'Practitioner?_has:PractitionerRole:practitioner:role=qa',
                    path: `name.given.first() + ' ' + name.family.first()`,
                },
            ]}
            getRecordActions={({ resource, bundle }, { reload }) => {
                const visitEncounter = resolveReference<Encounter>(bundle, resource.encounter!)!;
                const patient = resolveReference<Patient>(bundle, visitEncounter.subject!)!;
                return [
                    customAction(
                        <ProcessNoteModal
                            task={resource}
                            encounter={visitEncounter}
                            patient={patient}
                            reload={reload}
                        />,
                    ),
                    questionnaireAction(<Trans>Update status</Trans>, formProcessStatusEdit),
                    customAction(<StatusHistoryModal task={resource} />),
                    customAction(<ExportButton task={resource} patient={patient} />),
                    rol == 'admin' || rol == 'scriber'
                        ? customAction(
                            <NoteEditModal
                                task={resource}
                                encounter={visitEncounter}
                                patient={patient}
                                reload={reload}
                            />,
                        )
                        : '',
                ] as any;
            }}
            getBatchActions={() => [
                questionnaireAction(<Trans>Assign scriber</Trans>, 'scribe-note-task-batch-assign'),
                questionnaireAction(<Trans>Assign QA</Trans>, 'qa-note-task-batch-assign'),
                questionnaireAction(<Trans>Change Status</Trans>, formProcessStatusEditBulk),
            ]}
            defaultPageSize={50}
        ></ResourceListPage>
    );
}
