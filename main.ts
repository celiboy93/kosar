import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { DOMParser } from "https://deno.land/x/deno_dom/deno-dom-wasm.ts";

const TARGET_URL = "https://kosargyi.com/";

async function getMovies() {
  const response = await fetch(TARGET_URL);
  const html = await response.text();
  const doc = new DOMParser().parseFromString(html, "text/html");
  
  const posts = doc?.querySelectorAll("article") || [];
  const results = [];

  for (const post of posts) {
    const title = post.querySelector("h2")?.innerText || "No Title";
    const content = post.innerHTML;
    
    // MP4 link ရှာမယ် (Wasabi link တွေအပါအဝင်)
    const mp4Regex = /https?:\/\/[^\s"'<>]+?\.(mp4|m3u8)/g;
    const foundLinks = content.match(mp4Regex);

    results.push({
      title,
      videoUrl: foundLinks ? foundLinks[0] : null
    });
  }
  return results;
}

serve(async (req) => {
  const movies = await getMovies();

  let htmlResponse = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>KSG Direct Player</title>
      <style>
        body { background: #000; color: #fff; font-family: sans-serif; padding: 20px; }
        .card { background: #111; border: 1px solid #333; margin-bottom: 20px; border-radius: 10px; overflow: hidden; }
        h2 { font-size: 16px; padding: 10px; color: #ff9900; }
        video { width: 100%; display: block; }
        .error { padding: 20px; color: #555; font-size: 12px; }
      </style>
    </head>
    <body>
      <h1 style="text-align:center">Kosargyi Scraping Test</h1>
  `;

  movies.forEach(movie => {
    htmlResponse += `<div class="card"><h2>${movie.title}</h2>`;
    if (movie.videoUrl) {
      htmlResponse += `
        <video controls preload="none">
          <source src="${movie.videoUrl}" type="video/mp4">
        </video>`;
    } else {
      htmlResponse += `<div class="error">ဗီဒီယို Link ရှာမတွေ့ပါ။ (API ကနေ ဖျောက်ထားခြင်း ဖြစ်နိုင်သည်)</div>`;
    }
    htmlResponse += `</div>`;
  });

  htmlResponse += `</body></html>`;

  return new Response(htmlResponse, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
});
