import puppeteer from "puppeteer-core";
import sanitizeHtml from "sanitize-html";

export function cleanUpHtml(html: string) {
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

export async function getHtmlFromUrl({
  url,
  access_token,
}: {
  url: string;
  access_token: string;
}) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://chrome.browserless.io?token=${access_token}`,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080 });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const html = await page.content();
  const title = await page.title();
  await page.close();
  return { html: sanitizeHtml(html), title };
}
