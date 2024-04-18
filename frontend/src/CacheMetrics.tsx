// when user clicks on this button, one API is called https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all?instanceId=i-789&startTimeEpoch=1710002987&endTimeEpoch=1710002987 and response of the API is bound to a table. The table should have 3 fields InstanceId, MetricValue and Date
import React, { useState } from 'react';
import InstanceSelector from './InstanceSelector';
import Box from '@mui/material/Box'
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { LineChart } from '@mui/x-charts/LineChart';
type CacheRecord = { id: string, InstanceId: string; MetricValueAverage: number; DateHourTimeZone: string; }

export default function CacheMetrics() {

    const columns: GridColDef<CacheRecord>[] = [
        { field: 'id', headerName: 'ID', width: 90 },
        {
            field: 'InstanceId',
            headerName: 'InstanceId',
            width: 150
        },
        {
            field: 'MetricValueAverage',
            headerName: 'Metric Value Average',
            width: 150
        },
        {
            field: 'DateHourTimeZone',
            headerName: 'Date/Time',
            type: 'string',
            width: 200,
            valueFormatter: (params: number) => { const date = new Date(params * 1000); return date.toLocaleString() }
        },
    ];
    const initialRows: CacheRecord[] = [];
    const [rows, setRows] = useState(initialRows);

    const updateTable = (data: CacheRecord[]) => {
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
            {rows && rows.length > 0 && <LineChart
                grid={{ vertical: true, horizontal: true }}
                dataset={rows}
                series={[{ dataKey: 'MetricValueAverage', label: 'MetricsValueAverage' }]}
                xAxis={[{
                    scaleType: 'point', dataKey: 'DateHourTimeZone', valueFormatter: (timestamp: number) => {
                        const date = new Date(timestamp * 1000);
                        const formatter = new Intl.DateTimeFormat('en-US', { dateStyle: 'short', timeStyle: 'short' });
                        const formattedDate = formatter.format(date);
                        return formattedDate;
                    }, label: 'Date/Time',
                }]}
            />}
             {/* {rows && rows.length > 0 && <DataGrid
                rows={rows}
                columns={columns}
                initialState={{
                    pagination: {
                        paginationModel: {
                            pageSize: 10,
                        },
                    },
                }}
                pageSizeOptions={[10]}
            />} */}
        </Box>
    );

}