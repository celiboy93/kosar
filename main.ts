import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const SITE_URL = "https://kosargyi.com/wp-json/wp/v2/posts?per_page=5";

async function getPosts() {
  const response = await fetch(SITE_URL);
  const posts = await response.json();
  return posts;
}

// Deno Deploy အတွက် HTTP Server တစ်ခုအဖြစ် ပြောင်းလိုက်တာပါ
serve(async (req) => {
  try {
    const posts = await getPosts();
    return new Response(JSON.stringify(posts, null, 2), {
      headers: { "content-type": "application/json; charset=utf-8" },
    });
  } catch (err) {
    return new Response("Error fetching data", { status: 500 });
  }
});
