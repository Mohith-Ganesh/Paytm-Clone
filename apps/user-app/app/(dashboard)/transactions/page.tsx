import { getServerSession } from "next-auth";
import { authOptions } from "../../lib/auth";
import prisma from "@repo/db/client";

async function getTransactions() {
  const session = await getServerSession(authOptions);
  const userId = Number(session?.user?.id);

  // OnRamp Transactions
  const onRampTxns = await prisma.onRampTransaction.findMany({
    where: { userId },
    orderBy: { startTime: "desc" }
  });

  // P2P Sent
  const sentTxns = await prisma.p2pTransfer.findMany({
    where: { fromUserId: userId },
    include: { toUser: true },
    orderBy: { timestamp: "desc" }
  });

  // P2P Received
  const receivedTxns = await prisma.p2pTransfer.findMany({
    where: { toUserId: userId },
    include: { fromUser: true },
    orderBy: { timestamp: "desc" }
  });

  return {
    onRampTxns,
    sentTxns,
    receivedTxns
  };
}



export default async function () {
  const { onRampTxns, sentTxns, receivedTxns } = await getTransactions();

  return (
    <div className="p-6 w-full space-y-6">

      <h1 className="text-2xl font-semibold">Transactions</h1>

      {/* OnRamp Transactions */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">Deposits</h2>
        {onRampTxns.map((tx) => (
          <div key={tx.id} className="flex justify-between py-2 border-b">
            <div>
              <p className="text-sm text-gray-600">{tx.provider}</p>
              <p className="text-xs text-gray-400">
                {new Date(tx.startTime).toLocaleString()}
              </p>
            </div>
            <p className="text-green-600 font-medium">
              + ₹ {tx.amount / 100}
            </p>
          </div>
        ))}
      </div>

      {/* Sent Transactions */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">Sent</h2>
        {sentTxns.map((tx) => (
          <div key={tx.id} className="flex justify-between py-2 border-b">
            <div>
              <p className="text-sm">To: {tx.toUser.name}</p>
              <p className="text-xs text-gray-400">
                {new Date(tx.timestamp).toLocaleString()}
              </p>
            </div>
            <p className="text-red-600 font-medium">
              - ₹ {tx.amount / 100}
            </p>
          </div>
        ))}
      </div>

      {/* Received Transactions */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-semibold mb-3">Received</h2>
        {receivedTxns.map((tx) => (
          <div key={tx.id} className="flex justify-between py-2 border-b">
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
  );
}