import type { Call } from "@coinbase/onchainkit/transaction";

// Función para generar la llamada de compra de libro
export const getBuyBookCall = (bookId: number, price: string, to: string): Call[] => [
  {
    to, // dirección del contrato del marketplace
    value: price, // en wei, si es necesario
    abi: [
      {
        "inputs": [
          { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
        ],
        "name": "buy",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      }
    ],
    functionName: "buy",
    args: [bookId],
  }
];

// Función para generar la llamada de compra de guía de estudio
export const getBuyGuideCall = (guideId: number, price: string, to: string): Call[] => [
  {
    to, // dirección del contrato del marketplace de guías
    value: price, // en wei, si es necesario
    abi: [
      // ABI mínima para la función de compra de guía (ajusta cuando tengas el ABI real)
      {
        "inputs": [
          { "internalType": "uint256", "name": "guideId", "type": "uint256" }
        ],
        "name": "buyGuide",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
      }
    ],
    functionName: "buyGuide",
    args: [guideId],
  }
];

export const getMintAndListCall = (tokenURI: string, price: string) => [
  {
    to: "0x096659e074C3CC1427495Ff58532C0459550Ed77" as `0x${string}`,
    abi: [
      {
        "inputs": [
          { "internalType": "string", "name": "tokenURI", "type": "string" },
          { "internalType": "uint256", "name": "price", "type": "uint256" }
        ],
        "name": "mintAndList",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ],
    functionName: "mintAndList",
    args: [tokenURI, price],
    value: "0" // Aseguramos que no se envíe ETH con la transacción
  }
]; 