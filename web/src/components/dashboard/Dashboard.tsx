import { Container, Header, Link } from "@cloudscape-design/components";
import { ICloudWatcherProps } from "../../pages/CloudWatcher";
import DashboardPieChart from "../charts/PieChart";

export type metric = {
    name: string,
    threshold: number,
    thresholdOperator: string,
    helpText: string
}
const metricsTracked: metric[] = [
    {
        "name": "BufferCacheHitRatio",
        "threshold": 100,
        "thresholdOperator": ">=",
        "helpText": "This metric measures the percentage of requests that are served by the buffer cache of a DB instance in your DB cluster. This metric gives you an insight into the amount of data that is being served from memory. A high hit ratio indicates that your DB instance has enough memory available.A low hit ratio indicates that your queries on this DB instance are frequently going to disk.Investigate your workload to see which queries are causing this behavior"
    },
    {
        "name": "Freeable Memory",
        "threshold": 90,
        "thresholdOperator": "<=",
        "helpText": "How much RAM is available on the DB instance, in bytes. The red line in the Monitoring tab metrics is marked at 75% for CPU, Memory and Storage Metrics. If instance memory consumption frequently crosses that line, then this indicates that you should check your workload or upgrade your instance. "
    },
    {
        "name": "CPU Utlization",
        "threshold": 100,
        "thresholdOperator": ">=",
        "helpText": "Percentage of computer processing capacity used."
    }

];

export interface IPageProps extends ICloudWatcherProps {
    setShowTable: (value: boolean) => void
}

const Dashboard = ({ setSidePanel, setShowTable }: IPageProps) => {
    return (
        <div style={{ display: 'flex', gap: '1em' }}>
            {metricsTracked.map((metric, index) =>
                <Container
                    key={`${metric.name}_${index}`}
                    header={
                        <Header
                            variant="h2"
                            info={<Link variant="info" onClick={() => setSidePanel(metric.helpText)}>Info</Link>}
                        >
                            {metric.name}
                        </Header>
                    }
                >

                    <DashboardPieChart metric={metric} setShowTable={setShowTable} />
                </Container>)}
        </div>

    )
}
export default Dashboard;