import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Typography } from '@mui/material';
import { ResponsiveBar } from '@nivo/bar';
import { t } from '@lingui/macro';
import { useEffect, useState } from 'react';
import { dataFacilitySummary, dataDischergedPatient } from './hook';
function FacilitySummary() {
    const [facilitySummary, setFacilitySummary] = useState([{}]);
    const [graphic1] = useState([{}]);
    const [graphic2, setGraphic2] = useState([{}]);
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        setGraphic2(await dataDischergedPatient());
        //setGraphic1(await dataTotalEncountersGraphic())
        setFacilitySummary(await dataFacilitySummary());
    };
    const styleHeader = {
        color: '#A3AED0',
        fontFamily: 'DM Sans',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: '24px' /* 171.429% */,
        letterSpacing: '-0.28px',
    };
    const styleRows = {
        color: '#2B3674',
        fontFamily: 'DM Sans',
        fontSize: '14px',
        fontStyle: 'normal',
        fontWeight: '700',
        lineHeight: '24px',
        letterSpacing: '-0.28px',
    };
    return (
        <>
            <div className="facilitySumary">
                <div className="table-facility-sumary">
                    <TableContainer component={Paper} style={{ height: '100%' }}>
                        <Typography variant="h6" style={{ marginBottom: 10, marginLeft: 10, marginTop: 5 }}>
                            {t`Facilities Summary`}
                        </Typography>
                        <Table style={{ width: '100%', tableLayout: 'fixed' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={styleHeader}>{t`Name`}</TableCell>
                                    <TableCell sx={styleHeader}>{t`Completed`}</TableCell>
                                    <TableCell sx={styleHeader}>{t`Pending`}</TableCell>
                                    <TableCell sx={styleHeader}>{t`Total`}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {facilitySummary.map((row: any) => (
                                    <TableRow>
                                        <TableCell sx={styleRows}>{row.facility}</TableCell>
                                        <TableCell sx={styleRows}>{row.completed}</TableCell>
                                        <TableCell sx={styleRows}>{row.notCompleted}</TableCell>
                                        <TableCell sx={styleRows}>{row.total}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
                <div className="facility-sumary-graphic-1">
                    <div className="info-graph-sumary-facility">
                        <p className="title-billing-total">{t`Total Encounters`}</p>
                        <div className="amount">
                            <p className="value-billing-info">0</p>
                            <p className="title-billing-total">{t`Encounters`}</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '50%', marginTop: '20px' }}>
                        <ResponsiveBar
                            data={graphic1}
                            keys={['count']}
                            indexBy="month"
                            padding={0.6}
                            margin={{ top: 5, right: 0, bottom: 25, left: 30 }}
                            colors={{ scheme: 'nivo' }}
                            borderRadius={6}
                            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                            enableLabel={false}
                            axisLeft={null}
                            fill={[
                                {
                                    match: '*', // Aplica el gradiente a todas las barras
                                    id: 'gradientA', // Nombre del gradiente que definiremos
                                },
                            ]}
                            defs={[
                                {
                                    id: 'gradientA',
                                    type: 'linearGradient',
                                    colors: [
                                        { offset: 0, color: '#4318FF' }, // Base (color más claro)
                                        { offset: 100, color: '#bfdbfe' }, // Tope (color más oscuro)
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
                                {graphic2.reduce((sum: any, item: any) => sum + item.count, 0)}
                            </p>
                            <p className="title-billing-total">{t`patients`}</p>
                        </div>
                    </div>
                    <div style={{ width: '100%', height: '50%', marginTop: '20px' }}>
                        <ResponsiveBar
                            data={graphic2}
                            keys={['count']}
                            indexBy="month"
                            padding={0.6}
                            margin={{ top: 5, right: 0, bottom: 25, left: 30 }}
                            colors={{ scheme: 'nivo' }}
                            borderRadius={6}
                            borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                            enableLabel={false}
                            fill={[
                                {
                                    match: '*', // Aplica el gradiente a todas las barras
                                    id: 'gradientB', // Nombre del gradiente que definiremos
                                },
                            ]}
                            defs={[
                                {
                                    id: 'gradientB',
                                    type: 'linearGradient',
                                    colors: [
                                        { offset: 0, color: '#FFAE18' }, // Base (color más claro)
                                        { offset: 100, color: '#fef08a' }, // Tope (color más oscuro)
                                    ],
                                },
                            ]}
                        />
                    </div>
                </div>
            </div>
        </>
    );
}
export default FacilitySummary;
