import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";

export class AwsCdkTestStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const api = new RestApi(this, "blogPostApi");

    const table = new Table(this, "blogPostTable", {
      tableName: "blogPostTable",
      partitionKey: { name: "id", type: AttributeType.STRING },
    });

    // create
    const createBlogPostLambdaName = "createBlogPostHandler";
    const createBlogPostLambda = new NodejsFunction(
      this,
      createBlogPostLambdaName,
      {
        entry: "lib/lambdas/blog-post-handler.ts",
        handler: createBlogPostLambdaName,
        functionName: createBlogPostLambdaName,
        environment: { TABLE_NAME: table.tableName },
      }
    );
    table.grantWriteData(createBlogPostLambda);

    // list
    const getBlogPostsLambdaName = "getBlogPostsHandler";
    const getBlogPostsLambda = new NodejsFunction(
      this,
      getBlogPostsLambdaName,
      {
        entry: "lib/lambdas/blog-post-handler.ts",
        handler: getBlogPostsLambdaName,
        functionName: getBlogPostsLambdaName,
        environment: { TABLE_NAME: table.tableName },
      }
    );
    table.grantReadData(getBlogPostsLambda);

    // https://example.com/blogposts
    const blogPostPath = api.root.addResource("blogposts");
    blogPostPath.addMethod("POST", new LambdaIntegration(createBlogPostLambda));
    blogPostPath.addMethod("GET", new LambdaIntegration(getBlogPostsLambda), {
      requestParameters: {
        "method.request.querystring.order": false,
      },
    });
  }
}
