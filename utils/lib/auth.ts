import { verifyToken } from "@/utils/lib/jwt";
import dbConnect from "@/utils/lib/dbConnect";
import Admin from "@/utils/models/Admin";

export async function verifyAdmin(req: Request) {
  try {
    await dbConnect();
    
    let token = "";
    
    // 1. Try to read from Authorization header
    const authHeader = req.headers.get("Authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }
    
    // 2. Try to read from Cookie header if not found in Authorization header
    if (!token) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/adminToken=([^;]+)/);
        if (match) {
          token = match[1];
        }
      }
    }
    
    if (!token) {
      return null;
    }
    
    const decoded = verifyToken(token) as any;
    if (!decoded || !decoded.id) {
      return null;
    }
    
    const admin = await Admin.findById(decoded.id).select("-password");
    return admin;
  } catch (error) {
    console.error("verifyAdmin helper error:", error);
    return null;
  }
}
