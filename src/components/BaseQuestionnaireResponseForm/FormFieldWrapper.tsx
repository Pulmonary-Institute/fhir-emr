// components/FormFieldWrapper.tsx
import React from 'react';

interface FormFieldWrapperProps {
    label?: string;
    children: React.ReactNode;
    unit?: string;
}

const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({ label, children, unit }) => (
    <div className="edit-field">
        {label && <label>{label}:</label>}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {children}
            {unit && <span>{unit}</span>}
        </div>
    </div>
);

export default FormFieldWrapper;
