    // src/app/api/todos/route.ts
    // This file defines the API endpoints for managing user tasks.

    import { NextResponse } from 'next/server';
    import prisma from '@/lib/prisma'; // Import the Prisma Client singleton

    // --- POST handler: Adds a new task for a specific user ---
    export async function POST(request: Request) {
      try {
        // Extract 'title' (task description) and 'userId' from the request body.
        // The 'userId' is expected to come from the frontend's localStorage after login.
        const { title, userId } = await request.json();

        // Server-side validation for the incoming data.
        // Ensure title is a non-empty string.
        if (!title || typeof title !== 'string' || title.trim() === '') {
          return NextResponse.json({ message: 'Task title is required and must be a non-empty string.' }, { status: 400 }); // Bad Request
        }
        // Ensure userId is a number.
        if (!userId || typeof userId !== 'number') {
          return NextResponse.json({ message: 'User ID is required and must be a number.' }, { status: 400 }); // Bad Request
        }

        // Security Check: Verify that the provided userId corresponds to an existing user in the database.
        // This prevents creating tasks for non-existent users or by unauthorized attempts.
        const existingUser = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (!existingUser) {
          return NextResponse.json({ message: 'User not found.' }, { status: 404 }); // Not Found
        }

        // Create the new task record in the database using Prisma.
        // The 'userId' links this task to the specific user.
        const newTask = await prisma.task.create({
          data: {
            title,
            userId, // Assign the task to the verified user ID
            completed: false, // New tasks default to not completed
          },
        });

        // Return the newly created task object as a JSON response.
        return NextResponse.json(newTask, { status: 201 }); // 201 Created status indicates successful resource creation
      } catch (error) {
        // Log the error for server-side debugging.
        console.error('Error adding task:', error);
        // Return a generic internal server error message to the client for unexpected issues.
        return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
      }
    }

    // --- GET handler: Fetches all tasks for a specific user ---
    export async function GET(request: Request) {
      try {
        // Extract 'userId' from the URL query parameters.
        // Example URL: /api/todos?userId=123
        const { searchParams } = new URL(request.url);
        const userIdParam = searchParams.get('userId');

        // Validation: Ensure 'userId' query parameter is provided.
        if (!userIdParam) {
          return NextResponse.json({ message: 'User ID is required as a query parameter.' }, { status: 400 }); // Bad Request
        }

        // Convert the 'userId' string parameter to an integer.
        const userId = parseInt(userIdParam, 10);

        // Validation: Ensure the parsed 'userId' is a valid number.
        if (isNaN(userId)) {
          return NextResponse.json({ message: 'Invalid User ID format.' }, { status: 400 }); // Bad Request
        }

        // Retrieve all tasks associated with the specified user ID from the database using Prisma.
        // Tasks are ordered by their creation date for consistent display.
        const tasks = await prisma.task.findMany({
          where: { userId: userId }, // Filter tasks by the user's ID
          orderBy: { createdAt: 'asc' }, // Order tasks from oldest to newest
        });

        // Return the list of tasks as a JSON response.
        return NextResponse.json(tasks, { status: 200 }); // 200 OK status indicates successful retrieval
      } catch (error) {
        // Log the error for server-side debugging.
        console.error('Error fetching tasks:', error);
        // Return a generic internal server error message to the client for unexpected issues.
        return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
      }
    }
    