import { APIGatewayEvent } from "aws-lambda";
import { BlogPost } from "./BlogPost";
import * as crypto from "crypto";

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

  return {
    statusCode: 201,
    body: JSON.stringify(blogPost),
  };
};
