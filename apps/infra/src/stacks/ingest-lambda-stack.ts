import { Stack, StackProps } from 'aws-cdk-lib';
import { Runtime, Code, Function as LambdaFunction } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';

export class IngestLambdaStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    new LambdaFunction(this, 'IngestHandler', {
      runtime: Runtime.NODEJS_20_X,
      handler: 'index.handler',
      code: Code.fromInline(
        'exports.handler = async () => ({ statusCode: 200, body: "placeholder" });'
      ),
    });
  }
}
