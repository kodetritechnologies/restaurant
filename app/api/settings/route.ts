import { NextResponse } from "next/server";
import dbConnect from "@/utils/lib/dbConnect";
import Setting from "@/utils/models/Setting";
import { verifyAdmin } from "@/utils/lib/auth";

export async function GET() {
  try {
    await dbConnect();
    let settings = await Setting.findOne({});
    if (!settings) {
      // Seed default settings with all fallback defaults
      settings = await Setting.create({
        showBanner: false,
        bannerText: "",
        shopPhone: "+33 1 45 67 89 00",
        shopEmail: "reserve@aurea.dining",
        shopAddress: "12 Rue de l'Élégance, 75008 Paris",
        shortHours: "Tue–Sun · 17:00 – 23:30",
        openHoursTueFri: "Tuesday – Friday · 17:00 – 23:00",
        openHoursSatSun: "Saturday – Sunday · 12:00 – 23:30",
        openHoursMon: "Monday · Closed",
        instagramUsername: "aurea.dining",
        facebookUsername: "aurea.dining",
        twitterUsername: "aurea.dining",
      });
    }

    return NextResponse.json(
      { success: true, settings },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Get Settings Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error getting settings.", error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await verifyAdmin(req);
    if (!admin) {
      return NextResponse.json(
        { success: false, message: "Unauthorized." },
        { status: 401 }
      );
    }

    const body = await req.json();

    await dbConnect();
    let settings = await Setting.findOne({});
    if (!settings) {
      settings = await Setting.create(body);
    } else {
      // Dynamically copy fields from request body to document
      Object.keys(body).forEach((key) => {
        if (key !== "_id" && key !== "createdAt" && key !== "updatedAt" && key !== "__v") {
          settings[key] = body[key];
        }
      });
      await settings.save();
    }

    return NextResponse.json(
      { success: true, message: "Settings updated successfully.", settings },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Update Settings Error:", error);
    return NextResponse.json(
      { success: false, message: "Server error updating settings.", error: error.message },
      { status: 500 }
    );
  }
}
