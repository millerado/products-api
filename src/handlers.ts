import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { v4 } from "uuid";

const docClient = new AWS.DynamoDB.DocumentClient();

export const createProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const reqBody = JSON.parse(event.body as string);

  const product = {
    ...reqBody,
    productID: v4(),
  };

  await docClient
    .put({
      TableName: "ProductsTable",
      Item: {
        ...reqBody,
        productID: v4(),
      },
    })
    .promise();

  return {
    statusCode: 200,
    body: JSON.stringify(product),
  };
};
