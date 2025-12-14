import { NextResponse } from "next/server";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
});

export async function POST(req) {
  try {
    const { imageUrl, fileName } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "imageUrl is required" },
        { status: 400 }
      );
    }

    const upload = await imagekit.upload({
      file: imageUrl, // ImageKit fetches directly
      fileName: fileName || "unsplash-image.jpg",
      folder: "/unsplash",
    });

    return NextResponse.json({
      success: true,
      fileId: upload.fileId,
      name: upload.name,
      url: upload.url,
      width: upload.width,
      height: upload.height,
      size: upload.size,
    });
  } catch (error) {
    console.error("ImageKit upload error:", error);
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
