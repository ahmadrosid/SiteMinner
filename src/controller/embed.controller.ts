import { apiContract } from "..//lib/contract";
import { ServerInferRequest, ServerInferResponses } from "@ts-rest/core";
import { extract } from "@extractus/oembed-extractor";

type Request = ServerInferRequest<typeof apiContract>["embedExrtractor"];
type Response = ServerInferResponses<typeof apiContract>["embedExrtractor"];

export async function embedExrtractor({ query }: Request): Promise<Response> {
  console.log(query);

  if (!query.access_token) {
    return {
      status: 401,
      body: {
        error: "Unauthorized: access_token is required",
      },
    };
  }

  const data = await extract(query.url);
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
      url: query.url,
      title: data.title || "",
      data: data,
    },
  };
}
