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
      <title>Video Extractor</title>
      <style>
        body { font-family: sans-serif; background: #111; color: #fff; padding: 10px; }
        .card { background: #222; margin-bottom: 30px; border-radius: 12px; padding: 10px; border: 1px solid #444; }
        h2 { font-size: 16px; margin-bottom: 10px; color: #f39c12; }
        .video-box { width: 100%; aspect-ratio: 16/9; background: #000; border-radius: 8px; overflow: hidden; }
        iframe { width: 100%; height: 100%; border: none; }
        .no-video { padding: 20px; color: #777; font-style: italic; }
      </style>
    </head>
    <body>
      <h1 style="text-align:center">Movie Stream</h1>
  `;

  for (const post of posts) {
    const content = post.content.rendered;
    
    // ၁။ Content ထဲမှာ iframe ပါလား အရင်ရှာမယ်
    // ၂။ မပါရင် Link (https://doodstream.com/e/...) တွေကို လိုက်ရှာမယ်
    const videoRegex = /https:\/\/(doodstream\.com|dood\.to|streamtape\.com|dood\.la)\/(e|v)\/[a-zA-Z0-9]+/g;
    const foundLinks = content.match(videoRegex);

    html += `<div class="card"><h2>${post.title.rendered}</h2>`;

    if (foundLinks && foundLinks.length > 0) {
      foundLinks.forEach((link: string) => {
        // Embed link ဖြစ်အောင် ပြုပြင်ခြင်း
        let embedLink = link.replace('/v/', '/e/'); 
        
        html += `
          <div class="video-box">
            <iframe 
              src="${embedLink}" 
              sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts"
              allowfullscreen>
            </iframe>
          </div>`;
      });
    } else {
      html += `<div class="no-video">ဗီဒီယို Link ရှာမတွေ့ပါ။</div>`;
    }

    html += `</div>`;
  }

  html += `</body></html>`;
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
