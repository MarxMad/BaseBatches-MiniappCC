// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Structs.sol";
import "../utils/Modifiers.sol";
import "../utils/Events.sol";

abstract contract Categories is CampusModifiers {
    mapping(uint256 => Category) public categories;
    uint256 public categoryCounter;
    
    function _addCategory(string memory name, string memory icon) internal {
        categoryCounter++;
        categories[categoryCounter] = Category({
            id: categoryCounter,
            name: name,
            icon: icon,
            isActive: true
        });
        emit CategoryAdded(categoryCounter, name);
    }
    
    function addCategory(string memory name, string memory icon) external onlyOwner {
        _addCategory(name, icon);
    }
    
    function toggleCategory(uint256 categoryId) external onlyOwner {
        require(categoryId > 0 && categoryId <= categoryCounter, "Categoria invalida");
        categories[categoryId].isActive = !categories[categoryId].isActive;
        emit CategoryToggled(categoryId, categories[categoryId].isActive);
    }
    
    function getCategory(uint256 categoryId) external view returns (
        string memory name,
        string memory icon,
        bool isActive
    ) {
        require(categoryId > 0 && categoryId <= categoryCounter, "Categoria invalida");
        Category storage category = categories[categoryId];
        return (category.name, category.icon, category.isActive);
    }
}