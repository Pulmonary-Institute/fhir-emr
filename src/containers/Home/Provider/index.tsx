import { t } from '@lingui/macro';
import { PageContainer } from '@beda.software/emr/components';
import FacilitySummary from '../components/FacilitySumaryProvider';
import MonthlyClaim from '../components/MonthlyClaimProvider';
import { getNameUser } from 'src/utils-frontend/practitioner';
import { useState, useEffect } from 'react';
function HomeProvider() {
    const [fullName, setFullName] = useState<string>('');

    useEffect(() => {
        getNameUser().then((name) => setFullName(name));
    }, []);

    return (
        <>
            <PageContainer title={`${t`Welcome`} ${fullName}!`}>
                {' '}
                {/* Use the function here */}
                <div className="home-provider">
                    <FacilitySummary />
                    <MonthlyClaim />
                </div>
            </PageContainer>
        </>
    );
}

export default HomeProvider;
