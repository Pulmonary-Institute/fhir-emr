import { t } from '@lingui/macro';
import classNames from 'classnames';
import { QuestionnaireResponse } from 'fhir/r4b';
import { Button } from 'antd';
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
import EditableFormContent from './EditableQuestionnaireFormContent';
import { FormFooter } from './FormFooter';

import { copyAllToClipboard } from './utils';

export interface BaseQuestionnaireResponseFormProps {
    formData: QuestionnaireResponseFormData;
    onSubmit?: (formData: QuestionnaireResponseFormData) => Promise<any>;
    itemControlGroupItemComponents?: ItemControlGroupItemComponentMapping;
    questionItemComponents?: QuestionItemComponentMapping;
    groupItemComponent?: GroupItemComponent;
    onCancel?: () => void;
    draftSaveResponse?: RemoteData<QuestionnaireResponse>;
}

interface FormField {
    label: string;
    type: 'text' | 'date' | 'decimal' | 'coding' | 'dateTime';
    path: string;
    otherPath?: string;
    isOther?: boolean;
    condition?: boolean;
    questionnaireId?: string;
    planItems?: any;
    unit?: string;
    isArray?: boolean;
}

export function EditableQuestionnaireResponseForm(props: BaseQuestionnaireResponseFormProps) {
    const { onSubmit, formData, draftSaveResponse } = props;

    const questionnaireId = formData.context.questionnaireResponse.questionnaire;

    const methods = useForm<FormItems>({
        defaultValues: formData.formValues,
        mode: 'onBlur',
    });

    const { handleSubmit, watch } = methods;
    const formValues: any = watch();

    const [isLoading, setIsLoading] = useState(false);

    // Define the NoteForm Data for tiptab module
    const formFields: FormField[] = [
        {
            label: 'Type of Care',
            type: 'text',
            path: 'patient-visit-type.0.value.string',
        },
        {
            label: 'Date of Service',
            type: 'dateTime',
            path: 'patient-service-time.0.value.dateTime',
        },
        {
            label: 'Code Status',
            type: 'text',
            path: 'patient-code.0.value.string',
        },
        {
            label: 'Charlson Comorbidity Index (CCI)',
            type: 'text',
            path: 'patient-cci.0.value.string',
            condition: questionnaireId === 'acute-care-response',
        },
        {
            label: 'HPI',
            type: 'text',
            path: 'patient-hpi.0.value.string',
        },
        {
            label: 'Problem List',
            type: 'text',
            path: 'patient-problem-list.0.value.string',
        },
        {
            label: 'Current Medications',
            type: 'coding',
            path: 'current-medications.0.value.Coding.display',
            otherPath: 'current-medications-other.0.value.string',
            isOther: formValues['current-medications']?.[0]?.value?.Coding.display === 'Other',
        },
        {
            label: 'Allergies',
            type: 'text',
            path: 'patient-allergies.0.value.string',
        },
        {
            label: 'Family History',
            type: 'coding',
            path: 'family-hostory.0.value.Coding.display',
            otherPath: 'family-history-other.0.value.string',
            isOther: formValues['family-hostory']?.[0]?.value?.Coding.code === 'Other',
        },
        {
            label: 'Past Surgical History',
            type: 'coding',
            path: 'past-surgical-history.0.value.Coding.display',
            otherPath: 'past-surgical-history-other.0.value.string',
            isOther: formValues['past-surgical-history']?.[0]?.value?.Coding.code === 'Other',
        },
        {
            label: 'Social History',
            type: 'coding',
            path: 'social-history.0.value.Coding.display',
            otherPath: 'social-history-other.0.value.string',
            isOther: formValues['social-history']?.[0]?.value?.Coding.code === 'Other',
        },
        {
            label: 'Review of Systems',
            type: 'text',
            path: 'review-of-systems.0.value.Coding.display',
        },
        {
            label: 'Weight',
            type: 'decimal',
            path: 'patient-vital-signs-group.items.weight.0.value.decimal',
            condition: questionnaireId === 'infectious-disease',
            unit: 'lbs',
        },
        {
            label: 'Temperature',
            type: 'decimal',
            path: 'patient-vital-signs-group.items.temperature.0.value.decimal',
            unit: 'Fahrenheit',
        },
        {
            label: 'Oxygen Saturation',
            type: 'decimal',
            path: 'patient-vital-signs-group.items.oxygen-saturation.0.value.decimal',
            unit: '%',
        },
        {
            label: 'Pulse Rate',
            type: 'decimal',
            path: 'patient-vital-signs-group.items.pulse-rate.0.value.decimal',
            unit: 'bpm',
        },
        {
            label: 'Respiratory Rate',
            type: 'decimal',
            path: 'patient-vital-signs-group.items.respiratory-rate.0.value.decimal',
            unit: 'bpm',
        },
        {
            label: 'BP Systolic',
            type: 'decimal',
            path: 'patient-vital-signs-group.items.blood-pressure.items.blood-pressure-systolic-diastolic.items.blood-pressure-systolic.0.value.decimal',
            unit: 'mmHg',
        },
        {
            label: 'BP Diastolic',
            type: 'decimal',
            path: 'patient-vital-signs-group.items.blood-pressure.items.blood-pressure-systolic-diastolic.items.blood-pressure-diastolic.0.value.decimal',
            unit: 'mmHg',
        },
        {
            label: 'General appearance',
            type: 'text',
            path: 'patient-vital-signs-group.items.patient-physical-exam-group.items.general-appearance.0.value.Coding.display',
            otherPath:
                'patient-vital-signs-group.items.patient-physical-exam-group.items.general-appearance-other.0.value.string',
            isOther:
                formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                    'general-appearance'
                ]?.[0]?.value.Coding.code == 'Other',
        },
        {
            label: 'Integumentary',
            type: 'text',
            path: 'patient-vital-signs-group.items.patient-physical-exam-group.items.integumentary.0.value.Coding.display',
            otherPath:
                'patient-vital-signs-group.items.patient-physical-exam-group.items.integumentary-other.0.value.string',

            isOther:
                formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                    'integumentary'
                ]?.[0]?.value.Coding.code == 'Other',
        },
        {
            label: 'HEENT',
            type: 'text',
            path: 'patient-vital-signs-group.items.patient-physical-exam-group.items.heent.0.value.Coding.display',
            otherPath: 'patient-vital-signs-group.items.patient-physical-exam-group.items.heent-other.0.value.string',

            isOther:
                formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['heent']?.[0]
                    ?.value.Coding.code == 'Other',
        },
        {
            label: 'Neck',
            type: 'text',
            path: 'patient-vital-signs-group.items.patient-physical-exam-group.items.neck.0.value.Coding.display',
            otherPath: 'patient-vital-signs-group.items.patient-physical-exam-group.items.neck-other.0.value.string',

            isOther:
                formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['neck']?.[0]?.value
                    .Coding.code == 'Other',
        },
        {
            label: 'Respiratory',
            type: 'text',
            path: 'patient-vital-signs-group.items.patient-physical-exam-group.items.respiratory.0.value.Coding.display',
            otherPath:
                'patient-vital-signs-group.items.patient-physical-exam-group.items.respiratory-other.0.value.string',

            isOther:
                formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['respiratory']?.[0]
                    ?.value.Coding.code == 'Other',
        },
        {
            label: 'Cardiovascular',
            type: 'text',
            path: 'patient-vital-signs-group.items.patient-physical-exam-group.items.cardiovascular.0.value.Coding.display',
            otherPath:
                'patient-vital-signs-group.items.patient-physical-exam-group.items.cardiovascular-other.0.value.string',

            isOther:
                formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                    'cardiovascular'
                ]?.[0]?.value.Coding.code == 'Other',
        },
        {
            label: 'Gastrointestinal',
            type: 'text',
            path: 'patient-vital-signs-group.items.patient-physical-exam-group.items.gastrointestinal.0.value.Coding.display',
            otherPath:
                'patient-vital-signs-group.items.patient-physical-exam-group.items.gastrointestinal-other.0.value.string',

            isOther:
                formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                    'gastrointestinal'
                ]?.[0]?.value.Coding.code == 'Other',
        },
        {
            label: 'Genitourinary',
            type: 'text',
            path: 'patient-vital-signs-group.items.patient-physical-exam-group.items.genitourinary.0.value.Coding.display',
            otherPath:
                'patient-vital-signs-group.items.patient-physical-exam-group.items.genitourinary-other.0.value.string',

            isOther:
                formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                    'genitourinary'
                ]?.[0]?.value.Coding.code == 'Other',
        },
        {
            label: 'Extremities',
            type: 'text',
            path: 'patient-vital-signs-group.items.patient-physical-exam-group.items.extremities.0.value.Coding.display',
            otherPath:
                'patient-vital-signs-group.items.patient-physical-exam-group.items.extremities-other.0.value.string',

            isOther:
                formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['extremities']?.[0]
                    ?.value.Coding.code == 'Other',
        },
        {
            label: 'Musculoskeletal',
            type: 'text',
            path: 'patient-vital-signs-group.items.patient-physical-exam-group.items.musculoskeletal.0.value.Coding.display',
            otherPath:
                'patient-vital-signs-group.items.patient-physical-exam-group.items.musculoskeletal-other.0.value.string',

            isOther:
                formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                    'musculoskeletal'
                ]?.[0]?.value.Coding.code == 'Other',
        },
        {
            label: 'Neurological',
            type: 'text',
            path: 'patient-vital-signs-group.items.patient-physical-exam-group.items.neurological.0.value.Coding.display',
            otherPath:
                'patient-vital-signs-group.items.patient-physical-exam-group.items.neurological-other.0.value.string',

            isOther:
                formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items[
                    'neurological'
                ]?.[0]?.value.Coding.code == 'Other',
        },
        {
            label: 'Psychiatric',
            type: 'text',
            path: 'patient-vital-signs-group.items.patient-physical-exam-group.items.psychiatric.0.value.Coding.display',
            otherPath:
                'patient-vital-signs-group.items.patient-physical-exam-group.items.psychiatric -other.0.value.string',

            isOther:
                formValues['patient-vital-signs-group']?.items['patient-physical-exam-group']?.items['psychiatric']?.[0]
                    ?.value.Coding.code == 'Other',
            condition: questionnaireId !== 'infectious-disease',
        },
        {
            label: 'Diagnostic test or pertinent labs',
            type: 'text',
            path: 'patient-vital-signs-group.items.patient-physical-exam-group.items.diagnostic-test-or-pertinent-labs.0.value.string',
        },
        {
            label: 'Assessment/Plan',
            type: 'text',
            path: 'patient-assessment-plan-group.items.assessment',
            isArray: true,
            condition: questionnaireId !== 'infectious-disease' && questionnaireId !== 'cardiovascular',
        },
        {
            label: 'Antibiotics',
            type: 'text',
            path: 'patient-assessment-plan-group.items.antibiotics.0.value.string',
            condition: questionnaireId == 'infectious-disease',
        },
        {
            label: 'Exchange foley catheter',
            type: 'text',
            path: 'patient-assessment-plan-group.items.exchange-foley-catheter.0.value.string',
            condition: questionnaireId == 'infectious-disease',
        },
        {
            label: 'ID team will be available if there is deterioration of the clinical condition',
            type: 'text',
            path: 'patient-assessment-plan-group.items.id-team-condition.0.value.string',
            condition: questionnaireId == 'infectious-disease',
        },
        {
            label: 'Imaging Studies',
            type: 'text',
            path: 'patient-assessment-plan-group.items.imaging-studies.0.value.string',
            condition: questionnaireId == 'infectious-disease',
        },
        {
            label: 'Laboratory Tests',
            type: 'text',
            path: 'patient-assessment-plan-group.items.laboratory-tests.0.value.string',
            condition: questionnaireId == 'infectious-disease',
        },
        {
            label: 'Monitor signs of sepsis fever or change in mental status',
            type: 'text',
            path: 'patient-assessment-plan-group.items.monitor-signs-of-sepsis-fever-or-change-in-mental-status.0.value.string',
            condition: questionnaireId == 'infectious-disease',
        },
        {
            label: 'Other Data Reviewed',
            type: 'text',
            path: 'patient-assessment-plan-group.items.other-data-reviewed.0.value.string',
            condition: questionnaireId == 'infectious-disease',
        },
        {
            label: 'Other Recommendations',
            type: 'text',
            path: 'patient-assessment-plan-group.items.other-recommendations.0.value.string',
            condition: questionnaireId == 'infectious-disease',
        },
        {
            label: 'Risk Of Mortality',
            type: 'text',
            path: 'patient-assessment-plan-group.items.risk-of--mortality.0.value.string',
            condition: questionnaireId == 'infectious-disease',
        },
        {
            label: 'Trend WBC',
            type: 'text',
            path: 'patient-assessment-plan-group.items.trend-WBC.0.value.string',
            condition: questionnaireId == 'infectious-disease',
        },
        {
            label: 'Assessment',
            type: 'text',
            path: 'patient-assessment-plan-group.items.plan-group.items.treatment.0.value.string',
            condition: questionnaireId == 'cardiovascular',
        },
        {
            label: '',
            type: 'text',
            path: 'patient-assessment-plan-group.items.plan-group.items.treatment.0.question',
            condition: questionnaireId == 'cardiovascular',
        },
        {
            label: 'Plan',
            type: 'text',
            path: 'care-plan-group.items.plan.0.value.string',
            condition: questionnaireId == 'cardiovascular',
        },
        {
            label: 'Care Plan',
            type: 'text',
            path: 'care-plan-group.items.disclosure',
            condition: questionnaireId !== 'infectious-disease',
            isArray: true,
        },
        {
            label: 'CPT Code',
            type: 'text',
            path: 'cpt-code',
            isArray: true,
        },
        {
            label: 'Provider',
            type: 'text',
            path: 'provider.0.value.string',
        },
        {
            label: '',
            type: 'text',
            path: 'ferrer-pulmonary-institute.0.value.string',
        },
        {
            label: 'Case discussed with',
            type: 'text',
            path: 'case-discussed-with.0.value.Coding.display',
            otherPath: 'case-discussed-with-other.0.value.string',
            isOther: formValues['case-discussed-with']?.[0]?.value.Coding.code == 'Other',
        },
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
                {/* Form Actions */}
                <div className="form-action">
                    <Button onClick={() => copyAllToClipboard(formValues, questionnaireId)}>{t`Copy All`}</Button>
                </div>

                {/* Form Content */}
                <div className="form-content">
                    {formFields.map(
                        (field, index) =>
                            field.condition !== false && (
                                <EditableFormContent
                                    key={index}
                                    label={field.label}
                                    type={field.type}
                                    path={field.path}
                                    formValues={formValues}
                                    otherPath={field.otherPath}
                                    isOther={field.isOther}
                                    questionnaireId={field.questionnaireId}
                                    planItems={field.planItems}
                                    unit={field.unit}
                                    isArray={field.isArray}
                                />
                            ),
                    )}
                </div>

                <FormFooter {...props} submitting={isLoading} />
            </form>
        </FormProvider>
    );
}
