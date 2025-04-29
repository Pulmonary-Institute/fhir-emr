import {
    FormControl,
    Select,
    MenuItem,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    TableContainer,
    Paper,
    Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import { FaCheck } from 'react-icons/fa';
import { FaTimesCircle } from 'react-icons/fa';
import { FaExclamationCircle } from 'react-icons/fa';

import { dataMonthlyClaim } from './hooks';

import { t } from '@lingui/macro';

import PieChartForTopInsurances from './pieChartForTopInsurances';
import PieChartForTopFacilities from './pieChartForTopFacilities';

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

function MonthlyClaim() {
    const [monthlyClaims, setMonthlyClaim] = useState([
        { quantity: 0, progress: '0%' },
        { quantity: 0, progress: '0%' },
        { quantity: 0, progress: '0%' },
        { quantity: 0, progress: '0%' },
        { quantity: 0, progress: '0%' },
    ]);

    const [monthClaims, setMonthClaim] = useState([]);
    const [monthList, setMonthList] = useState<string[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>('All');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setMonthClaim(await dataMonthlyClaim());
    };

    // Filter Claims by month
    useEffect(() => {
        const filteredFacilities =
            selectedMonth === 'All'
                ? monthClaims
                : monthClaims.filter((item: any) => item.meta.lastUpdated?.startsWith(selectedMonth));

        filterClaimData(filteredFacilities);
    }, [monthClaims, selectedMonth]);

    useEffect(() => {
        if (monthClaims.length > 0) {
            // Filter by Month in Facilities Summary as 2025-01
            const uniqueMonths = [
                ...new Set(monthClaims.map((item: any) => item.meta.lastUpdated?.slice(0, 7))),
            ].filter(Boolean);
            setMonthList(uniqueMonths);

            // Show filter Claims Data
            filterClaimData(monthClaims);
        }
    }, [monthClaims]);

    // Update format of monthlyClaims
    const filterClaimData = (Claims: any) => {
        const grouped = Claims.reduce((acc: any, item: any) => {
            const status = item.businessStatus?.coding?.[0]?.display || 'Unknown';

            if (!acc[status]) {
                acc[status] = {
                    count: 0,
                    lastUpdated: null,
                };
            }

            // Increment count
            acc[status].count++;

            // Store the last updated date
            if (item.meta?.lastUpdated) {
                acc[status].lastUpdated = item.meta.lastUpdated.split('T')[0];
            }

            return acc;
        }, {});

        const agrupedObject = Object.entries(grouped).map(([claims, quantity]) => ({
            claims,
            quantity,
        }));

        const total = Claims.length;
        const result = [
            { quantity: 0, progress: '0%' },
            { quantity: 0, progress: '0%' },
            { quantity: 0, progress: '0%' },
            { quantity: 0, progress: '0%' },
            { quantity: 0, progress: '0%' },
        ];

        agrupedObject.forEach((item: any) => {
            if (item.claims === 'Claim Accepted') {
                result[0] = {
                    quantity: item.quantity.count,
                    progress: `${((item.quantity.count * 100) / total).toFixed(2)}%`,
                };
            }
            if (item.claims === 'Claim Rejected') {
                result[1] = {
                    quantity: item.quantity.count,
                    progress: `${((item.quantity.count * 100) / total).toFixed(2)}%`,
                };
            }
            if (item.claims === 'Unable to claim') {
                result[2] = {
                    quantity: item.quantity.count,
                    progress: `${((item.quantity.count * 100) / total).toFixed(2)}%`,
                };
            }
            if (item.claims === 'Pending') {
                result[3] = {
                    quantity: item.quantity.count,
                    progress: `${((item.quantity.count * 100) / total).toFixed(2)}%`,
                };
            }
            if (item.claims === 'Claim Sent') {
                result[4] = {
                    quantity: item.quantity.count,
                    progress: `${((item.quantity.count * 100) / total).toFixed(2)}%`,
                };
            }
        });

        setMonthlyClaim(result);
    };

    const styleHeader = {
        color: '#00000',
        fontFamily: 'DM Sans',
        fontSize: '16px',
        fontStyle: 'normal',
        fontWeight: '500',
        lineHeight: '24px',
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
                                {t`Monthly Claims`}
                            </Typography>

                            {/* Month Filter Dropdown */}
                            <FormControl sx={{ minWidth: 150, marginBottom: 2 }}>
                                <Select
                                    displayEmpty
                                    id="filterbymonth"
                                    value={selectedMonth}
                                    MenuProps={MenuProps}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    sx={{
                                        height: '30px',
                                        fontSize: '12px',
                                        width: '130px',
                                        color: 'gray',
                                    }}
                                >
                                    <MenuItem value="All" sx={{ fontSize: '13px', height: '36px' }}>{t`All`}</MenuItem>
                                    {monthList.map((month) => (
                                        <MenuItem key={month} value={month} sx={{ fontSize: '13px', height: '36px' }}>
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
                                    <TableCell sx={styleHeader}>{t`Claims`}</TableCell>
                                    <TableCell sx={styleHeader}>{t`Status`}</TableCell>
                                    <TableCell sx={styleHeader}>{t`Quantity`}</TableCell>
                                    <TableCell sx={styleHeader}>{t`Progress`}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                <TableRow>
                                    <TableCell sx={styleRows}>{t`Claim Accepted`}</TableCell>
                                    <TableCell sx={styleRows}>
                                        <FaCheck color="#05CD99" />
                                    </TableCell>
                                    <TableCell sx={styleRows}>{monthlyClaims[0].quantity}</TableCell>
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
                                                style={{ width: monthlyClaims[0].progress, backgroundColor: '#4318FF' }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={styleRows}>{t`Claim Rejected`} </TableCell>
                                    <TableCell sx={styleRows}>
                                        <FaTimesCircle color="#EE5D50" />
                                    </TableCell>
                                    <TableCell sx={styleRows}>{monthlyClaims[1].quantity}</TableCell>
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
                                                style={{ width: monthlyClaims[1].progress, backgroundColor: '#4318FF' }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={styleRows}>{t`Unable to Claim`}</TableCell>
                                    <TableCell sx={styleRows}>
                                        <FaExclamationCircle color="#FFCE20" />
                                    </TableCell>
                                    <TableCell sx={styleRows}>{monthlyClaims[2].quantity}</TableCell>
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
                                                style={{ width: monthlyClaims[2].progress, backgroundColor: '#4318FF' }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={styleRows}>{t`Pending`}</TableCell>
                                    <TableCell sx={styleRows}>
                                        <FaExclamationCircle color="#AEAEB2" />
                                    </TableCell>
                                    <TableCell sx={styleRows}>{monthlyClaims[3].quantity}</TableCell>
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
                                                style={{ width: monthlyClaims[3].progress, backgroundColor: '#4318FF' }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell sx={styleRows}>{t`Claim Sent`}</TableCell>
                                    <TableCell sx={styleRows}>
                                        <FaExclamationCircle color="#AEAEB2" />
                                    </TableCell>
                                    <TableCell sx={styleRows}>{monthlyClaims[4].quantity}</TableCell>
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
                                                style={{ width: monthlyClaims[4].progress, backgroundColor: '#4318FF' }}
                                            ></div>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>

                <div className="monthly-graphic">
                    <PieChartForTopInsurances />
                    <PieChartForTopFacilities />
                </div>
            </div>
        </>
    );
}

export default MonthlyClaim;