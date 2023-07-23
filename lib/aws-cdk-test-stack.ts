import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LambdaIntegration, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";

export class AwsCdkTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const functionName = "handler";
    const hello = new NodejsFunction(this, functionName, {
      entry: "lambda/hello.ts",
      handler: functionName,
      functionName: functionName,
    });

    const api = new LambdaRestApi(this, "Endpoint", {
      handler: hello,
      proxy: false,
    });

    // Add a GET method to the API
    api.root.addMethod("GET", new LambdaIntegration(hello));
  }
}
