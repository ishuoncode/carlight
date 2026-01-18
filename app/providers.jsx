'use client';
import { AuthProvider } from './context/AuthContext';

export default function provider({ children }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
