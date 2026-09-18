import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import { getAuthenticatedContext } from "@/lib/server-auth";
import { createClient } from "@supabase/supabase-js";
import dns from "node:dns";

// Ensure Node uses IPv4 first to prevent connect timeout on Windows IPv6
try {
  dns.setDefaultResultOrder("ipv4first");
} catch {
  // Ignore in environments where not supported
}

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
  "image/svg+xml",
]);

export async function POST(request: Request) {
  // 1. Enforce authentication — registered, active user
  const authContext = await getAuthenticatedContext();
  if (!authContext) {
    return NextResponse.json(
      { error: "Unauthorized: Please log in to upload images." },
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
        { error: "Invalid file type. Allowed formats: JPG, PNG, WEBP, GIF, SVG." },
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

    // 4. Primary: Upload to Supabase Storage bucket 'course-thumbnails'
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
          auth: { persistSession: false },
        });

        const bucketName = "course-thumbnails";
        const fileExt = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const cleanName = file.name
          .replace(/[^a-zA-Z0-9]/g, "_")
          .substring(0, 30);
        const fileName = `${Date.now()}_${cleanName}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucketName)
          .upload(fileName, buffer, {
            contentType: file.type,
            upsert: true,
          });

        if (!uploadError) {
          const { data: publicUrlData } = supabase.storage
            .from(bucketName)
            .getPublicUrl(fileName);

          if (publicUrlData?.publicUrl) {
            return NextResponse.json({ url: publicUrlData.publicUrl });
          }
        } else {
          console.warn("[api/upload] Supabase upload error:", uploadError.message);
        }
      } catch (sbErr: any) {
        console.warn("[api/upload] Supabase storage exception:", sbErr?.message || sbErr);
      }
    }

    // 5. Fallback: Cloudinary upload (if configured and valid)
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      try {
        const uploadResult = await new Promise<any>((resolve, reject) => {
          cloudinary.uploader
            .upload_stream(
              {
                folder: "aims_uploads",
                resource_type: "image",
                allowed_formats: ["jpg", "png", "jpeg", "webp", "gif", "svg"],
                max_bytes: MAX_FILE_SIZE_BYTES,
              },
              (error, result) => {
                if (error) reject(error);
                else resolve(result);
              }
            )
            .end(buffer);
        });

        if (uploadResult?.secure_url) {
          return NextResponse.json({ url: uploadResult.secure_url });
        }
      } catch (cErr: any) {
        console.error("[api/upload] Cloudinary fallback failed:", cErr?.message || cErr);
      }
    }

    return NextResponse.json(
      { error: "Failed to upload image. Please try again or use a direct image URL." },
      { status: 500 }
    );
  } catch (error: any) {
    console.error("[api/upload] Upload processing error:", error?.message || error);
    return NextResponse.json(
      { error: error?.message || "Failed to process image upload." },
      { status: 500 }
    );
  }
}
