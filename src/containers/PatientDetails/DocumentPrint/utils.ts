import { QuestionnaireItem, QuestionnaireResponse } from 'fhir/r4b';

import { compileAsFirst } from 'src/utils';

const qItemIsHidden = compileAsFirst<QuestionnaireItem, boolean>(
    "extension.where(url='http://hl7.org/fhir/StructureDefinition/questionnaire-hidden').exists() and extension.where(url='http://hl7.org/fhir/StructureDefinition/questionnaire-hidden').valueBoolean=true",
);

const getQrItemValueByLinkIdAndType = (linkId: string, type: string) =>
    compileAsFirst<QuestionnaireResponse, string>(`repeat(item).where(linkId='${linkId}').answer.value${type}`);


const questionnaireItemValueTypeMap: Record<QuestionnaireItem['type'], string> = {
    display: 'String',
    group: 'String',
    text: 'String',
    string: 'String',
    decimal: 'Decimal',
    integer: 'Integer',
    date: 'Date',
    dateTime: 'DateTime',
    time: 'Time',
    choice: 'Coding.code',
    boolean: 'Boolean',
    reference: 'Reference.display',
    'open-choice': '',
    attachment: '',
    quantity: '',
    question: '',
    url: '',
};

export function getQuestionnaireItemValue(
    questionnaireItem: QuestionnaireItem,
    questionnaireResponse: QuestionnaireResponse,
) {
    if (qItemIsHidden(questionnaireItem)) {
        return undefined;
    }
    if (questionnaireItem.type === 'decimal') {
        const unit = questionnaireItem?.extension?.[0]?.valueCoding?.code
        let result: [] | any = []
        function recursiveFlatten(array: [] | any): void {
            array.map((item: any) => {
                if (item.item) {
                    recursiveFlatten(item.item)
                }
                else {
                    result.push(item)
                }
            })
        }
        if (questionnaireResponse.item) {
            recursiveFlatten(questionnaireResponse.item)
        }
        const valueFilter = result.filter((item: any) => item.linkId == questionnaireItem.linkId)
        if (valueFilter[0]) {
            const valueDecimal = valueFilter[0].answer[0].valueDecimal
            return valueDecimal + ' ' + unit
        }

    }
    if (questionnaireItem.repeats) {
        let result: [] | any = []
        function recursiveFlatten(array: [] | any): void {
            array.map((item: any) => {
                if (item.item) {
                    recursiveFlatten(item.item)
                }
                else {
                    result.push(item)
                }
            })
        }
        if (questionnaireResponse.item) {
            recursiveFlatten(questionnaireResponse.item)
        }
        const valueFilter = result.filter((item: any) => item.linkId == questionnaireItem.linkId)
        if (valueFilter[0]) {
            const itemValue = valueFilter[0].answer.map((item: any) => {
                return item.valueCoding.code
            })
            return itemValue.join(', ')
        }
    }
    return getQrItemValueByLinkIdAndType(
        questionnaireItem.linkId,
        questionnaireItemValueTypeMap[questionnaireItem.type],
    )(questionnaireResponse);
}

export function flattenQuestionnaireGroupItems(item: QuestionnaireItem): QuestionnaireItem[] {
    if (item.type !== 'group') {
        return [item];
    } else {
        const extractedItems = item.item
            ? item.item.map((internalItem) => {
                if (internalItem.type === 'group') {
                    return flattenQuestionnaireGroupItems(internalItem);
                }
                return [internalItem];
            })
            : [];
        return [...extractedItems.flat()];
    }
}
