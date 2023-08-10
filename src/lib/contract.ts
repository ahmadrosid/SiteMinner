import { initContract } from "@ts-rest/core";
import { z } from "zod";

const contract = initContract();

const MardownResponseSchema = z.object({
  url: z.string(),
  title: z.string(),
  content: z.string(),
});

const EmbedResponseSchema = z.object({
  url: z.string(),
  title: z.string(),
  data: z.any(),
});

const ErrorSchema = z.object({
  error: z.string(),
});

const apiContract = contract.router({
  embedExrtractor: {
    method: "GET",
    path: "/extractor/embedding-data",
    responses: {
      200: EmbedResponseSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    query: z.object({
      url: z.string(),
      access_token: z.string(),
    }),
    summary: "Get embedding data from any url",
  },
  articleExtractor: {
    method: "POST",
    path: "/extractor/article",
    responses: {
      200: MardownResponseSchema,
      401: ErrorSchema,
      404: ErrorSchema,
    },
    body: z.object({
      url: z.string(),
    }),
    query: z.object({
      access_token: z.string(),
    }),
    summary: "Turn any website into markdown text by website url",
  },
});

export { apiContract };
