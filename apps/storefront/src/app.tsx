import { Suspense } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './lib/router';

export default function App() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center bg-slate-950 text-slate-100">
          <span className="animate-pulse text-lg font-semibold">Loading storefront…</span>
        </div>
      }
    >
      <RouterProvider router={router} />
    </Suspense>
  );
}
