import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { LambdaIntegration, RestApi } from "aws-cdk-lib/aws-apigateway";
import { AttributeType, Table } from "aws-cdk-lib/aws-dynamodb";
import { PolicyStatement } from "aws-cdk-lib/aws-iam";

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

    // get by id
    const getBlogPostLambdaName = "getBlogPostHandler";
    const getBlogPostLambda = new NodejsFunction(this, getBlogPostLambdaName, {
      entry: "lib/lambdas/blog-post-handler.ts",
      handler: getBlogPostLambdaName,
      functionName: getBlogPostLambdaName,
      environment: { TABLE_NAME: table.tableName },
    });
    table.grantReadData(getBlogPostLambda);

    // delete
    const deleteBlogPostLambdaName = "deleteBlogPostHandler";
    const deleteBlogPostLambda = new NodejsFunction(
      this,
      deleteBlogPostLambdaName,
      {
        entry: "lib/lambdas/blog-post-handler.ts",
        handler: deleteBlogPostLambdaName,
        functionName: deleteBlogPostLambdaName,
        environment: { TABLE_NAME: table.tableName },
      }
    );
    table.grantWriteData(deleteBlogPostLambda);

    // api doc
    const apiDocsLambdaName = "apiDocsHandler";
    const apiDocsLambda = new NodejsFunction(this, apiDocsLambdaName, {
      entry: "lib/lambdas/blog-post-handler.ts",
      handler: apiDocsLambdaName,
      functionName: apiDocsLambdaName,
      environment: { API_ID: api.restApiId },
    });

    const policy = new PolicyStatement({
      actions: ["apigateway:GET"],
      resources: ["*"],
    });
    apiDocsLambda.role?.addToPrincipalPolicy(policy);

    const apiDocsPath = api.root.addResource("api-docs");
    apiDocsPath.addMethod("GET", new LambdaIntegration(apiDocsLambda));

    // https://example.com/blogposts
    const blogPostPath = api.root.addResource("blogposts");
    blogPostPath.addMethod("POST", new LambdaIntegration(createBlogPostLambda));
    blogPostPath.addMethod("GET", new LambdaIntegration(getBlogPostsLambda), {
      requestParameters: {
        "method.request.querystring.order": false,
      },
    });
    const blogPostByIdPath = blogPostPath.addResource("{id}");
    blogPostByIdPath.addMethod("GET", new LambdaIntegration(getBlogPostLambda));
    blogPostByIdPath.addMethod(
      "DELETE",
      new LambdaIntegration(deleteBlogPostLambda)
    );
  }
}
