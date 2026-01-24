export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Nimmit</h1>
          <p className="mt-2 text-sm text-gray-600">
            Your overnight assistant team
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
