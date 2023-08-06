import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";
import { BlogPost } from "./BlogPost";
import {
  DeleteItemCommand,
  DynamoDBClient,
  GetItemCommand,
  PutItemCommand,
  ScanCommand,
} from "@aws-sdk/client-dynamodb";

const db = new DynamoDBClient({});
const TABLE_NAME = process.env.TABLE_NAME!;

export const saveBlogPost = async (blogPost: BlogPost) => {
  const params = {
    TableName: TABLE_NAME,
    Item: marshall(blogPost),
  };

  const command = new PutItemCommand(params);
  await db.send(command);
};

export const getBlogPosts = async () => {
  const params = {
    TableName: TABLE_NAME,
  };

  const command = new ScanCommand(params);
  const { Items } = await db.send(command);
  return Items?.map((item) => unmarshall(item) as BlogPost) ?? [];
};

export const getBlogPostById = async (id: string) => {
  const params = {
    TableName: TABLE_NAME,
    Key: marshall({ id }),
  };

  const command = new GetItemCommand(params);
  const { Item } = await db.send(command);
  return Item ? (unmarshall(Item) as BlogPost) : null;
};

export const deleteBlogPostById = async (id: string) => {
  const params = {
    TableName: TABLE_NAME,
    Key: marshall({ id }),
  };

  const command = new DeleteItemCommand(params);
  await db.send(command);
};
