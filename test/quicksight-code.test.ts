import * as cdk from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { QuicksightCodeStack } from '../lib/quicksight-code-stack';

test('Pipeline Stack matches Snapshot', () => {
    const app = new cdk.App();
    const stack = new QuicksightCodeStack(app, 'MyTestStack');
    const template = Template.fromStack(stack);
 
    // Assert the template matches the snapshot.
    expect(template.toJSON()).toMatchSnapshot();

 });
 
 