import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET as string;

function base64UrlDecode(str: string): Uint8Array {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function decodeJwtPayload(payloadB64: string) {
  let base64 = payloadB64.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  const json = decodeURIComponent(
    atob(base64)
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(json);
}

async function verifyJwt(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, signatureB64] = parts;

    const payload = decodeJwtPayload(payloadB64);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return false;
    }

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const data = encoder.encode(`${headerB64}.${payloadB64}`);
    const signatureBytes = base64UrlDecode(signatureB64);

    return await crypto.subtle.verify('HMAC', key, signatureBytes as any, data);
  } catch (error) {
    console.error('JWT verification error in middleware:', error);
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // ==========================================
  // 1. ADMIN ROUTE PROTECTION
  // ==========================================
  const isAdminRoute = pathname.startsWith('/admin');
  
  if (isAdminRoute) {
    const adminToken = request.cookies.get('adminToken')?.value;
    const isAdminValid = adminToken ? await verifyJwt(adminToken, JWT_SECRET) : false;
    const isAdminLoginRoute = pathname === '/admin/login';

    if (isAdminLoginRoute) {
      // If admin is already logged in, redirect them to dashboard
      if (isAdminValid) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    // For all other /admin routes, block unauthenticated access
    if (!isAdminValid) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    
    return NextResponse.next();
  }

  // ==========================================
  // 2. CUSTOMER ROUTE PROTECTION
  // ==========================================
  // Define which paths require a customer to be logged in
  const isCustomerProtectedRoute = pathname.startsWith('/profile') || pathname.startsWith('/checkout');
  
  if (isCustomerProtectedRoute) {
    const customerToken = request.cookies.get('customerToken')?.value;
    const isCustomerValid = customerToken ? await verifyJwt(customerToken, JWT_SECRET) : false;

    if (!isCustomerValid) {
      // Redirect unauthenticated customers to the home page
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }
    
    return NextResponse.next();
  }

  // Allow all other public routes
  return NextResponse.next();
}

export const config = {
  // Add your protected customer routes to the matcher
  matcher: [
    '/admin/:path*', 
    '/profile/:path*', 
    '/checkout/:path*'
  ],
};
