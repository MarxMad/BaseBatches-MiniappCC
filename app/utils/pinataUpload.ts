const PINATA_API_KEY = 'e118a5b5cc57e4976932';
const PINATA_API_SECRET = 'c5ab4e0a79ba1f2fe3dd06ac045d905efcdd08e950cc39c8de2c50fac75892f5';

export async function uploadFileToPinata(file: File): Promise<string> {
  const url = `https://api.pinata.cloud/pinning/pinFileToIPFS`;
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_API_SECRET,
    },
    body: formData,
  });

  if (!res.ok) {
    throw new Error('Error subiendo a Pinata');
  }

  const data = await res.json();
  // Devuelve la URL pública de IPFS
  return `https://gateway.pinata.cloud/ipfs/${data.IpfsHash}`;
} 