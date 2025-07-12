// app/api/login/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma'; // Using '@/lib/prisma' alias

export async function POST(request: Request) {
  try {
    const { identifier, password } = await request.json();

    if (!identifier || !password) {
      return NextResponse.json({ message: 'Username/Email and password are required.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { email: identifier },
        ],
      },
      select: { id: true, name: true, username: true, email: true, passwordHash: true },
    });

    if (!user) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return NextResponse.json({ message: 'Invalid credentials.' }, { status: 401 });
    }

    const { passwordHash, ...userData } = user;

    return NextResponse.json({
      message: 'Login successful!',
      user: userData,
    }, { status: 200 });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
// This code handles user login by checking the provided credentials against the database.
// It returns appropriate responses based on the success or failure of the operation.
// Ensure that the Prisma client is correctly set up and that the database schema is up to date
// and that the bcrypt library is installed for password hashing and comparison.