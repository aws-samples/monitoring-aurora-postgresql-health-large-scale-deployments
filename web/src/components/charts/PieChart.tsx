import { useEffect, useState } from "react";
import Box from "@cloudscape-design/components/box";
import Button from "@cloudscape-design/components/button";
import PieChart from "@cloudscape-design/components/pie-chart";
import { DateRangePickerProps, Spinner } from "@cloudscape-design/components";
import {
    colorChartsStatusHigh,
    colorChartsStatusPositive
} from '@cloudscape-design/design-tokens';
import { MetricSummary } from "../../model/model";
import { useMetricsSummary } from "../../hooks/use-metric-summary";
interface IDashboardPieChartProps {
    metricName: string,
    dateRange: DateRangePickerProps.Value,
    setSelectedMetricName: (value: string) => void
}

const DashboardPieChart = ({ metricName, dateRange, setSelectedMetricName }: IDashboardPieChartProps) => {
    const [metricSummary, setMetricSummary] = useState<MetricSummary>();
    const { data: metricsSummary, isLoading: isSummaryLoading, error: summaryError } = useMetricsSummary(dateRange as DateRangePickerProps.RelativeValue,  metricName);

    useEffect(() => {
        setMetricSummary(metricsSummary as MetricSummary)
    }, [metricsSummary])

    if (isSummaryLoading) {
        return <Spinner />;
    }

    if (summaryError) {
        return <div>Error: {summaryError.message}</div>
    }

    const updatedMetricSummary = [{
        title: "Healthy Instances",
        value: metricSummary?.HealthyInstances ?? 0,
        color: colorChartsStatusPositive
    },
    {
        title: "Unhealthy Instances",
        value: metricSummary?.UnhealthyInstances ?? 0,
        color: colorChartsStatusHigh
    }
    ];
    return (
        <PieChart
            data={updatedMetricSummary}
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