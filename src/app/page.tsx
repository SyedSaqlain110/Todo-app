'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Check if running in a browser environment
    if (typeof window !== 'undefined') {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        // User is logged in, redirect to todos page
        router.push('/todos');
      } else {
        // No user data, redirect to login page
        router.push('/login');
      }
    }
  }, [router]);

  // Optionally, show a loading spinner or message while redirecting
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center font-inter">
      <p className="text-gray-700 text-lg">Loading...</p>
    </div>
  );
}
// This code defines a HomePage component for a Next.js application.
// It checks if a user is logged in by looking for user data in local storage.
// If a user is found, it redirects to the todos page; otherwise, it redirects to the login page.
// The useEffect hook ensures that the check runs only once when the component mounts.
// The component also includes a simple loading message while the redirection is happening.
// Ensure that you have the necessary routing set up in your Next.js application for this to work correctly.
// This page serves as the entry point for your application, redirecting users based on their authentication status.
// You can customize the loading message or add a spinner for better user experience. 