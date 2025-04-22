import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {

  console.log(request.nextUrl);
    const res = NextResponse.next();
    res.headers.append('ACCESS-CONTROL-ALLOW-ORIGIN', '*');
    res.headers.append('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.headers.append('Access-Control-Allow-Headers', 'authorization, x-client-info, apikey, content-type');
    return res; 
  
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
