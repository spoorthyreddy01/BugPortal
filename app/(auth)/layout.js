export default function AuthLayout({ children }) {
  return (
    <div className="flex flex-1 items-center justify-center overflow-y-auto bg-zinc-50 dark:bg-zinc-950 px-4">
      {children}
    </div>
  );
}
