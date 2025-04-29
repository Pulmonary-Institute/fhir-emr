import { FormControl, Select, MenuItem } from '@mui/material';
import { VictoryPie, VictoryTooltip } from 'victory';
import { getSumaryStatusEncounters } from './hooks';
import { useEffect, useState } from 'react';
import { t } from '@lingui/macro';

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

function PieChartForTopEncounters() {
    const [statusEncounters, setStatusEncounters] = useState([
        { x: '', y: 0 },
        { x: '', y: 0 },
        { x: '', y: 0 },
    ]);

    const [encounters, setEncounters] = useState([]);

    const [monthList, setMonthList] = useState<any[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<any>('All');

    useEffect(() => {
        loadData();
    }, []);
    const loadData = async () => {
        const dataEncounters = await getSumaryStatusEncounters();
        if (dataEncounters.length > 0) setEncounters(dataEncounters);
    };

    // Define data format form TopFacilities
    useEffect(() => {
        if (encounters.length > 0) {
            const uniqueMonths = [...new Set(encounters.map((item: any) => item.meta.lastUpdated?.slice(0, 7)))].filter(
                Boolean,
            );
            setMonthList(uniqueMonths);

            // define format of TopFacilities
            defineStatusEncounters(encounters);
        }
    }, [encounters]);

    const defineStatusEncounters = (Encounters: any) => {
        const grouped = Encounters.reduce((acc: any, item: any) => {
            const name = item.businessStatus.coding[0].display || 'Unknown';
            if (acc[name]) {
                acc[name]++;
            } else {
                acc[name] = 1;
            }

            return acc;
        }, {});

        const agrupedObject = Object.entries(grouped).map(([name, count]) => ({
            name,
            count,
        }));

        const groupCoverage = selectTopPorcentage(agrupedObject);
        setStatusEncounters(groupCoverage);
    };

    // Filter Claims by month
    useEffect(() => {
        const filteredEncounters =
            selectedMonth == 'All'
                ? encounters
                : encounters.filter((item: any) => item.meta.lastUpdated?.startsWith(selectedMonth));

        defineStatusEncounters(filteredEncounters);
    }, [encounters, selectedMonth]);

    //select 3th mor count and calculate %
    const selectTopPorcentage = (coverage: any) => {
        const totalCoverage = coverage.reduce((total: any, item: any) => total + (item.count || 0), 0);
        const sortedArray = coverage.sort((a: any, b: any) => b.count - a.count);
        const topThree = sortedArray.slice(0, 3);
        const result = topThree.map((item: any) => {
            const porcent = Number((item.count * 100) / totalCoverage);
            return {
                x: item.name,
                y: Math.round(porcent),
            };
        });
        while (result.length < 3) {
            result.push({ x: '', y: 0 });
        }
        return result;
    };

    const colors1 = ['#5735ff', '#907aff', '#c5b9ff'];

    return (
        <>
            <div className="monthly-claim-graphic-1">
                <div className="monthly-claim-graphic-title">
                    <div className="title-graph-pae">
                        <p>{t`Status Encounters`}</p>
                    </div>
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
                            <MenuItem value="All">{t`All`}</MenuItem>
                            {monthList.map((month: any) => (
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

                <VictoryPie
                    data={statusEncounters}
                    colorScale={colors1}
                    radius={130}
                    labelComponent={<VictoryTooltip />}
                    style={{
                        labels: { fontSize: 14, fill: '#333' },
                    }}
                />
                <div className="leyenda-graphic">
                    <div className="item">
                        <div className="legend-item">
                            <div className="top-leyenda">
                                <span className="dot" style={{ backgroundColor: '#5735ff' }}></span>
                                <p>{statusEncounters[0]?.x.slice(0, 5)}</p>
                            </div>
                            <div className="down-leyenda">
                                <p>{statusEncounters[0]?.y}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="legend-item">
                            <div className="top-leyenda">
                                <span className="dot" style={{ backgroundColor: '#907aff' }}></span>
                                <p>{statusEncounters[1].x.slice(0, 5)}</p>
                            </div>
                            <div className="down-leyenda">
                                <p>{statusEncounters[1]?.y}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="legend-item">
                            <div className="top-leyenda">
                                <span className="dot" style={{ backgroundColor: '#c5b9ff' }}></span>
                                <p>{statusEncounters[2]?.x.slice(0, 5)}</p>
                            </div>
                            <div className="down-leyenda">
                                <p>{statusEncounters[2]?.y}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default PieChartForTopEncounters;
