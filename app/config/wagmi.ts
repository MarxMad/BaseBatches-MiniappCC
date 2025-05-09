import { createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { USDC_ADDRESS, CAMPUS_COIN_ADDRESS, STUDY_GUIDE_NFT_ADDRESS } from '../constants/addresses';
import { USDC_ABI, CAMPUS_COIN_ABI, STUDY_GUIDE_NFT_ABI } from '../constants/abis';

export const config = createConfig({
    chains: [base],
    transports: {
        [base.id]: http(),
    },
}); 