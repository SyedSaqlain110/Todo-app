// src/app/api/todos/[id]/route.ts
// This dynamic API route handles operations on a single task by its ID.

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma'; // Import the Prisma Client singleton

// Define the PATCH handler for updating an existing task
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    // FIX: Await params before accessing its properties, as recommended by Next.js.
    const awaitedParams = await params;
    const taskId = parseInt(awaitedParams.id, 10); // Use awaitedParams.id

    // Validate if taskId is a valid number
    if (isNaN(taskId)) {
      return NextResponse.json({ message: 'Invalid task ID format.' }, { status: 400 }); // Bad Request
    }

    // Extract the fields to update from the request body.
    const { completed, title, isImportant, userId } = await request.json();

    // Prepare data for update: only include fields that are actually provided in the request body.
    const updateData: { completed?: boolean; title?: string; isImportant?: boolean } = {};
    if (typeof completed === 'boolean') {
      updateData.completed = completed;
    }
    if (typeof title === 'string' && title.trim() !== '') {
      updateData.title = title.trim();
    }
    if (typeof isImportant === 'boolean') {
      updateData.isImportant = isImportant;
    }

    // If no valid fields are provided for update, return a bad request.
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ message: 'No valid fields provided for update.' }, { status: 400 });
    }

    // Add a security check to ensure the user making the request owns the task.
    if (!userId || typeof userId !== 'number') {
      return NextResponse.json({ message: 'User ID is required for authorization.' }, { status: 401 }); // Unauthorized
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json({ message: 'Task not found.' }, { status: 404 });
    }

    // Ensure the task belongs to the authenticated user
    if (existingTask.userId !== userId) {
      return NextResponse.json({ message: 'Unauthorized to update this task.' }, { status: 403 }); // Forbidden
    }

    // Update the task in the database using Prisma.
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: updateData,
    });

    // Return the updated task object as a JSON response.
    return NextResponse.json(updatedTask, { status: 200 }); // 200 OK
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}

// --- DELETE handler: Deletes an existing task (Optional, for future expansion) ---
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    // FIX: Await params before accessing its properties.
    const awaitedParams = await params;
    const taskId = parseInt(awaitedParams.id, 10); // Use awaitedParams.id

    if (isNaN(taskId)) {
      return NextResponse.json({ message: 'Invalid task ID format.' }, { status: 400 });
    }

    const { userId } = await request.json(); // Or retrieve from headers/auth token
    if (!userId || typeof userId !== 'number') {
      return NextResponse.json({ message: 'User ID is required for authorization.' }, { status: 401 });
    }

    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!existingTask) {
      return NextResponse.json({ message: 'Task not found.' }, { status: 404 });
    }

    if (existingTask.userId !== userId) {
      return NextResponse.json({ message: 'Unauthorized to delete this task.' }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: 'Task deleted successfully.' }, { status: 200 }); // 200 OK
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ message: 'Internal server error.' }, { status: 500 });
  }
}
// Note: The DELETE handler is optional and can be expanded in the future as needed.
// This code provides a robust API for updating and deleting tasks, ensuring proper validation and security checks.
// The PATCH handler updates a task, while the DELETE handler removes it.
// Both handlers ensure that the user making the request is authorized to perform the operation on the task
// based on their user ID.
// The code uses Prisma for database operations and Next.js's NextResponse for handling HTTP responses.
// The PATCH handler is designed to be flexible, allowing updates to specific fields of a task,
// while the DELETE handler provides a straightforward way to remove a task from the database.  