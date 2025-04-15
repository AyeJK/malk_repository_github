export default function StaticTestPage() {
  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Static Test Page</h1>
        <div className="bg-green-900/50 border border-green-500 rounded p-4 mb-4">
          <p className="text-green-400">
            This is a static page that doesn't rely on any API calls.
          </p>
          <div className="mt-2 text-sm">
            <p>If you can see this page, Next.js is working correctly.</p>
            <p>Timestamp: {new Date().toISOString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 