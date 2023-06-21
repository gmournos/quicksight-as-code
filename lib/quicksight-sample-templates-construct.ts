import { Construct } from 'constructs';
import { QuickSightTemplateConstruct } from './constructs/qs-template-construct';
import { Stack } from 'aws-cdk-lib';
import * as path from 'path';

export class QuickSightSampleTemplatesConstruct extends Construct {

    constructor(scope: Construct, id: string) {
        super(scope, id);

        new QuickSightTemplateConstruct(this, 'people', {
            templateDefinitionSource: path.join(__dirname, '..', 'template-defs', 'people-template-def.json'),
            stackVersion: Stack.of(this).node.tryGetContext('version'),
            dataSets: {
                "People Overview": `arn:aws:quicksight:${Stack.of(this).region}:${Stack.of(this).account}:dataset/people-ds`,
            }
        });

        new QuickSightTemplateConstruct(this, 'sales', {
            templateDefinitionSource: path.join(__dirname,'..', 'template-defs', 'sales-template-def.json'),
            stackVersion: Stack.of(this).node.tryGetContext('version'),
            dataSets: {
                "Sales Pipeline": `arn:aws:quicksight:${Stack.of(this).region}:${Stack.of(this).account}:dataset/sales-ds`,
            }
        });

 
        new QuickSightTemplateConstruct(this, 'business', {
            templateDefinitionSource: path.join(__dirname,'..', 'template-defs', 'business-template-def.json'),
            stackVersion: Stack.of(this).node.tryGetContext('version'),
            dataSets: {
                "Business Review": `arn:aws:quicksight:${Stack.of(this).region}:${Stack.of(this).account}:dataset/business-ds`,
            }
        });
        
        new QuickSightTemplateConstruct(this, 'web', {
            templateDefinitionSource: path.join(__dirname, '..', 'template-defs', 'web-template-def.json'),
            stackVersion: Stack.of(this).node.tryGetContext('version'),
            dataSets: {
                "Web and Social Media Analytics": `arn:aws:quicksight:${Stack.of(this).region}:${Stack.of(this).account}:dataset/web-ds`,
            }
        });
        
    }

}