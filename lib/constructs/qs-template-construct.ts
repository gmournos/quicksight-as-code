import { Construct } from 'constructs';
import { readFileSync, writeFileSync } from 'fs';
import { CfnAnalysis, CfnDashboard } from 'aws-cdk-lib/aws-quicksight';
import * as path from 'path';
import { CustomResource, Stack } from 'aws-cdk-lib';
import * as util from './qs-util';
import { CfnInclude } from 'aws-cdk-lib/cloudformation-include';
import * as os from 'os';
  

export interface QuickSightTemplateConstructProps {
    templateDefinitionSource: string;
    stackVersion: string;
    dataSets: {
        [placeholder: string] : string
    }
}

export class QuickSightTemplateConstruct extends Construct {
    
    constructor(scope: Construct, private id: string, props: QuickSightTemplateConstructProps) {
        super(scope, id);
        const templatePath = props.templateDefinitionSource;
        const { account, region } = Stack.of(this);
        const quicksightDevsGroupArn = util.getQuicksightGroupArn(region, account);

        const buffer = readFileSync(templatePath, { encoding: 'latin1'});
        const jsonObj = JSON.parse(buffer);
        delete jsonObj.ThemeArn;
        delete jsonObj.Status;
        delete jsonObj.ResourceStatus;
        delete jsonObj.RequestId;
       
        if (jsonObj.Errors) {
            throw new Error(`Template has errors. Remove errors before using it with CDK`);
        }
        jsonObj.TemplateId =  `${id}-template`;
        
        jsonObj.Name = `${props.stackVersion} ${id} Template`; // always generate a new template
        jsonObj.AwsAccountId = account;
        const logicalId = `${id}quicksighttemplate`;
        const cloudFormationObject = {
            "Resources": {
                [logicalId] : {
                    Type: 'AWS::QuickSight::Template',
                    Properties: jsonObj
                }
            }
        };
                
        const templateFile = path.join(os.tmpdir(), `cf-template-${id}.json`);
        writeFileSync(templateFile, JSON.stringify(cloudFormationObject));
        const template = new CfnInclude(this, `${id}-qs-template`, {
            templateFile,
        });

        const templateResource = template.getResource(logicalId);
        
        const dataSetReferences = Object.keys(props.dataSets).map( placeholder => {
            return { 
                dataSetArn: props.dataSets[placeholder],
                dataSetPlaceholder: placeholder,
            };
        });

        const analysisPermissions = [{
                principal : quicksightDevsGroupArn,
                actions: util.QS_RW_ANALYSIS_ACCESS,
            }
        ];
        const templateArn = `arn:aws:quicksight:${region}:${account}:template/${jsonObj.TemplateId}`;
        const analysis = new CfnAnalysis(this, `${id}-qs-analysis`, {
            analysisId: `${id}-analysis`,
            awsAccountId: account,
            name: `${props.stackVersion} ${id} Analysis`, // always generate a new analysis
            themeArn: 'arn:aws:quicksight::aws:theme/CLASSIC',
            sourceEntity: {
                sourceTemplate: {
                    arn: templateArn,
                    dataSetReferences,
                  },
            },
            permissions: analysisPermissions,
        });

        analysis.addDependency(templateResource);
        
        const dashboardPermissions = [{
            principal : quicksightDevsGroupArn,
            actions: util.QS_RW_DASHBOARD_ACCESS,
        }];

        const dashboard = new CfnDashboard(this, `${id}-qs-dashboard`, {
            dashboardId: `${id}-dashboard`,
            awsAccountId: account,
            name: `${props.stackVersion} ${id} Dashboard`, // always generate a new dashboard
            themeArn: 'arn:aws:quicksight::aws:theme/CLASSIC',
            sourceEntity: {
                sourceTemplate: {
                    arn:  templateArn,
                    dataSetReferences,
                  },
            },
            permissions: dashboardPermissions,
            dashboardPublishOptions: {
                adHocFilteringOption: {
                    availabilityStatus: "ENABLED"
                },
                exportToCsvOption: {
                    availabilityStatus: "ENABLED"
                },
                sheetControlsOption: {
                    visibilityState: "EXPANDED"
                },
                sheetLayoutElementMaximizationOption: {
                    availabilityStatus: "ENABLED"
                },
                visualMenuOption: {
                    availabilityStatus: "ENABLED"
                },
                visualAxisSortOption: {
                    availabilityStatus: "ENABLED"
                },
                exportWithHiddenFieldsOption: {
                    availabilityStatus: "DISABLED"
                },
                dataPointDrillUpDownOption: {
                    availabilityStatus: "ENABLED"
                },
                dataPointMenuLabelOption: {
                    availabilityStatus: "ENABLED"
                },
                dataPointTooltipOption: {
                    availabilityStatus: "ENABLED"
                }
            }
        });
        dashboard.addDependency(templateResource);

        const shareFunctionArn = process.env.SHARE_FUNCTION;
        if (!shareFunctionArn) {
            throw new Error('no share function');
        }

        const quickSightShareDashboardCustomResource = new CustomResource(this, `${id}-qs-dashboard-share-function`, {
            serviceToken: shareFunctionArn,
            properties: {
                DashboardId: `${id}-dashboard`,
                AwsAccountId: Stack.of(this).account,
                Region: Stack.of(this).region,
            },
        });
  
        quickSightShareDashboardCustomResource.node.addDependency(dashboard);
    
    }
}
