'use client';

import React, { useEffect, useState, FC } from 'react';
import { useRouter } from 'next/navigation'; // For programmatic redirection
import Link from 'next/link'; // For logout link (or other navigation)

// Define types for data structures (repeated for clarity in this file)
interface UserData {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface Task {
  id: number;
  title: string;
  completed: boolean;
  createdAt: string; // Date string from backend
  userId: number;
}

// Define a type for the possible views within the Todo app itself
type TodoAppView = 'all' | 'important' | 'completed';

const TodosPage: FC = () => {
  const router = useRouter();

  // State for authenticated user data (from localStorage)
  const [user, setUser] = useState<UserData | null>(null);
  // State for the list of tasks fetched from the backend
  const [tasks, setTasks] = useState<Task[]>([]);
  // State for the input field when adding a new task
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  // State for initial loading (checking auth, fetching initial tasks)
  const [loading, setLoading] = useState<boolean>(true);
  // State for showing a loading indicator specifically when adding a task
  const [addingTask, setAddingTask] = useState<boolean>(false);
  // State for displaying success or error messages to the user
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  // State to manage the currently selected view in the sidebar (e.g., All, Important, Completed)
  const [currentTodoView, setCurrentTodoView] = useState<TodoAppView>('all'); // Initialize to 'all' tasks

  // --- useEffect for Authentication Check and Initial Task Fetch ---
  useEffect(() => {
    const loadUserDataAndTasks = async () => {
      setLoading(true); // Start initial loading indicator
      setMessage(null); // Clear any previous messages

      // Crucial check: Ensure this code runs only in the browser environment
      if (typeof window === 'undefined') {
        router.push('/login'); // If somehow on server, redirect
        return;
      }

      const storedUser = localStorage.getItem('user'); // Attempt to retrieve user data from localStorage

      if (storedUser) { // If user data is found
        try {
          const parsedUser: UserData = JSON.parse(storedUser);
          setUser(parsedUser); // Set the user state

          // Fetch tasks for the logged-in user immediately after user data is loaded
          await fetchTasks(parsedUser.id);
        } catch (e) {
          console.error("Failed to parse user data from localStorage or fetch tasks", e);
          localStorage.removeItem('user'); // Clear corrupted data
          router.push('/login'); // Redirect to login page
        }
      } else {
        // If no user data found in localStorage, user is not authenticated
        router.push('/login'); // Redirect unauthenticated user to the login page
      }
      setLoading(false); // End initial loading
    };

    loadUserDataAndTasks(); // Call the async function
  }, [router]); // Dependency array: useEffect runs when 'router' object changes (typically once on mount)

  // --- Function to Fetch Tasks from the Backend API ---
  const fetchTasks = async (userId: number) => {
    try {
      const response = await fetch(`/api/todos?userId=${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setTasks(data); // Set the tasks state with the fetched data (array of Task objects)
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to fetch tasks.' });
      }
    } catch (error) {
      console.error('Network error fetching tasks:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred while fetching tasks.' });
    }
  };

  // --- Handler for Adding a New Task ---
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission (page reload)
    setMessage(null); // Clear any previous messages
    setAddingTask(true); // Activate adding task loading state

    // Client-side validation for the new task title
    if (!newTaskTitle.trim()) {
      setMessage({ type: 'error', text: 'Task title cannot be empty.' });
      setAddingTask(false);
      return;
    }

    // Safeguard: Ensure user is logged in before attempting to add a task
    if (!user) {
      setMessage({ type: 'error', text: 'User not logged in. Please refresh or log in again.' });
      setAddingTask(false);
      router.push('/login'); // Redirect if user somehow becomes null
      return;
    }

    try {
      // Make a POST request to the backend API to add a new task
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send the task title and the current user's ID
        body: JSON.stringify({ title: newTaskTitle, userId: user.id }),
      });

      const data = await response.json(); // Parse the JSON response from the backend

      if (response.ok) {
        setMessage({ type: 'success', text: 'Task added successfully!' });
        setNewTaskTitle(''); // Clear the input field after successful addition
        // Re-fetch all tasks to update the list with the newly added task
        await fetchTasks(user.id);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add task.' });
      }
    } catch (error) {
      console.error('Network error adding task:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred while adding task.' });
    } finally {
      setAddingTask(false); // Deactivate adding task loading state
    }
  };

  // --- Handler for User Logout ---
  const handleLogout = () => {
    // Ensure code runs only in the browser environment
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user'); // Remove user data from local storage
    }
    router.push('/login'); // Redirect to login page
  };

  // --- Function to Filter Tasks based on currentTodoView ---
  const getFilteredTasks = (): Task[] => {
    switch (currentTodoView) {
      case 'all':
        return tasks; // Show all tasks
      case 'important':
        // TODO: Implement 'important' logic (e.g., add an 'isImportant' field to Task model)
        return tasks; // Placeholder: show all tasks for 'important' view until implemented
      case 'completed':
        return tasks.filter(task => task.completed); // Filter for completed tasks
      default:
        return tasks;
    }
  };

  // --- Function to Determine Main Content Title ---
  const getMainContentTitle = (): string => {
    switch (currentTodoView) {
      case 'all':
        return 'All Tasks';
      case 'important':
        return 'Important Tasks';
      case 'completed':
        return 'Completed Tasks';
      default:
        return '';
    }
  };

  // --- Conditional Rendering for Initial Loading ---
  // Display a loading message while user data and tasks are being fetched
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center font-inter">
        <p className="text-gray-700 text-lg">Loading your tasks...</p>
      </div>
    );
  }

  // If 'user' is null after loading, it means they were redirected by useEffect,
  // so we return null to prevent rendering the app content briefly.
  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-green-50 font-inter"> {/* Overall container with a light green background */}
      {/* Left Pane (Sidebar) */}
      <div className="w-64 bg-green-100 p-6 flex flex-col rounded-l-lg shadow-md"> {/* Sidebar styling */}
        {/* Logo and Title */}
        <div className="flex items-center mb-10">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-green-700 mr-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
          <h1 className="text-3xl font-semibold text-green-800">TO-DO</h1>
        </div>

        {/* Navigation Items */}
        <nav className="space-y-4">
          <button
            className={`flex items-center w-full px-4 py-3 rounded-lg text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors duration-200 ${
              currentTodoView === 'all' ? 'bg-green-200' : ''
            }`}
            onClick={() => setCurrentTodoView('all')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="text-lg font-medium">All Tasks</span>
          </button>
          <button
            className={`flex items-center w-full px-4 py-3 rounded-lg text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors duration-200 ${
              currentTodoView === 'important' ? 'bg-green-200' : ''
            }`}
            onClick={() => setCurrentTodoView('important')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.324 1.144l1.519 4.674c.3.921-.755 1.688-1.539 1.144l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.544-1.839-.223-1.539-1.144l1.519-4.674a1 1 0 00-.324-1.144L2.92 8.092c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z"
              />
            </svg>
            <span className="text-lg font-medium">Important</span>
          </button>
          <button
            className={`flex items-center w-full px-4 py-3 rounded-lg text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors duration-200 ${
              currentTodoView === 'completed' ? 'bg-green-200' : ''
            }`}
            onClick={() => setCurrentTodoView('completed')}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 mr-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            <span className="text-lg font-medium">Completed</span>
          </button>
        </nav>
      </div>

      {/* Right Pane (Main Content) */}
      <div className="flex-1 bg-white p-8 flex flex-col rounded-r-lg shadow-md"> {/* Main content area styling */}
        {/* Top Bar for Main Content - Contains Title, Settings Icon, and Logout Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-700">
            {user?.name}'s {getFilteredTasks().length} {getMainContentTitle()}
          </h2>
          <div className="flex items-center space-x-4"> {/* Group settings icon and logout button */}
            {/* Settings icon - Placeholder, no functionality */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-gray-400 cursor-pointer hover:text-gray-600 transition-colors duration-200"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {/* Logout Button - Moved here */}
            <button
              onClick={handleLogout}
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Message Display Area (Success/Error) */}
        {message && (
          <div className={`p-3 mb-4 rounded-md text-sm ${
            message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {message.text}
          </div>
        )}

        {/* Add New Task Form (only visible on 'All Tasks' view) */}
        {currentTodoView === 'all' && (
          <form onSubmit={handleAddTask} className="flex gap-2 mb-8">
            <input
              type="text"
              placeholder="Add a new task..."
              className="flex-grow px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              disabled={addingTask}
            />
            <button
              type="submit"
              className="py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={addingTask}
            >
              {addingTask ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        )}

        {/* Task List Display */}
        {getFilteredTasks().length === 0 && !loading ? (
          <p className="text-center text-gray-600">No tasks yet. Add one above!</p>
        ) : (
          <ul className="space-y-3">
            {getFilteredTasks().map((task) => (
              <li key={task.id} className="flex items-center bg-gray-50 p-4 rounded-md shadow-sm">
                <input
                  type="checkbox"
                  checked={task.completed}
                  // TODO: Implement actual toggle logic here (e.g., call a PATCH API route)
                  onChange={() => console.log('Toggle task completion (not implemented yet)')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
                />
                <span className={`flex-grow text-gray-800 ${task.completed ? 'line-through text-gray-500' : ''}`}>
                  {task.title}
                </span>
                <span className="text-xs text-gray-400 ml-4">
                  {new Date(task.createdAt).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TodosPage;
