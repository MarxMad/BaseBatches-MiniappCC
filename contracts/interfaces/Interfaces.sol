// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface ICampusCoin {
    function getStudentDetails(address studentAddress) external view returns (
        bool isRegistered,
        uint256 points,
        uint256 level,
        uint256 reputation,
        uint256 totalTransacted
    );
    
    function getLevelBenefits(uint256 level) external view returns (
        string memory name,
        uint256 discountRate,
        uint256 pointsMultiplier,
        uint256 requiredPoints
    );
    
    function getCategory(uint256 categoryId) external view returns (
        string memory name,
        string memory icon,
        bool isActive
    );
}