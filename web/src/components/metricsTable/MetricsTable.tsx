import { Box, DateRangePickerProps, Header, Link, SpaceBetween, Spinner, Table } from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import { useMetricsDetails } from "../../hooks/use-metric-details";
import { MetricItem } from "../../model/model";


interface IMetricDetailsProps {
    metricName: string,
    setSidePanel: (value: string) => void,
    dateRange: DateRangePickerProps.Value
}

const MetricsTable = ({ setSidePanel, dateRange, metricName }: IMetricDetailsProps) => {

    const [metricsDetails, setMetrcisDetails] = useState<MetricItem[]>([]);
    const { data: metricItems, isLoading, error } = useMetricsDetails(dateRange as DateRangePickerProps.RelativeValue, metricName);

    useEffect(() => {
        setMetrcisDetails(metricItems as MetricItem[])
    }, [metricItems]);

    if (isLoading) {
        return <Spinner />;
    }

    if (error) {
        return <div>Error: {error.message}</div>
    }

    return (
        <Table
            renderAriaLive={({
                firstIndex,
                lastIndex,
                totalItemsCount
            }) =>
                `Displaying items ${firstIndex} to ${lastIndex} of ${totalItemsCount}`
            }
            columnDefinitions={[
                {
                    id: "MetricName",
                    header: "Metric name",
                    cell: item => (
                        <Link href="#">{item.MetricName || "-"}</Link>
                    ),
                    sortingField: "MetricName",
                    isRowHeader: true
                },
                {
                    id: "InstanceId",
                    header: "Id",
                    cell: item => item.InstanceId || "-",
                    sortingField: "InstanceId",
                },
                {
                    id: "MetricValueAverage",
                    header: "Metric Value Average",
                    cell: item => item.MetricValueAverage || "-",
                    sortingField: "MetricValueAverage"
                },
                {
                    id: "Date",
                    header: "Date",
                    cell: item => item.DateHourTimeZone || "-"
                }
            ]}
            enableKeyboardNavigation
            items={metricsDetails}
            loadingText="Loading resources"
            sortingDisabled
            empty={
                <Box
                    margin={{ vertical: "xs" }}
                    textAlign="center"
                    color="inherit"
                >
                    <SpaceBetween size="m">
                        <b>No resources</b>
                    </SpaceBetween>
                </Box>
            }
            header={<Header> Metric logs <Link variant="info" onClick={() => setSidePanel("Metrics table")}>Info</Link> </Header>}
        />
    );
}

export default MetricsTable;