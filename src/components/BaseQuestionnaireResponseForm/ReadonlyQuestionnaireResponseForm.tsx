import { FormProvider, useForm } from 'react-hook-form';
import {
    calcInitialContext,
    FormItems,
    QRFContextData,
    QuestionItems,
    // QuestionnaireResponseFormData,
    QuestionnaireResponseFormProvider,
} from 'sdc-qrf';

import { QuestionBoolean } from './readonly-widgets/boolean';
import { QuestionChoice } from './readonly-widgets/choice';
import { QuestionDateTime } from './readonly-widgets/date';
import { Display } from './readonly-widgets/display';
import { Col, Group, Row } from './readonly-widgets/group';
import { QuestionInteger, QuestionDecimal, QuestionQuantity } from './readonly-widgets/number';
import { QuestionReference } from './readonly-widgets/reference';
import { AnxietyScore, DepressionScore } from './readonly-widgets/score';
import { QuestionText, TextWithInput } from './readonly-widgets/string';
import { TimeRangePickerControl } from './readonly-widgets/TimeRangePickerControl';
import { UploadFile } from './readonly-widgets/UploadFile';
import { AudioAttachment } from './readonly-widgets/AudioAttachment';
import ReactMarkdown from 'react-markdown';

interface Props extends Partial<QRFContextData> {
    formData: any;
}

export function ReadonlyQuestionnaireResponseForm(props: Props) {
    const {
        formData,
        questionItemComponents,
        itemControlQuestionItemComponents,
        itemControlGroupItemComponents,
        ...other
    } = props;

    const methods = useForm<FormItems>({
        defaultValues: formData.formValues,
    });
    const { watch } = methods;

    // const formValues = watch();
    // console.log('formValues in Readonly=>', formValues);
    // Extract AI Summary Value
    const aiSummary = formData?.formValues?.AISummary?.[0]?.value?.string || '';
    console.log('aiSummary', aiSummary);
    // Remove AI Summary from formValues
    const { AISummary, ...filteredFormValues } = formData.formValues || {};

    const formValues = watch();

    return (
        <FormProvider {...methods}>
            <form>
                <QuestionnaireResponseFormProvider
                    {...other}
                    formValues={filteredFormValues}
                    setFormValues={() => {}}
                    groupItemComponent={Group}
                    itemControlGroupItemComponents={{
                        col: Col,
                        row: Row,
                        'time-range-picker': TimeRangePickerControl,
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
                        attachment: UploadFile,
                        ...questionItemComponents,
                    }}
                    itemControlQuestionItemComponents={{
                        'inline-choice': QuestionChoice,
                        'anxiety-score': AnxietyScore,
                        'depression-score': DepressionScore,
                        'input-inside-text': TextWithInput,
                        'audio-recorder-uploader': AudioAttachment,
                        ...itemControlQuestionItemComponents,
                    }}
                >
                    <>
                        {/* Render Question Items */}
                        <QuestionItems
                            questionItems={formData.context.questionnaire.item!}
                            parentPath={[]}
                            context={calcInitialContext(formData.context, formValues)}
                        />
                        {/* AI Summary Section */}
                        {!aiSummary && (
                            <div
                                className="markdown-container"
                                style={{
                                    margin: '20px 0',
                                    padding: '15px',
                                    border: '1px solid #e8e8e8',
                                    borderRadius: '4px',
                                }}
                            >
                                <h6
                                    style={{
                                        marginBottom: '10px',
                                        borderBottom: '1px solid #f0f0f0',
                                        paddingBottom: '8px',
                                        fontSize: '18px',
                                    }}
                                >
                                    AI Summary
                                </h6>
                                <div className="markdown-content">
                                    <ReactMarkdown>{aiSummary}</ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </>
                </QuestionnaireResponseFormProvider>
            </form>
        </FormProvider>
    );
}
