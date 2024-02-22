import * as path from 'path';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {NodejsFunction} from 'aws-cdk-lib/aws-lambda-nodejs';
import {Cors, LambdaIntegration, RequestValidator, RestApi} from 'aws-cdk-lib/aws-apigateway';
import {Secret} from 'aws-cdk-lib/aws-secretsmanager';


export class LiminalUmbrellaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const discordAPISecrets = new Secret(this, 'discord-bot-api-key');
    new cdk.CfnOutput(this, 'discordSecretName', { value: discordAPISecrets.secretArn });

    const discordCommandsLambda = new NodejsFunction(this, 'discord-commands-lambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../functions/DiscordCommands.ts'),
      handler: 'handler',
      environment: {
        DISCORD_BOT_API_KEY_NAME: discordAPISecrets.secretName,
        //USERS_TABLE_NAME: this.usersTable.tableName,
      },
      timeout: cdk.Duration.seconds(60),
    });
    discordAPISecrets.grantRead(discordCommandsLambda)

    // Create the Lambdas next.
    const discordBotLambda = new NodejsFunction(this, 'discord-bot-lambda', {
      runtime: lambda.Runtime.NODEJS_20_X,
      entry: path.join(__dirname, '../functions/DiscordBotFunction.ts'),
      handler: 'handler',
      environment: {
        DISCORD_BOT_API_KEY_NAME: discordAPISecrets.secretName,
        COMMAND_LAMBDA_ARN: discordCommandsLambda.functionArn,
      },
      timeout: cdk.Duration.seconds(3),
      memorySize: 256,
    });
    discordCommandsLambda.grantInvoke(discordBotLambda)
    discordAPISecrets.grantRead(discordBotLambda);

    // Create our API Gateway
    const discordBotAPI = new RestApi(this, 'discord-bot-api', {
      defaultCorsPreflightOptions: {
        allowOrigins: Cors.ALL_ORIGINS,
      },
    });
    const discordBotAPIValidator = new RequestValidator(this, 'discord-bot-api-validator', {
      restApi: discordBotAPI,
      validateRequestBody: true,
      validateRequestParameters: true,
    });

    // User authentication endpoint configuration
    const discordBotEventItems = discordBotAPI.root.addResource('event', {
      defaultCorsPreflightOptions: {
        allowOrigins: [
          '*',
        ],
      },
    });

    // Transform our requests and responses as appropriate.
    const discordBotIntegration: LambdaIntegration = new LambdaIntegration(discordBotLambda, {
      proxy: false,
      requestTemplates: {
        'application/json': '{\r\n\
              "timestamp": "$input.params(\'x-signature-timestamp\')",\r\n\
              "signature": "$input.params(\'x-signature-ed25519\')",\r\n\
              "jsonBody" : $input.json(\'$\')\r\n\
            }',
      },
      integrationResponses: [
        {
          statusCode: '200',
        },
        {
          statusCode: '401',
          selectionPattern: '.*[UNAUTHORIZED].*',
          responseTemplates: {
            'application/json': 'invalid request signature',
          },
        },
      ],
    });

    // Add a POST method for the Discord APIs.
    discordBotEventItems.addMethod('POST', discordBotIntegration, {
      apiKeyRequired: false,
      requestValidator: discordBotAPIValidator,
      methodResponses: [
        {
          statusCode: '200',
        },
        {
          statusCode: '401',
        },
      ],
    });
  }
}
