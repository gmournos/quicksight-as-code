import { Construct } from 'constructs';
import { StackProps, Stack, Stage } from 'aws-cdk-lib';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';
import { StringParameter } from 'aws-cdk-lib/aws-ssm';
import { QuicksightCodeStack } from './quicksight-code-stack';

class QuicksightArtifactsStage extends Stage {
  constructor(scope: Construct, id: string, props: StackProps) {
    super(scope, id, props);
    new QuicksightCodeStack(this, 'quicksight-artifacts-stack', props);
  }
}

export class QuicksightCicdStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const githubConnectionArn = StringParameter.valueForStringParameter(this, '/gmournos/github/connection/arn');

    const quicksightSource = CodePipelineSource.connection('gmournos/quicksight-as-code', "main", {
      connectionArn: githubConnectionArn,
      triggerOnPush: true,
    });

    const pipeline = new CodePipeline(this, "quicksight-cicd-pipeline", {
      pipelineName: "Quicksight_CICD_Pipeline",
      synth: new CodeBuildStep("synth-step", {
        input: quicksightSource,
        installCommands: ["npm install -g aws-cdk"],
        commands: ["npm install", "npm run build", "npx cdk synth"],
      }),
    });

    pipeline.addStage(new QuicksightArtifactsStage(this, 'quicksight-artifacts-deploy', {
      env: {
        account: this.account,
        region: this.region,
      }
    }));
  }

}
