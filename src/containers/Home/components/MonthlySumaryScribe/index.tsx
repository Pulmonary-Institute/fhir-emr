import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, Typography } from '@mui/material';
import { FaCheck } from 'react-icons/fa';
import { FaTimesCircle } from 'react-icons/fa';
import { FaExclamationCircle } from 'react-icons/fa';
import { useEffect, useState } from 'react';
import { dataMobthlySymmary } from './hooks';
import { t } from '@lingui/macro';

function MonthlyNotesScribe() {
    const [datamonthlyNotes, setDataMonthlyNotes] = useState([
        { quantity: 0, progress: 0 },
        { quantity: 0, progress: 0 },
        { quantity: 0, progress: 0 },
        { quantity: 0, progress: 0 },
        { quantity: 0, progress: 0 },
    ]);
    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        setDataMonthlyNotes(await dataMobthlySymmary());
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
            <div className="monthlyClaims">
                <div className="table-monthly-claims">
                    <TableContainer component={Paper} style={{ height: '100%' }}>
                        <Typography variant="h6" style={{ marginBottom: 10, marginLeft: 10, marginTop: 5 }}>
                            {t`Monthly Notes`}
                        </Typography>
                        <Table style={{ width: '100%', tableLayout: 'fixed' }}>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={styleHeader}>{t`Claims`}</TableCell>
                                    <TableCell sx={styleHeader}>{t`Status`}</TableCell>
                                    <TableCell sx={styleHeader}>{t`Quantity`}</TableCell>
                                    <TableCell sx={styleHeader}>{t`PROGRESS`}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={styleRows}>{`QA Aproved`}</TableCell>
                                    <TableCell sx={styleRows}>
                                        <FaCheck color="#05CD99" />
                                    </TableCell>
                                    <TableCell sx={styleRows}>{datamonthlyNotes[0].quantity}</TableCell>
                                    <TableCell sx={styleRows}>
                                        <div
                                            style={{ height: '10px' }}
                                            className="progress"
                                            role="progressbar"
                                            aria-label="Basic example"
                                            aria-valuenow={0}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        >
                                            <div
                                                className="progress-bar"
                                                style={{
                                                    width: `${datamonthlyNotes[0].progress}%`,
                                                    backgroundColor: '#4318FF',
                                                }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={styleRows}>{t`Not Completed`}</TableCell>
                                    <TableCell sx={styleRows}>
                                        <FaTimesCircle color="#EE5D50" />
                                    </TableCell>
                                    <TableCell sx={styleRows}>{datamonthlyNotes[1].quantity}</TableCell>
                                    <TableCell sx={styleRows}>
                                        <div
                                            style={{ height: '10px' }}
                                            className="progress"
                                            role="progressbar"
                                            aria-label="Basic example"
                                            aria-valuenow={0}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        >
                                            <div
                                                className="progress-bar"
                                                style={{
                                                    width: `${datamonthlyNotes[1].progress}%`,
                                                    backgroundColor: '#4318FF',
                                                }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={styleRows}>{t`Feedback to Handle`}</TableCell>
                                    <TableCell sx={styleRows}>
                                        <FaExclamationCircle color="#FFCE20" />
                                    </TableCell>
                                    <TableCell sx={styleRows}>{datamonthlyNotes[2].quantity}</TableCell>
                                    <TableCell sx={styleRows}>
                                        <div
                                            style={{ height: '10px' }}
                                            className="progress"
                                            role="progressbar"
                                            aria-label="Basic example"
                                            aria-valuenow={0}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        >
                                            <div
                                                className="progress-bar"
                                                style={{
                                                    width: `${datamonthlyNotes[2].progress}%`,
                                                    backgroundColor: '#4318FF',
                                                }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={styleRows}>{t`Submitted for QA`}</TableCell>
                                    <TableCell sx={styleRows}>
                                        <FaExclamationCircle color="#AEAEB2" />
                                    </TableCell>
                                    <TableCell sx={styleRows}>{datamonthlyNotes[3].quantity}</TableCell>
                                    <TableCell sx={styleRows}>
                                        <div
                                            style={{ height: '10px' }}
                                            className="progress"
                                            role="progressbar"
                                            aria-label="Basic example"
                                            aria-valuenow={0}
                                            aria-valuemin={0}
                                            aria-valuemax={100}
                                        >
                                            <div
                                                className="progress-bar"
                                                style={{
                                                    width: `${datamonthlyNotes[3].progress}%`,
                                                    backgroundColor: '#4318FF',
                                                }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </>
    );
}
export default MonthlyNotesScribe;
