import { EventBus, Rule } from 'aws-cdk-lib/aws-events';
import { Construct } from 'constructs';
import { CloudWatchLogGroup, LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import { Provider } from 'aws-cdk-lib/custom-resources';

export interface QuickSightAutomationsConstructProps {
    eventBus?: EventBus;
    refreshTargets?: [{
        etlJobName: string,
        datasetIds: string[],
    }]
}

export class QuickSightAutomationsConstruct extends Construct {
    public readonly shareDashboardLambdaToken: string;
    
    public constructor(scope: Construct, id: string, props?: QuickSightAutomationsConstructProps) {
        super(scope, id);
        this.shareDashboardLambdaToken = this.makeShareJob();

        if (props?.refreshTargets) {
            this.makeRefreshRuleAfterEtl(props);
        }
    }
    
    protected makeShareJob() {    
        
        const shareDashboardLambda = new NodejsFunction(this, 'qs-dashboard-share-function', {
            functionName: 'qs-dashboard-share-function',
            runtime: Runtime.NODEJS_18_X,
            handler: 'shareDashboard',
            entry: path.join(__dirname, '..', '..', 'lambda', 'qs-share-dashboard.ts'),
        });

        const updateDashboardPolicy = new PolicyStatement({
            actions: [
                'quicksight:UpdateDashboardPermissions',
            ],
            effect: Effect.ALLOW,
            resources: [
                '*',
            ],
        });
        
        shareDashboardLambda.addToRolePolicy(updateDashboardPolicy);
        
        const customResourceProvider = new Provider(this, `qf-share-dashboard-resource-provider`, {
            onEventHandler: shareDashboardLambda,
        });
        
        return customResourceProvider.serviceToken;
    }


    protected makeRefreshRuleAfterEtl(props: QuickSightAutomationsConstructProps) {
        const cleanEtlJobNameForEnvironmnet = (id: string) => { // function environnment variable keys only accept limited chars 
            return id.replace(/[^a-zA-Z0-9]/g, '_');
        };

        const environment: {[key: string] : string} = {};
        props.refreshTargets!.forEach(t => {
            environment[cleanEtlJobNameForEnvironmnet(t.etlJobName)] = t.datasetIds.join('___');
        });

        const refreshDatasetFunction = new NodejsFunction(this, 'qs-dataset-refresh-function', {
            functionName: 'qs-dataset-refresh-function',
            runtime: Runtime.NODEJS_18_X,
            handler: 'refreshDataset',
            environment,
            entry: path.join(__dirname, '..', '..', 'lambda', 'qs-refresh-dataset.ts'),
        });

        const quicksightInjestionPolicy = new PolicyStatement({
            actions: [
                'quicksight:CreateIngestion',
            ],
            effect: Effect.ALLOW,
            resources: [
                '*',
            ],
        });

        refreshDatasetFunction.addToRolePolicy(quicksightInjestionPolicy),

        new Rule(this, `qs-refresh-datasets-rule`, {
            ruleName: 'qs-refresh-datasets-rule',
            description: 'Refresh QS datasets after relevant ETL jobs finish',
            eventBus: props?.eventBus,
            eventPattern: {
                detailType: ['Glue Job State Change'],
                source: ['aws.glue'],
                detail: {
                    state: [ 'SUCCEEDED' ],
                },
            },
            targets: [
                new LambdaFunction(refreshDatasetFunction),
                new CloudWatchLogGroup(new LogGroup(this, 'qs-dataset-refresh-log-group', {
                    logGroupName: '/aws/events/quicksight/dataset-refresh',
                    retention: RetentionDays.ONE_WEEK,
                })),
            ],
        });
    }
}