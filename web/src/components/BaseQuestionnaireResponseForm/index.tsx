import { yupResolver } from '@hookform/resolvers/yup';
import { Trans } from '@lingui/macro';
import { loading, RemoteData, isSuccess } from 'aidbox-react';
import { Button } from 'antd';
import classNames from 'classnames';
import _ from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    calcInitialContext,
    FormItems,
    GroupItemComponent,
    ItemControlGroupItemComponentMapping,
    ItemControlQuestionItemComponentMapping,
    QuestionItemComponentMapping,
    QuestionItems,
    QuestionnaireResponseFormData,
    QuestionnaireResponseFormProvider,
} from 'sdc-qrf';
import * as yup from 'yup';

import 'react-phone-input-2/lib/style.css';

import { saveQuestionnaireResponseDraft } from 'src/components/QuestionnaireResponseForm';
import { questionnaireToValidationSchema } from 'src/utils/questionnaire';

import { TextWithMacroFill } from '../TextWithMacroFill';
import s from './BaseQuestionnaireResponseForm.module.scss';
import {
    Col,
    Group,
    InlineChoice,
    TimeRangePickerControl,
    QuestionBoolean,
    QuestionChoice,
    QuestionDateTime,
    QuestionDecimal,
    QuestionInteger,
    QuestionPhone,
    QuestionSlider,
    QuestionSolidRadio,
    QuestionString,
    QuestionText,
    Row,
    PractitionerRoleList,
    BloodPressure,
} from './widgets';
import { Display } from './widgets/display';
import { QuestionReference } from './widgets/reference';

export interface BaseQuestionnaireResponseFormProps {
    formData: QuestionnaireResponseFormData;
    onSubmit: (formData: QuestionnaireResponseFormData) => Promise<any>;
    readOnly?: boolean;
    itemControlQuestionItemComponents?: ItemControlQuestionItemComponentMapping;
    itemControlGroupItemComponents?: ItemControlGroupItemComponentMapping;
    questionItemComponents?: QuestionItemComponentMapping;
    groupItemComponent?: GroupItemComponent;
    onCancel?: () => void;
    saveButtonTitle?: string;
    autoSave?: boolean;
    draftSaveState?: RemoteData;
    setDraftSaveState?: React.Dispatch<React.SetStateAction<RemoteData<any, any>>>;
}

export function BaseQuestionnaireResponseForm(props: BaseQuestionnaireResponseFormProps) {
    const {
        onSubmit,
        formData,
        readOnly,
        onCancel,
        saveButtonTitle,
        autoSave,
        draftSaveState,
        setDraftSaveState,
    } = props;

    const questionnaireId = formData.context.questionnaire.assembledFrom;

    const schema: yup.AnyObjectSchema = useMemo(
        () => questionnaireToValidationSchema(formData.context.questionnaire),
        [formData.context.questionnaire],
    );

    const methods = useForm<FormItems>({
        defaultValues: formData.formValues,
        resolver: yupResolver(schema),
        mode: 'onBlur',
    });
    const { setValue, handleSubmit, watch } = methods;

    const formValues = watch();

    const [isLoading, setIsLoading] = useState(false);

    const previousFormValuesRef = useRef<FormItems | null>(null);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSaveDraft = useCallback(
        _.debounce(async (currentFormValues: FormItems) => {
            if (!autoSave || !questionnaireId) return;

            if (!_.isEqual(currentFormValues, previousFormValuesRef.current) && setDraftSaveState) {
                setDraftSaveState(loading);
                setDraftSaveState(
                    await saveQuestionnaireResponseDraft(
                        questionnaireId,
                        formData,
                        currentFormValues,
                    ),
                );
                previousFormValuesRef.current = _.cloneDeep(currentFormValues);
            }
        }, 1000),
        [],
    );

    useEffect(() => {
        debouncedSaveDraft(formValues);
    }, [formValues, debouncedSaveDraft]);

    return (
        <FormProvider {...methods}>
            <form
                onSubmit={handleSubmit(async () => {
                    setIsLoading(true);
                    if (questionnaireId && draftSaveState && isSuccess(draftSaveState)) {
                        formData.context.questionnaireResponse.id = draftSaveState.data.id;
                    }
                    await onSubmit({ ...formData, formValues });
                    setIsLoading(false);
                })}
                className={classNames(s.form, 'app-form')}
            >
                <QuestionnaireResponseFormProvider
                    formValues={formValues}
                    setFormValues={(values, fieldPath, value) =>
                        setValue(fieldPath.join('.'), value)
                    }
                    groupItemComponent={Group}
                    itemControlGroupItemComponents={{
                        col: Col,
                        row: Row,
                        'blood-pressure': BloodPressure,
                        'time-range-picker': TimeRangePickerControl,
                        ...props.itemControlGroupItemComponents,
                    }}
                    questionItemComponents={{
                        text: QuestionText,
                        string: QuestionString,
                        decimal: QuestionDecimal,
                        integer: QuestionInteger,
                        date: QuestionDateTime,
                        dateTime: QuestionDateTime,
                        time: QuestionDateTime,
                        choice: QuestionChoice,
                        boolean: QuestionBoolean,
                        display: Display,
                        reference: QuestionReference,
                        ...props.questionItemComponents,
                    }}
                    itemControlQuestionItemComponents={{
                        phoneWidget: QuestionPhone,
                        slider: QuestionSlider,
                        'solid-radio-button': QuestionSolidRadio,
                        'inline-choice': InlineChoice,
                        'practitioner-role': PractitionerRoleList,
                        'text-with-macro': TextWithMacroFill,
                        ...props.itemControlQuestionItemComponents,
                    }}
                    readOnly={readOnly}
                >
                    <>
                        <div className={classNames(s.content, 'form__content')}>
                            <QuestionItems
                                questionItems={formData.context.questionnaire.item!}
                                parentPath={[]}
                                context={calcInitialContext(formData.context, formValues)}
                            />
                        </div>
                        {!readOnly && (
                            <div className={classNames(s.footer, 'form__footer')}>
                                {onCancel && (
                                    <Button key="back" onClick={onCancel}>
                                        <Trans>Cancel</Trans>
                                    </Button>
                                )}

                                {isLoading ? (
                                    <Button type="primary" loading>
                                        Saving...
                                    </Button>
                                ) : (
                                    <Button type="primary" htmlType="submit">
                                        <Trans>{saveButtonTitle ?? 'Save'}</Trans>
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                </QuestionnaireResponseFormProvider>
            </form>
        </FormProvider>
    );
}
