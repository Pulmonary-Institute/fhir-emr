// components/EditableFormContent.tsx
import React, { useCallback } from 'react';
import TiptapEditor from './TiptabEditor';
import FormFieldWrapper from './FormFieldWrapper';
import { FormItems } from 'sdc-qrf';
import { useFormContext } from 'react-hook-form';
import _ from 'lodash';

interface EditableFormContentProps {
    label?: string;
    type?: 'text' | 'date' | 'decimal' | 'coding';
    path: string;
    otherPath?: string;
    unit?: string;
    isOther?: boolean;
    isArray?: boolean;
    questionnaireId?: string;
    planItems?: string[];
    formValues: FormItems;
}

const EditableFormContent: React.FC<EditableFormContentProps> = ({
    label,
    type = 'text',
    path,
    otherPath,
    unit,
    isOther,
    isArray = false,
    formValues,
}) => {
    const { setValue } = useFormContext<FormItems>();

    const getValue = (extractPath: string) => _.get(formValues, extractPath);

    if (isArray) {
        const values: any = getValue(path) || [];

        return (
            <FormFieldWrapper label={label}>
                <div className="d-flex" style={{ flexDirection: 'column', gap: '4px' }}>
                    <div className="d-flex">
                        {values.length > 0 ? (
                            values.map((item: any, index: number) => {
                                const itemPath: any = `${path}.${index}.value.Coding.code`;
                                return (
                                    <div key={index}>
                                        <TiptapEditor
                                            value={_.get(formValues, itemPath) || ''}
                                            onChange={(content) => {
                                                setValue(itemPath, content);
                                            }}
                                        />
                                    </div>
                                );
                            })
                        ) : (
                            <div>-</div>
                        )}
                    </div>
                    {label == 'Assessment/Plan' && (
                        <>
                            <div>
                                {' '}
                                <TiptapEditor
                                    value={
                                        _.get(
                                            formValues,
                                            'patient-assessment-plan-group.items.treatment.0.value.string',
                                        ) || ''
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
                                {' '}
                                <TiptapEditor
                                    value={
                                        _.get(
                                            formValues,
                                            'patient-assessment-plan-group.items.assessment.0.question',
                                        ) || ''
                                    }
                                    onChange={(content) => {
                                        setValue('patient-assessment-plan-group.items.assessment.0.question', content);
                                    }}
                                />
                            </div>
                        </>
                    )}
                </div>
            </FormFieldWrapper>
        );
    }

    const displayValue: any = (type === 'coding' || type === 'text') && isOther ? getValue(otherPath!) : getValue(path);

    const handleChange = useCallback(
        (input: any) => {
            if (type === 'decimal') {
                const num: any = parseFloat(input);
                if (!isNaN(num)) setValue(path, num);
            } else {
                if (isOther && otherPath) {
                    setValue(otherPath, input);
                } else {
                    setValue(path, input);
                }
            }
        },
        [setValue, path, type, isOther, otherPath],
    );

    return (
        <FormFieldWrapper label={label} unit={unit}>
            {type === 'date' ? (
                <input type="date" value={displayValue || ''} onChange={(e) => handleChange(e.target.value)} />
            ) : (
                <TiptapEditor value={displayValue || ''} onChange={handleChange} />
            )}
        </FormFieldWrapper>
    );
};

export default EditableFormContent;
