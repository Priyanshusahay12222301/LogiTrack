import React, { useRef, useEffect } from "react";
import { Search } from "lucide-react";

interface SearchBarProps {
  query: string;
  setQuery: (q: string) => void;
}

export function SearchBar({ query, setQuery }: SearchBarProps) {
  const searchRef = useRef<HTMLInputElement>(null);

  // Ctrl+K or Meta+K focuses search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="relative flex-1 max-w-sm">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
      <input
        ref={searchRef}
        type="text"
        placeholder="Search ID, sender, city… (⌘K)"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 transition-colors"
      />
    </div>
  );
}
