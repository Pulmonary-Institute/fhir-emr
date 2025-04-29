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
import { ResponsiveBar } from '@nivo/bar';
import { useEffect, useState } from 'react';
import { t } from '@lingui/macro';

import { dataFacilitySummary, dataTotalPatientGraphic, dataDischergedPatient } from './hook';

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
    const [facilitySummary, setFacilitySummary] = useState([{}]);
    const [graphic1, setGraphic1] = useState([{}]);
    const [graphic2, setGraphic2] = useState([{}]);

    const [selectedMonth, setSelectedMonth] = useState<any>('All');

    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        setGraphic2(await dataDischergedPatient());
        setGraphic1(await dataTotalPatientGraphic());
        setFacilitySummary(await dataFacilitySummary());
    };

    // Filter by Month in Facilities Summary
    const uniqueMonths = [...new Set(facilitySummary.map((facility: any) => facility.lastUpdated?.slice(0, 7)))].filter(
        Boolean,
    );

    const filteredFacilities =
        selectedMonth == 'All'
            ? facilitySummary
            : facilitySummary.filter((facility: any) => facility.lastUpdated?.startsWith(selectedMonth));

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
                                {t`Facilities Summary`}
                            </Typography>

                            {/* Updated date selector with proportional styling */}
                            <FormControl sx={{ minWidth: 160, marginBottom: 2 }}>
                                <Select
                                    displayEmpty
                                    id="filterbymonth"
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(e.target.value)}
                                    MenuProps={{
                                        ...MenuProps,
                                        PaperProps: {
                                            ...MenuProps.PaperProps,
                                            style: {
                                                ...MenuProps.PaperProps?.style,
                                                maxHeight: '300px',
                                                width: '160px'
                                            }
                                        }
                                    }}
                                    sx={{
                                        height: '36px',
                                        fontSize: '13px',
                                        width: '160px',
                                        color: 'gray',
                                        '& .MuiSelect-select': {
                                            padding: '8px 12px',
                                            display: 'flex',
                                            alignItems: 'center'
                                        }
                                    }}
                                >
                                    <MenuItem value="All" sx={{ fontSize: '13px', height: '36px' }}>{t`All`}</MenuItem>
                                    {uniqueMonths.map((month) => (
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
                                    <TableCell sx={styleHeader}>{t`Name`}</TableCell>
                                    <TableCell sx={styleHeader}>{t`Patients`}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredFacilities.map((row: any, index: any) => (
                                    <TableRow key={index}>
                                        <TableCell sx={styleRows}>{row.facility}</TableCell>
                                        <TableCell sx={styleRows}>{row.patients}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>

                <div className="facility-graph">
                    <div className="facility-sumary-graphic-1">
                        <div className="info-graph-sumary-facility">
                            <p className="title-billing-total">{t`Total Patients`}</p>
                            <div className="amount">
                                <p className="value-billing-info">
                                    {graphic1.length > 0 && Object.keys(graphic1[0]).length > 0
                                        ? graphic1.reduce((sum: any, item: any) => sum + item.count, 0)
                                        : 0}
                                </p>
                            </div>
                        </div>
                        <div style={{ width: '100%', height: '60%' }}>
                            {/* Updated date formatting for chart */}
                            <ResponsiveBar
                                data={graphic1}
                                keys={['count']}
                                indexBy="month"
                                padding={0.6}
                                margin={{ top: 0, right: 0, bottom: 36, left: 0 }}
                                colors={{ scheme: 'nivo' }}
                                borderRadius={12}
                                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                                enableLabel={false}
                                enableGridY={false}
                                axisBottom={{
                                    tickSize: 0,
                                    tickRotation: 0,
                                    renderTick: (tick) => {
                                        // Format the month string to a more consistent format
                                        const monthText = new Date(`${tick.value}-01`).toLocaleDateString('en-US', {
                                            month: 'short'
                                        });
                                        return (
                                            <g transform={`translate(${tick.x},${tick.y + 8})`}>
                                                <text
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    style={{
                                                        fill: '#666',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {monthText}
                                                </text>
                                            </g>
                                        );
                                    }
                                }}
                                tooltip={({ value, indexValue }) => (
                                    <div style={{
                                        padding: '8px 12px',
                                        background: 'white',
                                        borderRadius: '4px',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                        fontSize: '13px'
                                    }}>
                                        {new Date(`${indexValue}-01`).toLocaleDateString('en-US', {
                                            month: 'long'
                                        })}: <span style={{ fontWeight: 'bold' }}>{value}</span>
                                    </div>
                                )}
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
                                            { offset: 60, color: '#5735ff' },
                                            { offset: 100, color: '#5735ff' },
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
                        <div style={{ width: '100%', height: '60%' }}>
                            {/* Updated date formatting for chart */}
                            <ResponsiveBar
                                data={graphic2}
                                keys={['count']}
                                indexBy="month"
                                padding={0.6}
                                margin={{ top: 0, right: 0, bottom: 36, left: 0 }}
                                colors={{ scheme: 'nivo' }}
                                borderRadius={12}
                                borderColor={{ from: 'color', modifiers: [['darker', 1.6]] }}
                                enableLabel={false}
                                enableGridY={false}
                                axisBottom={{
                                    tickSize: 0,
                                    tickRotation: 0,
                                    renderTick: (tick) => {
                                        // Format the month string to a more consistent format
                                        const monthText = new Date(`${tick.value}-01`).toLocaleDateString('en-US', {
                                            month: 'short'
                                        });
                                        return (
                                            <g transform={`translate(${tick.x},${tick.y + 8})`}>
                                                <text
                                                    textAnchor="middle"
                                                    dominantBaseline="middle"
                                                    style={{
                                                        fill: '#666',
                                                        fontSize: '12px'
                                                    }}
                                                >
                                                    {monthText}
                                                </text>
                                            </g>
                                        );
                                    }
                                }}
                                tooltip={({ value, indexValue }) => (
                                    <div style={{
                                        padding: '8px 12px',
                                        background: 'white',
                                        borderRadius: '4px',
                                        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                                        fontSize: '13px'
                                    }}>
                                        {new Date(`${indexValue}-01`).toLocaleDateString('en-US', {
                                            month: 'long'
                                        })}: <span style={{ fontWeight: 'bold' }}>{value}</span>
                                    </div>
                                )}
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
                                            { offset: 60, color: '#ffbf3d' },
                                            { offset: 100, color: '#ffbf3d' },
                                        ],
                                    },
                                ]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default FacilitySummary;
