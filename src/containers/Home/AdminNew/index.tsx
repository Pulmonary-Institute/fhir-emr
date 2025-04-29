import { t } from '@lingui/macro';
import { PageContainer } from '@beda.software/emr/components';
import BillingTotal from '../components/BillingTotal';
import FacilitySummary from '../components/FacilitySumary';
import MonthlyClaim from '../components/MonthlyClaim';
import '../style-admin-dashboard.css';
import { getNameUser } from 'src/utils-frontend/practitioner';
import { useState, useEffect } from 'react';

function HomeAdmin() {
    const [fullName, setFullName] = useState<string>('');

    useEffect(() => {
        getNameUser().then((name) => setFullName(name));
    }, []);

    return (
        <>
            <PageContainer title={`${t`Welcome`} ${fullName}!`}>
                <div className="home-admin">
                    <BillingTotal />
                    <FacilitySummary />
                    <MonthlyClaim />
                </div>
            </PageContainer>
        </>
    );
}

export default HomeAdmin;
