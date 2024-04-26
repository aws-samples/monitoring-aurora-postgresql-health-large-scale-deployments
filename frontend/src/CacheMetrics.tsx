// when user clicks on this button, one API is called https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all?instanceId=i-789&startTimeEpoch=1710002987&endTimeEpoch=1710002987 and response of the API is bound to a table. The table should have 3 fields InstanceId, MetricValue and Date
import React, { useState } from 'react';
import InstanceSelector from './InstanceSelector';
import Box from '@mui/material/Box'
import { LineChart } from '@mui/x-charts/LineChart';
import { Button, Typography } from '@mui/material';
import { CacheRecord } from './CacheRecord';
export default function CacheMetrics() {
    const initialRows: CacheRecord[] = [];
    const [rows, setRows] = useState(initialRows);
    const [startTime, setStartTime] = useState(Date.now);
    const [endTime, setEndTime] = useState(Date.now);
    const [selectedMetric, setSelectedMetric] = useState('');
    const [metrics, set] = useState([{ name: '' }]);
    const initialData: CacheRecord[] = [];
    const [data, setData] = useState(initialData)

    const updateTable = (startTime: number, endTime: number, metricsName: string, data: CacheRecord[]) => {
        setStartTime(startTime);
        setEndTime(endTime);
        setSelectedMetric(metricsName);
        setData(data);
        console.log(data);
        setRows(data.filter(() => metricsName !== 'all').map((item, index) => {
            return {
                id: index.toString(),
                InstanceId: item.InstanceId,
                MetricValueAverage: item.MetricValueAverage,
                DateHourTimeZone: item.DateHourTimeZone,
                MetricName: item.MetricName
            }
        }));
    }


    function filterData(event: any): void {
        console.log('filterData');
        console.log(data);
        console.log(event.target.value);
        setRows(data.filter((item) => event.target.value === item.MetricName).map((item, index) => {
            return {
                id: index.toString(),
                InstanceId: item.InstanceId,
                MetricValueAverage: item.MetricValueAverage,
                DateHourTimeZone: item.DateHourTimeZone,
                MetricName: item.MetricName
            }
        }));
    }

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <InstanceSelector onDataFetch={updateTable} onMetricsFetch={set} />
            {rows && rows.length > 0 &&
                <Typography sx={{ fontSize: 16, paddingLeft: '25px', paddingTop: '25px' }} color="text.secondary" gutterBottom>
                    Displaying Report for {new Date(startTime * 1000).toLocaleString()} and {new Date(endTime * 1000).toLocaleString()}
                </Typography>
            }
            {selectedMetric === 'all' && metrics.map((item) => <Button variant="outlined" className='OutlinedButton' value={item.name} onClick={filterData} >{item.name}</Button>)}
            {rows && rows.length > 0 && <LineChart
                grid={{ vertical: true, horizontal: true }}
                dataset={rows}
                series={[{ dataKey: 'MetricValueAverage', label: 'Average Metrics Value' }]}
                xAxis={[{
                    scaleType: 'point', dataKey: 'DateHourTimeZone', valueFormatter: (timestamp: number) => {
                        const date = new Date(timestamp * 1000);
                        const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' });
                        const formattedDate = formatter.format(date);
                        return formattedDate;
                    }, label: 'Date/Time',
                }]}
            />
            }
        </Box>
    );

}