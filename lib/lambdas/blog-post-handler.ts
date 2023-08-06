import { APIGatewayEvent } from "aws-lambda";
import { BlogPost } from "./BlogPost";
import * as crypto from "crypto";
import {
  deleteBlogPostById,
  getBlogPostById,
  getBlogPosts,
  saveBlogPost,
} from "./BlogPostServices";

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
