import React from 'react';
import { ReadonlyQuestionnaireResponseForm } from '@beda.software/emr/dist/components/BaseQuestionnaireResponseForm/ReadonlyQuestionnaireResponseForm';

interface EnhancedReadonlyFormProps {
    formData: any;
}

export const EnhancedReadonlyForm: React.FC<EnhancedReadonlyFormProps> = ({ formData }) => {
    return (
        <div className="enhanced-form-container">
            {/* First, render the standard form without the AI Summary */}
            <ReadonlyQuestionnaireResponseForm formData={formData} />
        </div>
    );
};
