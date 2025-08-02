import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { ClerkProvider } from "@clerk/clerk-react";
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL as string);

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <ConvexProvider client={convex}>
        <RouterProvider router={router} />
      </ConvexProvider>
    </ClerkProvider>
  </StrictMode>
)
