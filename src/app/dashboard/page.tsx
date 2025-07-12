'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; // Although not directly used for navigation in this component, good practice to keep if other links are added.

interface UserData {
  id: number;
  name: string;
  username: string;
  email: string;
}

const DashboardPage: React.FC = () => {
  const router = useRouter(); // Initialize router
  const [user, setUser] = useState<UserData | null>(null); // State to store logged-in user data
  const [loading, setLoading] = useState<boolean>(true); // State to manage loading status of user data

  useEffect(() => {
    // This effect runs once after the component mounts (client-side)
    // and is responsible for checking user authentication status.
    if (typeof window !== 'undefined') { // Crucial check: Ensure code runs only in the browser environment
      const storedUser = localStorage.getItem('user'); // Attempt to retrieve user data from local storage using the key 'user'

      if (storedUser) { // If user data is found in local storage (i.e., 'storedUser' is not null)
        try {
          setUser(JSON.parse(storedUser)); // Parse the JSON string back into a JavaScript object and set it to the 'user' state
        } catch (e) {
          // If parsing fails (e.g., the data in localStorage is corrupted or not valid JSON)
          console.error("Failed to parse user data from localStorage", e); // Log an error for debugging
          localStorage.removeItem('user'); // Remove the corrupted data to prevent future issues
          router.push('/login'); // Redirect to the login page as the user data is invalid
        }
      } else {
        // If no user data is found in local storage, it means the user is not logged in
        router.push('/login'); // Redirect to the login page
      }
    }
    setLoading(false); // Set loading to false once the check is complete, regardless of outcome (success or redirect)
  }, [router]); // Dependency array: useEffect runs when 'router' object changes (though it typically won't change after initial render for useRouter)

  const handleLogout = () => {
    // Function to handle user logout
    if (typeof window !== 'undefined') { // Ensure code runs only in the browser environment
      localStorage.removeItem('user'); // Remove the 'user' item from local storage, effectively logging out the user
    }
    router.push('/login'); // Redirect the user back to the login page after logout
  };

  if (loading) {
    // Display a loading message while user data is being checked from local storage
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center font-inter">
        <p className="text-gray-700 text-lg">Loading user data...</p>
      </div>
    );
  }

  if (!user) {
    // If 'user' state is null after loading, it means the user was either not found in localStorage
    // or the data was invalid, and the useEffect hook would have already triggered a redirect to '/login'.
    // Returning null here prevents any brief rendering of an empty dashboard before the redirect takes full effect.
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md text-center">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">Welcome, {user.name}!</h2>
        <p className="text-gray-700 mb-2">Username: {user.username}</p>
        <p className="text-gray-700 mb-6">Email: {user.email}</p>

        <button
          onClick={handleLogout} // Binds the logout function to the button click
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;
// This is a Next.js client component for the dashboard page
// It checks for user authentication, displays user information, and allows logout
// The component uses React hooks for state management and side effects
// It also handles loading states and redirects to the login page if the user is not authenticated
// The design is responsive and uses Tailwind CSS for styling