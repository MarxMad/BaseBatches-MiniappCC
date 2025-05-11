// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

event StudentRegistered(address indexed student);
event PaymentMade(address indexed from, address indexed to, uint256 amount, uint256 category);
event BookListed(uint256 indexed bookId, address indexed seller, uint256 price);
event BookPurchased(uint256 indexed bookId, address indexed buyer, address indexed seller, uint256 amount);
event BookRated(uint256 indexed bookId, address indexed rater, uint256 rating);
event StudentLevelUp(address indexed student, uint256 newLevel);
event PointsEarned(address indexed student, uint256 points);
event CategoryAdded(uint256 indexed categoryId, string name);
event CategoryToggled(uint256 indexed categoryId, bool isActive);