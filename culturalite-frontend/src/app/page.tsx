export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white mb-4">
          Hello World
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
          Welcome to Culturalite Frontend
        </p>
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <p>Next.js 14 • TypeScript • Tailwind CSS</p>
          <p>Ready for development</p>
        </div>
      </div>
    </div>
  );
}
