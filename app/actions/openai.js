"use server";
import ImageKit from "imagekit";
import { stripCodeFences } from "@/lib/utils";
const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});
import OpenAI from "openai";
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateBlogContent(title, category = "", tags = []) {
  try {
    if (!title || title.trim().length === 0) {
      throw new Error("Title is required to generate content");
    }

    const prompt = `
Write a comprehensive blog post with the title: "${title}"

${category ? `Category: ${category}` : ""}
${tags.length > 0 ? `Tags: ${tags.join(", ")}` : ""}

Requirements:
- Write engaging, informative content that matches the title
- Use proper HTML formatting with headers (h2, h3), paragraphs, lists, and emphasis
- Include 3–5 main sections with clear subheadings
- Write in a conversational yet professional tone
- Make it approximately 800–1200 words
- Include practical insights, examples, or actionable advice where relevant
- Use <h2> for main sections and <h3> for subsections
- Use <p> tags for paragraphs
- Use <ul> and <li> for bullet points when appropriate
- Use <strong> and <em> for emphasis
- Ensure the content is original and valuable to readers

Do not include the title in the content.
Start directly with the introduction paragraph.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content?.trim();

    if (!content || content.length < 100) {
      throw new Error("Generated content is too short or empty");
    }

    return {
      success: true,
      content,
    };
  } catch (error) {
    console.error("OpenAI Error:", error);

    if (error.message?.includes("API key")) {
      return {
        success: false,
        error: "AI service configuration error. Please try again later.",
      };
    }

    if (error.message?.includes("quota") || error.message?.includes("limit")) {
      return {
        success: false,
        error: "AI service is temporarily unavailable. Please try again later.",
      };
    }

    return {
      success: false,
      error: error.message || "Failed to generate content. Please try again.",
    };
  }
}

export async function improveContent(
  currentContent,
  improvementType = "enhance"
) {
  try {
    if (!currentContent || currentContent.trim().length === 0) {
      throw new Error("Content is required for improvement");
    }

    let prompt = "";

    switch (improvementType) {
      case "expand":
        prompt = `
Take this blog content and expand it with more details, examples, and insights:${currentContent}

Requirements:
- Keep the existing structure and main points
- Add more depth and detail to each section
- Include practical examples and insights
- Maintain the original tone and style
- Return the improved content in the same HTML format
`;
        break;

      case "simplify":
        prompt = `
Take this blog content and make it more concise and easier to read:${currentContent}

Requirements:
- Keep all main points but make them clearer
- Remove unnecessary complexity
- Use simpler language where possible
- Maintain the HTML formatting
- Keep the essential information
`;
        break;

      default: // enhance
        prompt = `
Improve this blog content by making it more engaging and well-structured:${currentContent}

Requirements:
- Improve the flow and readability
- Add engaging transitions between sections
- Enhance with better examples or explanations
- Maintain the original HTML structure
- Keep the same length approximately
- Make it more compelling to read
`;
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
    });

    const raw = response.choices[0]?.message?.content?.trim();
    const improvedContent = stripCodeFences(raw);
    if (!improvedContent) {
      throw new Error("AI returned empty content");
    }

    return {
      success: true,
      content: improvedContent,
    };
  } catch (error) {
    console.error("Content improvement error:", error);

    return {
      success: false,
      error: error.message || "Failed to improve content. Please try again.",
    };
  }
}

export async function generateAndUploadImage(prompt) {
  if (!prompt?.trim()) {
    return { success: false, error: "Prompt is required" };
  }

  // 1️⃣ Generate image with OpenAI
  const imageResponse = await openai.images.generate({
    model: "gpt-image-1",
    prompt,
    size: "1024x1024",
  });

  const base64Image = imageResponse.data[0].b64_json;

  // 2️⃣ Upload to ImageKit
  const uploadResponse = await imagekit.upload({
    file: base64Image,
    fileName: `ai-${Date.now()}.png`,
    folder: "/ai-generated",
  });

  return {
    success: true,
    url: uploadResponse.url,
    fileId: uploadResponse.fileId,
  };
}
