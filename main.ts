
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const SITE_URL = "https://kosargyi.com/wp-json/wp/v2/posts?per_page=10";

async function getWebPage() {
  const res = await fetch(SITE_URL);
  const posts = await res.json();

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>My Personal Streaming</title>
      <style>
        body { font-family: sans-serif; background: #050505; color: #fff; padding: 10px; margin: 0; }
        .container { max-width: 800px; margin: auto; }
        .card { background: #111; margin-bottom: 25px; border-radius: 15px; overflow: hidden; border: 1px solid #222; box-shadow: 0 4px 15px rgba(0,0,0,0.5); }
        h2 { font-size: 16px; padding: 15px; margin: 0; color: #f1c40f; background: #1a1a1a; }
        video { width: 100%; display: block; background: #000; }
        .no-video { padding: 20px; color: #555; text-align: center; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1 style="text-align:center; color: #e74c3c;">KSG Player</h1>
  `;

  for (const post of posts) {
    const content = post.content.rendered;
    
    // .mp4 နဲ့ ဆုံးတဲ့ link တွေကို ရှာတဲ့ Regex (Wasabi သို့မဟုတ် အခြား direct links များအတွက်)
    const mp4Regex = /https?:\/\/[^\s"'<>]+?\.(mp4|m3u8|webm)/g;
    const foundLinks = content.match(mp4Regex);

    html += `<div class="card"><h2>${post.title.rendered}</h2>`;

    if (foundLinks && foundLinks.length > 0) {
      // ပထမဆုံး တွေ့တဲ့ link တစ်ခုကိုပဲ Player ထဲ ထည့်ပြမယ်
      const videoSrc = foundLinks[0];
      
      html += `
        <video controls preload="metadata" poster="">
          <source src="${videoSrc}" type="video/mp4">
          Your browser does not support the video tag.
        </video>
      `;
    } else {
      html += `<div class="no-video">ဗီဒီယို Direct Link ရှာမတွေ့ပါ။ (Doodstream ဖြစ်နိုင်သည်)</div>`;
    }

    html += `</div>`;
  }

  html += `</div></body></html>`;
  return html;
}

serve(async (req) => {
  try {
    const page = await getWebPage();
    return new Response(page, { headers: { "content-type": "text/html; charset=utf-8" } });
  } catch (e) {
    return new Response("Error: " + e.message);
  }
});
