import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { QuickSightSamplesDatasetConstruct } from './quicksight-sample-datasets-construct';
import { QuickSightSampleTemplatesConstruct } from './quicksight-sample-templates-construct';
import { QuickSightAutomationsConstruct } from './constructs/qs-extra-automation';

export class QuicksightCodeStackProps {
  version: string;
} 

export class QuicksightCodeStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const automations = new QuickSightAutomationsConstruct(this, 'qs-automations');
    process.env.SHARE_FUNCTION = automations.shareDashboardLambdaToken;

    new QuickSightSamplesDatasetConstruct(this, 'qs-datasets');

    const templates = new QuickSightSampleTemplatesConstruct(this, 'qs-templates');
    templates.node.addDependency(automations);

  }
}
