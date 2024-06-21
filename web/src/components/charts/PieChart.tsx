import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import PieChart from "@cloudscape-design/components/pie-chart";
import { metric } from "../dashboard/Dashboard";


interface IDashboardPieChartProps {
    metric: metric,
    setShowTable: (value: boolean) => void
}

const DashboardPieChart = ({ setShowTable }: IDashboardPieChartProps) => {
    return (
        <PieChart
            data={[
                {
                    title: "Under threshold",
                    value: 60,
                    lastUpdate: "Dec 7, 2020"
                },
                {
                    title: "Above threshold",
                    value: 30,
                    lastUpdate: "Dec 6, 2020"
                },

            ]}
            detailPopoverContent={(datum, sum) => [
                { key: "Resource count", value: <a href="" onClick={() => setShowTable(true)}>{datum.value}</a> },
                {
                    key: "Percentage",
                    value: `${((datum.value / sum) * 100).toFixed(
                        0
                    )}%`
                },
                { key: "Last update on", value: datum.lastUpdate }
            ]}
            segmentDescription={(datum, sum) =>
                `${datum.value} units, ${(
                    (datum.value / sum) *
                    100
                ).toFixed(0)}%`
            }
            hideFilter
            ariaDescription="Pie chart showing how many resources are currently in which state."
            ariaLabel="Pie chart"
            empty={
                <Box textAlign="center" color="inherit">
                    <b>No data available</b>
                    <Box variant="p" color="inherit">
                        There is no data available
                    </Box>
                </Box>
            }
            noMatch={
                <Box textAlign="center" color="inherit">
                    <b>No matching data</b>
                    <Box variant="p" color="inherit">
                        There is no matching data to display
                    </Box>
                    <Button>Clear filter</Button>
                </Box>
            }
        />
    );
}

export default DashboardPieChart;