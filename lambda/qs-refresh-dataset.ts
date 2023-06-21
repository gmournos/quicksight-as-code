import { QuickSightClient, CreateIngestionCommand } from '@aws-sdk/client-quicksight';
import { EventBridgeEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';

export const refreshDataset = async (event: EventBridgeEvent<string, any>): Promise<void> => {
    
    const jobName = event.detail.jobName.replace(/[^a-zA-Z0-9]/g, '_');
    const datasetStrings  = process.env[jobName];
    
    if (datasetStrings == undefined) {
        return;
    }
    const datasets = datasetStrings.split('___');
 
    try {
        const client = new QuickSightClient({});
            
        for (const datasetId of datasets) {
            console.log(`Starting refreshing dataset: ${datasetId}`);
            const command = new CreateIngestionCommand({
                DataSetId: datasetId,
                IngestionType: "FULL_REFRESH",
                IngestionId: `${datasetId}-${uuidv4()}`,
                AwsAccountId: event.account,
            });
            const response = await client.send(command);
            console.log(`Generated response: ${response}`);
        }
    } catch (e) {
        console.log(e);
    }
};