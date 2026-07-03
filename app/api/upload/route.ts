import { NextResponse } from "next/server";
import { verifyAdmin } from "@/utils/lib/auth";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized credentials." },
        { status: 401 }
      );
    }

    const { file } = await req.json();
    if (!file) {
      return NextResponse.json(
        { success: false, message: "No file content provided." },
        { status: 400 }
      );
    }

    const cloudName = process.env.cloud_name;
    const apiKey = process.env.cloud_api_key;
    const apiSecret = process.env.cloud_secret;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json(
        { success: false, message: "Cloudinary credentials missing in environment." },
        { status: 500 }
      );
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const folder = "restaurant";

    // Alphabetically sorted parameters to sign
    const signatureString = `folder=${folder}&timestamp=${timestamp}${apiSecret}`;
    const signature = crypto
      .createHash("sha1")
      .update(signatureString)
      .digest("hex");

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          file,
          api_key: apiKey,
          timestamp,
          signature,
          folder,
        }),
      }
    );

    const data = await response.json();
    if (data.error) {
      console.error("Cloudinary upload failed:", data.error);
      return NextResponse.json(
        { success: false, message: data.error.message || "Cloudinary upload failed." },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: true, url: data.secure_url, public_id: data.public_id },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Upload API Error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to upload image.", error: error.message },
      { status: 500 }
    );
  }
}
