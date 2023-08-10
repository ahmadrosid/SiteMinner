import express from "express";
import cors from "cors";
import { initServer, createExpressEndpoints } from "@ts-rest/express";
import { apiContract } from "./contract";
import { generateOpenApi } from "@ts-rest/open-api";
import * as swaggerUi from "swagger-ui-express";
import controller from "./controller";

const app = express();
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const restServer = initServer();
const router = restServer.router(apiContract, controller);

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

// Hide access_token from markdown endpoint
// openApiDocument.paths["/markdown"].post.parameters = [];

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get("/swagger.json", (req, res) => {
  res.contentType("application/json");
  res.send(JSON.stringify(openApiDocument, null, 2));
});

createExpressEndpoints(apiContract, router, app);

const port = process.env.port || 3333;
const server = app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});
