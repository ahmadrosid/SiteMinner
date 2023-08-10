import { apiContract } from "../contract";
import { ServerInferRequest, ServerInferResponses } from "@ts-rest/core";
import { extractFromHtml } from "@extractus/article-extractor";
import TurndownService from "turndown";
import { getHtmlFromUrl } from "../lib/browser";
const turndownService = new TurndownService();

type Request = ServerInferRequest<typeof apiContract>["markdown"];
type Response = ServerInferResponses<typeof apiContract>["markdown"];

export async function markdown({ query, body }: Request): Promise<Response> {
  if (!query.access_token) {
    return {
      status: 401,
      body: {
        error: "Unauthorized: access_token is required",
      },
    };
  }

  const html = await getHtmlFromUrl({
    url: body.siteUrl,
    access_token: query.access_token,
  });

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
}
