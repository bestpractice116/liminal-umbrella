import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs'
import * as lambda from 'aws-cdk-lib/aws-lambda'
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb'
import {Duration} from 'aws-cdk-lib';


export class LiminalUmbrellaStack extends cdk.Stack {
  public readonly usersTable: dynamodb.TableV2;

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
    this.usersTable = new dynamodb.TableV2(this, 'TestTable', {
       partitionKey: { name: 'pk', type: dynamodb.AttributeType.STRING },
    });

    // Create the Lambdas next.
    const discordCommandsLambda = new lambda.Function(this, 'discord-commands-lambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, 'functions')),
      handler: 'handler',
      environment: {
        USERS_TABLE_NAME: this.usersTable.tableName,
      },
      timeout: Duration.seconds(60),
    });
    this.usersTable.grantReadWriteData(discordCommandsLambda);
  }
}
