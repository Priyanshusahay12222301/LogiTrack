"use client";

import { useEffect } from "react";
import { MoveUpRight } from "lucide-react";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-gray-50 p-4 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
        <h2 className="text-2xl font-bold font-['Space_Grotesk'] mb-2 text-red-600">Something went wrong!</h2>
        <p className="text-gray-600 text-sm mb-6 font-['Inter']">
          An unexpected error occurred in the application. Our telemetry has logged the incident.
        </p>
        <button
          onClick={() => reset()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-black text-white font-bold text-sm tracking-wide transition-all hover:bg-gray-800"
        >
          Try again <MoveUpRight size={16} />
        </button>
      </div>
    </div>
  );
}
