import { SendCard } from "../../../components/SendCard";
import prisma from "@repo/db/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";

async function getP2PTransactions() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  const sent = await prisma.p2pTransfer.findMany({
    where: { fromUserId: userId },
    include: { toUser: true },
    orderBy: { timestamp: "desc" }
  });

  const received = await prisma.p2pTransfer.findMany({
    where: { toUserId: userId },
    include: { fromUser: true },
    orderBy: { timestamp: "desc" }
  });

  return { sent, received };
}

export default async function () {
  const { sent, received } = await getP2PTransactions();

  return (
    <div className="p-4 w-full flex flex-col justify-center">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">

        {/* LEFT: Send Money */}
        <div className="bg-white rounded-2xl shadow p-4 h-[500px] flex flex-col">
          <SendCard />
        </div>

        {/* RIGHT: Transactions */}
        <div className="bg-white rounded-2xl shadow p-4 h-[500px] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">
            P2P Transactions
          </h2>

          {/* Sent */}
          {sent.map((tx) => (
            <div key={`sent-${tx.id}`} className="flex justify-between py-2 border-b">
              <div>
                <p className="text-sm">To: {tx.toUser.name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
              <p className="text-red-500 font-medium">
                - ₹ {tx.amount / 100}
              </p>
            </div>
          ))}

          {/* Received */}
          {received.map((tx) => (
            <div key={`rec-${tx.id}`} className="flex justify-between py-2 border-b">
              <div>
                <p className="text-sm">From: {tx.fromUser.name}</p>
                <p className="text-xs text-gray-400">
                  {new Date(tx.timestamp).toLocaleString()}
                </p>
              </div>
              <p className="text-green-600 font-medium">
                + ₹ {tx.amount / 100}
              </p>
            </div>
          ))}

        </div>

      </div>
    </div>
  );
}