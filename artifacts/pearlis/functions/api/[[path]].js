/**
 * Cloudflare Pages Function — proxies all /api/* requests to the Render backend.
 * Set RENDER_API_URL in the Cloudflare Pages dashboard → Settings → Environment Variables.
 * Example: https://pearlis-api.onrender.com
 */
export async function onRequest(context) {
  const { request, env } = context;
  const renderApiUrl = env.RENDER_API_URL;

  if (!renderApiUrl) {
    return new Response(JSON.stringify({ error: "RENDER_API_URL not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(request.url);
  const targetUrl = `${renderApiUrl.replace(/\/$/, "")}${url.pathname}${url.search}`;

  const headers = new Headers(request.headers);
  headers.set("X-Forwarded-For", request.headers.get("CF-Connecting-IP") || "");
  headers.delete("host");

  const proxyRequest = new Request(targetUrl, {
    method: request.method,
    headers,
    body: ["GET", "HEAD"].includes(request.method) ? undefined : request.body,
    redirect: "follow",
  });

  const response = await fetch(proxyRequest);

  const responseHeaders = new Headers(response.headers);
  responseHeaders.set("Access-Control-Allow-Origin", url.origin);
  responseHeaders.set("Access-Control-Allow-Credentials", "true");

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
