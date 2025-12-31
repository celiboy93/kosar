import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const SITE_URL = "https://kosargyi.com/wp-json/wp/v2/posts?per_page=10";

async function getWebPage() {
  const res = await fetch(SITE_URL);
  const posts = await res.json();

  // HTML UI စတင်တည်ဆောက်ခြင်း
  let html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>My Movie Web</title>
      <style>
        body { font-family: sans-serif; background: #111; color: white; padding: 20px; }
        .movie-card { background: #222; border-radius: 8px; padding: 15px; margin-bottom: 20px; border: 1px solid #333; }
        .movie-card h2 { font-size: 18px; color: #ff9900; }
        iframe { width: 100%; height: 250px; border-radius: 8px; margin-top: 10px; }
        .content-box { font-size: 14px; color: #ccc; line-height: 1.6; }
      </style>
    </head>
    <body>
      <h1>Kosargyi Clone (Test)</h1>
  `;

  posts.forEach((post: any) => {
    // Sandbox ထည့်ပြီး ကြော်ငြာတားထားတဲ့ iframe ကုဒ်
    const sanitizedContent = post.content.rendered.replace(
      /<iframe/g, 
      '<iframe sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts"'
    );

    html += `
      <div class="movie-card">
        <h2>${post.title.rendered}</h2>
        <div class="content-box">
          ${sanitizedContent} 
        </div>
      </div>
    `;
  });

  html += `</body></html>`;
  return html;
}

serve(async (req) => {
  const page = await getWebPage();
  return new Response(page, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
});
