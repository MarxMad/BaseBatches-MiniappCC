// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../utils/Structs.sol";
import "../utils/Modifiers.sol";
import "../utils/Events.sol";
import "./Categories.sol";
import "./Students.sol";

abstract contract Marketplace is CampusModifiers, Students, Categories {
    IERC20 public usdc;
    mapping(uint256 => Book) public books;
    uint256 public bookCounter;
    uint256 public constant PLATFORM_FEE = 2; // 2%
    
    function listBook(
        string memory title,
        string memory author,
        string memory description,
        uint256 price,
        uint256 category
    ) external virtual onlyRegistered(msg.sender) {
        require(price > 0, "Precio invalido");
        require(categories[category].isActive, "Categoria invalida");
        
        bookCounter++;
        books[bookCounter] = Book({
            id: bookCounter,
            title: title,
            author: author,
            description: description,
            seller: msg.sender,
            price: price,
            isAvailable: true,
            category: category,
            rating: 0,
            totalRatings: 0
        });
        
        emit BookListed(bookCounter, msg.sender, price);
    }
    
    function purchaseBook(uint256 bookId) external virtual onlyRegistered(msg.sender)  {
        Book storage book = books[bookId];
        require(book.isAvailable, "Libro no disponible");
        require(book.seller != msg.sender, "No puedes comprar tu propio libro");
        
        uint256 platformFee = (book.price * PLATFORM_FEE) / 100;
        uint256 sellerAmount = book.price - platformFee;
        uint256 discount = (book.price * levelBenefits[students[msg.sender].level].discountRate) / 100;
        uint256 finalPrice = book.price - discount;
        
        require(usdc.balanceOf(msg.sender) >= finalPrice, "Saldo USDC insuficiente");
        require(usdc.allowance(msg.sender, address(this)) >= finalPrice, "Permiso USDC insuficiente");
        
        usdc.transferFrom(msg.sender, book.seller, sellerAmount);
        usdc.transferFrom(msg.sender, owner(), platformFee);
        
        book.isAvailable = false;
        students[msg.sender].totalPurchases++;
        students[book.seller].totalSales++;
        
        _updatePointsAndLevel(msg.sender, finalPrice);
        emit BookPurchased(bookId, msg.sender, book.seller, finalPrice);
    }
    
    function makePayment(
        address to,
        uint256 amount,
        uint256 category
    ) external virtual onlyRegistered(msg.sender)  {
        require(_isRegistered(to), "Destinatario no registrado");
        require(amount > 0, "Monto invalido");
        require(categories[category].isActive, "Categoria invalida");
        require(usdc.balanceOf(msg.sender) >= amount, "Saldo USDC insuficiente");
        require(usdc.allowance(msg.sender, address(this)) >= amount, "Permiso USDC insuficiente");
        
        usdc.transferFrom(msg.sender, to, amount);
        students[msg.sender].lastActivity = block.timestamp;
        students[to].lastActivity = block.timestamp;
        
        _updatePointsAndLevel(msg.sender, amount);
        emit PaymentMade(msg.sender, to, amount, category);
    }
}