import { useEffect, useState } from 'react';
import { useAccount, usePublicClient } from 'wagmi';
import { formatUnits } from 'viem';

interface WalletStats {
  balanceChange24h: number;
  transactionCount: number;
  gasSaved: number;
}

export function useWalletStats() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const [stats, setStats] = useState<WalletStats>({
    balanceChange24h: 0,
    transactionCount: 0,
    gasSaved: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!address || !publicClient) return;

      try {
        // Obtener transacciones
        const transactions = await publicClient.getTransactionCount({
          address,
        });

        // Calcular gas gastado
        const gasPrice = await publicClient.getGasPrice();
        const gasUsed = Number(formatUnits(gasPrice, 18)); // Gas gastado en ETH

        // Actualizar estadísticas
        setStats({
          balanceChange24h: 2.5, // Por ahora hardcodeado, se puede implementar la lógica real después
          transactionCount: Number(transactions),
          gasSaved: gasUsed // Ahora representa el gas gastado
        });

      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 60000); // Actualizar cada minuto

    return () => clearInterval(interval);
  }, [address, publicClient]);

  return stats;
} 