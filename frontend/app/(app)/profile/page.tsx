export default function Page() {
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Profile</h1>

      <div className="mt-8 border rounded-xl p-6">
        <div className="flex items-center gap-5">
          <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold">
            AP
          </div>

          <div>
            <h2 className="text-2xl font-semibold">Aryan Pandey</h2>
            <p className="text-gray-400">DESIDOC AI Knowledge Library</p>
            <p className="text-gray-500">Research Assistant</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mt-8">
          <div className="border rounded-lg p-4">
            <p className="text-gray-400">Documents Read</p>
            <h3 className="text-3xl font-bold mt-2">24</h3>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-gray-400">AI Conversations</p>
            <h3 className="text-3xl font-bold mt-2">51</h3>
          </div>

          <div className="border rounded-lg p-4">
            <p className="text-gray-400">Bookmarks</p>
            <h3 className="text-3xl font-bold mt-2">12</h3>
          </div>
        </div>
      </div>
    </div>
  );
}