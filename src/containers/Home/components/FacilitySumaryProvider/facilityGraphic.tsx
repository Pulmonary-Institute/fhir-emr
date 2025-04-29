import { ResponsiveBar } from '@nivo/bar';
import React, { useEffect, useState } from 'react';

import { t } from '@lingui/macro';

import { dataTotalPatientGraphic, dataDischergedPatient } from './hook';

function FacilitySumaryGraphic() {
    const [graphic1, setGraphic1] = useState([{}]);
    const [graphic2, setGraphic2] = useState([{}]);
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        setGraphic2(await dataDischergedPatient());
        setGraphic1(await dataTotalPatientGraphic());
    };

    return (
        <React.Fragment>
            <div className="facility-sumary-graphic-1">
                <div className="info-graph-sumary-facility">
                    <p className="title-billing-total">{t`Encounters`}</p>
                    <div className="amount">
                        <p className="value-billing-info">
                            {Array.isArray(graphic1) && graphic1.length > 0
                                ? graphic1.reduce((sum: number, item: any) => sum + (item.count || 0), 0)
                                : 0}
                        </p>
                    </div>
                </div>
                <div style={{ width: '100%', height: '60%', marginTop: '20px' }}>
                    <ResponsiveBar
                        data={graphic1}
                        keys={['count']}
                        indexBy="month"
                        padding={0.6}
                        margin={{ top: 0, right: 0, bottom: 25, left: 0 }}
                        colors={{ scheme: 'nivo' }}
                        borderRadius={12}
                        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                        enableLabel={false}
                        enableGridY={false}
                        axisBottom={{ tickSize: 0 }}
                        fill={[
                            {
                                match: '*',
                                id: 'gradientA',
                            },
                        ]}
                        defs={[
                            {
                                id: 'gradientA',
                                type: 'linearGradient',
                                colors: [
                                    { offset: 0, color: '#4318FF' },
                                    { offset: 100, color: '#bfdbfe' },
                                ],
                            },
                        ]}
                    />
                </div>
            </div>

            <div className="facility-sumary-graphic-2">
                <div className="info-graph-sumary-facility">
                    <p className="title-billing-total">{t`Discharged Patients`}</p>
                    <div className="amount">
                        <p className="value-billing-info">
                            {Array.isArray(graphic2) && graphic2.length > 0
                                ? graphic2.reduce((sum: number, item: any) => sum + (item.count || 0), 0)
                                : 0}
                        </p>
                    </div>
                </div>
                <div style={{ width: '100%', height: '60%', marginTop: '20px' }}>
                    <ResponsiveBar
                        data={graphic2}
                        keys={['count']}
                        indexBy="month"
                        padding={0.6}
                        margin={{ top: 0, right: 0, bottom: 25, left: 0 }}
                        colors={{ scheme: 'nivo' }}
                        borderRadius={12}
                        borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                        enableLabel={false}
                        enableGridY={false}
                        axisBottom={{ tickSize: 0 }}
                        fill={[
                            {
                                match: '*',
                                id: 'gradientB',
                            },
                        ]}
                        defs={[
                            {
                                id: 'gradientB',
                                type: 'linearGradient',
                                colors: [
                                    { offset: 0, color: '#FFAE18' },
                                    { offset: 100, color: '#fef08a' },
                                ],
                            },
                        ]}
                    />
                </div>
            </div>
        </React.Fragment>
    );
}

export default FacilitySumaryGraphic;
