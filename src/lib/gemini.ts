import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface BookCoverData {
  title: string;
  author: string;
  subtitle: string;
  visualDescription: string;
  imageUrl?: string;
}

export async function generateBookDetails(theme: string): Promise<BookCoverData> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate book details for a book with the theme: "${theme}". 
    Return a JSON object with:
    - title: A creative book title.
    - author: A fictional author name.
    - subtitle: A compelling subtitle.
    - visualDescription: A detailed description for an AI image generator to create a book cover illustration matching the theme and title.
    
    The language should be Indonesian if the theme is in Indonesian, otherwise English.`,
    config: {
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text || "{}");
}

export async function generateCoverImage(description: string): Promise<string> {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: {
      parts: [
        {
          text: `A professional book cover illustration, high quality, artistic style: ${description}. No text on the image.`,
        },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "3:4",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }

  throw new Error("Failed to generate image");
}
