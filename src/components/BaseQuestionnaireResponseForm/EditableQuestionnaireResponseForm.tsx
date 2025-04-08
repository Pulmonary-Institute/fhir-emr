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

    const questionnaireId = formData.context.questionnaireResponse.questionnaire;

    const methods = useForm<FormItems>({
        defaultValues: formData.formValues,
        mode: 'onBlur',
    });

    const { setValue, handleSubmit, watch } = methods;
    const formValues: any = watch();

    const [isLoading, setIsLoading] = useState(false);
    // Copy the Form Information
    const copyAllToClipboard = () => {
        const getValue = (path: any) => path?.[0]?.value;
        const generateText = (label: string, value: any) => `\n${label}: ${value ?? ''}`;

        const getDisplayOrOther = (field: string) => {
            const val = getValue(formValues[field]);
            return val?.Coding?.code === 'Other'
                ? getValue(formValues[`${field}-other`])?.string
                : val?.Coding?.display;
        };

        const getPhysicalExamValue = (key: string) => {
            const val = physicalExam?.[key]?.[0]?.value?.Coding;
            return val?.code === 'Other' ? physicalExam?.[`${key}-other`]?.[0]?.value?.string : val?.display;
        };

        const getVital = (key: string) => getValue(vitals?.[key])?.decimal;
        const getBP = (key: string) =>
            vitals?.blood_pressure?.items?.['blood-pressure-systolic-diastolic']?.items?.[key]?.[0]?.value?.decimal;

        const vitals = formValues['patient-vital-signs-group']?.items;
        const physicalExam = vitals?.['patient-physical-exam-group']?.items;

        let text = '';

        const fields: [string, any][] = [
            ['Type of Care', getValue(formValues['patient-visit-type'])?.string],
            ['Date of Birth', getValue(formValues['patient-birth-date'])?.date],
            ['Time of Service', getValue(formValues['patient-service-time'])?.dateTime],
            ['Code Status', getValue(formValues['patient-code'])?.string],
            ['Charlson Comorbidity Index(CCI)', getValue(formValues['patient-cci'])?.string],
            ['HPI', getValue(formValues['patient-hpi'])?.string],
            ['Problem list', getValue(formValues['patient-problem-list'])?.string],
            [
                'Current medications',
                (() => {
                    const med = getValue(formValues['current-medications']);
                    return med?.Coding?.code === 'Other'
                        ? getValue(formValues['current-medications-other'])?.string
                        : med?.Coding?.display;
                })(),
            ],
            ['Allergies', getValue(formValues['patient-allergies'])?.string],
            ['Family History', getDisplayOrOther('family-hostory')],
            ['Past Surgical History', getDisplayOrOther('past-surgical-history')],
            ['Social History', getDisplayOrOther('social-history')],
            ['Review of systems', getValue(formValues['review-of-systems'])?.Coding?.display],
            ['Weight', getVital('weight')],
            ['Temperature', getVital('temperature')],
            ['Oxygen saturation', getVital('oxygen-saturation')],
            ['Pulse rate', getVital('pulse-rate')],
            ['Respiratory Rate', getVital('respiratory-rate')],
            ['BP systolic', getBP('blood-pressure-systolic')],
            ['BP diastolic', getBP('blood-pressure-diastolic')],
            ['General appearance', getPhysicalExamValue('general-appearance')],
            ['Integumentary', getPhysicalExamValue('integumentary')],
            ['HEENT', getPhysicalExamValue('heent')],
            ['Neck', getPhysicalExamValue('neck')],
            ['Respiratory', getPhysicalExamValue('respiratory')],
            ['Cardiovascular', getPhysicalExamValue('cardiovascular')],
            ['Gastrointestinal', getPhysicalExamValue('gastrointestinal')],
            ['Genitourinary', getPhysicalExamValue('genitourinary')],
            ['Extremities', getPhysicalExamValue('extremities')],
            ['Musculoskeletal', getPhysicalExamValue('musculoskeletal')],
            [
                'Psychiatric',
                (() => {
                    const psych = physicalExam?.['psychiatric']?.[0]?.value?.Coding;
                    return psych?.code === 'Other'
                        ? physicalExam?.['psychiatric -other']?.[0]?.value?.string
                        : psych?.display;
                })(),
            ],
            [
                'Diagnostic test or pertinent labs',
                physicalExam?.['diagnostic-test-or-pertinent-labs']?.[0]?.value?.string || '-',
            ],
            ['Assessment Question', formValues['patient-assessment-plan-group']?.items['assessment']?.[0]?.question],
        ];

        fields.forEach(([label, value]) => {
            text += generateText(label, value);
        });

        const assessmentItems =
            formValues['patient-assessment-plan-group']?.items['assessment']?.map(
                (item: { value: { Coding: { code: string } } }) => ` ${item?.value?.Coding?.code || '-'}`,
            ) || [];
        text += `\n${assessmentItems.join('\n')}`;

        text += generateText(
            'Treatment',
            formValues['patient-assessment-plan-group']?.items['treatment']?.[0]?.value?.string,
        );

        if (questionnaireId === 'infectious-disease') {
            const planItems = [
                'antibiotics',
                'exchange-foley-catheter',
                'id-team-condition',
                'imaging-studies',
                'laboratory-tests',
                'monitor-signs-of-sepsis-fever-or-change-in-mental-status',
                'other-data-reviewed',
                'other-recommendations',
                'risk-of--mortality',
                'trend-WBC',
                'vaccines',
            ];

            planItems.forEach((key) => {
                const item = formValues['patient-assessment-plan-group']?.items[key]?.[0];
                const label = item?.question || key;
                const value = item?.value?.string || '-';
                text += generateText(label, value);
            });
        }

        const disclosureItems =
            formValues['care-plan-group']?.items['disclosure']?.map(
                (item: { value: { Coding: { display: string } } }) => item?.value?.Coding?.display || '-',
            ) || [];
        text += generateText('Disclosure', disclosureItems.join(', '));

        const cptCodeItems =
            formValues['cpt-code']?.map(
                (item: { value: { Coding: { code: string } } }) => item?.value?.Coding?.code || '-',
            ) || [];
        text += generateText('CPT Code', cptCodeItems.join(', '));

        const postCptFields: [string, any][] = [
            ['Provider', formValues['provider']?.[0]?.value?.string],
            ['Ferrer Pulmonary Institute', formValues['ferrer-pulmonary-institute']?.[0]?.value?.string],
            ['Case Discussed With', formValues['case-discussed-with']?.[0]?.value?.Coding?.display],
        ];

        postCptFields.forEach(([label, value]) => {
            text += generateText(label, value);
        });

        navigator.clipboard
            .writeText(text.trim())
            .then(() => {
                notification.success({
                    message: `Copied all content`,
                });
            })
            .catch((err) => {
                notification.error({ message: 'Failed to copy all content' });
            });
    };

    const planItems = [
        'antibiotics',
        'exchange-foley-catheter',
        'id-team-condition',
        'imaging-studies',
        'laboratory-tests',
        'monitor-signs-of-sepsis-fever-or-change-in-mental-status',
        'other-data-reviewed',
        'other-recommendations',
        'risk-of--mortality',
        'trend-WBC',
        'vaccines',
    ];

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
                            <label>{t`Type of Care`}:</label>
                            <TiptapEditor
                                value={formValues['patient-visit-type']?.[0]?.value?.string || ''}
                                onChange={(content) => setValue('patient-visit-type.0.value.string', content)}
                            />
                        </div>
                        <div className="edit-field">
                            <label>{t`Date of Birth`}:</label>
                            <input
                                type="date"
                                value={formValues['patient-birth-date']?.[0]?.value?.date || ''}
                                onChange={(e) => {
                                    const selectedDate = e.target.value;
                                    const dateCheck = new Date(selectedDate);

                                    if (!isNaN(dateCheck.getTime())) {
                                        setValue('patient-birth-date.0.value.date', selectedDate);
                                    }
                                }}
                            />
                        </div>

                        <div className="edit-field">
                            <label>{t`Time of Service`}:</label>
                            <input
                                type="date"
                                value={formValues['patient-service-time']?.[0]?.value?.dateTime?.split('T')[0] || ''}
                                onChange={(e) => {
                                    const selectedDate = e.target.value;
                                    const dateCheck = new Date(selectedDate);

                                    if (!isNaN(dateCheck.getTime())) {
                                        setValue('patient-service-time.0.value.dateTime', selectedDate);
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
                        {questionnaireId == 'acute-care-response' && (
                            <div className="edit-field">
                                <label>{t`Charlson Comorbidity Index (CCI)`}:</label>
                                <TiptapEditor
                                    value={formValues['patient-cci']?.[0]?.value?.string || ''}
                                    onChange={(content) => setValue('patient-cci.0.value.string', content)}
                                />
                            </div>
                        )}
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
                        {questionnaireId == 'infectious-disease' && (
                            <div className="edit-field">
                                <label>{t`Weight`}:</label>
                                <TiptapEditor
                                    value={
                                        formValues['patient-vital-signs-group']?.items['weight']?.[0]?.value.decimal ||
                                        ''
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
                        )}
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
                        {questionnaireId != 'infectious-disease' ? (
                            <div className="edit-field">
                                <label>{t`Assessment/Plan`}:</label>
                                <div className="assessment-field">
                                    <div className="assessment-item">
                                        {formValues['patient-assessment-plan-group']?.items['assessment']?.length >
                                        0 ? (
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
                                                formValues['patient-assessment-plan-group']?.items['treatment']?.[0]
                                                    .value.string || ''
                                            }
                                            onChange={(content) => {
                                                setValue(
                                                    'patient-assessment-plan-group.items.treatment.0.value.string',
                                                    content,
                                                );
                                            }}
                                        />
                                    </div>
                                    <div>
                                        {formValues['patient-assessment-plan-group']?.items['assessment']?.[0]
                                            ?.question || 'No selection'}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="edit-field">
                                <label>{t`Plan`}:</label>
                                <div>
                                    {planItems.map((key) => {
                                        const item = formValues['patient-assessment-plan-group']?.items[key]?.[0];
                                        return (
                                            <div className="d-flex" key={key}>
                                                <label>{item?.question}:</label>
                                                <TiptapEditor
                                                    value={item?.value?.string || '-'}
                                                    onChange={(content) => {
                                                        setValue(
                                                            `patient-assessment-plan-group.items.${key}.0.value.string`,
                                                            content,
                                                        );
                                                    }}
                                                />
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

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
                        {questionnaireId == 'cardiovascular' && (
                            <div className="edit-field">
                                <label>{t`Plan`}:</label>
                                <div className="assessment-item">
                                    <label>{formValues['care-plan-group']?.items['plan'][0].question}</label>
                                    <TiptapEditor
                                        value={formValues['care-plan-group']?.items['plan'][0].value?.string || '-'}
                                        onChange={(content) => {
                                            setValue('care-plan-group.items.plan.0.value.string', content);
                                        }}
                                    />
                                </div>
                            </div>
                        )}
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
