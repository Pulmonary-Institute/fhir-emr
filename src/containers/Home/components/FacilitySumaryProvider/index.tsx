import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    Typography,
    MenuItem,
    Select,
    FormControl,
} from '@mui/material';
import { useEffect, useState } from 'react';

import { t } from '@lingui/macro';

import { getEncounterSummary } from './hook';
import FacilitySumaryGraphic from './facilityGraphic';

const ITEM_HEIGHT = 18;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 130,
        },
    },
};

function FacilitySummary() {
    const [encounterSummary, setEncounterSummary] = useState([
        { quantity: 0, progress: '0%' },
        { quantity: 0, progress: '0%' },
        { quantity: 0, progress: '0%' },
        { quantity: 0, progress: '0%' },
        { quantity: 0, progress: '0%' },
    ]);

    const [encounterSum, setEncounterSum] = useState<any[]>([]);

    const [monthList, setMonthList] = useState<any[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<any>('All');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setEncounterSummary(await getEncounterSummary());
    };

    // Filter Encounter by month
    useEffect(() => {
        const filteredEncounters =
            selectedMonth == 'All'
                ? encounterSummary
                : encounterSummary.filter((item: any) => item.meta?.lastUpdated?.startsWith(selectedMonth));

        filterEncounterData(filteredEncounters);
    }, [encounterSummary, selectedMonth]);

    useEffect(() => {
        if (encounterSummary.length > 0) {
            // Filter by Month in Encounter Summary
            const uniqueMonths = [
                ...new Set(encounterSummary.map((encounter: any) => encounter.meta?.lastUpdated?.slice(0, 7))),
            ].filter(Boolean);

            setMonthList(uniqueMonths);

            // Show filter Encounter Data
            filterEncounterData(encounterSummary);
        }
    }, [encounterSummary]);

    // Filter Encounter Data
    const filterEncounterData = (Encounter: any) => {
        const grouped = Encounter.reduce((acc: any, item: any) => {
            const status = item.businessStatus?.coding[0].display || 'Unknown';
            if (acc[status]) {
                acc[status]++;
            } else {
                acc[status] = 1;
            }

            return acc;
        }, {});

        const agrupedObject = Object.entries(grouped).map(([claims, quantity]) => ({
            claims,
            quantity,
        }));

        const total = Encounter.length;

        const result = [
            { quantity: 0, progress: '0%' },
            { quantity: 0, progress: '0%' },
            { quantity: 0, progress: '0%' },
            { quantity: 0, progress: '0%' },
            { quantity: 0, progress: '0%' },
        ];

        agrupedObject.map((item: any) => {
            if (item.claims === 'Completed') {
                result[0] = { quantity: item.quantity, progress: `${((item.quantity * 100) / total).toFixed(2)}%` };
            }
            if (item.claims === 'Not Completed') {
                result[1] = { quantity: item.quantity, progress: `${((item.quantity * 100) / total).toFixed(2)}%` };
            }
            if (item.claims === 'Feedback to handle') {
                result[2] = { quantity: item.quantity, progress: `${((item.quantity * 100) / total).toFixed(2)}%` };
            }
            if (item.claims === 'For QA') {
                result[3] = { quantity: item.quantity, progress: `${((item.quantity * 100) / total).toFixed(2)}%` };
            }
            if (item.claims === 'New') {
                result[4] = { quantity: item.quantity, progress: `${((item.quantity * 100) / total).toFixed(2)}%` };
            }
        });

        setEncounterSum(result);
    };

    const styleHeader = {
        color: '#00000',
        fontFamily: 'DM Sans',
        fontSize: '16px',
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
                    <TableContainer
                        component={Paper}
                        style={{ height: '100%', background: 'none' }}
                        sx={{ boxShadow: 'none', border: 'none' }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <Typography
                                variant="h6"
                                style={{ color: '#2b3674', marginBottom: 10, marginLeft: 10, marginTop: 5 }}
                            >
                                {t`Encounters Summary`}
                            </Typography>

                            <FormControl sx={{ minWidth: 140, marginBottom: 2 }}>
                                <Select
                                    displayEmpty
                                    id="filterbymonth"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    MenuProps={MenuProps}
                                    sx={{
                                        height: '40px',
                                        fontSize: '14px',
                                    }}
                                >
                                    <MenuItem value="All">{t`All`}</MenuItem>
                                    {monthList.map((month) => (
                                        <MenuItem key={month} value={month}>
                                            {new Date(`${month}-01`).toLocaleDateString('en-US', {
                                                month: 'long',
                                                year: 'numeric',
                                            })}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>

                        <Table style={{ width: '100%', tableLayout: 'auto' }}>
                            <TableHead>
                                <TableRow style={{ top: 0, zIndex: 100, backgroundColor: 'none', color: '#2B3674' }}>
                                    <TableCell sx={styleHeader}>{t`Status`}</TableCell>
                                    <TableCell sx={styleHeader}>{t`Quantity`}</TableCell>
                                    <TableCell sx={styleHeader}>{t`Progress`}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={styleRows}>{t`Completed`}</TableCell>
                                    <TableCell sx={styleRows}>{encounterSum[0]?.quantity}</TableCell>
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
                                                    width: encounterSum[0]?.progress,
                                                    backgroundColor: '#4318FF',
                                                }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={styleRows}>{t`Not Completed`}</TableCell>
                                    <TableCell sx={styleRows}>{encounterSum[1]?.quantity}</TableCell>
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
                                                    width: encounterSum[1]?.progress,
                                                    backgroundColor: '#4318FF',
                                                }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={styleRows}>{t`Feedback to handle`}</TableCell>
                                    <TableCell sx={styleRows}>{encounterSum[2]?.quantity}</TableCell>
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
                                                    width: encounterSum[2]?.progress,
                                                    backgroundColor: '#4318FF',
                                                }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={styleRows}>{t`For QA`}</TableCell>
                                    <TableCell sx={styleRows}>{encounterSum[3]?.quantity}</TableCell>
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
                                                    width: encounterSum[3]?.progress,
                                                    backgroundColor: '#4318FF',
                                                }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={styleRows}>{t`New`}</TableCell>
                                    <TableCell sx={styleRows}>{encounterSum[4]?.quantity}</TableCell>
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
                                                    width: encounterSum[4]?.progress,
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

                <FacilitySumaryGraphic />
            </div>
        </>
    );
}
export default FacilitySummary;
