import { useState } from "react";
import { useAccount, useSignMessage, useContractWrite } from "wagmi";
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from "../constants/marketplace";

export function ProofOfDelivery({ orderId, onProofSubmitted }: { orderId: number, onProofSubmitted?: () => void }) {
  const { address } = useAccount();
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [ipfsUrl, setIpfsUrl] = useState<string | null>(null);
  const { signMessageAsync } = useSignMessage();
  const { writeAsync: confirmDelivery } = useContractWrite({
    address: MARKETPLACE_ADDRESS,
    abi: MARKETPLACE_ABI,
    functionName: "confirmDelivery",
  });

  // Simulación de subida a IPFS (reemplaza por tu lógica real)
  const uploadToIPFS = async (file: File) => {
    // Aquí deberías usar web3.storage, nft.storage, Pinata, etc.
    // Por ahora, solo simula un hash
    return "ipfs://fakehash";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setIsSubmitting(true);

    // 1. Sube la foto a IPFS
    const ipfsHash = await uploadToIPFS(file);
    setIpfsUrl(ipfsHash);

    // 2. Firma un mensaje (opcional, pero recomendado)
    const message = `Confirmo que recibí el recurso del pedido #${orderId} con prueba: ${ipfsHash}`;
    const signature = await signMessageAsync({ message });

    // 3. Llama a la función del contrato
    await confirmDelivery({ args: [orderId, ipfsHash] });

    setIsSubmitting(false);
    if (onProofSubmitted) onProofSubmitted();
    alert("¡Prueba de entrega enviada! El vendedor recibirá el pago pronto.");
  };

  return (
    <div className="space-y-2">
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {ipfsUrl && (
        <div className="text-xs text-green-600">Imagen subida: {ipfsUrl}</div>
      )}
      <button
        onClick={handleSubmit}
        disabled={!file || isSubmitting}
        className="px-4 py-2 bg-green-600 text-white rounded"
      >
        {isSubmitting ? "Enviando..." : "Recibí libro/guía"}
      </button>
    </div>
  );
} 