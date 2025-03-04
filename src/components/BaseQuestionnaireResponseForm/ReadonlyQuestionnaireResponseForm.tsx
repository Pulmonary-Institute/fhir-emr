import { t } from '@lingui/macro';
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
    // const { watch } = methods;

    // const formValues = watch();
    // Extract AI Summary Value
    const aiSummary = formData?.formValues?.AISummary?.[0]?.value?.string || '';
    // Remove AI Summary from formValues
    const { AISummary, ...filteredFormValues } = formData.formValues || {};

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
                            questionItems={formData.context.questionnaire.item?.filter(
                                (item: any) => item.linkId !== 'AISummary',
                            )}
                            parentPath={[]}
                            context={calcInitialContext(formData.context, filteredFormValues)}
                        />
                        {/* AI Summary Section */}
                        {!aiSummary && (
                            <div className="markdown-container">
                                <h6
                                    style={{
                                        borderBottom: '1px solid #f0f0f0',
                                        paddingBottom: '8px',
                                        fontSize: '14px',
                                        fontWeight: '600',
                                    }}
                                >
                                    {t`AI Summary`}
                                </h6>
                                <div className="markdown-content">
                                    <ReactMarkdown
                                        components={{
                                            h2: ({ node, ...props }) => <h2 style={{ fontSize: '14px' }} {...props} />,
                                        }}
                                    >
                                        {aiSummary}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        )}
                    </>
                </QuestionnaireResponseFormProvider>
            </form>
        </FormProvider>
    );
}
