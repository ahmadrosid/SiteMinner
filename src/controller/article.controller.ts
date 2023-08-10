import { apiContract } from "../lib/contract.js";
import { ServerInferRequest, ServerInferResponses } from "@ts-rest/core";
import { extractFromHtml } from "@extractus/article-extractor";
import TurndownService from "turndown";
import { getHtmlFromUrl, cleanUpHtml } from "../lib/browser.js";
const turndownService = new TurndownService();

type Request = ServerInferRequest<typeof apiContract>["articleExtractor"];
type Response = ServerInferResponses<typeof apiContract>["articleExtractor"];

export async function articleExtractor({
  query,
  body,
}: Request): Promise<Response> {
  if (!query.access_token) {
    return {
      status: 401,
      body: {
        error: "Unauthorized: access_token is required",
      },
    };
  }

  const { html, title } = await getHtmlFromUrl({
    url: body.url,
    access_token: query.access_token,
  });

  const data = await extractFromHtml(html, body.url);
  if (data) {
    return {
      status: 200,
      body: {
        url: body.url,
        content: turndownService.turndown(data?.content || ""),
        title: title,
      },
    };
  }

  const markdownContent = turndownService.turndown(cleanUpHtml(html));
  if (markdownContent) {
    return {
      status: 200,
      body: {
        url: body.url,
        content: markdownContent,
        title: title,
      },
    };
  }

  return {
    status: 404,
    body: {
      error: "No content found",
    },
  };
}
