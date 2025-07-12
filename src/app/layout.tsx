// app/layout.tsx
import './globals.css'; // Assuming you have a globals.css for Tailwind setup

export const metadata = {
  title: 'Todo App',
  description: 'A simple todo application with user authentication.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
// This layout file sets up the global styles and metadata for the application.
// Ensure that you have Tailwind CSS configured in your project for styling.
// The `children` prop will render the content of each page within this layout.
// You can add more global styles or components here as needed.
// Make sure to import this layout in your pages or components where needed.
// This file is essential for Next.js applications to define the overall structure and styling of the app.
// It serves as the root layout for your application, wrapping all pages and components.
// Ensure that the Tailwind CSS is properly configured in your project for styling to work correctly.
// You can also add additional metadata or global components as needed for your application.
// This layout file is used to define the overall structure of your Next.js application.      