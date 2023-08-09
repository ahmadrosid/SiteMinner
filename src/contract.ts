import { initContract } from "@ts-rest/core";
import { z } from "zod";

export const contract = initContract();

const PostSchema = z.object({
  url: z.string(),
  title: z.string(),
  content: z.string(),
});

const ErrorSchema = z.object({
  error: z.string(),
});

export const apiContract = contract.router({
  markdown: {
    method: "POST",
    path: "/markdown",
    responses: {
      200: PostSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    body: z.object({
      siteUrl: z.string(),
    }),
    query: z.object({
      access_token: z.string(),
    }),
    summary: "Turn any website into markdown text by website url",
  },
});
