import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

// _embed ထည့်ထားမှ Title နဲ့ အချက်အလက်တွေ အစုံရမှာပါ
const API_URL = "https://kosargyi.com/wp-json/wp/v2/posts?per_page=10&_embed";

async function getMovies() {
  try {
    const response = await fetch(API_URL, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      }
    });
    
    if (!response.ok) return [];
    const posts = await response.json();
    
    return posts.map((post: any) => {
      const content = post.content.rendered;
      
      // MP4 Link တွေကို ပိုစုံအောင် ရှာမယ် (Wasabi, S3, Direct MP4)
      const mp4Regex = /https?:\/\/[^\s"'<>]+?\.(mp4|m3u8|webm|mov)/gi;
      let foundLinks = content.match(mp4Regex) || [];

      // Doodstream/Streamtape Link တွေပါ ရှာမယ်
      const embedRegex = /https?:\/\/(doodstream\.com|dood\.to|streamtape\.com|dood\.la|doods\.pro)\/(e|v)\/[a-zA-Z0-9]+/gi;
      const embedLinks = content.match(embedRegex) || [];

      // Link အားလုံးကို ပေါင်းလိုက်မယ်
      const allLinks = [...new Set([...foundLinks, ...embedLinks])];

      return {
        title: post.title.rendered,
        videoUrl: allLinks.length > 0 ? allLinks[0] : null,
        rawContent: content // အရန်သင့်ထားတာပါ
      };
    });
  } catch (e) {
    console.error(e);
    return [];
  }
}

serve(async (req) => {
  const movies = await getMovies();

  let htmlResponse = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KSG Player</title>
      <style>
        body { background: #000; color: #fff; font-family: sans-serif; padding: 10px; margin: 0; }
        .card { background: #111; border: 1px solid #333; margin-bottom: 20px; border-radius: 10px; overflow: hidden; }
        h2 { font-size: 15px; padding: 10px; color: #ff9900; margin: 0; }
        video, iframe { width: 100%; aspect-ratio: 16/9; display: block; border: none; }
        .no-video { padding: 20px; color: #666; font-size: 13px; text-align: center; }
      </style>
    </head>
    <body>
      <h1 style="text-align:center; font-size: 20px;">KSG New Update</h1>
  `;

  if (movies.length === 0) {
    htmlResponse += `<div class="no-video">Data ဆွဲယူ၍ မရပါ။ ခဏနေမှ ပြန်စမ်းကြည့်ပါ။</div>`;
  }

  movies.forEach(movie => {
    htmlResponse += `<div class="card"><h2>${movie.title}</h2>`;
    
    if (movie.videoUrl) {
      if (movie.videoUrl.includes('.mp4') || movie.videoUrl.includes('.m3u8')) {
        // Direct MP4 Player
        htmlResponse += `
          <video controls preload="none">
            <source src="${movie.videoUrl}" type="video/mp4">
          </video>`;
      } else {
        // Embed Player (Doodstream etc.)
        const embedUrl = movie.videoUrl.replace('/v/', '/e/');
        htmlResponse += `
          <iframe src="${embedUrl}" sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts" allowfullscreen></iframe>`;
      }
    } else {
      htmlResponse += `<div class="no-video">ဗီဒီယို Link ရှာမတွေ့ပါ။</div>`;
    }
    htmlResponse += `</div>`;
  });

  htmlResponse += `</body></html>`;

  return new Response(htmlResponse, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
});
