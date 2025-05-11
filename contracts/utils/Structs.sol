// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

struct Student {
    bool isRegistered;
    uint256 lastActivity;
    uint256 reputation;
    uint256 totalPurchases;
    uint256 totalSales;
    uint256 points;          
    uint256 level;           
    uint256 totalTransacted; 
}

struct Category {
    uint256 id;
    string name;
    string icon;
    bool isActive;
}

struct Book {
    uint256 id;
    string title;
    string author;
    string description;
    address seller;
    uint256 price;          
    bool isAvailable;
    uint256 category;
    uint256 rating;
    uint256 totalRatings;
}

struct LevelBenefit {
    uint256 level;
    string name;
    uint256 discountRate;    
    uint256 pointsMultiplier; 
    uint256 requiredPoints;   
}