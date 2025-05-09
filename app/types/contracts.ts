import { Address } from 'viem';

export interface StudyGuideNFT {
    id: number;
    title: string;
    author: string;
    description: string;
    subject: string;
    price: bigint;
    creator: Address;
    isAvailable: boolean;
    totalSupply: number;
    minted: number;
    uri: string;
}

export interface StudyGuideNFTContract {
    createGuide: (params: {
        title: string;
        author: string;
        description: string;
        subject: string;
        price: bigint;
        uri: string;
    }) => Promise<{ hash: `0x${string}` }>;
    getGuideInfo: (id: number) => Promise<StudyGuideNFT>;
    isGuideAvailable: (id: number) => Promise<boolean>;
    purchaseGuide: (params: {
        id: number;
        value: bigint;
    }) => Promise<{ hash: `0x${string}` }>;
    uri: (id: number) => Promise<string>;
}

export interface USDCContract {
    balanceOf: (address: Address) => Promise<bigint>;
    transfer: (params: {
        to: Address;
        amount: bigint;
    }) => Promise<{ hash: `0x${string}` }>;
}

export interface CampusCoinContract {
    balanceOf: (address: Address) => Promise<bigint>;
    transfer: (params: {
        to: Address;
        amount: bigint;
    }) => Promise<{ hash: `0x${string}` }>;
}

export type ContractWriteResult = {
    hash: `0x${string}`;
};

export type ContractWriteParams = {
    address: Address;
    abi: any;
    functionName: string;
    args: any[];
    value?: bigint;
};

export type UseContractWriteResult = {
    writeContract: (params: ContractWriteParams) => Promise<ContractWriteResult>;
    data: `0x${string}` | undefined;
}; 