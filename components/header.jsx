"use client";

export function Header({ children }) {
  return (
    <header className="h-16 border-b bg-card flex items-center justify-between px-6">
      <div className="flex-1" />
      <div className="flex items-center gap-4">{children}</div>
    </header>
  );
}
