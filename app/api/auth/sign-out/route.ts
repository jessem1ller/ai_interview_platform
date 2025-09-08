import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true });

    response.cookies.delete('session');

    return response;
  } catch (error) {
    console.error("Sign-out error:", error);
    return NextResponse.json({ success: false, error: 'Failed to sign out' }, { status: 500 });
  }
}