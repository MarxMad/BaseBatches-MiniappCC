// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "../utils/Events.sol";
import "../utils/Modifiers.sol";
import "../utils/Structs.sol";

abstract contract Students is CampusModifiers {
    mapping(address => Student) public students;
    mapping(uint256 => LevelBenefit) public levelBenefits;
    
    uint256 public levelCounter;
    uint256 public constant POINTS_PER_USDC = 1;
    
    function registerStudent(address studentAddress) external virtual onlyOwner {
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
    
    function _addLevelBenefit(
        string memory name,
        uint256 discountRate,
        uint256 pointsMultiplier,
        uint256 requiredPoints
    ) internal {
        levelCounter++;
        levelBenefits[levelCounter] = LevelBenefit({
            level: levelCounter,
            name: name,
            discountRate: discountRate,
            pointsMultiplier: pointsMultiplier,
            requiredPoints: requiredPoints
        });
    }
    
    function _updatePointsAndLevel(address student, uint256 amount) internal {
        Student storage s = students[student];
        uint256 pointsEarned = amount * POINTS_PER_USDC * levelBenefits[s.level].pointsMultiplier;
        s.points += pointsEarned;
        s.totalTransacted += amount;
        
        for (uint256 i = s.level + 1; i <= levelCounter; i++) {
            if (s.points >= levelBenefits[i].requiredPoints) {
                s.level = i;
                emit StudentLevelUp(student, i);
            }
        }
        emit PointsEarned(student, pointsEarned);
    }
    
    function getStudentDetails(address studentAddress) external view returns (
        bool isRegistered,
        uint256 points,
        uint256 level,
        uint256 reputation,
        uint256 totalTransacted
    ) {
        Student storage s = students[studentAddress];
        return (s.isRegistered, s.points, s.level, s.reputation, s.totalTransacted);
    }
    
    function getLevelBenefits(uint256 level) external view returns (
        string memory name,
        uint256 discountRate,
        uint256 pointsMultiplier,
        uint256 requiredPoints
    ) {
        LevelBenefit storage lb = levelBenefits[level];
        return (lb.name, lb.discountRate, lb.pointsMultiplier, lb.requiredPoints);
    }
    
    function _isRegistered(address student) internal view override returns (bool) {
        return students[student].isRegistered;
    }
}