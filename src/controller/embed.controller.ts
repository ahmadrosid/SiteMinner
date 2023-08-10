import { apiContract } from "../contract";
import { ServerInferRequest, ServerInferResponses } from "@ts-rest/core";
import { extract } from "@extractus/oembed-extractor";

type Request = ServerInferRequest<typeof apiContract>["embedExrtractor"];
type Response = ServerInferResponses<typeof apiContract>["embedExrtractor"];

export async function embedExrtractor({
  query,
  body,
}: Request): Promise<Response> {
  console.log(body, query);

  if (!query.access_token) {
    return {
      status: 401,
      body: {
        error: "Unauthorized: access_token is required",
      },
    };
  }

  const data = await extract(body.siteUrl);
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
      title: data.title || "",
      data: data,
    },
  };
}
