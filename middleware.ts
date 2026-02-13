import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  console.log(request.headers)
  // Add custom middleware logic here
  return NextResponse.next()
}

export const config = {
  matcher: [
  ],
}