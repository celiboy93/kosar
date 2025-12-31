// main.ts
const SITE_URL = "https://kosargyi.com/wp-json/wp/v2/posts?per_page=5";

async function fetchPosts() {
  console.log("Fetching data from Kosargyi...");
  try {
    const response = await fetch(SITE_URL);
    if (!response.ok) throw new Error("Server error");
    
    const posts = await response.json();

    posts.forEach((post: any) => {
      // Ads တွေပါနိုင်တဲ့ iframe ထဲကို sandbox ထည့်တဲ့အပိုင်း
      const cleanContent = post.content.rendered.replace(
        /<iframe/g, 
        '<iframe sandbox="allow-forms allow-pointer-lock allow-same-origin allow-scripts"'
      );

      console.log("================================");
      console.log("ခေါင်းစဉ်:", post.title.rendered);
      console.log("လင့်ခ်:", post.link);
      console.log("Content (Sanitized):", cleanContent.substring(0, 100) + "..."); 
    });
  } catch (error) {
    console.error("Error:", error);
  }
}

fetchPosts();
