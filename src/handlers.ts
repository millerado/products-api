import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";
import { v4 } from "uuid";

const docClient = new AWS.DynamoDB.DocumentClient();
const tableName = "ProductsTable";
const headers = {
  "content-type": "application/json",
};

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
      Item: product,
    })
    .promise();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(product),
  };
};

class HttpError extends Error {
  constructor(public statusCody: number, body: Record<string, unknown> = {}) {
    super(JSON.stringify(body));
  }
}

const fetchProductById = async (id: string) => {
  const output = await docClient
    .get({
      TableName: tableName,
      Key: {
        productId: id,
      },
    })
    .promise();

  if (!output.Item) {
    throw new HttpError(404, { error: "Product not found" });
  }

  return output.Item;
};

const handleError = (error: unknown) => {
  if (error instanceof HttpError) {
    return {
      statusCode: error.statusCody,
      headers,
      body: error.message,
    };
  }

  throw error;
};

export const getProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const product = await fetchProductById(event?.pathParameters?.id as string);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (error) {
    return handleError(error);
  }
};

export const updateProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event?.pathParameters?.id as string;

    await fetchProductById(id);

    const reqBody = JSON.parse(event?.body as string);

    const product = {
      ...reqBody,
      productId: id,
    };

    await docClient
      .put({
        TableName: tableName,
        Item: product,
      })
      .promise();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(product),
    };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const id = event?.pathParameters?.id as string;

    await fetchProductById(id);

    await docClient
      .delete({
        TableName: tableName,
        Key: {
          productId: id,
        },
      })
      .promise();

    return {
      statusCode: 204,
      body: "",
    };
  } catch (error) {
    return handleError(error);
  }
};

export const listProduct = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const output = await docClient
    .scan({
      TableName: tableName,
    })
    .promise();

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(output.Items),
  };
};
