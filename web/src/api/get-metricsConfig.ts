import { ApiError } from 'aws-amplify/api';
import { metricsConfig } from './mock/mockData';


export const getMetricsConfig = async (): Promise<unknown> => {
    try {
        // const restOperation = get({
        //     apiName: 'myRestApi',
        //     path: 'metrics'
        // });
        // const { body } = await restOperation.response;
        // return await body.json();

        return metricsConfig
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