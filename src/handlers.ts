import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { v4 } from "uuid";

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "ProductsTable";

export const createProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log("event", event);
  const reqBody = JSON.parse(event?.body as string);

  const product = {
    ...reqBody,
    productId: v4(),
  };

  await docClient
    .put({
      TableName: tableName,
      Item: {
        ...reqBody,
        productId: v4(),
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify(product),
  };
};

export const getProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const id = event.pathParameters?.id;

  const output = await docClient
    .get({
      TableName: tableName,
      Key: {
        productId: id,
      },
    })
    .promise();

  if (!output.Item) {
    return {
      statusCode: 404,
      body: JSON.stringify({ error: "Product not found" }),
    };
  }

  return {
    statusCode: 200,
    body: JSON.stringify(output.Item),
  };
};
