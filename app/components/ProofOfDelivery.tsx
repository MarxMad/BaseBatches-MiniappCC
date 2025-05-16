import { useState, useEffect } from "react";
import { useAccount, useSignMessage } from "wagmi";
import { writeContract } from 'wagmi/actions';
import { config } from '../config/wagmi';
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "../constants/marketplace";
import { toast } from "react-hot-toast";

export function ProofOfDelivery({ orderId, onProofSubmitted }: { orderId: number, onProofSubmitted?: () => void }) {
  const { address } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'uploading' | 'signing' | 'confirming' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { signMessageAsync } = useSignMessage();
  
  // Simulación de subida a IPFS (reemplaza por tu lógica real)
  const uploadToIPFS = async (file: File) => {
    // Aquí deberías usar web3.storage, nft.storage, Pinata, etc.
    // Por ahora, solo simula un hash
    return "ipfs://fakehash";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setStatus('idle');
    setErrorMessage(null);
  };

  const handleSubmit = async () => {
    if (!file) {
      toast.error("Por favor, selecciona una imagen primero");
      return;
    }

    if (!address) {
      toast.error("Por favor, conecta tu wallet primero");
      return;
    }

    try {
      setIsSubmitting(true);
      setStatus('uploading');
      setErrorMessage(null);

      // 1. Sube la foto a IPFS
      const ipfsHash = await uploadToIPFS(file);
      setIpfsUrl(ipfsHash);

      // 2. Firma un mensaje
      setStatus('signing');
      const message = `Confirmo que recibí el recurso del pedido #${orderId} con prueba: ${ipfsHash}`;
      await signMessageAsync({ message });

      // 3. Llama a la función del contrato usando writeContract
      setStatus('confirming');
      const tx = await writeContract(config, {
        address: MARKETPLACE_ADDRESS as `0x${string}`,
        abi: MARKETPLACE_ABI,
        functionName: "confirmDelivery",
        args: [BigInt(orderId), ipfsHash],
      });

      toast.success("Transacción enviada. Esperando confirmación...");
      setStatus('success');
      if (onProofSubmitted) {
        onProofSubmitted();
      }
    } catch (error: any) {
      console.error("Error al confirmar entrega:", error);
      setStatus('error');
      setErrorMessage(error?.message || "Error al confirmar la entrega");
      toast.error(error?.message || "Error al confirmar la entrega");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return "Subiendo imagen...";
      case 'signing':
        return "Firmando mensaje...";
      case 'confirming':
        return "Confirmando transacción...";
      case 'success':
        return "¡Entrega confirmada exitosamente!";
      case 'error':
        return errorMessage || "Error al procesar la entrega";
      default:
        return "Confirmar entrega";
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'bg-green-600 hover:bg-green-700';
      case 'error':
        return 'bg-red-600 hover:bg-red-700';
      default:
        return !file || isSubmitting
          ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
          : 'bg-green-600 hover:bg-green-700';
    }
  };

  return (
    <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-200">
          Sube una foto como prueba de entrega
        </label>
        <input 
          type="file" 
          accept="image/*" 
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-300
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-green-600 file:text-white
            hover:file:bg-green-700"
        />
      </div>
      
      {ipfsUrl && (
        <div className="text-sm text-green-400">
          Imagen subida: {ipfsUrl}
        </div>
      )}
      
      {status === 'error' && (
        <div className="p-3 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-sm">
          {errorMessage}
        </div>
      )}

      {status === 'success' && (
        <div className="p-3 bg-green-900/50 border border-green-500 rounded-lg text-green-200 text-sm">
          ¡Entrega confirmada exitosamente! El vendedor recibirá el pago pronto.
        </div>
      )}
      
      <button
        onClick={handleSubmit}
        disabled={!file || isSubmitting}
        className={`w-full px-4 py-2 rounded-lg font-medium transition-colors text-white
          ${getStatusColor()}`}
      >
        {getStatusMessage()}
      </button>
    </div>
  );
} 