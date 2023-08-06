import { APIGatewayEvent } from "aws-lambda";
import { BlogPost } from "./BlogPost";
import * as crypto from "crypto";
import {
  deleteBlogPostById,
  getBlogPostById,
  getBlogPosts,
  saveBlogPost,
} from "./BlogPostServices";
import {
  APIGatewayClient,
  GetExportCommand,
} from "@aws-sdk/client-api-gateway";

export const createBlogPostHandler = async (event: APIGatewayEvent) => {
  const partialBlogPost = JSON.parse(event.body!) as {
    title: string;
    author: string;
    content: string;
  };

  const blogPost: BlogPost = {
    id: crypto.randomUUID(),
    ...partialBlogPost,
    createAt: new Date().toISOString(),
  };

  await saveBlogPost(blogPost);

  return {
    statusCode: 201,
    body: JSON.stringify(blogPost),
  };
};

export const getBlogPostsHandler = async (event: APIGatewayEvent) => {
  const order = event?.queryStringParameters?.order;
  let blogPosts = await getBlogPosts();
  if (order === "desc") {
    blogPosts = blogPosts.sort((a, b) => b.createAt.localeCompare(a.createAt));
  }
  return {
    statusCode: 200,
    body: JSON.stringify(blogPosts),
  };
};

export const getBlogPostHandler = async (event: APIGatewayEvent) => {
  const id = event.pathParameters!.id!;
  const blogPost = await getBlogPostById(id);
  return {
    statusCode: 200,
    body: JSON.stringify(blogPost),
  };
};

export const deleteBlogPostHandler = async (event: APIGatewayEvent) => {
  const id = event.pathParameters!.id!;
  await deleteBlogPostById(id);
  return {
    statusCode: 204,
  };
};

export const apiDocsHandler = async (event: APIGatewayEvent) => {
  const apitgateway = new APIGatewayClient({});
  const restApiId = process.env.API_ID!;
  const getExportCommand = new GetExportCommand({
    restApiId,
    exportType: "swagger",
    accepts: "application/json",
    stageName: "prod",
  });

  const api = await apitgateway.send(getExportCommand);
  const response = Buffer.from(api.body!).toString("utf-8");

  return {
    statusCode: 200,
    body: response,
  };
};
