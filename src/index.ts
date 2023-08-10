import express from "express";
import cors from "cors";
import { initServer, createExpressEndpoints } from "@ts-rest/express";
import { apiContract } from "./contract";
import { generateOpenApi } from "@ts-rest/open-api";
import * as swaggerUi from "swagger-ui-express";
import { extractFromHtml } from "@extractus/article-extractor";
import puppeteer from "puppeteer-core";
import TurndownService from "turndown";

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const restServer = initServer();
const turndownService = new TurndownService();

function cleanUpHtml(html: string) {
  let newHtml = html.replace(
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    ""
  );

  // remove image tag
  newHtml = newHtml.replace(/<img[^>]*>/gi, "");
  // remove css class names
  newHtml = newHtml.replace(/class=".*?"/gi, "");

  return newHtml;
}

const router = restServer.router(apiContract, {
  markdown: async ({ body, query }) => {
    if (!query.access_token) {
      return {
        status: 401,
        body: {
          error: "Unauthorized: access_token is required",
        },
      };
    }

    const browser = await puppeteer.connect({
      browserWSEndpoint: `wss://chrome.browserless.io?token=${query.access_token}`,
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(body.siteUrl, { waitUntil: "domcontentloaded" });
    const html = await page.content();

    const data = await extractFromHtml(html, body.siteUrl);
    if (!data) {
      return {
        status: 404,
        body: {
          error: "No content found",
        },
      };
    }

    return {
      status: 200,
      body: {
        url: body.siteUrl,
        content: turndownService.turndown(data?.content || ""),
        title: data?.title || "",
      },
    };
  },
});

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
openApiDocument.paths["/markdown"].post.parameters = [];

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
