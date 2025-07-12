'use client';

import React, { useState } from 'react';
import Link from 'next/link'; // For navigation to /register
import { useRouter } from 'next/navigation'; // For programmatic redirection to /todos

const LoginPage: React.FC = () => {
  const router = useRouter();

  const [identifier, setIdentifier] = useState<string>('');
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
    if (!identifier.trim()) { newErrors.identifier = 'Username or Email is required'; }
    if (!password.trim()) { newErrors.password = 'Password is required'; }
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) { setLoading(false); return; }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: data.message || 'Login successful!' });
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log('User data stored in local storage:', data.user);
        }
        router.push('/todos'); // Redirect to todos page after successful login
      } else {
        setMessage({ type: 'error', text: data.message || 'Login failed. Invalid credentials.' });
      }
    } catch (error) {
      console.error('Network or server error during login:', error);
      setMessage({ type: 'error', text: 'An unexpected error occurred. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Login</h2>
        {message && (<div className={`p-3 mb-4 rounded-md text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{message.text}</div>)}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-1">Username or Email</label>
            <input type="text" id="identifier" className={`mt-1 block w-full px-4 py-2 border ${errors.identifier ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} value={identifier} onChange={(e) => setIdentifier(e.target.value)} aria-invalid={errors.identifier ? "true" : "false"} aria-describedby={errors.identifier ? "identifier-error" : undefined} disabled={loading} />
            {errors.identifier && <p id="identifier-error" className="mt-1 text-sm text-red-600">{errors.identifier}</p>}
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" id="password" className={`mt-1 block w-full px-4 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`} value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={errors.password ? "true" : "false"} aria-describedby={errors.password ? "password-error" : undefined} disabled={loading} />
            {errors.password && <p id="password-error" className="mt-1 text-sm text-red-600">{errors.password}</p>}
          </div>
          <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>{loading ? 'Logging in...' : 'Login'}</button>
        </form>
        <p className="mt-6 text-center text-sm text-gray-600">Don't have an account?{' '}<Link href="/register" passHref><button className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline" disabled={loading}>Register here</button></Link></p>
      </div>
    </div>
  );
};

export default LoginPage;
// This code defines a LoginPage component for a Next.js application.
// It includes a form for users to log in with their username or email and password.
// The form handles validation, submission, and displays messages based on the success or failure of the