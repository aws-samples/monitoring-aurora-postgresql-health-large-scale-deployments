import { Box, Header, Link, SpaceBetween, Table } from "@cloudscape-design/components";
import { mockData } from "../../mock/mockData";
import { IPageProps } from "../dashboard/Dashboard";

const MetricsTable = ({ setSidePanel }: IPageProps) => {
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
            items={mockData}
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