// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "../modules/Students.sol";
import "../modules/Categories.sol";
import "../modules/Marketplace.sol";

contract CampusCoin is Ownable, Pausable, ReentrancyGuard, Students, Categories, Marketplace {
    constructor(address _usdcAddress) Ownable(msg.sender) {
        usdc = IERC20(_usdcAddress);
        
        // Inicializar categorías
        _addCategory("Libros de Texto", "BOOK");
        _addCategory("Novelas", "NOVEL");
        _addCategory("Referencia", "REF");
        _addCategory("Revistas", "MAG");
        
        // Inicializar niveles
        _addLevelBenefit("Bronce", 0, 1, 0);
        _addLevelBenefit("Plata", 2, 2, 1000);
        _addLevelBenefit("Oro", 5, 3, 5000);
        _addLevelBenefit("Platino", 10, 4, 10000);
    }
    
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}