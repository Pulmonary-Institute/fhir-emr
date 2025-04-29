import { FormControl, Select, MenuItem } from '@mui/material';
import { useEffect, useState } from 'react';
import { t } from '@lingui/macro';
import { VictoryPie } from 'victory';

import { getSummaryFacilities } from './hooks';

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
    const [topFacilities, setTopFacilities] = useState<any[]>([]);
    const [filterFacilitiesData, setFilterFacilitiesData] = useState<any[]>([]);
    const [monthList, setMonthList] = useState<string[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<string>('All');
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
    const [activeSlice, setActiveSlice] = useState<number | null>(null);

    useEffect(() => {
        loadData();
    }, []);
    
    // Smooth tooltip movement with requestAnimationFrame
    useEffect(() => {
        if (activeSlice !== null) {
            // Use requestAnimationFrame for smoother animation
            let animationFrameId: number;
            
            const animateTooltip = () => {
                // Calculate distance between current tooltip position and mouse position
                const dx = mousePosition.x - tooltipPosition.x;
                const dy = mousePosition.y - tooltipPosition.y;
                
                // Calculate new position
                let newX = tooltipPosition.x + dx * 0.15;
                let newY = tooltipPosition.y + dy * 0.15;
                
                // Get container dimensions
                const containerWidth = 300;
                const containerHeight = 300;
                
                // Dynamic tooltip dimensions based on text length
                const textLength = filterFacilitiesData[activeSlice]?.x?.length || 0;
                const tooltipWidth = Math.max(150, Math.min(300, 20 + textLength * 8)); // Estimate width based on text length
                const tooltipHeight = 40;
                
                // Adjust tooltip position to keep it fully visible
                // If too close to right edge, move it left
                if (newX + tooltipWidth > containerWidth - 10) {
                    newX = Math.max(10, containerWidth - tooltipWidth - 10);
                }
                
                // If too close to bottom edge, move it up
                if (newY + tooltipHeight > containerHeight - 10) {
                    newY = Math.max(10, containerHeight - tooltipHeight - 10);
                }
                
                // Move tooltip position by a fraction of the distance
                setTooltipPosition({
                    x: newX,
                    y: newY
                });
                
                // Continue animation loop
                animationFrameId = requestAnimationFrame(animateTooltip);
            };
            
            // Start animation loop
            animationFrameId = requestAnimationFrame(animateTooltip);
            
            // Clean up animation frame on unmount or when activeSlice changes
            return () => {
                cancelAnimationFrame(animationFrameId);
            };
        }
    }, [activeSlice, mousePosition, tooltipPosition, filterFacilitiesData]);

    const loadData = async () => {
        const dataFacilities = await getSummaryFacilities();
        if (dataFacilities.length > 0) {
            setTopFacilities(dataFacilities);
        }
    };

    // Define data format from topFacilities
    useEffect(() => {
        if (topFacilities.length > 0) {
            const uniqueMonths = [
                ...new Set(topFacilities.map((item: any) => item.meta.lastUpdated?.slice(0, 7))),
            ].filter(Boolean);
            setMonthList(uniqueMonths);

            // Define format of topFacilities
            defineTopFacilitiesData(topFacilities);
        }
    }, [topFacilities]);

    // Filter Claims by month
    useEffect(() => {
        const filteredFacilities =
            selectedMonth === 'All'
                ? topFacilities
                : topFacilities.filter((item: any) => item.meta.lastUpdated?.startsWith(selectedMonth));

        defineTopFacilitiesData(filteredFacilities);
    }, [topFacilities, selectedMonth]);

    const defineTopFacilitiesData = (facilities: any[]) => {
        const grouped = facilities.reduce((acc: Record<string, number>, item: any) => {
            const facility = item.serviceProvider.display || 'Unknown';
            acc[facility] = (acc[facility] || 0) + 1;
            return acc;
        }, {});

        const facilityData = Object.entries(grouped).map(([name, count]) => ({
            name,
            count,
        }));

        const groupCoverage = selectTopPercentage(facilityData);
        setFilterFacilitiesData(groupCoverage);
    };

    //select top 3 by count and calculate percentages
    const selectTopPercentage = (coverage: any[]) => {
        const totalCoverage = coverage.reduce((total: number, item: any) => total + (item.count || 0), 0);
        const sortedArray = coverage.sort((a: any, b: any) => b.count - a.count);
        const topThree = sortedArray.slice(0, 3);
        const result = topThree.map((item: any) => {
            const percent = Number((item.count * 100) / totalCoverage);
            return {
                x: item.name,
                y: Math.round(percent),
                _count: item.count, // Store original count for the tooltip
                _total: totalCoverage, // Store total for calculations
                _tags: ['Facility', 'Service Provider', 'Claims'] // Add relevant tags
            };
        });
        
        // Ensure we always have 3 elements even if there are fewer facilities
        while (result.length < 3) {
            result.push({ x: '', y: 0, _count: 0, _total: totalCoverage, _tags: [] });
        }
        
        return result;
    };

    const colors2 = ['#ffbf3d', '#ffd277', '#ffeabf'];

    return (
        <>
            <div 
                className="monthly-claim-graphic-2"
                onMouseMove={(e) => {
                    // Get position relative to the container
                    const rect = e.currentTarget.getBoundingClientRect();
                    setMousePosition({
                        x: e.clientX - rect.left,
                        y: e.clientY - rect.top
                    });
                    
                    // If this is the first mouse movement after hovering a slice,
                    // initialize tooltip position to current mouse position to avoid initial jump
                    if (activeSlice !== null && tooltipPosition.x === 0 && tooltipPosition.y === 0) {
                        setTooltipPosition({
                            x: e.clientX - rect.left,
                            y: e.clientY - rect.top
                        });
                    }
                }}
                onMouseLeave={() => {
                    setActiveSlice(null);
                    setTooltipPosition({ x: 0, y: 0 }); // Reset tooltip position
                }}
            >
                <div className="monthly-claim-graphic-title">
                    <div className="title-graph-pae">
                        <p style={{ fontSize: '18px', fontWeight: 'bold' }}>{t`Top Facilities`}</p>
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

                <VictoryPie
                    data={filterFacilitiesData}
                    colorScale={colors2}
                    radius={130}
                    labels={() => null} // Remove all fixed labels
                    style={{
                        data: {
                            stroke: "#fff",
                            strokeWidth: 2,
                            fillOpacity: ({ index }) => activeSlice === index ? 0.7 : 1
                        },
                        labels: { display: 'none' } // Ensure labels don't appear
                    }}
                    animate={{
                        duration: 500,
                        onLoad: { duration: 500 }
                    }}
                    events={[
                        {
                            target: "data",
                            eventHandlers: {
                                onMouseOver: (_evt, { index }) => {
                                    setActiveSlice(index);
                                    return [
                                        {
                                            target: "data",
                                            mutation: (props) => ({
                                                style: {
                                                    ...props.style,
                                                    stroke: "#fff",
                                                    strokeWidth: 3
                                                }
                                            })
                                        }
                                    ];
                                },
                                onMouseOut: () => {
                                    setActiveSlice(null);
                                    return [
                                        {
                                            target: "data",
                                            mutation: () => null
                                        }
                                    ];
                                }
                            }
                        }
                    ]}
                    padding={0}
                />
                
                {/* Custom tooltip that follows mouse with smooth animation */}
                {activeSlice !== null && filterFacilitiesData[activeSlice] && (
                    <div 
                        style={{
                            position: 'absolute',
                            left: `${tooltipPosition.x}px`,
                            top: `${tooltipPosition.y}px`,
                            backgroundColor: 'white',
                            borderRadius: '4px',
                            padding: '8px 12px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            border: '1px solid #d1d1d1',
                            fontSize: '12px',  // Increased from 10px to 14px
                            fontWeight: 'bold',
                            color: '#333',
                            pointerEvents: 'none',
                            zIndex: 1000,
                            transition: 'transform 0.1s ease-out, opacity 0.1s ease-out',
                            opacity: 0.95,
                            maxWidth: '220px', // Increased to accommodate larger font
                            whiteSpace: 'nowrap',
                            wordWrap: 'break-word',
                            minWidth: 'fit-content'
                        }}
                    >
                        {filterFacilitiesData[activeSlice].x}: {filterFacilitiesData[activeSlice].y}%
                    </div>
                )}
                {filterFacilitiesData.length > 0 && (
                    <div className="leyenda-graphic">
                        <div className="item">
                            <div className="legend-item">
                                <div className="top-leyenda">
                                    <span className="dot" style={{ backgroundColor: '#ffbf3d' }}></span>
                                    <p style={{ fontSize: '10px' }}>{filterFacilitiesData[0]?.x.slice(0, 9)}</p>
                                </div>
                                <div className="down-leyenda">
                                    <p style={{ fontSize: '10px', fontWeight: 'bold' }}>{filterFacilitiesData[0]?.y}%</p>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            <div className="legend-item">
                                <div className="top-leyenda">
                                    <span className="dot" style={{ backgroundColor: '#ffd277' }}></span>
                                    <p style={{ fontSize: '10px' }}>{filterFacilitiesData[1]?.x.slice(0, 9)}</p>
                                </div>
                                <div className="down-leyenda">
                                    <p style={{ fontSize: '10px', fontWeight: 'bold' }}>{filterFacilitiesData[1]?.y}%</p>
                                </div>
                            </div>
                        </div>
                        <div className="item">
                            <div className="legend-item">
                                <div className="top-leyenda">
                                    <span className="dot" style={{ backgroundColor: '#ffeabf' }}></span>
                                    <p style={{ fontSize: '10px' }}>{filterFacilitiesData[2]?.x.slice(0, 9)}</p>
                                </div>
                                <div className="down-leyenda">
                                    <p style={{ fontSize: '10px', fontWeight: 'bold' }}>{filterFacilitiesData[2]?.y}%</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default PieChartForTopFacilities;