// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CampusCoin is Ownable, Pausable, ReentrancyGuard {
    // Interface del token USDC
    IERC20 public usdc;
    
    // Estructuras
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

    // Mapeos
    mapping(address => Student) public students;
    mapping(uint256 => Book) public books;
    mapping(uint256 => Category) public categories;
    mapping(uint256 => LevelBenefit) public levelBenefits;
    
    // Contadores
    uint256 public bookCounter;
    uint256 public categoryCounter;
    uint256 public levelCounter;
    
    // Constantes
    uint256 public constant MIN_REPUTATION = 1;
    uint256 public constant MAX_REPUTATION = 5;
    uint256 public constant PLATFORM_FEE = 2; // 2%
    uint256 public constant POINTS_PER_USDC = 1;
    
    // Eventos
    event StudentRegistered(address indexed student);
    event PaymentMade(address indexed from, address indexed to, uint256 amount, uint256 category);
    event BookListed(uint256 indexed bookId, address indexed seller, uint256 price);
    event BookPurchased(uint256 indexed bookId, address indexed buyer, address indexed seller, uint256 amount);
    event BookRated(uint256 indexed bookId, address indexed rater, uint256 rating);
    event StudentLevelUp(address indexed student, uint256 newLevel);
    event PointsEarned(address indexed student, uint256 points);
    event CategoryAdded(uint256 indexed categoryId, string name);

    // Modificadores
    modifier onlyRegistered() {
        require(students[msg.sender].isRegistered, "Estudiante no registrado");
        _;
    }

    modifier validReputation(uint256 reputation) {
        require(reputation >= MIN_REPUTATION && reputation <= MAX_REPUTATION, "Calificacion invalida");
        _;
    }

    // Funciones internas
    function _addCategory(string memory name, string memory icon) private {
        categoryCounter++;
        categories[categoryCounter] = Category({
            id: categoryCounter,
            name: name,
            icon: icon,
            isActive: true
        });
        emit CategoryAdded(categoryCounter, name);
    }

    function _addLevelBenefit(
        string memory name,
        uint256 discountRate,
        uint256 pointsMultiplier,
        uint256 requiredPoints
    ) private {
        levelCounter++;
        levelBenefits[levelCounter] = LevelBenefit({
            level: levelCounter,
            name: name,
            discountRate: discountRate,
            pointsMultiplier: pointsMultiplier,
            requiredPoints: requiredPoints
        });
    }

    // Constructor
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

    // Funciones de registro y gestión de estudiantes
    function registerStudent(address studentAddress) external onlyOwner {
        require(!students[studentAddress].isRegistered, "Estudiante ya registrado");
        students[studentAddress] = Student({
            isRegistered: true,
            lastActivity: block.timestamp,
            reputation: 3,
            totalPurchases: 0,
            totalSales: 0,
            points: 0,
            level: 1,
            totalTransacted: 0
        });
        emit StudentRegistered(studentAddress);
    }

    // Funciones de marketplace
    function listBook(
        string memory title,
        string memory author,
        string memory description,
        uint256 price,
        uint256 category
    ) external onlyRegistered whenNotPaused {
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

    function purchaseBook(uint256 bookId) external onlyRegistered whenNotPaused nonReentrant {
        Book storage book = books[bookId];
        require(book.isAvailable, "Libro no disponible");
        require(book.seller != msg.sender, "No puedes comprar tu propio libro");
        
        uint256 platformFee = (book.price * PLATFORM_FEE) / 100;
        uint256 sellerAmount = book.price - platformFee;
        
        // Aplicar descuento según nivel
        uint256 discount = (book.price * levelBenefits[students[msg.sender].level].discountRate) / 100;
        uint256 finalPrice = book.price - discount;
        
        require(usdc.balanceOf(msg.sender) >= finalPrice, "Saldo USDC insuficiente");
        require(usdc.allowance(msg.sender, address(this)) >= finalPrice, "Permiso USDC insuficiente");
        
        // Transferir USDC
        usdc.transferFrom(msg.sender, book.seller, sellerAmount);
        usdc.transferFrom(msg.sender, owner(), platformFee);
        
        // Actualizar estados
        book.isAvailable = false;
        students[msg.sender].totalPurchases++;
        students[book.seller].totalSales++;
        
        // Actualizar puntos y nivel
        _updatePointsAndLevel(msg.sender, finalPrice);
        
        emit BookPurchased(bookId, msg.sender, book.seller, finalPrice);
    }

    function makePayment(
        address to,
        uint256 amount,
        uint256 category
    ) external onlyRegistered whenNotPaused nonReentrant {
        require(students[to].isRegistered, "Destinatario no registrado");
        require(amount > 0, "Monto invalido");
        require(categories[category].isActive, "Categoria invalida");
        require(usdc.balanceOf(msg.sender) >= amount, "Saldo USDC insuficiente");
        require(usdc.allowance(msg.sender, address(this)) >= amount, "Permiso USDC insuficiente");
        
        // Transferir USDC
        usdc.transferFrom(msg.sender, to, amount);
        
        // Actualizar estados
        students[msg.sender].lastActivity = block.timestamp;
        students[to].lastActivity = block.timestamp;
        
        // Actualizar puntos y nivel
        _updatePointsAndLevel(msg.sender, amount);
        
        emit PaymentMade(msg.sender, to, amount, category);
    }

    // Funciones internas
    function _updatePointsAndLevel(address student, uint256 amount) internal {
        Student storage s = students[student];
        
        // Calcular puntos ganados
        uint256 pointsEarned = amount * POINTS_PER_USDC * levelBenefits[s.level].pointsMultiplier;
        s.points += pointsEarned;
        s.totalTransacted += amount;
        
        // Verificar si sube de nivel
        for (uint256 i = s.level + 1; i <= levelCounter; i++) {
            if (s.points >= levelBenefits[i].requiredPoints) {
                s.level = i;
                emit StudentLevelUp(student, i);
            }
        }
        
        emit PointsEarned(student, pointsEarned);
    }

    // Funciones de consulta
    function getStudentDetails(address studentAddress) external view returns (
        bool isRegistered,
        uint256 points,
        uint256 level,
        uint256 reputation,
        uint256 totalTransacted
    ) {
        Student storage s = students[studentAddress];
        return (
            s.isRegistered,
            s.points,
            s.level,
            s.reputation,
            s.totalTransacted
        );
    }

    function getLevelBenefits(uint256 level) external view returns (
        string memory name,
        uint256 discountRate,
        uint256 pointsMultiplier,
        uint256 requiredPoints
    ) {
        LevelBenefit storage lb = levelBenefits[level];
        return (
            lb.name,
            lb.discountRate,
            lb.pointsMultiplier,
            lb.requiredPoints
        );
    }

    // Funciones de administración
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // Funciones de categorías
    function addCategory(string memory name, string memory icon) external onlyOwner {
        _addCategory(name, icon);
    }

    function toggleCategory(uint256 categoryId) external onlyOwner {
        require(categoryId > 0 && categoryId <= categoryCounter, "Categoria invalida");
        categories[categoryId].isActive = !categories[categoryId].isActive;
    }

    function getCategory(uint256 categoryId) external view returns (
        string memory name,
        string memory icon,
        bool isActive
    ) {
        require(categoryId > 0 && categoryId <= categoryCounter, "Categoria invalida");
        Category storage category = categories[categoryId];
        return (
            category.name,
            category.icon,
            category.isActive
        );
    }
} 