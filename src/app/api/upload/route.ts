import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAuthenticatedContext } from "@/lib/server-auth";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB limit
const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  // 1. Enforce authentication — only registered, active users can upload assets
  const authContext = await getAuthenticatedContext();
  if (!authContext) {
    return NextResponse.json(
      { error: "Unauthorized: Authentication required to upload files." },
      { status: 401 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || typeof file !== "object" || !("size" in file)) {
      return NextResponse.json({ error: "No valid file provided." }, { status: 400 });
    }

    // 2. Validate MIME type
    if (!ALLOWED_MIME_TYPES.has(file.type)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed formats: JPG, PNG, WEBP, GIF." },
        { status: 400 }
      );
    }

    // 3. Enforce maximum file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: "File exceeds maximum permitted size of 5MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 4. Secure upload via stream with explicit resource constraints
    const uploadResult = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          {
            folder: "aims_uploads",
            resource_type: "image",
            allowed_formats: ["jpg", "png", "jpeg", "webp", "gif"],
            max_bytes: MAX_FILE_SIZE_BYTES,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error: any) {
    console.error("[api/upload] Upload processing error:", error?.message || error);
    return NextResponse.json(
      { error: "Failed to process image upload. Please try again with a valid image file." },
      { status: 500 }
    );
  }
}
