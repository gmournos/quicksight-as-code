#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { QuicksightCicdStack } from '../lib/quicksight-cicd-stack';
// import { QuicksightCodeStack } from '../lib/quicksight-code-stack';

const app = new cdk.App();
new QuicksightCicdStack(app, 'quicksight-cicd-stack');
// new QuicksightCodeStack(app, 'quicksight-artifacts-stack');