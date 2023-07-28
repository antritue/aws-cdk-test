import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";

export class AwsCdkTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new RestApi(this, "blogPostApi");

    const createBlogPostLambdaName = "createBlogPostHandler";
    const createBlogPostLambda = new NodejsFunction(
      this,
      createBlogPostLambdaName,
      {
        entry: "lib/lambdas/blog-post-handler.ts",
        handler: createBlogPostLambdaName,
        functionName: createBlogPostLambdaName,
      }
    );

    // POST: https://example.com/blogposts
    const blogPostPath = api.root.addResource("blogposts");
    blogPostPath.addMethod("POST", new LambdaIntegration(createBlogPostLambda));
  }
}
