import { Button, ContentLayout, DateRangePickerProps } from "@cloudscape-design/components";
import { useState } from "react";
import Dashboard from "../components/dashboard/Dashboard";
import RelativeDateRangePicker from "../components/dateRange/DateRange";
import { helpPanelType } from "../components/layout/Layout";
import MetricsTable from "../components/metricsTable/MetricsTable";
import { DEFAULT_DATE_FILTER } from "../constant";

export interface ICloudWatcherProps {
    setHelpPanel: (value: helpPanelType) => void,
}

const CloudWatcher = ({ setHelpPanel }: ICloudWatcherProps) => {

    const [selectedMetricName, setSelectedMetricName] = useState<string | undefined>(undefined);
    const [dateRangeFilter, setDateRangeFilter] = useState<DateRangePickerProps.Value>(DEFAULT_DATE_FILTER);
    console.log("selectedMetricName", selectedMetricName);
    return (
        <ContentLayout>
            {selectedMetricName && <Button iconName="arrow-left" variant="icon" onClick={() => setSelectedMetricName(undefined)} />}
            <br />
            <h3>Date Range</h3>
            <RelativeDateRangePicker value={dateRangeFilter} setValue={setDateRangeFilter} />
            <br />
            {!selectedMetricName && <Dashboard setHelpPanel={setHelpPanel} dateRange={dateRangeFilter} setSelectedMetricName={setSelectedMetricName} />}

            {selectedMetricName && <MetricsTable setHelpPanel={setHelpPanel} dateRange={dateRangeFilter} metricName={selectedMetricName} />}
            <p>
                <div>
                    <h2>How to use</h2>
                    <p>The dashboard provides a comprehensive overview of your CloudWatch metrics, allowing you to visualize and analyze your data with ease.</p>

                    <h3>Date Filter</h3>
                    <p>The date filter located on the page allows you to select a specific date range for which you want to view the CloudWatch metrics. Simply click on the date filter and choose the desired start and end dates. Once you've selected the date range, the metrics displayed below will update accordingly.</p>

                    <h3>Metric Information</h3>
                    <p>Next to each metric displayed on the dashboard, you'll find an "Info" button. Clicking this button will provide you with detailed information about the specific metric, including its Symptom, Possible Causes, and Recommendations.</p>

                    <h3>Pie Chart Interaction</h3>
                    <p>The CloudWatch metrics are presented in the form of a pie chart for easy visualization. When you hover over a specific slice of the pie chart, you'll see additional information about that metric. If the metric represents an "Unhealthy Resource Count," you can click on that slice to navigate to a detailed page, where you can further investigate and address any issues related to that metric.</p>
                </div>
            </p>
        </ContentLayout>
    )
}

export default CloudWatcher;