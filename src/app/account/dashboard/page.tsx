import { cookies } from "next/headers";
import { redirect } from "next/navigation"; 
import { getAuthUser } from "@/services/auth/session";
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Dashboard | Safe Nest",
  description: "An overview of your Safe Nest properties and units.",
};

 
export default async function DashboardPage() {
  const user = await getAuthUser(await cookies());
  if (!user) redirect("/auth/login");

  return (
    <div className="mx-auto w-full max-w-5xl p-1 md:p-5">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-2xl font-light text-slate-900 dark:text-slate-50 md:text-3xl">
            Welcome back, {[user.firstName, user.lastName].filter(Boolean).join(" ")}!
          </h1>
      </div>
 
      <div className="grid gap-6 lg:grid-cols-3">
         
      </div>
    </div>
  );
}
