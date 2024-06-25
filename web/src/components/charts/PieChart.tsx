import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import PieChart from "@cloudscape-design/components/pie-chart";
import {
    colorChartsStatusHigh,
    colorChartsStatusPositive
} from '@cloudscape-design/design-tokens';
import { MetricInfo } from "../../model/model";


const pieChartColorMapping: { [key: string]: string } = {
    "Healthy Instances": colorChartsStatusPositive,
    'Unhealthy Instances': colorChartsStatusHigh
};

interface IDashboardPieChartProps {
    metricSummary: MetricInfo[],
    metricName: string,
    setSelectedMetricName: (value: string) => void
}

const DashboardPieChart = ({ metricSummary, metricName, setSelectedMetricName }: IDashboardPieChartProps) => {
    metricSummary = metricSummary.map((metric) => {
        return {
            ...metric,
            color: pieChartColorMapping[metric.title]
        }
    })
    return (
        <PieChart
            data={metricSummary}
            detailPopoverContent={(datum, sum) => [
                { key: "Resource count", value: <a href="#" onClick={() => { setSelectedMetricName(metricName); return false; }}>{datum.value}</a> },
                {
                    key: "Percentage",
                    value: `${((datum.value / sum) * 100).toFixed(
                        0
                    )}%`
                }
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