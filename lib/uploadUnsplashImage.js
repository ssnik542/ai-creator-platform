export const uploadUnsplashImage = async (image) => {
  try {
    const response = await fetch("/api/imagekit/unsplash/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        imageUrl: image.url, // ✅ REAL image URL
        fileName: `unsplash-${image.id}.jpg`,
      }),
    });

    const result = await response.json();

    if (!response.ok || !result.url) {
      throw new Error(result.error || "Image upload failed");
    }

    return {
      success: true,
      data: {
        fileId: result.fileId,
        name: result.name,
        url: result.url,
        width: result.width,
        height: result.height,
        size: result.size,
        attribution: image.attribution,
      },
    };
  } catch (error) {
    console.error("ImageKit upload error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
