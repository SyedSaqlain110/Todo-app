// app/api/register/route.ts
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma'; // Using '@/lib/prisma' alias

export async function POST(request: Request) {
  try {
    const { name, username, email, password } = await request.json();

    if (!name || !username || !email || !password) {
      return NextResponse.json({ message: 'All fields are required.' }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username },
          { email: email },
        ],
      },
      select: { username: true, email: true },
    });

    if (existingUser) {
      let conflictField = '';
      if (existingUser.username === username) {
        conflictField = 'username';
      } else if (existingUser.email === email) {
        conflictField = 'email';
      }
      return NextResponse.json({ message: `${conflictField} already exists.` }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        name,
        username,
        email,
        passwordHash,
      },
      select: { id: true, name: true, username: true, email: true },
    });

    return NextResponse.json({
      message: 'Registration successful!',
      user: newUser,
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
// This code handles user registration by checking for existing users, hashing the password, and creating a new user in the database.
// It returns appropriate responses based on the success or failure of the operation.
// Ensure that the Prisma client is correctly set up and that the database schema is up to date