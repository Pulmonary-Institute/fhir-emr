import { FormControl, Select, MenuItem } from '@mui/material';
import { VictoryPie, VictoryTooltip } from 'victory';
import { t } from '@lingui/macro';

import { getSummaryFacilities } from './hooks';
import { useEffect, useState } from 'react';

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

function PieChartForTopFacilities() {
    const [TopFacilities, setFacilities] = useState([]);
    const [filterFacilitesData, setFilterFaciliesData] = useState<any[]>([]);

    const [monthList, setMonthList] = useState<any[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<any>('All');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        const dataFaciliences = await getSummaryFacilities();

        if (dataFaciliences.length > 0) setFacilities(dataFaciliences);
    };

    // Define data format form TopFacilities
    useEffect(() => {
        if (TopFacilities.length > 0) {
            const uniqueMonths = [
                ...new Set(TopFacilities.map((item: any) => item.meta.lastUpdated?.slice(0, 7))),
            ].filter(Boolean);
            setMonthList(uniqueMonths);

            // define format of TopFacilities
            defineTopFacilitesData(TopFacilities);
        }
    }, [TopFacilities]);

    const defineTopFacilitesData = (TopFacilities: any) => {
        const grouped = TopFacilities.reduce((acc: any, item: any) => {
            const facility = item.serviceProvider.display || 'Unknown';
            if (acc[facility]) {
                acc[facility]++;
            } else {
                acc[facility] = 1;
            }

            return acc;
        }, {});
        const filterInsurances = Object.entries(grouped).map(([name, count]) => ({
            name,
            count,
        }));

        const groupCoverage = selectTopPorcentage(filterInsurances);
        setFilterFaciliesData(groupCoverage);
    };

    // Filter Claims by month
    useEffect(() => {
        const filteredFacilities =
            selectedMonth == 'All'
                ? TopFacilities
                : TopFacilities.filter((item: any) => item.meta.lastUpdated?.startsWith(selectedMonth));

        defineTopFacilitesData(filteredFacilities);
    }, [TopFacilities, selectedMonth]);

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

    const colors2 = ['#ffbf3d', '#ffd277', '#ffeabf'];

    return (
        <>
            <div className="monthly-claim-graphic-2">
                <div className="monthly-claim-graphic-title">
                    <div className="title-graph-pae">
                        <p>{t`Top Facilities`}</p>
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
                    data={filterFacilitesData}
                    colorScale={colors2}
                    radius={130}
                    labelRadius={10}
                    labelComponent={<VictoryTooltip />}
                    style={{
                        labels: { fontSize: 14, fill: '#333' },
                    }}
                />
                <div className="leyenda-graphic">
                    <div className="item">
                        <div className="legend-item">
                            <div className="top-leyenda">
                                <span className="dot" style={{ backgroundColor: '#ffbf3d' }}></span>
                                <p>{filterFacilitesData[0]?.x.slice(0, 9)}</p>
                            </div>
                            <div className="down-leyenda">
                                <p>{filterFacilitesData[0]?.y}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="legend-item">
                            <div className="top-leyenda">
                                <span className="dot" style={{ backgroundColor: '#ffd277' }}></span>
                                <p>{filterFacilitesData[1]?.x.slice(0, 9)}</p>
                            </div>
                            <div className="down-leyenda">
                                <p>{filterFacilitesData[1]?.y}%</p>
                            </div>
                        </div>
                    </div>
                    <div className="item">
                        <div className="legend-item">
                            <div className="top-leyenda">
                                <span className="dot" style={{ backgroundColor: '#ffeabf' }}></span>
                                <p>{filterFacilitesData[2]?.x.slice(0, 9)}</p>
                            </div>
                            <div className="down-leyenda">
                                <p>{filterFacilitesData[2]?.y}%</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
export default PieChartForTopFacilities;
