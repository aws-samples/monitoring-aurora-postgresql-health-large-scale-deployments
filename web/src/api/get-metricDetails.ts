import { DateRangePickerProps } from '@cloudscape-design/components';
import { ApiError } from 'aws-amplify/api';
import { metricDetails } from './mock/mockData';
import { getCurrentEpochTime, getRangeStartAsEpoc } from './utils/utils';


export const getMetricDetails = async (range: DateRangePickerProps.RelativeValue, metricName: string): Promise<unknown> => {
    try {
        const path = `metricsdetails?starttime=${getRangeStartAsEpoc(range.amount, range.unit)}&endtime=${getCurrentEpochTime()}&metricName=${metricName}`
        // const restOperation = get({
        //     apiName: 'myRestApi',
        //     path: path
        // });
        // const { body } = await restOperation.response;
        // return await body.json();


        console.log('Fetching getMetricDetails using path= ', path);
        return metricDetails;
    } catch (error) {
        if (error instanceof ApiError) {
            if (error.response) {
                const {
                    statusCode,
                    body
                } = error.response;
                console.error(`Received ${statusCode} error response with payload: ${body}`);
            }
        } else {
            console.log('GET call failed: ');
        }
        return undefined
    }
}