import { Container, DateRangePickerProps, Header, Link, Spinner } from '@cloudscape-design/components';
import { useEffect, useState } from "react";
import { useMetricsConfig } from "../../hooks/use-metrics-config";
import { MetricConfig } from '../../model/model';
import { ICloudWatcherProps } from "../../pages/CloudWatcher";
import DashboardPieChart from "../charts/PieChart";
export interface IPageProps extends ICloudWatcherProps {
    dateRange: DateRangePickerProps.Value,
    setSelectedMetricName: (value: string) => void
}

const Dashboard = ({ setHelpPanel, dateRange, setSelectedMetricName }: IPageProps) => {
    const [metricsConfig, setMetricsConfig] = useState<MetricConfig[]>();
    const { data: metricsInfo, isLoading } = useMetricsConfig();
    useEffect(() => {
        setMetricsConfig(metricsInfo as MetricConfig[])
    }, [metricsInfo]);

    if (isLoading) {
        return <Spinner />;
    }

    return (
        <div style={{ display: 'flex', gap: '1em' }}>
            {metricsConfig && metricsConfig.map((metric, index) =>
                <Container
                    key={index}
                    header={
                        <Header
                            variant="h2"
                            info={<Link variant="info" onClick={() => setHelpPanel({ header: metric.metricName, text: metric.helpText })}>Info</Link>}
                        >
                            {metric.metricName}
                        </Header>
                    }
                >
                    <DashboardPieChart dateRange={dateRange} metricName={metric.metricName} setSelectedMetricName={setSelectedMetricName} />
                </Container>
            )}
        </div>
    )
}
export default Dashboard;