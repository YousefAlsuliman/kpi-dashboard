import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Employee Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Welcome, <span className="font-medium">{session.user.name}</span>
        </p>
      </div>
    </main>
  );
}
