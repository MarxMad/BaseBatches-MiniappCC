// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";

contract StudyGuideNFT is ERC1155URIStorage, Ownable {
    using Strings for uint256;

    // Estructura para almacenar información de la guía
    struct StudyGuide {
        uint256 id;
        string title;
        string author;
        string description;
        string subject;
        uint256 price;
        address creator;
        bool isAvailable;
        uint256 totalSupply;
        uint256 minted;
    }

    // Mapeo de IDs a guías
    mapping(uint256 => StudyGuide) public studyGuides;
    uint256 public guideCounter;

    // Eventos
    event GuideCreated(uint256 indexed id, address indexed creator, string title, uint256 price);
    event GuidePurchased(uint256 indexed id, address indexed buyer, uint256 amount);
    event GuideMinted(uint256 indexed id, address indexed to, uint256 amount);

    constructor() ERC1155("") Ownable(msg.sender) {}

    // Función para crear una nueva guía
    function createGuide(
        string memory title,
        string memory author,
        string memory description,
        string memory subject,
        uint256 price,
        string memory uri
    ) external onlyOwner returns (uint256) {
        require(price > 0, "Price must be greater than 0");
        
        guideCounter++;
        uint256 newGuideId = guideCounter;

        studyGuides[newGuideId] = StudyGuide({
            id: newGuideId,
            title: title,
            author: author,
            description: description,
            subject: subject,
            price: price,
            creator: msg.sender,
            isAvailable: true,
            totalSupply: 100, // Máximo de NFTs por guía
            minted: 0
        });

        _setURI(newGuideId, uri);
        emit GuideCreated(newGuideId, msg.sender, title, price);
        
        return newGuideId;
    }

    // Función para comprar una guía
    function purchaseGuide(uint256 guideId) external payable {
        StudyGuide storage guide = studyGuides[guideId];
        require(guide.isAvailable, "Guide not available");
        require(msg.value >= guide.price, "Insufficient payment");
        require(guide.minted < guide.totalSupply, "All copies minted");

        // Mintear el NFT al comprador
        _mint(msg.sender, guideId, 1, "");
        guide.minted++;

        // Transferir el pago al creador
        payable(guide.creator).transfer(msg.value);

        emit GuidePurchased(guideId, msg.sender, 1);
    }

    // Función para obtener la URI de una guía específica
    function uri(uint256 guideId) public view override returns (string memory) {
        return _uri(guideId);
    }

    // Función para verificar si una guía está disponible
    function isGuideAvailable(uint256 guideId) external view returns (bool) {
        return studyGuides[guideId].isAvailable && 
               studyGuides[guideId].minted < studyGuides[guideId].totalSupply;
    }

    // Función para obtener información de una guía
    function getGuideInfo(uint256 guideId) external view returns (
        string memory title,
        string memory author,
        string memory description,
        string memory subject,
        uint256 price,
        address creator,
        bool isAvailable,
        uint256 totalSupply,
        uint256 minted
    ) {
        StudyGuide storage guide = studyGuides[guideId];
        return (
            guide.title,
            guide.author,
            guide.description,
            guide.subject,
            guide.price,
            guide.creator,
            guide.isAvailable,
            guide.totalSupply,
            guide.minted
        );
    }
} 