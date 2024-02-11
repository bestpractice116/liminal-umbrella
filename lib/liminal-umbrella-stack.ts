import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs'
//import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'

export class LiminalUmbrellaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    /*const queue = new sqs.Queue(this, 'LiminalUmbrellaQueue', {
       visibilityTimeout: cdk.Duration.seconds(300)
    });*/

    /*
	const fn = new lambda.Function(this, 'MyFunction', {
  runtime: lambda.Runtime.NODEJS_18_X,
  handler: 'index.handler',
  code: lambda.Code.fromAsset(path.join(__dirname, 'lambda-handler')),
});
	*/
     const table = new dynamodb.TableV2(this, 'TestTable', {
       partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
    });
  }
}
