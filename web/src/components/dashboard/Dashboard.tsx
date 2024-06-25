import { Container, DateRangePickerProps, Header, Link, Spinner } from '@cloudscape-design/components';
import { useEffect, useState } from "react";
import { useMetricsSummary } from "../../hooks/use-metric-summary";
import { useMetricsConfig } from "../../hooks/use-metrics-config";
import { MetricConfig, MetricSummary } from '../../model/model';
import { ICloudWatcherProps } from "../../pages/CloudWatcher";
import DashboardPieChart from "../charts/PieChart";


export interface IPageProps extends ICloudWatcherProps {
    dateRange: DateRangePickerProps.RelativeValue,
    setSelectedMetricName: (value: string) => void
}

const Dashboard = ({ setSidePanel, dateRange, setSelectedMetricName }: IPageProps) => {

    const [metricSummary, setMetricSummary] = useState<MetricSummary>();
    const [metricsConfig, setMetricsConfig] = useState<MetricConfig[]>();

    const { data: metricsInfo } = useMetricsConfig();
    const { data: metricsSummary, isLoading: isSummaryLoading, error: summaryError } = useMetricsSummary(dateRange);

    useEffect(() => {
        setMetricsConfig(metricsInfo as MetricConfig[])
    }, [metricsInfo]);

    useEffect(() => {
        setMetricSummary(metricsSummary as MetricSummary)
    }, [metricsSummary])

    if (isSummaryLoading) {
        return <Spinner />;
    }

    if (summaryError) {
        return <div>Error: {summaryError.message}</div>
    }


    return (
        <div style={{ display: 'flex', gap: '1em' }}>
            {metricsConfig && metricSummary && metricsConfig.map((metric, index) =>
                <Container
                    key={index}
                    header={
                        <Header
                            variant="h2"
                            info={<Link variant="info" onClick={() => setSidePanel(metric.helpText)}>Info</Link>}
                        >
                            {metric.metricName}
                        </Header>
                    }
                >
                    <DashboardPieChart metricSummary={metricSummary[metric.metricName]} metricName={metric.metricName} setSelectedMetricName={setSelectedMetricName} />
                </Container>
            )}
        </div>
    )
}
export default Dashboard;