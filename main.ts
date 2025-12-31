
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// API URL (Embed data ပါအောင် _embed parameter ထည့်ထားပါတယ်)
const SITE_URL = "https://kosargyi.com/wp-json/wp/v2/posts?per_page=10&_embed";

async function getWebPage() {
  const res = await fetch(SITE_URL);
  const posts = await res.json();

  let html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Video Test</title>
      <style>
        body { font-family: sans-serif; background: #000; color: #fff; text-align: center; padding: 10px; }
        .card { background: #1a1a1a; margin-bottom: 30px; border-radius: 10px; overflow: hidden; padding-bottom: 15px; border: 1px solid #333; }
        h2 { font-size: 16px; padding: 10px; color: #eee; }
        /* ဗီဒီယိုအကွက်ကို အပြည့်ပေါ်အောင် လုပ်တာပါ */
        .video-container { position: relative; width: 100%; height: 0; padding-bottom: 56.25%; background: #000; }
        .video-container iframe { position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; }
      </style>
    </head>
    <body>
      <h1>New Movies</h1>
  `;

  for (const post of posts) {
    // တစ်ခါတလေ iframe က oembed link အနေနဲ့ လာတတ်လို့ အဲ့ဒါကို လိုက်ရှာတာပါ
    let videoHtml = post.content.rendered;

    // Sandbox ထည့်ပြီး ကြော်ငြာပိတ်မယ်
    const safeVideo = videoHtml.replace(/<iframe/g, '<iframe sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts"');

    html += `
      <div class="card">
        <h2>${post.title.rendered}</h2>
        <div class="video-container">
          ${safeVideo}
        </div>
      </div>
    `;
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
