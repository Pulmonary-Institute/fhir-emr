import { ControllerFieldState, ControllerRenderProps, FieldValues } from 'react-hook-form';
import { notification } from 'antd';
import jsPDF from 'jspdf';

export function getFieldErrorMessage(
    field: ControllerRenderProps<FieldValues, any>,
    fieldState: ControllerFieldState,
    text?: string,
) {
    if (!fieldState || !fieldState.invalid) {
        return undefined;
    }

    if (!fieldState.error || !fieldState.error.message) {
        return undefined;
    }
    // replace [0], [1] with .0, .1 to match field.name
    const errorMessageWithInternalFieldName = fieldState.error.message.replace(/\[(\d+)\]/g, '.$1');

    const errorMessageWithHumanReadableFieldName = errorMessageWithInternalFieldName.replace(field.name, text ?? '');

    return errorMessageWithHumanReadableFieldName;
}

// Helper function to extract and format data
const extractFormData = (formValues: any, questionnaireId: string | undefined): string => {
    const getValue = (path: any) => path?.[0]?.value;
    const generateText = (label: string, value: any) => `\n${label}: ${value ?? ''}`;

    const getDisplayOrOther = (field: string) => {
        const val = getValue(formValues[field]);
        return val?.Coding?.code === 'Other' ? getValue(formValues[`${field}-other`])?.string : val?.Coding?.display;
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
        ['Date of Service', getValue(formValues['patient-service-time'])?.dateTime],
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

    if (questionnaireId === 'infectious-disease') {
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
        [
            'Case Discussed With',
            (() => {
                const cswith = formValues['case-discussed-with']?.[0]?.value?.Coding;
                return cswith?.code === 'Other'
                    ? formValues['case-discussed-with-other']?.[0]?.value?.string
                    : cswith?.display;
            })(),
        ],
    ];

    postCptFields.forEach(([label, value]) => {
        text += generateText(label, value);
    });

    return text.trim();
};

// Copy function using the helper
export const copyAllToClipboard = (formValues: any, questionnaireId: string | undefined) => {
    const textToCopy = extractFormData(formValues, questionnaireId);

    return navigator.clipboard
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

// Create PDF function using the helper
export const generatePDF = (formValues: any, questionnaireId: string | undefined) => {
    const textToPdf = extractFormData(formValues, questionnaireId);

    const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
    });

    const marginLeft = 20;
    const marginTop = 40;
    const marginBottom = 30;
    const marginRight = 20;

    const lineHeight = 10;
    const pageHeight = 297;
    const maxLineWidth = 210 - marginLeft - marginRight;

    const lines = doc.splitTextToSize(textToPdf, maxLineWidth);

    let currentY = marginTop;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(16);

    doc.setFont('helvetica', 'bold');
    doc.text('Process Note', 105, 20, { align: 'center' });

    doc.setFont('helvetica', 'normal');

    lines.forEach((line: string) => {
        if (currentY + lineHeight > pageHeight - marginBottom) {
            doc.addPage();
            currentY = marginTop;
        }
        doc.text(line, marginLeft, currentY);
        currentY += lineHeight;
    });

    doc.save('ProcessNote.pdf');
};
