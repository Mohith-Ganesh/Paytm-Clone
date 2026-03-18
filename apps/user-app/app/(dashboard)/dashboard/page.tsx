import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/client";

async function getBalance() {
    const session = await getServerSession(authOptions);
    const balance = await prisma.balance.findFirst({
        where: {
            userId: Number(session?.user?.id)
        }
    });
    return {
        amount: balance?.amount || 0,
        locked: balance?.locked || 0,
        name: session?.user?.name || "User"
    }
}



export default async function() {
  const balanceData = await getBalance();
  return (
    
    <div className="p-6 space-y-6 w-full max-w-4xl mx-auto">

      <div className="bg-white rounded-2xl shadow p-6">
        <h1 className="text-2xl font-semibold">
          Welcome back, {balanceData.name}
        </h1>
        <p className="text-gray-500 mt-1">
          Here’s your financial overview
        </p>
      </div>

      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl p-6 shadow">
        <p className="text-sm opacity-80">Available Balance</p>
        <h2 className="text-3xl font-bold mt-2">
          ₹ {balanceData.amount/100}
        </h2>
      </div>

    </div>
  );
}