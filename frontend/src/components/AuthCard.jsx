export default function AuthCard({ title, children }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-6 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-semibold text-center mb-4">{title}</h2>
        {children}
      </div>
    </div>
  );
}
