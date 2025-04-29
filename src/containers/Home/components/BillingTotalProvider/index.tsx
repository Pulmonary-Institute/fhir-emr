import { getDataBillingSummary } from './hooks';
import { t } from '@lingui/macro';

import { useEffect, useState } from 'react';
function BillingTotal() {
    const [dataBillingTotal, setDataBillingTotal] = useState({
        totalEncounter: 0,
        totalFacility: 0,
        totalProvider: 0,
        totalScriber: 0,
    });
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        setDataBillingTotal(await getDataBillingSummary());
    };
    return (
        <>
            <div className="billing-total">
                <div className="total-1">
                    <div className="billing-info">
                        <div className="info">
                            <p className="title-billing-total">{t`Total Encounters`}</p>
                            <p className="value-billing-info">{dataBillingTotal.totalEncounter}</p>
                        </div>
                    </div>
                </div>
                <div className="total-4">
                    <div className="billing-info">
                        <div className="info">
                            <p className="title-billing-total">{t`Total Facilities`}</p>
                            <p className="value-billing-info">{dataBillingTotal.totalFacility}</p>
                        </div>
                    </div>
                </div>
                <div className="total-5">
                    <div className="billing-info">
                        <div className="info">
                            <p className="title-billing-total">{t`Total Providers`}</p>
                            <p className="value-billing-info">{dataBillingTotal.totalProvider}</p>
                        </div>
                    </div>
                </div>
                <div className="total-6">
                    <div className="billing-info">
                        <div className="info">
                            <p className="title-billing-total">{t`Total Scribers`}</p>
                            <p className="value-billing-info">{dataBillingTotal.totalScriber}</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default BillingTotal;
