import { yupResolver } from '@hookform/resolvers/yup';
import classNames from 'classnames';
import { QuestionnaireResponse } from 'fhir/r4b';
import _ from 'lodash';
import { useMemo, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import {
    calcInitialContext,
    FormItems,
    GroupItemComponent,
    ItemControlGroupItemComponentMapping,
    QuestionItemComponentMapping,
    QuestionItems,
    QuestionnaireResponseFormData,
    QuestionnaireResponseFormProvider,
} from 'sdc-qrf';
import * as yup from 'yup';

import { Questionnaire as FCEQuestionnaire } from '@beda.software/aidbox-types';

import { Col, Group, Row } from './readonly-widgets/group';
import { QuestionBoolean } from './readonly-widgets/boolean';
import { QuestionChoice } from './readonly-widgets/choice';
import { QuestionDateTime } from './readonly-widgets/date';
import { Display } from './readonly-widgets/display';
import { QuestionInteger, QuestionDecimal, QuestionQuantity } from './readonly-widgets/number';
import { QuestionReference } from './readonly-widgets/reference';
import { AnxietyScore } from './readonly-widgets/score';
import { QuestionText } from './readonly-widgets/string';

import 'react-phone-input-2/lib/style.css';

import { RemoteData, isSuccess } from '@beda.software/remote-data';

import { questionnaireToValidationSchema } from 'src/utils/questionnaire';

import s from './EditableQuestionnaireResponseForm.module.scss';

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
    const { onSubmit, formData, questionItemComponents, itemControlGroupItemComponents, draftSaveResponse } = props;

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

    const isWizard = isGroupWizard(formData.context.questionnaire);

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
                <div className="form-content">
                    <QuestionnaireResponseFormProvider
                        formValues={formValues}
                        setFormValues={(values, fieldPath, value) => setValue(fieldPath.join('.'), value)}
                        groupItemComponent={Group}
                        itemControlGroupItemComponents={{
                            col: Col,
                            row: Row,
                            ...itemControlGroupItemComponents,
                        }}
                        questionItemComponents={{
                            text: QuestionText,
                            string: QuestionText,
                            integer: QuestionInteger,
                            decimal: QuestionDecimal,
                            quantity: QuestionQuantity,
                            choice: QuestionChoice,
                            date: QuestionDateTime,
                            dateTime: QuestionDateTime,
                            reference: QuestionReference,
                            display: Display,
                            boolean: QuestionBoolean,
                            score: AnxietyScore,
                            ...questionItemComponents,
                        }}
                    >
                        <>
                            <QuestionItems
                                questionItems={formData.context.questionnaire.item!}
                                parentPath={[]}
                                context={calcInitialContext(formData.context, formValues)}
                            />

                            {!isWizard ? <FormFooter {...props} submitting={isLoading} /> : null}
                        </>
                    </QuestionnaireResponseFormProvider>
                </div>
            </form>
        </FormProvider>
    );
}

function isGroupWizard(q: FCEQuestionnaire) {
    return q.item?.some((i) => {
        const itemControlCode = i.itemControl?.coding?.[0]?.code;

        return itemControlCode && ['wizard', 'wizard-with-tooltips'].includes(itemControlCode);
    });
}
