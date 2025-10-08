"use client";

import { useState, useEffect } from "react";
import { useAccount, useContractRead, useContractWrite, useWaitForTransactionReceipt } from "wagmi";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "../constants/marketplace";
import { toast } from "react-hot-toast";
import { Package, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Purchase {
  tokenId: number;
  title: string;
  price: string;
  seller: string;
  buyer: string;
  sold: boolean;
  confirmed: boolean;
  image: string;
}

export function RealProofOfDelivery() {
  const { address } = useAccount();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState<number | null>(null);

  // Leer las compras del usuario desde el contrato
  const { data: myPurchases, refetch } = useContractRead({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "getMyPurchases",
    args: [address],
    enabled: !!address,
  });

  // Función para confirmar entrega
  const { writeContract: confirmDelivery, data: hash } = useContractWrite();

  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Obtener detalles de cada compra
  const { data: allBooks } = useContractRead({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "getAllBooks",
    enabled: !!myPurchases,
  });

  useEffect(() => {
    if (myPurchases && allBooks) {
      const userPurchases = (myPurchases as number[]).map(tokenId => {
        const bookIndex = allBooks[0].indexOf(tokenId);
        if (bookIndex !== -1) {
          return {
            tokenId: Number(tokenId),
            title: `Libro #${tokenId}`, // En una implementación real, obtendrías el título del tokenURI
            price: (Number(allBooks[2][bookIndex]) / 1e18).toFixed(4) + " ETH",
            seller: allBooks[1][bookIndex],
            buyer: allBooks[5][bookIndex],
            sold: allBooks[3][bookIndex],
            confirmed: allBooks[4][bookIndex],
            image: "/placeholder-book.jpg"
          };
        }
        return null;
      }).filter(Boolean) as Purchase[];

      // Filtrar solo las compras pendientes de confirmación
      const pendingPurchases = userPurchases.filter(purchase => 
        purchase.sold && !purchase.confirmed && purchase.buyer.toLowerCase() === address?.toLowerCase()
      );

      setPurchases(pendingPurchases);
      setLoading(false);
    }
  }, [myPurchases, allBooks, address]);

  const handleConfirmDelivery = async (tokenId: number) => {
    if (!address) {
      toast.error("Por favor, conecta tu wallet");
      return;
    }

    try {
      setConfirming(tokenId);
      
      await confirmDelivery({
        address: MARKETPLACE_ADDRESS,
        abi: MARKETPLACE_ABI,
        functionName: "confirmDelivery",
        args: [BigInt(tokenId)],
      });

      toast.success("Transacción enviada. Esperando confirmación...");
    } catch (error: any) {
      console.error("Error al confirmar entrega:", error);
      toast.error(error?.message || "Error al confirmar la entrega");
      setConfirming(null);
    }
  };

  useEffect(() => {
    if (isSuccess) {
      toast.success("¡Entrega confirmada exitosamente! El vendedor recibirá el pago.");
      setConfirming(null);
      refetch(); // Actualizar la lista
    }
  }, [isSuccess, refetch]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B82F6]"></div>
      </div>
    );
  }

  if (purchases.length === 0) {
    return (
      <div className="text-center py-8">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-white mb-2">No hay entregas pendientes</h3>
        <p className="text-gray-400">No tienes productos esperando confirmación de entrega.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2 mb-6">
        <Package className="w-6 h-6 text-[#3B82F6]" />
        <h2 className="text-2xl font-bold text-white">Confirmar Entrega</h2>
      </div>

      {purchases.map((purchase) => (
        <div key={purchase.tokenId} className="bg-[#1A1A1A] rounded-xl p-6 border border-[#2A2A2A]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gradient-to-r from-[#3B82F6] to-[#1D4ED8] rounded-lg flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">{purchase.title}</h3>
                <p className="text-gray-400 text-sm">Token ID: {purchase.tokenId}</p>
                <p className="text-gray-500 text-xs">Vendedor: {purchase.seller.slice(0, 6)}...{purchase.seller.slice(-4)}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xl font-bold text-[#3B82F6]">{purchase.price}</div>
              <div className="flex items-center space-x-1 text-yellow-400 text-sm">
                <Clock className="w-4 h-4" />
                <span>Pendiente</span>
              </div>
            </div>
          </div>

          <div className="bg-[#0A0A0A] rounded-lg p-4 border border-[#333333] mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <AlertCircle className="w-5 h-5 text-yellow-400" />
              <h4 className="text-white font-semibold">Estado del Escrow</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-gray-300">Comprado</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-300">En Escrow</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-gray-300">Pendiente Confirmación</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-[#3B82F6]/10 to-[#1D4ED8]/10 rounded-lg p-4 border border-[#3B82F6]/30 mb-4">
            <h4 className="text-white font-semibold mb-2">💡 ¿Cómo funciona?</h4>
            <ul className="text-sm text-gray-300 space-y-1">
              <li>• Has comprado este producto y los fondos están en escrow</li>
              <li>• Al confirmar la entrega, el NFT se transferirá a tu wallet</li>
              <li>• El vendedor recibirá el pago automáticamente</li>
              <li>• Esta acción es irreversible una vez confirmada</li>
            </ul>
          </div>

          <button
            onClick={() => handleConfirmDelivery(purchase.tokenId)}
            disabled={confirming === purchase.tokenId || isConfirming}
            className="w-full bg-gradient-to-r from-[#10B981] to-[#059669] text-white py-3 px-6 rounded-lg font-medium hover:from-[#34D399] hover:to-[#10B981] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {confirming === purchase.tokenId || isConfirming ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Confirmando...</span>
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Confirmar Entrega</span>
              </>
            )}
          </button>
        </div>
      ))}
    </div>
  );
}
