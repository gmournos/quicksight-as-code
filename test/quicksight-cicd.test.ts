import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { QuicksightCicdStack } from '../lib/quicksight-cicd-stack';

test('Pipeline Stack matches Snapshot', () => {
    const app = new cdk.App();
    const stack = new QuicksightCicdStack(app, 'MyTestStack');
    const template = Template.fromStack(stack);
 
    // Assert the template matches the snapshot.
    expect(template.toJSON()).toMatchSnapshot();

 });
 
 