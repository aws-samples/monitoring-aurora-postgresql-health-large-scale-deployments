import { DateRangePickerProps } from '@cloudscape-design/components';
import { ApiError, get } from 'aws-amplify/api';
import { getCurrentEpochTime, getRangeStartAsEpoc } from './utils/utils';


export const getMetricDetails = async (range: DateRangePickerProps.RelativeValue, metricName: string): Promise<unknown> => {
    try {
        const path = `query-all?startTimeEpoch=${getRangeStartAsEpoc(range.amount, range.unit)}&endTimeEpoch=${getCurrentEpochTime()}&metricName=${metricName}`
        const restOperation = get({
            apiName: 'myRestApi',
            path: path
        });
        const { body } = await restOperation.response;
        return await body.json();
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