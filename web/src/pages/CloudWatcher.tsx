import { Button, ContentLayout, DateRangePickerProps, Header } from "@cloudscape-design/components";
import { useState } from "react";
import Dashboard from "../components/dashboard/Dashboard";
import RelativeDateRangePicker from "../components/dateRange/DateRange";
import MetricsTable from "../components/metricsTable/MetricsTable";
import { APP_NAME, DEFAULT_DATE_FILTER } from "../constant";

export interface ICloudWatcherProps {
    setSidePanel: (value: string) => void,
}

const CloudWatcher = ({ setSidePanel }: ICloudWatcherProps) => {

    const [selectedMetricName, setSelectedMetricName] = useState<string | undefined>(undefined);
    const [dateRangeFilter, setDateRangeFilter] = useState<DateRangePickerProps.RelativeValue>(DEFAULT_DATE_FILTER);

    return (
        <ContentLayout>
            {selectedMetricName && <Button iconName="arrow-left" variant="icon" onClick={() => setSelectedMetricName(undefined)} />}
            <br />
            <h3>Date Range filter</h3>
            <RelativeDateRangePicker value={dateRangeFilter} setValue={setDateRangeFilter} />
            <br />
            {!selectedMetricName && <Dashboard setSidePanel={setSidePanel} dateRange={dateRangeFilter} setSelectedMetricName={setSelectedMetricName} />}

            {selectedMetricName && <MetricsTable setSidePanel={setSidePanel} dateRange={dateRangeFilter} metricName={selectedMetricName} />}
            <p>
                <li>Some instructions</li>
            </p>
        </ContentLayout>
    )
}

export default CloudWatcher;