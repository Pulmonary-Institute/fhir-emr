import { useEffect, useState } from 'react';
import { getAssignedPatientsList } from './hooks';
import { t } from '@lingui/macro';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

function AssignedPatients() {
    const [patientsAssigned, setPatientsAssigned] = useState([{}]);
    useEffect(() => {
        loadAssignedPatients();
    }, []);
    const loadAssignedPatients = async () => {
        const data = await getAssignedPatientsList();
        setPatientsAssigned(data);
    };
    return (
        <>
            <div className="containerInvoice">
                <h5>{t`Assigned Patients`}</h5>
                <div className="overflow-auto" style={{ maxHeight: '240px', width: '100%', borderRadius: '6px' }}>
                    <ul className="listGroup">
                        {patientsAssigned.map((item: any) => (
                            <li className="list" style={{ height: '50px' }}>
                                <div className="ms-2">
                                    <div className="fw-bold">{item?.facility}</div>
                                    {item.dos}
                                </div>
                                <div className="badge">{item.count}</div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </>
    );
}
export default AssignedPatients;
