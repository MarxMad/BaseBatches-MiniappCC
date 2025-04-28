"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Transaction } from '../services/api';

type TransactionChartProps = {
  transactions: Transaction[];
};

export function TransactionChart({ transactions }: TransactionChartProps) {
  // Transformar las transacciones para la gráfica
  const chartData = transactions.map(transaction => ({
    fecha: new Date(transaction.timestamp).toLocaleDateString(),
    monto: parseFloat(transaction.amount?.replace('$', '') || '0'),
    tipo: transaction.type
  }));

  return (
    <div className="w-full h-64 bg-[var(--app-card-bg)] rounded-lg p-4">
      <h3 className="text-lg font-medium mb-4">Historial de Transacciones</h3>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="fecha" />
          <YAxis />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'var(--app-card-bg)',
              border: '1px solid var(--app-card-border)',
              borderRadius: '0.5rem'
            }}
            formatter={(value: number) => [`$${value}`, 'Monto']}
          />
          <Area 
            type="monotone" 
            dataKey="monto" 
            stroke="var(--app-accent)" 
            fill="var(--app-accent-light)" 
            fillOpacity={0.3} 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
} 