import { NextResponse } from "next/server";
import { getPaginatedData } from "@/utils/lib/pagination";
import dbConnect from "@/utils/lib/dbConnect";
import Message from "@/utils/models/Message";
import { verifyAdmin } from "@/utils/lib/auth";

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { name, email, subject, message } = await req.json();

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: "Please fill in all required fields." },
        { status: 400 }
      );
    }

    const newMessage = await Message.create({
      name,
      email,
      subject,
      message,
    });

    return NextResponse.json(
      { success: true, message: "Message sent successfully.", messageData: newMessage },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Create Message Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error sending message.", error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    await dbConnect();
    
    // Parse filters
    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const search = url.searchParams.get("search");

    let query: any = {};
    if (status && status !== "All") {
      query.status = status;
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { subject: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }

    const page = url.searchParams.get("page");
    const limit = url.searchParams.get("limit");

    const { data: messages, totalCount, totalPages, currentPage } = await getPaginatedData(
      Message,
      query,
      { page, limit },
      { createdAt: -1 }
    );

    return NextResponse.json(
      { 
        success: true, 
        count: messages.length, 
        totalCount,
        totalPages,
        currentPage,
        messages 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("List Messages Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error loading messages.", error: error.message },
      { status: 500 }
    );
  }
}
