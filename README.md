## SiteMinner

Scrape any website turn into markdown.

```bash
curl --request POST \
  --url https://site-minner.vercel.app/markdown?acess_token=... \
  --header 'Content-Type: application/json' \
  --data '{
	"siteUrl": "https://ahmadrosid.com/blog/cancel-fetch-request"
}'
```

This API using browserless to scrape the url, please grab your access token from [https://www.browserless.io/](https://www.browserless.io/).

[OpenAPI spec](https://site-minner.vercel.app/swagger.json)
