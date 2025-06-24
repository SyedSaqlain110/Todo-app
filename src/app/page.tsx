'use client';
import React, { useState, FC } from 'react';


// Define a type for the possible views in the application
type AppView = 'tasks' | 'important' | 'completed';

// Main App Component
// FC (Functional Component) is a common type for React functional components in TypeScript
const App: FC = () => {
  // State to manage the currently selected view
  // We explicitly type currentView as AppView and initialize it to 'tasks'
  const [currentView, setCurrentView] = useState<AppView>('tasks');

  // Function to determine the main content title based on currentView
  // This function returns a string
  const getMainContentTitle = (): string => {
    switch (currentView) {
      case 'tasks':
        return ''; // No specific title for the initial 'add a task' screen
      case 'important':
        return 'Important Tasks';
      case 'completed':
        return 'Completed Tasks';
      default:
        // A fallback for unexpected values, though our type `AppView` should prevent this
        return '';
    }
  };

  // Function to render the main content based on currentView
  // This function returns a JSX.Element or null
  
  const renderMainContent = (): JSX.Element | null => {
    switch (currentView) {
      case 'tasks':
        return (
          // Add a Task Section (from Desktop - 1)
          <div className="flex flex-col items-center justify-center bg-blue-50 p-6 rounded-xl shadow-inner max-w-sm mx-auto mt-20">
            <span className="text-xl text-gray-600 mb-4">add a task</span>
            <button className="flex items-center justify-center bg-white h-20 w-20 rounded-full shadow-lg text-blue-400 hover:bg-gray-100 transition-colors duration-200">
              {/* Plus icon */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        );
      case 'important':
      case 'completed':
        // For 'important' and 'completed', only the title is displayed as per the images
        return (
          <h2 className="text-3xl font-semibold text-gray-700 mt-8 text-center">{getMainContentTitle()}</h2>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-green-50"> {/* Overall container with a light green background */}
      {/* Left Pane (Sidebar) */}
      <div className="w-64 bg-green-100 p-6 flex flex-col rounded-l-lg shadow-md"> {/* Sidebar styling */}
        {/* Logo and Title */}
        <div className="flex items-center mb-10">
          {/* Using a simple SVG for the TO-DO icon */}
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
              currentView === 'tasks' ? 'bg-green-200' : ''
            }`}
            onClick={() => setCurrentView('tasks')}
          >
            {/* Task icon (check mark) */}
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
            <span className="text-lg font-medium">tasks</span>
          </button>
          <button
            className={`flex items-center w-full px-4 py-3 rounded-lg text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors duration-200 ${
              currentView === 'important' ? 'bg-green-200' : ''
            }`}
            onClick={() => setCurrentView('important')}
          >
            {/* Star icon */}
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
            <span className="text-lg font-medium">important</span>
          </button>
          <button
            className={`flex items-center w-full px-4 py-3 rounded-lg text-green-700 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-green-300 transition-colors duration-200 ${
              currentView === 'completed' ? 'bg-green-200' : ''
            }`}
            onClick={() => setCurrentView('completed')}
          >
            {/* Trash icon */}
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
            <span className="text-lg font-medium">completed</span>
          </button>
        </nav>
      </div>

      {/* Right Pane (Main Content) */}
      <div className="flex-1 bg-white p-8 flex flex-col rounded-r-lg shadow-md"> {/* Main content area styling */}
        {/* Top Bar for Main Content */}
        <div className="flex justify-between items-center mb-8"> {/* Adjusted to justify-between for title and settings */}
          {/* Dynamically display the title if not on the 'tasks' view */}
          {currentView !== 'tasks' && (
            <h2 className="text-3xl font-semibold text-gray-700">
              {getMainContentTitle()}
            </h2>
          )}
          {/* Settings icon */}
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
        </div>

        {/* Dynamic Main Content */}
        {renderMainContent()}
      </div>
    </div>
  );
}

export default App;
