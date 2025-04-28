// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

contract CampusCoin is ERC20, Ownable, Pausable {
    // Estructura para almacenar información de estudiantes
    struct Student {
        bool isRegistered;
        uint256 balance;
        uint256 lastActivity;
    }

    // Mapeo de direcciones a estudiantes
    mapping(address => Student) public students;
    
    // Eventos
    event StudentRegistered(address indexed student);
    event PaymentMade(address indexed from, address indexed to, uint256 amount);
    event BookPurchased(address indexed student, uint256 amount);
    event RewardClaimed(address indexed student, uint256 amount);

    constructor() ERC20("CampusCoin", "CC") {
        // Mint inicial de tokens para el contrato
        _mint(msg.sender, 1000000 * 10 ** decimals());
    }

    // Modificador para verificar si el estudiante está registrado
    modifier onlyRegistered() {
        require(students[msg.sender].isRegistered, "Estudiante no registrado");
        _;
    }

    // Función para registrar un nuevo estudiante
    function registerStudent(address studentAddress) external onlyOwner {
        require(!students[studentAddress].isRegistered, "Estudiante ya registrado");
        students[studentAddress] = Student({
            isRegistered: true,
            balance: 0,
            lastActivity: block.timestamp
        });
        emit StudentRegistered(studentAddress);
    }

    // Función para realizar un pago entre estudiantes
    function makePayment(address to, uint256 amount) external onlyRegistered whenNotPaused {
        require(students[to].isRegistered, "Destinatario no registrado");
        require(balanceOf(msg.sender) >= amount, "Saldo insuficiente");
        
        _transfer(msg.sender, to, amount);
        students[msg.sender].lastActivity = block.timestamp;
        students[to].lastActivity = block.timestamp;
        
        emit PaymentMade(msg.sender, to, amount);
    }

    // Función para comprar un libro
    function purchaseBook(uint256 amount) external onlyRegistered whenNotPaused {
        require(balanceOf(msg.sender) >= amount, "Saldo insuficiente");
        
        _transfer(msg.sender, owner(), amount);
        students[msg.sender].lastActivity = block.timestamp;
        
        emit BookPurchased(msg.sender, amount);
    }

    // Función para reclamar recompensas
    function claimReward(uint256 amount) external onlyRegistered whenNotPaused {
        require(amount > 0, "Cantidad inválida");
        require(block.timestamp - students[msg.sender].lastActivity >= 1 days, "Debe esperar 24 horas");
        
        _mint(msg.sender, amount);
        students[msg.sender].lastActivity = block.timestamp;
        
        emit RewardClaimed(msg.sender, amount);
    }

    // Función para pausar el contrato en caso de emergencia
    function pause() external onlyOwner {
        _pause();
    }

    // Función para reanudar el contrato
    function unpause() external onlyOwner {
        _unpause();
    }

    // Función para obtener el saldo de un estudiante
    function getStudentBalance(address studentAddress) external view returns (uint256) {
        return balanceOf(studentAddress);
    }

    // Función para verificar si un estudiante está registrado
    function isStudentRegistered(address studentAddress) external view returns (bool) {
        return students[studentAddress].isRegistered;
    }
} 