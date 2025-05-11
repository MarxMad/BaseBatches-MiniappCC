// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";

abstract contract CampusModifiers is Ownable {
    uint256 public constant MIN_REPUTATION = 1;
    uint256 public constant MAX_REPUTATION = 5;
    
    modifier onlyRegistered(address student) {
        require(_isRegistered(student), "Estudiante no registrado");
        _;
    }

    modifier validReputation(uint256 reputation) {
        require(reputation >= MIN_REPUTATION && reputation <= MAX_REPUTATION, "Calificacion invalida");
        _;
    }
    
    function _isRegistered(address student) internal view virtual returns (bool);
}