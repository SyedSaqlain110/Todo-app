'use client';

import React, { useState } from 'react';
import Link from 'next/link'; // For navigation to /login
import { useRouter } from 'next/navigation'; // For programmatic redirection (optional, but good practice)

const RegistrationPage: React.FC = () => {
  const router = useRouter(); // Initialize router

  const [name, setName] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setMessage(null);
    setLoading(true);

    const newErrors: { [key: string]: string } = {};
    if (!name.trim()) { newErrors.name = 'Name is required'; }
    if (!username.trim()) { newErrors.username = 'Username is required'; }
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) { newErrors.email = 'Valid email is required'; }
    if (!password.trim() || password.length < 6) { newErrors.password = 'Password must be at least 6 characters'; }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) { setLoading(false); return; }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Registration successful!' });
        setName(''); setUsername(''); setEmail(''); setPassword('');
        router.push('/login'); // Redirect to login page after successful registration
      } else {
        setMessage({ type: 'error', text: data.message || 'Registration failed. Please try again.' });
      }
    } catch (error) {
      console.error('Network or server error during registration:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Register</h2>
        {message && (<div className={`p-3 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</div>)}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input type="text" id="name" className={`mt-1 block w-full px-4 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} value={name} onChange={(e) => setName(e.target.value)} aria-invalid={errors.name ? "true" : "false"} aria-describedby={errors.name ? "name-error" : undefined} disabled={loading} />
            {errors.name && <p id="name-error" className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input type="text" id="username" className={`mt-1 block w-full px-4 py-2 border ${errors.username ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} value={username} onChange={(e) => setUsername(e.target.value)} aria-invalid={errors.username ? "true" : "false"} aria-describedby={errors.username ? "username-error" : undefined} disabled={loading} />
            {errors.username && <p id="username-error" className="mt-1 text-sm text-red-600">{errors.username}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" id="email" className={`mt-1 block w-full px-4 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} value={email} onChange={(e) => setEmail(e.target.value)} aria-invalid={errors.email ? "true" : "false"} aria-describedby={errors.email ? "email-error" : undefined} disabled={loading} />
            {errors.email && <p id="email-error" className="mt-1 text-sm text-red-600">{errors.email}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" id="password" className={`mt-1 block w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={errors.password ? "true" : "false"} aria-describedby={errors.password ? "password-error" : undefined} disabled={loading} />
            {errors.password && <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>{loading ? 'Registering...' : 'Register'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">Already have an account?{' '}<Link href="/login" passHref><button className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline" disabled={loading}>Login here</button></Link></p>
      </div>
    </div>
  );
};

export default RegistrationPage;

// This code defines a RegistrationPage component for a Next.js application.
// It includes a form for users to register with their name, username, email, and password.
// The form handles validation, submission, and displays messages based on the success or failure of the registration.
// It uses the Next.js router for navigation and local state management for form data and error handling.
// Ensure that you have Tailwind CSS configured in your project for styling.  
