import { Box, DateRangePickerProps, Header, Link, SpaceBetween, Spinner, Table } from "@cloudscape-design/components";
import { useEffect, useState } from "react";
import { useMetricsDetails } from "../../hooks/use-metric-details";
import { MetricItem } from '../../model/model';
import { helpPanelType } from "../layout/Layout";
import { HELPTEXT } from '../../constant';


interface IMetricDetailsProps {
    metricName: string,
    setHelpPanel: (value: helpPanelType) => void,
    dateRange: DateRangePickerProps.Value
}

const MetricsTable = ({ setHelpPanel, dateRange, metricName }: IMetricDetailsProps) => {

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
    const metricLogsTableHelpText = HELPTEXT["MetricLogs"] as string;
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
                    cell: item => item.MetricName || "-",
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
                    id: "MetricValue",
                    header: "Metric Value",
                    cell: item => item.MetricValue || "-",
                    sortingField: "MetricValue"
                },
                {
                    id: "Date",
                    header: "Date Time Range",
                    cell: item => item.DateHourTimeZone ? ((new Date(item.DateHourTimeZone * 1000)).toLocaleString() + " +1 hour") : "-",
                    sortingField: "DateHourTimeZone"
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
            header={<Header> Metric logs <Link variant="info" onClick={() => setHelpPanel({ header: "Metric logs", text: metricLogsTableHelpText })}>Info</Link> </Header>}
        />
    );
}

export default MetricsTable;