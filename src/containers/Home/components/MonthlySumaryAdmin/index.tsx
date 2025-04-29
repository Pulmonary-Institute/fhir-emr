import 'bootstrap/dist/css/bootstrap.min.css';
import { useState, useEffect } from 'react';
import { t } from '@lingui/macro';

import { getCountOrganizationByCode, getCountProviders, getCountActivePatients, getCountNews } from './hooks';
function MonthlySumary() {
    const [insurance, setInsurance] = useState(0);
    const [totalProviders, setTotalProviders] = useState(0);
    const [totalFacility, setTotalFacility] = useState(0);
    const [totalPatientActive, setTotalPatientActive] = useState(0);
    const [totalNews, setTotalNews] = useState(0);
    useEffect(() => {
        loadCounts();
    }, []);

    const loadCounts = async () => {
        const codeInsurence = 'ins';
        const codefacility = 'dept';
        setTotalProviders(await getCountProviders());
        setInsurance(await getCountOrganizationByCode(codeInsurence));
        setTotalFacility(await getCountOrganizationByCode(codefacility));
        setTotalPatientActive(await getCountActivePatients());
        setTotalNews(await getCountNews());
    };
    return (
        <>
            <div className="right">
                <div className="scroll-container">
                    <h3>{t`Monthly Summary`}</h3>
                    <ol className="list-group list-group">
                        <li className="list-group-item d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">{t`New Patients`}</div>
                            <div className="badge">{totalNews}</div>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">{t`Discharged Patients`}</div>
                            <div className="badge">0</div>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">{t`Readmissions`}</div>
                            <div className="badge">0</div>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">{t`Total Active Patients`}</div>
                            <div className="badge">{totalPatientActive}</div>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">{t`Total Facilites`}</div>
                            <div className="badge">{totalFacility}</div>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">{t`Total Providers`}</div>
                            <div className="badge">{totalProviders}</div>
                        </li>
                        <li className="list-group-item d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">{t`Total Insurances`}</div>
                            <div className="badge">{insurance}</div>
                        </li>
                    </ol>
                </div>
            </div>
        </>
    );
}
export default MonthlySumary;
