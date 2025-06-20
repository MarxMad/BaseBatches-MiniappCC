// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./CampusCoin.sol";

contract BookNFT is ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    CampusCoin public campusCoin;

    struct Listing {
        address seller;
        uint256 price;
        bool sold;
        bool confirmed;
        address buyer;
    }

    mapping(uint256 => Listing) public listings;
    uint256[] public allTokenIds;

    event BookListed(uint256 indexed tokenId, address indexed seller, uint256 price);
    event BookPurchased(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event DeliveryConfirmed(uint256 indexed tokenId, address indexed buyer);

    constructor(address _campusCoin) ERC721("CampusBook", "CBK") Ownable(msg.sender) {
        campusCoin = CampusCoin(_campusCoin);
    }

    function mintAndList(string memory tokenURI, uint256 price) external returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        listings[newTokenId] = Listing(msg.sender, price, false, false, address(0));
        allTokenIds.push(newTokenId);
        emit BookListed(newTokenId, msg.sender, price);
        return newTokenId;
    }

    function buy(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(!listing.sold, "Book already sold");
        require(ownerOf(tokenId) == listing.seller, "Seller no longer owns the book");
        
        require(
            campusCoin.transferFrom(msg.sender, address(this), listing.price),
            "Transfer failed"
        );
        
        listing.buyer = msg.sender;
        listing.sold = true;
        emit BookPurchased(tokenId, msg.sender, listing.price);
    }

    function confirmDelivery(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.sold, "Book not sold");
        require(msg.sender == listing.buyer, "Only buyer can confirm");
        require(!listing.confirmed, "Already confirmed");

        listing.confirmed = true;
        _transfer(listing.seller, listing.buyer, tokenId);
        require(
            campusCoin.transfer(listing.seller, listing.price),
            "Transfer to seller failed"
        );
        
        emit DeliveryConfirmed(tokenId, msg.sender);
    }

    // Frontend helper functions
    function getAllBooks() external view returns (
        uint256[] memory tokenIds,
        address[] memory sellers,
        uint256[] memory prices,
        bool[] memory soldFlags,
        bool[] memory confirmedFlags,
        address[] memory buyers
    ) {
        uint256 length = allTokenIds.length;
        tokenIds = new uint256[](length);
        sellers = new address[](length);
        prices = new uint256[](length);
        soldFlags = new bool[](length);
        confirmedFlags = new bool[](length);
        buyers = new address[](length);

        for (uint256 i = 0; i < length; i++) {
            uint256 tokenId = allTokenIds[i];
            Listing storage listing = listings[tokenId];
            tokenIds[i] = tokenId;
            sellers[i] = listing.seller;
            prices[i] = listing.price;
            soldFlags[i] = listing.sold;
            confirmedFlags[i] = listing.confirmed;
            buyers[i] = listing.buyer;
        }
    }

    function getMyBooks(address user) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            if (listings[allTokenIds[i]].seller == user) {
                count++;
            }
        }

        uint256[] memory myBooks = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            if (listings[allTokenIds[i]].seller == user) {
                myBooks[index] = allTokenIds[i];
                index++;
            }
        }
        return myBooks;
    }

    function getMyPurchases(address user) external view returns (uint256[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            if (listings[allTokenIds[i]].buyer == user) {
                count++;
            }
        }

        uint256[] memory myPurchases = new uint256[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < allTokenIds.length; i++) {
            if (listings[allTokenIds[i]].buyer == user) {
                myPurchases[index] = allTokenIds[i];
                index++;
            }
        }
        return myPurchases;
    }
} 