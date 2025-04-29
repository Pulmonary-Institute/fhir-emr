import { useState, useEffect } from 'react';
import { getMonthlySumary } from './hooks';
import { t } from '@lingui/macro';

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min';

function MonthlySumaryProvider() {
    const [dataMonthlySumary, setDataMonthlySumary] = useState([{}]);

    useEffect(() => {
        loadMonthlySumary();
    }, []);
    const loadMonthlySumary = async () => {
        const data = await getMonthlySumary();
        setDataMonthlySumary(data);
    };
    return (
        <>
            <div className="monthly-sumary">
                <h5>{t`Monthly Sumary`}</h5>
                <div className="encounters-summary" style={{ width: '90%' }}>
                    <h6 style={{ textDecoration: 'underline' }}>{t`Encounter Sumary`}</h6>
                    {dataMonthlySumary.map((item: any) => (
                        <div className="encounters-sumary-facility">
                            <h6>{item.facility}</h6>
                            <div className="progress-stacked" style={{ width: '100%' }}>
                                <div
                                    className="progress"
                                    role="progressbar"
                                    aria-label="Segment one"
                                    aria-valuenow={15}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    style={{ width: `${item.finished}` }}
                                >
                                    <div className="progress-bar progress-bar-striped my-progress-bar-success">
                                        {item.finished}
                                    </div>
                                </div>
                                <div
                                    className="progress"
                                    role="progressbar"
                                    aria-label="Segment two"
                                    aria-valuenow={30}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    style={{ width: `${item.planned}` }}
                                >
                                    <div className="progress-bar progress-bar-striped my-progress-bar-warning">
                                        {item.planned}
                                    </div>
                                </div>
                                <div
                                    className="progress"
                                    role="progressbar"
                                    aria-label="Segment three"
                                    aria-valuenow={20}
                                    aria-valuemin={0}
                                    aria-valuemax={100}
                                    style={{ width: `${item.cancelled}` }}
                                >
                                    <div className="progress-bar progress-bar-striped my-progress-bar-danger">
                                        {item.cancelled}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div
                    style={{
                        width: '90%',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: '100px',
                        marginTop: '10px',
                        fontSize: '10px',
                    }}
                >
                    <div style={{ width: '10%' }}>
                        <div className="progress-stacked">
                            <div
                                className="progress"
                                role="progressbar"
                                aria-label="Segment one"
                                aria-valuenow={15}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{ width: '100%' }}
                            >
                                <div className="progress-bar progress-bar-striped my-progress-bar-success"></div>
                            </div>
                        </div>
                        <p>{t`Encounter Complete`}</p>
                    </div>
                    <div style={{ width: '10%' }}>
                        <div className="progress-stacked">
                            <div
                                className="progress"
                                role="progressbar"
                                aria-label="Segment one"
                                aria-valuenow={15}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{ width: '100%' }}
                            >
                                <div className="progress-bar progress-bar-striped my-progress-bar-warning"></div>
                            </div>
                        </div>

                        <p>{t`Scheduled`}</p>
                    </div>

                    <div style={{ width: '10%' }}>
                        <div className="progress-stacked">
                            <div
                                className="progress"
                                role="progressbar"
                                aria-label="Segment one"
                                aria-valuenow={15}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                style={{ width: '100%' }}
                            >
                                <div className="progress-bar progress-bar-striped my-progress-bar-danger"></div>
                            </div>
                        </div>
                        <p>{t`Not seen`}</p>
                    </div>
                </div>
            </div>
        </>
    );
}
export default MonthlySumaryProvider;
