// when user clicks on this button, one API is called https://xlqpb40i3g.execute-api.us-east-1.amazonaws.com/prod/query-all?instanceId=i-789&startTimeEpoch=1710002987&endTimeEpoch=1710002987 and response of the API is bound to a table. The table should have 3 fields InstanceId, MetricValue and Date
import React from 'react';
import { Table } from 'reactstrap';
import InstanceSelector from './InstanceSelector';


export default class CacheMetrics extends React.Component {
    render() {
        //Add two textboxes with ability to select calendar dates and times. Next to the dropdown and two textboxes, there should be a button called "Show report"
        //Add a table with 3 columns InstanceId, MetricValue and Date.
        //Add a button called "Show report" which will call an API and bind the response to the table.
        //Add a button called "Clear" which will clear the table.

        return (
            <div>
                <InstanceSelector />
                <Table>
                    <thead>
                        <tr>
                            <th>InstanceId</th>
                            <th>MetricValue</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>i-789</td>
                            <td>100</td>
                            <td>2020-01-01</td>
                        </tr>
                    </tbody>
                </Table>
            </div>
        );
    }
}