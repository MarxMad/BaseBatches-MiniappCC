// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract POAPVerifier {
    IERC721 public poapContract;

    constructor(address _poapContract) {
        poapContract = IERC721(_poapContract);
    }

    function isStudent(address user) external view returns (bool) {
        return poapContract.balanceOf(user) > 0;
    }

    function getUserPOAPs(address user) external view returns (uint256[] memory) {
        uint256 balance = poapContract.balanceOf(user);
        uint256[] memory poaps = new uint256[](balance);
        
        // Nota: Esta implementación es simplificada y podría no funcionar correctamente
        // para todos los casos debido a las limitaciones de ERC721.
        // En una implementación real, necesitarías un mecanismo adicional para
        // rastrear los tokenIds específicos.
        
        return poaps;
    }
} 