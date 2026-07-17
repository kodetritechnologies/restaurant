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

async function verifyJwt(token: string, secret: string): Promise<any | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const payload = decodeJwtPayload(payloadB64);

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
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

    const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes as any, data);
    return isValid ? payload : null;
  } catch (error) {
    console.error('JWT verification error in middleware:', error);
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
  const isApiRoute = pathname.startsWith('/api/');

  if (isAdminRoute) {
    const adminToken = request.cookies.get('adminToken')?.value;
    const adminPayload = adminToken ? await verifyJwt(adminToken, JWT_SECRET) : null;
    const isAdminValid = !!adminPayload;
    const isAdminLoginRoute = pathname === '/admin/login';

    if (isAdminLoginRoute) {
      if (isAdminValid) {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.next();
    }

    if (!isAdminValid) {
      if (isApiRoute) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    return NextResponse.next();
  }

  const isCustomerProtectedRoute = pathname.startsWith('/profile');

  if (isCustomerProtectedRoute) {
    const customerToken = request.cookies.get('customerToken')?.value;
    const customerPayload = customerToken ? await verifyJwt(customerToken, JWT_SECRET) : null;
    const isCustomerValid = !!customerPayload;

    if (!isCustomerValid) {
      const homeUrl = new URL('/', request.url);
      return NextResponse.redirect(homeUrl);
    }

    return NextResponse.next();
  }

  const isCustomerApiRoute = pathname.startsWith('/api/customer');

  if (isCustomerApiRoute) {
    const customerToken = request.cookies.get('customerToken')?.value;
    const requestHeaders = new Headers(request.headers);
    
    if (customerToken) {
      const payload = await verifyJwt(customerToken, JWT_SECRET);
      if (payload && payload.id) {
        requestHeaders.set('x-customer-id', payload.id);
        requestHeaders.set('x-customer-email', payload.email || '');
      }
    }

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      }
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/profile/:path*',
    '/api/customer/:path*',
  ],
};
