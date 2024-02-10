import { App } from '@aws-cdk/core';
import { LiminalUmbrellaStack } from './stacks/start-api-stack';

const stackEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

const app = new App();
const liminalUmbrellaStack = new LiminalUmbrellaStack(app, 'LiminalUmbrellaStack', {
  domainAddress: process.env.LAMBDA_DOMAIN,
  env: stackEnv
});
