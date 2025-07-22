'use client';

import React, { useEffect, useState, FC } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define types for data structures
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
  isImportant: boolean;
  createdAt: string;
  userId: number;
}

type TodoAppView = 'all' | 'important' | 'completed';

const TodosPage: FC = () => {
  const router = useRouter();

  const [user, setUser] = useState<UserData | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [addingTask, setAddingTask] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [currentTodoView, setCurrentTodoView] = useState<TodoAppView>('all');

  // NEW STATES for Edit functionality
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null); // Stores the ID of the task being edited
  const [editedTaskTitle, setEditedTaskTitle] = useState<string>(''); // Stores the title being edited

  // --- useEffect for Authentication Check and Initial Task Fetch ---
  useEffect(() => {
    const loadUserDataAndTasks = async () => {
      setLoading(true);
      setMessage(null);

      if (typeof window === 'undefined') {
        router.push('/login');
        return;
      }

      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          const parsedUser: UserData = JSON.parse(storedUser);
          setUser(parsedUser);
          await fetchTasks(parsedUser.id);
        } catch (e) {
          console.error("Failed to parse user data from localStorage or fetch tasks", e);
          localStorage.removeItem('user');
          router.push('/login');
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    loadUserDataAndTasks();
  }, [router]);

  // --- Function to Fetch Tasks from the Backend API ---
  const fetchTasks = async (userId: number) => {
    try {
      const response = await fetch(`/api/todos?userId=${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await response.json();
      if (response.ok) {
        setTasks(data);
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
    e.preventDefault();
    setMessage(null);
    setAddingTask(true);

    if (!newTaskTitle.trim()) {
      setMessage({ type: 'error', text: 'Task title cannot be empty.' });
      setAddingTask(false);
      return;
    }
    if (!user) {
      setMessage({ type: 'error', text: 'User not logged in. Please refresh or log in again.' });
      setAddingTask(false);
      router.push('/login');
      return;
    }

    try {
      const response = await fetch('/api/todos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle, userId: user.id }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Task added successfully!' });
        setNewTaskTitle('');
        await fetchTasks(user.id);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to add task.' });
      }
    } catch (error) {
      console.error('Network error adding task:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred while adding task.' });
    } finally {
      setAddingTask(false);
    }
  };

  // --- Handler for Toggling Task Completion ---
  const handleToggleComplete = async (taskId: number, currentCompletedStatus: boolean) => {
    setMessage(null);
    if (!user) {
      setMessage({ type: 'error', text: 'User not logged in. Cannot update task.' });
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/todos/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completed: !currentCompletedStatus,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Task updated successfully!' });
        await fetchTasks(user.id);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update task.' });
      }
    } catch (error) {
      console.error('Network error toggling task completion:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred while updating task.' });
    }
  };

  // --- Handler for Toggling Task Importance ---
  const handleToggleImportant = async (taskId: number, currentImportantStatus: boolean) => {
    setMessage(null);
    if (!user) {
      setMessage({ type: 'error', text: 'User not logged in. Cannot update task importance.' });
      router.push('/login');
      return;
    }

    try {
      const response = await fetch(`/api/todos/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isImportant: !currentImportantStatus,
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: `Task marked ${!currentImportantStatus ? 'important' : 'unimportant'}!` });
        await fetchTasks(user.id);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update task importance.' });
      }
    } catch (error) {
      console.error('Network error toggling task importance:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred while updating task importance.' });
    }
  };

  // --- NEW: Handler for Deleting a Task ---
  const handleDeleteTask = async (taskId: number) => {
    setMessage(null);
    if (!user) {
      setMessage({ type: 'error', text: 'User not logged in. Cannot delete task.' });
      router.push('/login');
      return;
    }

    // Optional: Add a confirmation dialog here for better UX
    if (!confirm('Are you sure you want to delete this task?')) {
      return; // User cancelled deletion
    }

    try {
      const response = await fetch(`/api/todos/${taskId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }), // Send userId for authorization check
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Task deleted successfully!' });
        await fetchTasks(user.id); // Re-fetch tasks to update the list
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to delete task.' });
      }
    } catch (error) {
      console.error('Network error deleting task:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred while deleting task.' });
    }
  };

  // --- NEW: Handlers for Editing a Task ---
  const handleEditClick = (task: Task) => {
    setEditingTaskId(task.id); // Set the ID of the task being edited
    setEditedTaskTitle(task.title); // Populate the input with the current title
  };

  const handleSaveEdit = async (taskId: number) => {
    setMessage(null);
    if (!user) {
      setMessage({ type: 'error', text: 'User not logged in. Cannot save task.' });
      router.push('/login');
      return;
    }
    if (!editedTaskTitle.trim()) {
      setMessage({ type: 'error', text: 'Task title cannot be empty.' });
      return;
    }

    try {
      const response = await fetch(`/api/todos/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editedTaskTitle.trim(), // Send the new title
          userId: user.id, // Send userId for authorization
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Task title updated successfully!' });
        setEditingTaskId(null); // Exit edit mode
        setEditedTaskTitle(''); // Clear edited title
        await fetchTasks(user.id); // Re-fetch tasks
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to update task title.' });
      }
    } catch (error) {
      console.error('Network error saving task edit:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred while saving task.' });
    }
  };

  const handleCancelEdit = () => {
    setEditingTaskId(null); // Exit edit mode
    setEditedTaskTitle(''); // Clear edited title
  };


  // --- Handler for User Logout ---
  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user');
    }
    router.push('/login');
  };

  // --- Function to Filter Tasks based on currentTodoView ---
  const getFilteredTasks = (): Task[] => {
    switch (currentTodoView) {
      case 'all':
        return tasks;
      case 'important':
        return tasks.filter(task => task.isImportant);
      case 'completed':
        return tasks.filter(task => task.completed);
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
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center font-inter">
        <p className="text-gray-700 text-lg">Loading your tasks...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-green-50 font-inter">
      {/* Left Pane (Sidebar) */}
      <div className="w-64 bg-green-100 p-6 flex flex-col rounded-l-lg shadow-md">
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
      <div className="flex-1 bg-white p-8 flex flex-col rounded-r-lg shadow-md">
        {/* Top Bar for Main Content - Contains Title, Settings Icon, and Logout Button */}
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-semibold text-gray-700">
            {user?.name}'s {getFilteredTasks().length} {getMainContentTitle()}
          </h2>
          <div className="flex items-center space-x-4">
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
            {/* Logout Button */}
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
                {/* Checkbox for completion */}
                <input
                  type="checkbox"
                  checked={task.completed}
                  onChange={() => handleToggleComplete(task.id, task.completed)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded mr-3"
                />

                {/* Task Title - Conditional Rendering for Edit Mode */}
                {editingTaskId === task.id ? (
                  <input
                    type="text"
                    value={editedTaskTitle}
                    onChange={(e) => setEditedTaskTitle(e.target.value)}
                    onBlur={() => handleSaveEdit(task.id)} // Save on blur
                    onKeyPress={(e) => { // Save on Enter key press
                      if (e.key === 'Enter') {
                        e.preventDefault(); // Prevent new line in input
                        handleSaveEdit(task.id);
                      }
                    }}
                    className="flex-grow px-2 py-1 border border-blue-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    autoFocus // Focus the input when it appears
                  />
                ) : (
                  <span
                    className={`flex-grow text-gray-800 cursor-pointer ${task.completed ? 'line-through text-gray-500' : ''}`}
                    onDoubleClick={() => handleEditClick(task)} // Double click to edit
                  >
                    {task.title}
                  </span>
                )}

                {/* Action Buttons (Edit, Delete, Important) */}
                <div className="flex items-center ml-4 space-x-2">
                  {editingTaskId === task.id ? (
                    <>
                      {/* Save Button */}
                      <button
                        onClick={() => handleSaveEdit(task.id)}
                        className="p-1 rounded-full text-green-600 hover:bg-green-100 transition-colors duration-200"
                        aria-label="Save task edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </button>
                      {/* Cancel Button */}
                      <button
                        onClick={handleCancelEdit}
                        className="p-1 rounded-full text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                        aria-label="Cancel task edit"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </>
                  ) : (
                    <>
                      {/* Edit Button */}
                      <button
                        onClick={() => handleEditClick(task)}
                        className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors duration-200"
                        aria-label="Edit task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      {/* Star icon for importance */}
                      <button
                        onClick={() => handleToggleImportant(task.id, task.isImportant)}
                        className="p-1 rounded-full hover:bg-yellow-100 transition-colors duration-200"
                        aria-label={task.isImportant ? "Mark as unimportant" : "Mark as important"}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className={`h-6 w-6 ${task.isImportant ? 'text-yellow-500' : 'text-gray-400'}`}
                          viewBox="0 0 24 24"
                          fill={task.isImportant ? 'currentColor' : 'none'}
                          stroke={task.isImportant ? 'none' : 'currentColor'}
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.324 1.144l1.519 4.674c.3.921-.755 1.688-1.539 1.144l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.544-1.839-.223-1.539-1.144l1.519-4.674a1 1 0 00-.324-1.144L2.92 8.092c-.783-.57-.38-1.81.588-1.81h4.915a1 1 0 00.95-.69l1.519-4.674z"
                          />
                        </svg>
                      </button>
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 rounded-full text-red-600 hover:bg-red-100 transition-colors duration-200"
                        aria-label="Delete task"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
                <span className="text-xs text-gray-400 ml-2">
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
