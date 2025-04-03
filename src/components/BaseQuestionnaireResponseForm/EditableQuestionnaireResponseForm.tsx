import { t } from '@lingui/macro';
import classNames from 'classnames';
import { QuestionnaireResponse } from 'fhir/r4b';
import { notification, Button } from 'antd';
import _ from 'lodash';
import { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    FormItems,
    GroupItemComponent,
    ItemControlGroupItemComponentMapping,
    QuestionItemComponentMapping,
    QuestionnaireResponseFormData,
} from 'sdc-qrf';

import { RemoteData, isSuccess } from '@beda.software/remote-data';

import s from './EditableQuestionnaireResponseForm.module.scss';
import TiptapEditor from './TiptabEditor';
import { FormFooter } from './FormFooter';

export interface BaseQuestionnaireResponseFormProps {
    formData: QuestionnaireResponseFormData;
    onSubmit?: (formData: QuestionnaireResponseFormData) => Promise<any>;
    itemControlGroupItemComponents?: ItemControlGroupItemComponentMapping;
    questionItemComponents?: QuestionItemComponentMapping;
    groupItemComponent?: GroupItemComponent;
    onCancel?: () => void;
    draftSaveResponse?: RemoteData<QuestionnaireResponse>;
}

export function EditableQuestionnaireResponseForm(props: BaseQuestionnaireResponseFormProps) {
    const { onSubmit, formData, draftSaveResponse } = props;

    const questionnaireId = formData.context.questionnaire.assembledFrom;

    // Initialize form with default values
    const methods = useForm<FormItems>({
        defaultValues: formData.formValues,
        mode: 'onBlur',
    });

    const { setValue, handleSubmit, watch } = methods;
    const formValues: any = watch();
    console.log({ formValues });
    const [isLoading, setIsLoading] = useState(false);

    const copyAllToClipboard = () => {
        let textToCopy = '';

        const generateTextForField = (label: string, value: any) => {
            if (value) {
                return `\n${label}: ${value}`;
            }
            return `\n${label}:`;
        };

        textToCopy += generateTextForField('Facility', formValues['patient-facility']?.[0]?.value?.string);
        textToCopy += generateTextForField('Type of Care', formValues['patient-visit-type']?.[0]?.value?.string);
        textToCopy += generateTextForField('Name', formValues['patient-name']?.[0]?.value?.string);
        textToCopy += generateTextForField('Date of Birth', formValues['patient-birth-date']?.[0]?.value?.date);
        textToCopy += generateTextForField('Time of Service', formValues['patient-service-time']?.[0]?.value?.dateTime);
        textToCopy += generateTextForField('Code Status', formValues['patient-code']?.[0]?.value?.string);
        textToCopy += generateTextForField(
            'Charlson Comorbidity Index(CCI)',
            formValues['patient-cci']?.[0]?.value?.string,
        );
        textToCopy += generateTextForField('HPI', formValues['patient-hpi']?.[0]?.value?.string);
        textToCopy += generateTextForField('Problem list', formValues['patient-problem-list']?.[0]?.value?.string);
        textToCopy += generateTextForField(
            'Current medications',
            formValues['current-medications']?.[0]?.value?.Coding?.code === 'Other'
                ? formValues['current-medications-other']?.[0]?.value?.string
                : formValues['current-medications']?.[0]?.value?.Coding?.display,
        );
        textToCopy += generateTextForField('Allergies', formValues['patient-allergies']?.[0]?.value?.string);
        textToCopy += generateTextForField(
            'Family History',
            formValues['family-hostory']?.[0]?.value?.Coding?.code === 'Other'
                ? formValues['family-history-other']?.[0]?.value?.string
                : formValues['family-hostory']?.[0]?.value?.Coding?.display,
        );
        textToCopy += generateTextForField(
            'Past Surgical History',
            formValues['past-surgical-history']?.[0]?.value?.Coding?.code == 'Other'
                ? formValues['past-surgical-history-other']?.[0]?.value?.string
                : formValues['past-surgical-history']?.[0]?.value?.Coding?.display,
        );
        textToCopy += generateTextForField(
            'Social History',
            formValues['social-history']?.[0]?.value?.Coding?.code == 'Other'
                ? formValues['social-history-other']?.[0]?.value?.string
                : formValues['social-history']?.[0]?.value?.Coding?.display,
        );
        textToCopy += generateTextForField(
            'Review of systems',
            formValues['review-of-systems']?.[0]?.value?.Coding?.display,
        );
        textToCopy += generateTextForField(
            'Height',
            formValues['patient-vital-signs-group']?.items?.height?.[0]?.value?.decimal,
        );
        textToCopy += generateTextForField(
            'Weight',
            formValues['patient-vital-signs-group']?.items?.weight?.[0]?.value?.decimal,
        );
        textToCopy += generateTextForField(
            'Temperature',
            formValues['patient-vital-signs-group']?.items?.temperature?.[0]?.value?.decimal,
        );
        textToCopy += generateTextForField(
            'Oxygen saturation',
            formValues['patient-vital-signs-group']?.items?.['oxygen-saturation']?.[0]?.value?.decimal,
        );
        textToCopy += generateTextForField(
            'Pulse rate',
            formValues['patient-vital-signs-group']?.items?.['pulse-rate']?.[0]?.value?.decimal,
        );
        textToCopy += generateTextForField(
            'Respiratory Rate',
            formValues['patient-vital-signs-group']?.items?.['respiratory-rate']?.[0]?.value?.decimal,
        );
        textToCopy += generateTextForField(
            'BP systolic',
            formValues['patient-vital-signs-group']?.items?.blood_pressure?.items?.['blood-pressure-systolic-diastolic']
                ?.items?.['blood-pressure-systolic']?.[0]?.value?.decimal,
        );
        textToCopy += generateTextForField(
            'BP diastolic',
            formValues['patient-vital-signs-group']?.items?.blood_pressure?.items?.['blood-pressure-systolic-diastolic']
                ?.items?.['blood-pressure-diastolic']?.[0]?.value?.decimal,
        );
        textToCopy += generateTextForField(
            'Positions',
            formValues['patient-vital-signs-group']?.items?.blood_pressure?.items?.['blood-pressure-positions']?.[0]
                ?.value?.Coding?.display,
        );
        textToCopy += generateTextForField(
            'BMI',
            formValues['patient-vital-signs-group']?.items?.bmi?.[0]?.value?.decimal,
        );
        textToCopy += generateTextForField(
            'General appearance',
            formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                'general-appearance'
            ]?.[0]?.value.Coding.code == 'Other'
                ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'general-appearance-other'
                  ]?.[0]?.value.string
                : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'general-appearance'
                  ]?.[0]?.value.Coding.display,
        );
        textToCopy += generateTextForField(
            'Integumentary',
            formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['integumentary']?.[0]
                ?.value.Coding.code == 'Other'
                ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'integumentary-other'
                  ]?.[0]?.value.string
                : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'integumentary'
                  ]?.[0]?.value.Coding.display,
        );
        textToCopy += generateTextForField(
            'HEENT',
            formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['heent']?.[0]?.value
                .Coding.code == 'Other'
                ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'heent-other'
                  ]?.[0]?.value.string
                : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['heent']?.[0]
                      ?.value.Coding.display,
        );
        textToCopy += generateTextForField(
            'Neck',
            formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['neck']?.[0]?.value
                .Coding.display == 'Other'
                ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'neck-other'
                  ]?.[0]?.value.string
                : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['neck']?.[0]
                      ?.value.Coding.display,
        );
        textToCopy += generateTextForField(
            'Respiratory',
            formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['respiratory']?.[0]
                ?.value.Coding.code == 'Other'
                ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'respiratory-other'
                  ]?.[0]?.value.string
                : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'respiratory'
                  ]?.[0]?.value.Coding.display,
        );
        textToCopy += generateTextForField(
            'Cardiovascular',
            formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['cardiovascular']?.[0]
                ?.value.Coding.code == 'Other'
                ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'cardiovascular-other'
                  ]?.[0]?.value.string
                : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'cardiovascular'
                  ]?.[0]?.value.Coding.display,
        );
        textToCopy += generateTextForField(
            'Gastrointestinal',
            formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                'gastrointestinal'
            ]?.[0]?.value.Coding.code == 'Other'
                ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'gastrointestinal-other'
                  ]?.[0]?.value.string
                : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'gastrointestinal'
                  ]?.[0]?.value.Coding.display,
        );
        textToCopy += generateTextForField(
            'Genitourinary',
            formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['genitourinary']?.[0]
                ?.value.Coding.code == 'Other'
                ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'genitourinary-other'
                  ]?.[0]?.value.string
                : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'genitourinary'
                  ]?.[0]?.value.Coding.display,
        );
        textToCopy += generateTextForField(
            'Extremities',
            formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['extremities']?.[0]
                ?.value.Coding.code == 'Other'
                ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'extremities-other'
                  ]?.[0]?.value.string
                : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'extremities'
                  ]?.[0]?.value.Coding.display,
        );
        textToCopy += generateTextForField(
            'Musculoskeletal',
            formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['musculoskeletal']?.[0]
                ?.value.Coding.code == 'Other'
                ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'musculoskeletal-other'
                  ]?.[0]?.value.string
                : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'musculoskeletal'
                  ]?.[0]?.value.Coding.display,
        );
        textToCopy += generateTextForField(
            'Neurological',
            formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['neurological']?.[0]
                ?.value.Coding.code == 'Other'
                ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'neurological-other'
                  ]?.[0]?.value.string
                : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'neurological'
                  ]?.[0]?.value.Coding.display,
        );
        textToCopy += generateTextForField(
            'Psychiatric',
            formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['psychiatric']?.[0]
                ?.value.Coding.code == 'Other'
                ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'psychiatric -other'
                  ]?.[0]?.value.string
                : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                      'psychiatric'
                  ]?.[0]?.value.Coding.display,
        );
        textToCopy += generateTextForField(
            'Diagnostic test or pertinent labs',
            formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                'diagnostic-test-or-pertinent-labs'
            ]?.[0]?.value.string || '-',
        );
        textToCopy += generateTextForField(
            'Assessment Question',
            formValues['patient-assessment-plan-group']?.items['assessment']?.[0]?.question,
        );
        const assessmentItems =
            formValues['patient-assessment-plan-group']?.items['assessment']?.map(
                (item: { value: { Coding: { code: any } } }) => ` ${item?.value?.Coding?.code || '-'}`,
            ) || [];
        textToCopy += `\n${assessmentItems.join('\n')}`;
        textToCopy += generateTextForField(
            'Treatment',
            formValues['patient-assessment-plan-group']?.items['treatment']?.[0]?.value.string,
        );
        textToCopy += generateTextForField(
            'Psychosocial Support',
            formValues['care-plan-group']?.items['psychosocial-upport']?.[0]?.value.Coding.code == 'Other'
                ? formValues['care-plan-group']?.items['psychosocial-upport-other']?.[0]?.value.string
                : formValues['care-plan-group']?.items['psychosocial-upport']?.[0]?.value.Coding.display,
        );
        const dailyCareItems =
            formValues['care-plan-group']?.items['daily-care']?.map(
                (item: { value: { Coding: { display: string } } }) => `${item?.value?.Coding?.display || '-'}`,
            ) || [];
        textToCopy += generateTextForField('Daily Care', dailyCareItems);
        textToCopy += generateTextForField(
            'Monitor',
            formValues['care-plan-group']?.items['monitor']?.[0]?.value.Coding.display == 'Other'
                ? formValues['care-plan-group']?.items['psychosocial-upport-other']?.[0]?.value.string
                : formValues['care-plan-group']?.items['monitor']?.[0]?.value.Coding.display,
        );
        const aspirationItems =
            formValues['care-plan-group']?.items['aspiration-precautions']?.map(
                (item: { value: { Coding: { display: string } } }) => `${item?.value?.Coding?.display || '-'}`,
            ) || [];
        textToCopy += generateTextForField('Aspiration Precautions', aspirationItems);
        const positioningItems =
            formValues['care-plan-group']?.items['positioning-recautions']?.map(
                (item: { value: { Coding: { display: string } } }) => `${item?.value?.Coding?.display || '-'}`,
            ) || [];
        textToCopy += generateTextForField('Positioning Precautions', positioningItems);
        textToCopy += generateTextForField(
            'Safety precautions',
            formValues['care-plan-group']?.items['safety-precautions']?.[0]?.value.Coding.code == 'Other'
                ? formValues['care-plan-group']?.items['safety-precautions-other']?.[0]?.value.string
                : formValues['care-plan-group']?.items['safety-precautions']?.[0]?.value.Coding.display,
        );
        const careCollaborationItems =
            formValues['care-plan-group']?.items['care-collaboration']?.map(
                (item: { value: { Coding: { display: string } } }) => ` ${item?.value?.Coding?.display || '-'}`,
            ) || [];
        textToCopy += generateTextForField('Care Collaboration', careCollaborationItems);
        const patientFamilyItems =
            formValues['care-plan-group']?.items['patient-and-family-involvement']?.map(
                (item: { value: { Coding: { display: string } } }) => `${item?.value?.Coding?.display || '-'}`,
            ) || [];
        textToCopy += generateTextForField('Patient and Family Involvement', patientFamilyItems);
        textToCopy += generateTextForField(
            'Follow-Up',
            formValues['care-plan-group']?.items['follow-up']?.[0]?.value.Coding.code == 'Other'
                ? formValues['care-plan-group']?.items['follow-up-other']?.[0]?.value.string
                : formValues['care-plan-group']?.items['follow-up']?.[0]?.value.Coding.display,
        );
        const disclosureItems =
            formValues['care-plan-group']?.items['disclosure']?.map(
                (item: { value: { Coding: { display: string } } }) => `${item?.value?.Coding?.display || '-'}`,
            ) || [];
        textToCopy += generateTextForField('Disclosure', disclosureItems);
        const cptCodeItems =
            formValues['cpt-code']?.map(
                (item: { value: { Coding: { code: string } } }) => ` ${item?.value?.Coding?.code || '-'}`,
            ) || [];
        textToCopy += generateTextForField('CPT Code', cptCodeItems);
        textToCopy += generateTextForField('Provider', formValues['provider']?.[0]?.value.string);
        textToCopy += generateTextForField(
            'Ferrer Pulmonary Institute',
            formValues['ferrer-pulmonary-institute']?.[0]?.value.string,
        );
        textToCopy += generateTextForField(
            'Case Discussed With',
            formValues['case-discussed-with']?.[0]?.value.Coding.display,
        );

        navigator.clipboard
            .writeText(textToCopy)
            .then(() => {
                notification.success({
                    message: `Copied all content`,
                });
            })
            .catch((err) => {
                notification.error({ message: 'Failed to copy all content' });
            });
    };

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(async () => {
                    setIsLoading(true);
                    if (questionnaireId && draftSaveResponse && isSuccess(draftSaveResponse)) {
                        formData.context.questionnaireResponse.id = draftSaveResponse.data.id;
                    }
                    await onSubmit?.({ ...formData, formValues });
                    setIsLoading(false);
                })}
                className={classNames(s.form)}
            >
                <div className="form-action">
                    <Button onClick={copyAllToClipboard}>{t`Copy All`}</Button>
                </div>
                <div className="form-content">
                    <div className="field-content">
                        <div className="edit-field">
                            <label>{t`Facility`}:</label>
                            <TiptapEditor
                                value={formValues['patient-facility']?.[0]?.value?.string || ''}
                                onChange={(content) => setValue('patient-facility.0.value.string', content)}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Type of Care`}:</label>
                            <TiptapEditor
                                value={formValues['patient-visit-type']?.[0]?.value?.string || ''}
                                onChange={(content) => setValue('patient-visit-type.0.value.string', content)}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Name`}:</label>
                            <TiptapEditor
                                value={formValues['patient-name']?.[0]?.value?.string || ''}
                                onChange={(content) => setValue('patient-name.0.value.string', content)}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Date of Birth`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-birth-date']?.[0]?.value?.date
                                        ? (() => {
                                              const [year, month, day] =
                                                  formValues['patient-birth-date'][0].value.date.split('-');
                                              return `${month}/${day}/${year}`;
                                          })()
                                        : ''
                                }
                                onChange={(content) => {
                                    const dateParts = content.split('/');
                                    let [month, day, year] = formValues['patient-birth-date']?.[0]?.value?.date?.split(
                                        '-',
                                    ) || ['', '', ''];

                                    month = dateParts[0]?.replace(/\D/g, '').slice(0, 2) || month;
                                    day = dateParts[1]?.replace(/\D/g, '').slice(0, 2) || day;
                                    year = dateParts[2]?.replace(/\D/g, '').slice(0, 4) || year;

                                    if (month.length === 2 && day.length === 2 && year.length === 4) {
                                        const formattedDate = `${year}-${month}-${day}`;
                                        const dateCheck = new Date(formattedDate);

                                        if (!isNaN(dateCheck.getTime())) {
                                            setValue('patient-birth-date.0.value.date', formattedDate);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Time of Service`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-service-time']?.[0]?.value?.dateTime
                                        ? (() => {
                                              const [year, month, day] =
                                                  formValues['patient-service-time']?.[0]?.value?.dateTime.split('-');
                                              return `${month}/${day}/${year}`;
                                          })()
                                        : ''
                                }
                                onChange={(content) => {
                                    const dateParts = content.split('/');
                                    let [month, day, year] = formValues[
                                        'patient-service-time'
                                    ]?.[0]?.value?.dateTime?.split('-') || ['', '', ''];

                                    month = dateParts[0]?.replace(/\D/g, '').slice(0, 2) || month;
                                    day = dateParts[1]?.replace(/\D/g, '').slice(0, 2) || day;
                                    year = dateParts[2]?.replace(/\D/g, '').slice(0, 4) || year;

                                    if (month.length === 2 && day.length === 2 && year.length === 4) {
                                        const formattedDate = `${year}-${month}-${day}`;
                                        const dateCheck = new Date(formattedDate);

                                        if (!isNaN(dateCheck.getTime())) {
                                            setValue('patient-service-time.0.value.dateTime', formattedDate);
                                        }
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Code Status`}:</label>
                            <TiptapEditor
                                value={formValues['patient-code']?.[0]?.value?.string || ''}
                                onChange={(content) => setValue('patient-code.0.value.string', content)}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Charlson Comorbidity Index (CCI)`}:</label>
                            <TiptapEditor
                                value={formValues['patient-cci']?.[0]?.value?.string || ''}
                                onChange={(content) => setValue('patient-cci.0.value.string', content)}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`HPI`}:</label>
                            <TiptapEditor
                                value={formValues['patient-hpi']?.[0]?.value?.string || ''}
                                onChange={(content) => setValue('patient-hpi.0.value.string', content)}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Problem List`}:</label>
                            <TiptapEditor
                                value={formValues['patient-problem-list']?.[0]?.value?.string || ''}
                                onChange={(content) => setValue('patient-problem-list.0.value.string', content)}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Current Medications`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['current-medications']?.[0]?.value?.Coding.code == 'Other'
                                        ? formValues['current-medications-other']?.[0]?.value?.string
                                        : formValues['current-medications']?.[0]?.value?.Coding.display
                                }
                                onChange={(content) => {
                                    if (formValues['current-medications']?.[0]?.value?.Coding.code == 'Other') {
                                        setValue('current-medications-other.0.value.string', content);
                                        setValue('current-medications.0.value.Coding.display', 'Other');
                                        setValue('current-medications.0.value.Coding.code', 'Other');
                                    } else {
                                        setValue('current-medications.0.value.Coding.display', content);
                                        setValue('current-medications.0.value.Coding.code', content.toLowerCase());
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Allergies`}:</label>
                            <TiptapEditor
                                value={formValues['patient-allergies']?.[0]?.value?.string || ''}
                                onChange={(content) => setValue('patient-allergies.0.value.string', content)}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Family History`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['family-hostory']?.[0]?.value?.Coding.code == 'Other'
                                        ? formValues['family-history-other']?.[0]?.value?.string
                                        : formValues['family-hostory']?.[0]?.value?.Coding.code
                                }
                                onChange={(content) => {
                                    if (formValues['family-hostory']?.[0]?.value?.Coding.code == 'Other') {
                                        setValue('family-history-other.0.value.string', content);
                                        setValue('family-hostory.0.value.Coding.display', 'Other');
                                        setValue('family-hostory.0.value.Coding.code', 'Other');
                                    } else {
                                        setValue('family-hostory.0.value.Coding.display', content);
                                        setValue('family-hostory.0.value.Coding.code', content.toLowerCase());
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Past Surgical History`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['past-surgical-history']?.[0]?.value?.Coding.code == 'Other'
                                        ? formValues['past-surgical-history-other']?.[0]?.value?.string
                                        : formValues['past-surgical-history']?.[0]?.value?.Coding.display
                                }
                                onChange={(content) => {
                                    if (formValues['past-surgical-history']?.[0]?.value?.Coding.code == 'Other') {
                                        setValue('past-surgical-history-other.0.value.string', content);
                                        setValue('past-surgical-history.0.value.Coding.display', 'Other');
                                        setValue('past-surgical-history.0.value.Coding.code', 'Other');
                                    } else {
                                        setValue('past-surgical-history.0.value.Coding.display', content);
                                        setValue('past-surgical-history.0.value.Coding.code', content.toLowerCase());
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Social History`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['social-history']?.[0]?.value?.Coding.code == 'Other'
                                        ? formValues['social-history-other']?.[0]?.value?.string
                                        : formValues['social-history']?.[0]?.value?.Coding.display
                                }
                                onChange={(content) => {
                                    if (formValues['social-history']?.[0]?.value?.Coding.code == 'Other') {
                                        setValue('social-history-other.0.value.string', content);
                                        setValue('social-history.0.value.Coding.display', 'Other');
                                        setValue('social-history.0.value.Coding.code', 'Other');
                                    } else {
                                        setValue('social-history.0.value.Coding.display', content);
                                        setValue('social-history.0.value.Coding.code', content.toLowerCase());
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Review of Systems`}:</label>
                            <TiptapEditor
                                value={formValues['review-of-systems']?.[0]?.value?.Coding.display || ''}
                                onChange={(content) => {
                                    setValue('review-of-systems.0.value.Coding.display', content);
                                    setValue('review-of-systems.0.value.Coding.code', content.toLowerCase());
                                }}
                            />
                        </div>

                        <div className="edit-field">
                            <label>{t`Height`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['height']?.[0]?.value.decimal || ''
                                }
                                onChange={(content) => {
                                    setValue(
                                        'patient-vital-signs-group.items.height.0.value.decimal',
                                        parseFloat(content),
                                    );
                                }}
                            />
                            <span>feet</span>
                        </div>
                        <div className="edit-field">
                            <label>{t`Weight`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['weight']?.[0]?.value.decimal || ''
                                }
                                onChange={(content) => {
                                    setValue(
                                        'patient-vital-signs-group.items.weight.0.value.decimal',
                                        parseFloat(content),
                                    );
                                }}
                            />
                            <span>lbs</span>
                        </div>
                        <div className="edit-field">
                            <label>{t`Temperature`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['temperature']?.[0]?.value.decimal ||
                                    ''
                                }
                                onChange={(content) => {
                                    setValue(
                                        'patient-vital-signs-group.items.temperature.0.value.decimal',
                                        parseFloat(content),
                                    );
                                }}
                            />
                            <span>Fahrenheit</span>
                        </div>
                        <div className="edit-field">
                            <label>{t`Oxygen Saturation`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['oxygen-saturation']?.[0]?.value
                                        .decimal || ''
                                }
                                onChange={(content) => {
                                    setValue(
                                        'patient-vital-signs-group.items.oxygen-saturation.0.value.decimal',
                                        parseFloat(content),
                                    );
                                }}
                            />
                            <span>%</span>
                        </div>
                        <div className="edit-field">
                            <label>{t`Pulse Rate`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['pulse-rate']?.[0]?.value.decimal ||
                                    ''
                                }
                                onChange={(content) => {
                                    setValue(
                                        'patient-vital-signs-group.items.pulse-rate.0.value.decimal',
                                        parseFloat(content),
                                    );
                                }}
                            />
                            <span>bpm</span>
                        </div>
                        <div className="edit-field">
                            <label>{t`Respiratory Rate`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['respiratory-rate']?.[0]?.value
                                        .decimal || ''
                                }
                                onChange={(content) => {
                                    setValue(
                                        'patient-vital-signs-group.items.respiratory-rate.0.value.decimal',
                                        parseFloat(content),
                                    );
                                }}
                            />
                            <span>bpm</span>
                        </div>
                        <div className="edit-field">
                            <label>{t`BP Systolic`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['blood-pressure']?.items[
                                        'blood-pressure-systolic-diastolic'
                                    ]?.items['blood-pressure-systolic']?.[0]?.value.decimal || ''
                                }
                                onChange={(content) => {
                                    setValue(
                                        'patient-vital-signs-group.items.blood-pressure.items.blood-pressure-systolic-diastolic.items.blood-pressure-systolic.0.value.decimal',
                                        parseFloat(content),
                                    );
                                }}
                            />
                            <span>mmHg</span>
                        </div>
                        <div className="edit-field">
                            <label>{t`BP Diastolic`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['blood-pressure']?.items[
                                        'blood-pressure-systolic-diastolic'
                                    ]?.items['blood-pressure-diastolic']?.[0]?.value.decimal || ''
                                }
                                onChange={(content) => {
                                    setValue(
                                        'patient-vital-signs-group.items.blood-pressure.items.blood-pressure-systolic-diastolic.items.blood-pressure-diastolic.0.value.decimal',
                                        parseFloat(content),
                                    );
                                }}
                            />
                            <span>mmHg</span>
                        </div>
                        <div className="edit-field">
                            <label>{t`Positions`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['blood-pressure']?.items[
                                        'blood-pressure-positions'
                                    ]?.[0]?.value.Coding.display || ''
                                }
                                onChange={(content) => {
                                    setValue(
                                        'patient-vital-signs-group.items.blood-pressure.items.blood-pressure-positions.0.value.Coding.display',
                                        content,
                                    );
                                    setValue(
                                        'patient-vital-signs-group.items.blood-pressure.items.blood-pressure-positions.0.value.Coding.code',
                                        content.toLowerCase(),
                                    );
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`BMI`}:</label>
                            <TiptapEditor
                                value={formValues['patient-vital-signs-group']?.items['bmi']?.[0]?.value.decimal || ''}
                                onChange={(content) => {
                                    setValue('patient-vital-signs-group.items.bmi.0.value.decimal', content);
                                }}
                            />
                            <span>kg/m²</span>
                        </div>

                        <div className="edit-field">
                            <label>{t`General appearance`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                        ?.items['general-appearance']?.[0]?.value.Coding.code == 'Other'
                                        ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['general-appearance-other']?.[0]?.value.string
                                        : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['general-appearance']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                            ?.items['general-appearance']?.[0]?.value.Coding.code == 'Other'
                                    ) {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.general-appearance-other.0.value.string',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.general-appearance.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.general-appearance.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.general-appearance.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.general-appearance.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Integumentary`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                        ?.items['integumentary']?.[0]?.value.Coding.code == 'Other'
                                        ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['integumentary-other']?.[0]?.value.string
                                        : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['integumentary']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                            ?.items['integumentary']?.[0]?.value.Coding.code == 'Other'
                                    ) {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.integumentary-other.0.value.string',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.integumentary.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.integumentary.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.integumentary.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.integumentary.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`HEENT`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                        ?.items['heent']?.[0]?.value.Coding.code == 'Other'
                                        ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['heent-other']?.[0]?.value.string
                                        : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['heent']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                            ?.items['heent']?.[0]?.value.Coding.code == 'Other'
                                    ) {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.heent-other.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.heent.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.heent.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.heent.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.heent.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Neck`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                        ?.items['neck']?.[0]?.value.Coding.code == 'Other'
                                        ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['neck-other']?.[0]?.value.string
                                        : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['neck']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                            ?.items['neck']?.[0]?.value.Coding.code == 'Other'
                                    ) {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.neck-other.0.value.string',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.neck.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.neck.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.neck.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.neck.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Respiratory`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                        ?.items['respiratory']?.[0]?.value.Coding.code == 'Other'
                                        ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['respiratory-other']?.[0]?.value.string
                                        : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['respiratory']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                            ?.items['respiratory']?.[0]?.value.Coding.code == 'Other'
                                    ) {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.respiratory-other.0.value.string',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.respiratory.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.respiratory.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.respiratory.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.respiratory.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Cardiovascular`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                        ?.items['cardiovascular']?.[0]?.value.Coding.code == 'Other'
                                        ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['cardiovascular-other']?.[0]?.value.string
                                        : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['cardiovascular']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                            ?.items['cardiovascular']?.[0]?.value.Coding.code == 'Other'
                                    ) {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.cardiovascular-other.0.value.string',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.cardiovascular.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.cardiovascular.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.cardiovascular.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.cardiovascular.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Gastrointestinal`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                        ?.items['gastrointestinal']?.[0]?.value.Coding.code == 'Other'
                                        ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['gastrointestinal-other']?.[0]?.value.string
                                        : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['gastrointestinal']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                            ?.items['gastrointestinal']?.[0]?.value.Coding.code == 'Other'
                                    ) {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.gastrointestinal-other.0.value.string',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.gastrointestinal.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.gastrointestinal.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.gastrointestinal.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.gastrointestinal.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Genitourinary`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                        ?.items['genitourinary']?.[0]?.value.Coding.code == 'Other'
                                        ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['genitourinary-other']?.[0]?.value.string
                                        : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['genitourinary']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                            ?.items['genitourinary']?.[0]?.value.Coding.code == 'Other'
                                    ) {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.genitourinary-other.0.value.string',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.genitourinary.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.genitourinary.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.genitourinary.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.genitourinary.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Extremities`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                        ?.items['extremities']?.[0]?.value.Coding.code == 'Other'
                                        ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['extremities-other']?.[0]?.value.string
                                        : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['extremities']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                            ?.items['extremities']?.[0]?.value.Coding.code == 'Other'
                                    ) {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.extremities-other.0.value.string',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.extremities.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.extremities.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.extremities.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.extremities.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Musculoskeletal`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                        ?.items['musculoskeletal']?.[0]?.value.Coding.display == 'Other'
                                        ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['musculoskeletal-other']?.[0]?.value.string
                                        : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['musculoskeletal']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                            ?.items['musculoskeletal']?.[0]?.value.Coding.display == 'Other'
                                    ) {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.musculoskeletal-other.0.value.string',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.musculoskeletal.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.musculoskeletal.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.musculoskeletal.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.musculoskeletal.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Neurological`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                        ?.items['neurological']?.[0]?.value.Coding.code == 'Other'
                                        ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['neurological-other']?.[0]?.value.string
                                        : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['neurological']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                            ?.items['neurological']?.[0]?.value.Coding.code == 'Other'
                                    ) {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.neurological-other.0.value.string',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.neurological.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.neurological.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.neurological.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.neurological.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>

                        <div className="edit-field">
                            <label>{t`Psychiatric`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                        ?.items['psychiatric']?.[0]?.value.Coding.code == 'Other'
                                        ? formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['psychiatric -other']?.[0]?.value.string
                                        : formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                              ?.items['psychiatric']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                            ?.items['psychiatric']?.[0]?.value.Coding.code == 'Other'
                                    ) {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.psychiatric -other.0.value.string',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.psychiatric.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.psychiatric.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.psychiatric.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'patient-vital-signs-group.items.patient-physical-exam-group.items.psychiatric.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>

                        <div className="edit-field">
                            <label>{t`Diagnostic test or pertinent labs`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']
                                        ?.items['diagnostic-test-or-pertinent-labs']?.[0]?.value.string || ''
                                }
                                onChange={(content) => {
                                    setValue(
                                        'patient-vital-signs-group.items.patient-physical-exam-group.items.diagnostic-test-or-pertinent-labs.0.value.string',
                                        content,
                                    );
                                }}
                            />
                        </div>

                        <div className="edit-field">
                            <label>{t`Assessment/Plan`}:</label>
                            <div className="assessment-field">
                                <div>
                                    {formValues['patient-assessment-plan-group']?.items['assessment']?.[0]?.question ||
                                        'No selection'}
                                </div>
                                <div className="assessment-item">
                                    {formValues['patient-assessment-plan-group']?.items['assessment']?.length > 0 ? (
                                        formValues['patient-assessment-plan-group']?.items['assessment'].map(
                                            (
                                                item: {
                                                    value: { Coding: { code: any } };
                                                },
                                                index: number,
                                            ) => (
                                                <div key={index}>
                                                    <TiptapEditor
                                                        value={item?.value?.Coding?.code || ''}
                                                        onChange={(content) => {
                                                            const updatedAssessments =
                                                                formValues['patient-assessment-plan-group']?.items[
                                                                    'assessment'
                                                                ]?.map((assessmentItem: any, i: number) =>
                                                                    i === index
                                                                        ? {
                                                                              ...assessmentItem,
                                                                              value: {
                                                                                  Coding: {
                                                                                      code: content,
                                                                                  },
                                                                              },
                                                                          }
                                                                        : assessmentItem,
                                                                ) || [];

                                                            setValue(
                                                                'patient-assessment-plan-group.items.assessment',
                                                                updatedAssessments,
                                                            );
                                                        }}
                                                    />
                                                </div>
                                            ),
                                        )
                                    ) : (
                                        <div>-</div>
                                    )}
                                </div>
                                <div className="edit-field">
                                    <TiptapEditor
                                        value={
                                            formValues['patient-assessment-plan-group']?.items['treatment']?.[0].value
                                                .string || ''
                                        }
                                        onChange={(content) => {
                                            setValue(
                                                'patient-assessment-plan-group.items.treatment.0.value.string',
                                                content,
                                            );
                                        }}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="edit-field">
                            <label>{t`Psychosocial Support`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['care-plan-group']?.items['psychosocial-upport']?.[0]?.value.Coding
                                        .code == 'Other'
                                        ? formValues['care-plan-group']?.items['psychosocial-upport-other']?.[0]?.value
                                              .string
                                        : formValues['care-plan-group']?.items['psychosocial-upport']?.[0]?.value.Coding
                                              .display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['care-plan-group']?.items['psychosocial-upport']?.[0]?.value.Coding
                                            .code == 'Other'
                                    ) {
                                        setValue(
                                            'care-plan-group.items.psychosocial-upport-other.0.value.string',
                                            content,
                                        );
                                        setValue(
                                            'care-plan-group.items.psychosocial-upport.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'care-plan-group.items.psychosocial-upport.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'care-plan-group.items.psychosocial-upport.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'care-plan-group.items.psychosocial-upport.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>

                        <div className="edit-field">
                            <label>{t`Daily Care`}:</label>
                            <div className="assessment-item">
                                {formValues['care-plan-group']?.items['daily-care']?.length > 0 ? (
                                    formValues['care-plan-group']?.items['daily-care'].map(
                                        (
                                            item: { value: { Coding: { display: string; code: string } } },
                                            index: number,
                                        ) => (
                                            <div style={{ display: 'flex', gap: '5px' }} key={index}>
                                                <TiptapEditor
                                                    value={item?.value?.Coding?.display || ''}
                                                    onChange={(content) => {
                                                        const updatedItem = [
                                                            ...(formValues['care-plan-group']?.items['daily-care'] ||
                                                                []),
                                                        ];

                                                        updatedItem[index] = {
                                                            ...updatedItem[index],
                                                            value: {
                                                                ...updatedItem[index].value,
                                                                Coding: {
                                                                    ...updatedItem[index].value.Coding,
                                                                    display: content,
                                                                    code: content,
                                                                },
                                                            },
                                                        };

                                                        setValue('care-plan-group.items.daily-care', updatedItem);
                                                    }}
                                                />
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <div>-</div>
                                )}
                            </div>
                        </div>

                        <div className="edit-field">
                            <label>{t`Monitor`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['care-plan-group']?.items['monitor']?.[0]?.value.Coding.code == 'Other'
                                        ? formValues['care-plan-group']?.items['psychosocial-upport-other']?.[0]?.value
                                              .string
                                        : formValues['care-plan-group']?.items['monitor']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['care-plan-group']?.items['monitor']?.[0]?.value.Coding.code ==
                                        'Other'
                                    ) {
                                        setValue(
                                            'care-plan-group.items.psychosocial-upport-other.0.value.string',
                                            content,
                                        );
                                        setValue('care-plan-group.items.monitor.0.value.Coding.display', 'Other');
                                        setValue('care-plan-group.items.monitor.0.value.Coding.code', 'Other');
                                    } else {
                                        setValue('care-plan-group.items.monitor.0.value.Coding.display', content);
                                        setValue('care-plan-group.items.monitor.0.value.Coding.code', content);
                                    }
                                }}
                            />
                        </div>

                        <div className="edit-field">
                            <label>{t`Aspiration Precautions`}:</label>
                            <div className="assessment-item">
                                {formValues['care-plan-group']?.items['aspiration-precautions']?.length > 0 ? (
                                    formValues['care-plan-group']?.items['aspiration-precautions'].map(
                                        (
                                            item: { value: { Coding: { display: string; code: string } } },
                                            index: number,
                                        ) => (
                                            <div style={{ display: 'flex', gap: '5px' }} key={index}>
                                                <TiptapEditor
                                                    value={item?.value?.Coding?.display || ''}
                                                    onChange={(content) => {
                                                        const updatedItem = [
                                                            ...(formValues['care-plan-group']?.items[
                                                                'aspiration-precautions'
                                                            ] || []),
                                                        ];

                                                        updatedItem[index] = {
                                                            ...updatedItem[index],
                                                            value: {
                                                                ...updatedItem[index].value,
                                                                Coding: {
                                                                    ...updatedItem[index].value.Coding,
                                                                    display: content,
                                                                    code: content,
                                                                },
                                                            },
                                                        };

                                                        setValue(
                                                            'care-plan-group.items.aspiration-precautions',
                                                            updatedItem,
                                                        );
                                                    }}
                                                />
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <div>-</div>
                                )}
                            </div>
                        </div>

                        <div className="edit-field">
                            <label>{t`Positioning Precautions`}:</label>
                            <div className="assessment-item">
                                {formValues['care-plan-group']?.items['positioning-recautions']?.length > 0 ? (
                                    formValues['care-plan-group']?.items['positioning-recautions'].map(
                                        (
                                            item: { value: { Coding: { display: string; code: string } } },
                                            index: number,
                                        ) => (
                                            <div style={{ display: 'flex', gap: '5px' }} key={index}>
                                                <TiptapEditor
                                                    value={item?.value?.Coding?.display || ''}
                                                    onChange={(content) => {
                                                        const updatedItem = [
                                                            ...(formValues['care-plan-group']?.items[
                                                                'positioning-recautions'
                                                            ] || []),
                                                        ];

                                                        updatedItem[index] = {
                                                            ...updatedItem[index],
                                                            value: {
                                                                ...updatedItem[index].value,
                                                                Coding: {
                                                                    ...updatedItem[index].value.Coding,
                                                                    display: content,
                                                                    code: content,
                                                                },
                                                            },
                                                        };

                                                        setValue(
                                                            'care-plan-group.items.positioning-recautions',
                                                            updatedItem,
                                                        );
                                                    }}
                                                />
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <div>-</div>
                                )}
                            </div>
                        </div>

                        <div className="edit-field">
                            <label>{t`Safety precautions`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['care-plan-group']?.items['safety-precautions']?.[0]?.value.Coding
                                        .code == 'Other'
                                        ? formValues['care-plan-group']?.items['safety-precautions-other']?.[0]?.value
                                              .string
                                        : formValues['care-plan-group']?.items['safety-precautions']?.[0]?.value.Coding
                                              .display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['care-plan-group']?.items['safety-precautions']?.[0]?.value.Coding
                                            .code == 'Other'
                                    ) {
                                        setValue(
                                            'care-plan-group.items.safety-precautions-other.0.value.string',
                                            content,
                                        );
                                        setValue(
                                            'care-plan-group.items.safety-precautions.0.value.Coding.display',
                                            'Other',
                                        );
                                        setValue(
                                            'care-plan-group.items.safety-precautions.0.value.Coding.code',
                                            'Other',
                                        );
                                    } else {
                                        setValue(
                                            'care-plan-group.items.safety-precautions.0.value.Coding.display',
                                            content,
                                        );
                                        setValue(
                                            'care-plan-group.items.safety-precautions.0.value.Coding.code',
                                            content,
                                        );
                                    }
                                }}
                            />
                        </div>

                        <div className="edit-field">
                            <label>{t`Care Collaboration`}:</label>
                            <div className="assessment-item">
                                {formValues['care-plan-group']?.items['care-collaboration']?.length > 0 ? (
                                    formValues['care-plan-group']?.items['care-collaboration'].map(
                                        (
                                            item: { value: { Coding: { display: string; code: string } } },
                                            index: number,
                                        ) => (
                                            <div style={{ display: 'flex', gap: '5px' }} key={index}>
                                                <TiptapEditor
                                                    value={item?.value?.Coding?.display || ''}
                                                    onChange={(content) => {
                                                        const updatedItem = [
                                                            ...(formValues['care-plan-group']?.items[
                                                                'care-collaboration'
                                                            ] || []),
                                                        ];

                                                        updatedItem[index] = {
                                                            ...updatedItem[index],
                                                            value: {
                                                                ...updatedItem[index].value,
                                                                Coding: {
                                                                    ...updatedItem[index].value.Coding,
                                                                    display: content,
                                                                    code: content,
                                                                },
                                                            },
                                                        };

                                                        setValue(
                                                            'care-plan-group.items.care-collaboration',
                                                            updatedItem,
                                                        );
                                                    }}
                                                />
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <div>-</div>
                                )}
                            </div>
                        </div>
                        <div className="edit-field">
                            <label>{t`Patient and Family Involvement`}:</label>
                            <div className="assessment-item">
                                {formValues['care-plan-group']?.items['patient-and-family-involvement']?.length > 0 ? (
                                    formValues['care-plan-group']?.items['patient-and-family-involvement'].map(
                                        (
                                            item: { value: { Coding: { display: string; code: string } } },
                                            index: number,
                                        ) => (
                                            <div style={{ display: 'flex', gap: '5px' }} key={index}>
                                                <TiptapEditor
                                                    value={item?.value?.Coding?.display || ''}
                                                    onChange={(content) => {
                                                        const updatedItem = [
                                                            ...(formValues['care-plan-group']?.items[
                                                                'patient-and-family-involvement'
                                                            ] || []),
                                                        ];

                                                        updatedItem[index] = {
                                                            ...updatedItem[index],
                                                            value: {
                                                                ...updatedItem[index].value,
                                                                Coding: {
                                                                    ...updatedItem[index].value.Coding,
                                                                    display: content,
                                                                    code: content,
                                                                },
                                                            },
                                                        };

                                                        setValue(
                                                            'care-plan-group.items.patient-and-family-involvement',
                                                            updatedItem,
                                                        );
                                                    }}
                                                />
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <div>-</div>
                                )}
                            </div>
                        </div>
                        <div className="edit-field">
                            <label>{t`Follow-Up`}:</label>
                            <TiptapEditor
                                value={
                                    formValues['care-plan-group']?.items['follow-up']?.[0]?.value.Coding.code == 'Other'
                                        ? formValues['care-plan-group']?.items['follow-up-other']?.[0]?.value.string
                                        : formValues['care-plan-group']?.items['follow-up']?.[0]?.value.Coding.display
                                }
                                onChange={(content) => {
                                    if (
                                        formValues['care-plan-group']?.items['follow-up']?.[0]?.value.Coding.code ==
                                        'Other'
                                    ) {
                                        setValue('care-plan-group.items.follow-up-other.0.value.string', content);
                                        setValue('care-plan-group.items.follow-up.0.value.Coding.display', 'Other');
                                        setValue('care-plan-group.items.follow-up.0.value.Coding.code', 'Other');
                                    } else {
                                        setValue('care-plan-group.items.follow-up.0.value.Coding.display', content);
                                        setValue('care-plan-group.items.follow-up.0.value.Coding.code', content);
                                    }
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Disclosure`}:</label>
                            <div className="assessment-item">
                                {formValues['care-plan-group']?.items['disclosure']?.length > 0 ? (
                                    formValues['care-plan-group']?.items['disclosure'].map(
                                        (
                                            item: { value: { Coding: { display: string; code: string } } },
                                            index: number,
                                        ) => (
                                            <div style={{ display: 'flex', gap: '5px' }} key={index}>
                                                <TiptapEditor
                                                    value={item?.value?.Coding?.display || ''}
                                                    onChange={(content) => {
                                                        const updatedItem = [
                                                            ...(formValues['care-plan-group']?.items['disclosure'] ||
                                                                []),
                                                        ];

                                                        updatedItem[index] = {
                                                            ...updatedItem[index],
                                                            value: {
                                                                ...updatedItem[index].value,
                                                                Coding: {
                                                                    ...updatedItem[index].value.Coding,
                                                                    display: content,
                                                                    code: content,
                                                                },
                                                            },
                                                        };

                                                        setValue('care-plan-group.items.disclosure', updatedItem);
                                                    }}
                                                />
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <div>-</div>
                                )}
                            </div>
                        </div>
                        <div className="edit-field">
                            <label>{t`CPT Code`}:</label>
                            <div className="assessment-item">
                                {formValues['cpt-code']?.length > 0 ? (
                                    formValues['cpt-code'].map(
                                        (item: { value: { Coding: { code: string } } }, index: number) => (
                                            <div key={index}>
                                                <TiptapEditor
                                                    value={item?.value?.Coding?.code || ''}
                                                    onChange={(content) => {
                                                        const updatedItem = [...(formValues['cpt-code'] || [])];

                                                        updatedItem[index] = {
                                                            ...updatedItem[index],
                                                            value: {
                                                                ...updatedItem[index].value,
                                                                Coding: {
                                                                    ...updatedItem[index].value.Coding,
                                                                    code: content,
                                                                },
                                                            },
                                                        };

                                                        setValue('cpt-code', updatedItem);
                                                    }}
                                                />
                                            </div>
                                        ),
                                    )
                                ) : (
                                    <div>-</div>
                                )}
                            </div>
                        </div>
                        <div className="edit-field">
                            <label>{t`Provider`}:</label>
                            <TiptapEditor
                                value={formValues['provider']?.[0]?.value.string || ''}
                                onChange={(content) => {
                                    setValue('provider.0.value.string', content);
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <TiptapEditor
                                value={formValues['ferrer-pulmonary-institute']?.[0]?.value.string || ''}
                                onChange={(content) => {
                                    setValue('ferrer-pulmonary-institute.0.value.string', content);
                                }}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Case discussed with`}:</label>
                            <TiptapEditor
                                value={formValues['case-discussed-with']?.[0]?.value.Coding.display || ''}
                                onChange={(content) => {
                                    setValue('care-plan-group.0.value.Coding.display', content);
                                    setValue('care-plan-group.0.value.Coding.code', content);
                                }}
                            />
                        </div>
                    </div>

                    <FormFooter {...props} submitting={isLoading} />
                </div>
            </form>
        </FormProvider>
    );
}
