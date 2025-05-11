// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract CampusCoinMarketplace is ERC721URIStorage, ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    struct Listing {
        address seller;
        uint256 price;
        bool sold;
        address buyer;
        bool delivered;
    }

    mapping(uint256 => Listing) public listings;
    mapping(uint256 => string) public deliveryProof; // IPFS hash

    event BookMinted(uint256 indexed tokenId, address indexed seller, uint256 price);
    event BookPurchased(uint256 indexed tokenId, address indexed buyer, uint256 price);
    event DeliveryConfirmed(uint256 indexed tokenId, address indexed buyer, string ipfsHash);

    constructor() ERC721("CampusCoinBook", "CCB") {}

    // 1. Publicar libro/guía (mintear NFT)
    function mintAndList(string memory tokenURI, uint256 price) external returns (uint256) {
        require(price > 0, "Precio debe ser mayor a 0");
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        _mint(msg.sender, newTokenId);
        _setTokenURI(newTokenId, tokenURI); // Si usas ERC721URIStorage
        listings[newTokenId] = Listing(msg.sender, price, false, address(0), false);
        emit BookMinted(newTokenId, msg.sender, price);
        return newTokenId;
    }

    // 2. Comprar libro/guía (escrow)
    function buy(uint256 tokenId) external payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(!listing.sold, "Ya vendido");
        require(msg.value == listing.price, "Monto incorrecto");
        require(ownerOf(tokenId) == listing.seller, "El vendedor ya no es dueno");
        listing.buyer = msg.sender;
        listing.sold = true;
        // El NFT sigue en el vendedor, el dinero queda en el contrato
        emit BookPurchased(tokenId, msg.sender, msg.value);
    }

    // 3. Confirmar entrega (proof of delivery)
    function confirmDelivery(uint256 tokenId, string memory ipfsHash) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.sold, "No vendido");
        require(msg.sender == listing.buyer, "Solo el comprador puede confirmar");
        require(!listing.delivered, "Ya entregado");
        deliveryProof[tokenId] = ipfsHash;
        listing.delivered = true;
        // Transferir NFT al comprador
        _transfer(listing.seller, listing.buyer, tokenId);
        // Liberar pago al vendedor
        payable(listing.seller).transfer(listing.price);
        emit DeliveryConfirmed(tokenId, msg.sender, ipfsHash);
    }

    // (Opcional) Función para que el vendedor retire fondos si hay fallback
    function withdraw() external nonReentrant {
        // Implementa si quieres permitir retiros manuales en casos especiales
    }
}