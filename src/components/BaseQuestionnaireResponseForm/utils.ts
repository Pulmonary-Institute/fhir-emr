import { ControllerFieldState, ControllerRenderProps, FieldValues } from 'react-hook-form';
import { notification } from 'antd';
import jsPDF from 'jspdf';
import { pdfLogo, topbackgroundImg, bottomBackgroundImg } from 'src/images/pdfImage';

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

// Tuple type for RGB colors
type RGB = [number, number, number];

// Utility function to add appropriate units to specific labels
const addUnitsIfNeeded = (label: string, value: string): string => {
    const normalizedLabel = label.toLowerCase();

    if (normalizedLabel.includes('weight')) return `${value} lbs`;
    if (normalizedLabel.includes('temperature')) return `${value} °F`;
    if (normalizedLabel.includes('oxygen saturation')) return `${value} %`;
    if (normalizedLabel.includes('pulse')) return `${value} bpm`;
    if (normalizedLabel.includes('respiratory')) return `${value} bpm`;
    if (normalizedLabel.includes('bp systolic') || normalizedLabel.includes('bp diastolic')) return `${value} mmHg`;

    return value;
};

export const generatePDF = (formValues: Record<string, any>, questionnaireId?: string): void => {
    const textToPdf = extractFormData(formValues, questionnaireId);

    const doc = new jsPDF({
        unit: 'mm',
        format: 'a4',
        putOnlyUsedFonts: true,
    });

    const marginLeft = 20;
    const marginTop = 34;
    const marginBottom = 20;
    const marginRight = 20;

    const lineHeight = 8;
    const pageHeight = 297;
    const pageWidth = 210;
    const maxLineWidth = pageWidth - marginLeft - marginRight;

    let currentY = marginTop;

    const topBackgroundBase64 = topbackgroundImg;
    const topBackgroundWidth = 65;
    const topBackgroundHeight = 35;

    const bottomBackgroundBase64 = bottomBackgroundImg;
    const bottomBackgroundWidth = 65;
    const bottomBackgroundHeight = 35;

    const logoBase64 = pdfLogo;
    const logoWidth = 50;
    const logoHeight = 25;
    const rightMargin = 3;
    const logoTopMargin = 3;

    const drawPageImages = (): void => {
        doc.addImage(topBackgroundBase64, 'PNG', 0, 0, topBackgroundWidth, topBackgroundHeight);
        const logoX = pageWidth - rightMargin - logoWidth;
        doc.addImage(logoBase64, 'PNG', logoX, logoTopMargin, logoWidth, logoHeight);
        const bottomX = pageWidth - bottomBackgroundWidth;
        const bottomY = pageHeight - bottomBackgroundHeight;
        doc.addImage(bottomBackgroundBase64, 'PNG', bottomX, bottomY, bottomBackgroundWidth, bottomBackgroundHeight);
    };

    const addWrappedText = (text: string, fontStyle: 'normal' | 'italic' = 'normal', color: RGB = [0, 0, 0]): void => {
        doc.setFont('helvetica', fontStyle);
        doc.setTextColor(...color);
        const wrappedLines = doc.splitTextToSize(text, maxLineWidth);
        wrappedLines.forEach((wrappedLine: string) => {
            if (currentY + lineHeight > pageHeight - marginBottom) {
                doc.addPage();
                drawPageImages();
                currentY = marginTop;
            }
            doc.text(wrappedLine, marginLeft, currentY);
            currentY += lineHeight;
        });
    };

    const addLabelValue = (label: string, value: string): void => {
        const labelFontSize = 12;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(labelFontSize);
        const labelWidth = doc.getTextWidth(label);

        const remainingWidth = maxLineWidth - labelWidth - 2;
        const wrappedValueLines = doc.splitTextToSize(value, remainingWidth);

        if (currentY + lineHeight > pageHeight - marginBottom) {
            doc.addPage();
            drawPageImages();
            currentY = marginTop;
        }

        doc.setTextColor(0, 0, 0);
        doc.text(label, marginLeft, currentY);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(28, 27, 27);
        doc.text(wrappedValueLines[0], marginLeft + labelWidth + 2, currentY);
        currentY += lineHeight;

        for (let i = 1; i < wrappedValueLines.length; i++) {
            if (currentY + lineHeight > pageHeight - marginBottom) {
                doc.addPage();
                drawPageImages();
                currentY = marginTop;
            }
            doc.text(wrappedValueLines[i], marginLeft + 4, currentY);
            currentY += lineHeight;
        }
    };

    const lines = textToPdf ? textToPdf.split('\n') : [];

    drawPageImages();

    lines.forEach((rawLine) => {
        const line = rawLine.trim();

        if (!line) {
            currentY += lineHeight / 2;
            return;
        }

        if (line.endsWith(':') && !line.includes(' ')) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(12);
            doc.setTextColor(0, 0, 0);
            doc.text(line.replace(':', ''), marginLeft, currentY);
            currentY += lineHeight;
        } else if (line.startsWith('•') || line.startsWith('-')) {
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(0, 0, 0);
            doc.text(line, marginLeft + 4, currentY);
            currentY += lineHeight;
        } else if (line.includes(':')) {
            const [label = '', ...rest] = line.split(':');
            const rawValue = rest.join(':').trim();
            const valueWithUnit = addUnitsIfNeeded(label, rawValue);
            addLabelValue(`${label.trim()}:`, valueWithUnit);
        } else if (line.startsWith('No ') || line.startsWith('NORMAL ') || line.includes('no ')) {
            addWrappedText(line, 'italic');
        } else {
            addWrappedText(line);
        }
    });

    let providerName = 'Provider';
    for (const line of lines) {
        if (line.toLowerCase().includes('provider')) {
            const match = line.match(/provider\s*:\s*(.+)/i);
            if (match && match[1]) {
                providerName = match[1].trim();
                break;
            }
        }
    }

    currentY += 15;
    const today = new Date();
    const formattedDate = today.toLocaleDateString();

    const signedText = `**ELECTRONICALLY SIGNED ON ${formattedDate} BY ${providerName}, ARNP**`;
    const signedColor: RGB = [116, 116, 116];
    const signedLines = doc.splitTextToSize(signedText, maxLineWidth);

    signedLines.forEach((line: string) => {
        if (currentY + lineHeight > pageHeight - marginBottom) {
            doc.addPage();
            drawPageImages();
            currentY = marginTop;
        }
        doc.setFont('courier', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(...signedColor);
        doc.text(line, marginLeft, currentY);
        currentY += lineHeight;
    });

    let visitOfType = 'UnknownTypeOfCare';

    for (const line of lines) {
        if (line.toLowerCase().startsWith('type of care')) {
            const match = line.match(/Type of Care:\s*(.+)/i);
            if (match && match[1]) {
                visitOfType = match[1].trim();
                break;
            }
        }
    }
    const sanitizedVisitType = visitOfType.replace(/[^a-z0-9]/gi, '_');

    doc.save(`Moxie Health Group(${sanitizedVisitType}).pdf`);
};
