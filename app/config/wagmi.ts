import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { USDC_ADDRESS, CAMPUS_COIN_ADDRESS, STUDY_GUIDE_NFT_ADDRESS } from '../constants/addresses';
import { USDC_ABI, CAMPUS_COIN_ABI, STUDY_GUIDE_NFT_ABI } from '../constants/abis';
import { MARKETPLACE_ADDRESS, MARKETPLACE_ABI } from '../constants/marketplace';

export const config = createConfig({
    chains: [base],
    transports: {
        [base.id]: http(),
    },
    contracts: {
        marketplace: {
            address: MARKETPLACE_ADDRESS as `0x${string}`,
            abi: MARKETPLACE_ABI
        }
    }
}); 