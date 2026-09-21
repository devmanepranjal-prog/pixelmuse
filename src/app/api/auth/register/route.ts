import { NextResponse } from 'next/server';
import { createUser, findUserByEmail, hashPassword, sanitizeUser } from '@/lib/db/userStore';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email address and password are required.' },
        { status: 400 }
      );
    }

    const existing = findUserByEmail(email);
    if (existing) {
      return NextResponse.json(
        { error: 'An account with this email address already exists.' },
        { status: 409 }
      );
    }

    const passwordHash = hashPassword(password);
    const user = createUser(name || 'Community Member', email, passwordHash);
    const safeUser = sanitizeUser(user);

    return NextResponse.json({
      message: 'Registration successful',
      user: safeUser,
      token: `token_${user.id}_${Date.now()}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
