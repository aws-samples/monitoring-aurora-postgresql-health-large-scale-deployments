// when user clicks on this button, one API is called https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all?instanceId=i-789&startTimeEpoch=1710002987&endTimeEpoch=1710002987 and response of the API is bound to a table. The table should have 3 fields InstanceId, MetricValue and Date
import React, { useState } from 'react';
import InstanceSelector from './InstanceSelector';
import Box from '@mui/material/Box'
import { LineChart } from '@mui/x-charts/LineChart';
import { Typography } from '@mui/material';
type CacheRecord = { id: string, InstanceId: string; MetricValueAverage: number; DateHourTimeZone: string; }

export default function CacheMetrics() {
    const initialRows: CacheRecord[] = [];
    const [rows, setRows] = useState(initialRows);
    const [startTime, setStartTime] = useState(Date.now);
    const [endTime, setEndTime] = useState(Date.now);

    const updateTable = (startTime: number, endTime: number, data: CacheRecord[]) => {
        setStartTime(startTime);
        setEndTime(endTime);
        console.log(startTime, endTime, data);
        setRows(data.map((item, index) => {
            return {
                id: index.toString(),
                InstanceId: item.InstanceId,
                MetricValueAverage: item.MetricValueAverage,
                DateHourTimeZone: item.DateHourTimeZone
            }
        }));
    }

    return (
        <Box sx={{ height: 400, width: '100%' }}>
            <InstanceSelector onDataFetch={updateTable} />
            {rows && rows.length > 0 &&
                <Typography sx={{ fontSize: 16, paddingLeft: '25px', paddingTop: '25px' }} color="text.secondary" gutterBottom>
                    Displaying Report for {new Date(startTime * 1000).toLocaleString()} and {new Date(endTime * 1000).toLocaleString()}
                </Typography>
            }
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