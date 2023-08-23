import express from "express";
import cors from "cors";
import { initServer, createExpressEndpoints } from "@ts-rest/express";
import { apiContract } from "./lib/contract.js";
import { generateOpenApi } from "@ts-rest/open-api";
import * as swaggerUi from "swagger-ui-express";
import * as controller from "./controller/index.js";

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const restServer = initServer();
const router = restServer.router(apiContract, controller);
createExpressEndpoints(apiContract, router, app);

const openApiConfig = {
  openapi: "3.0.0",
  info: { title: "SiteMinner API", version: "1.0.0" },
  servers: [
    {
      url: process.env.BASE_URL || "http://localhost:3333/",
    },
  ],
  components: {
    schemas: {},
    parameters: {},
    securitySchemes: {
      api_key: {
        type: "apiKey",
        in: "query",
        name: "access_token",
      },
    },
  },
};

const openApiDocument = generateOpenApi(apiContract, openApiConfig, {
  setOperationId: true,
});
openApiDocument.paths["/extractor/article"].post.parameters = [];
openApiDocument.paths["/extractor/embedding-data"].get.parameters =
  openApiDocument.paths["/extractor/embedding-data"].get.parameters.filter(
    (item: any) => item.name !== "access_token"
  );

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get("/swagger.json", (req: any, res: any) => {
  res.json(openApiDocument);
});

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
