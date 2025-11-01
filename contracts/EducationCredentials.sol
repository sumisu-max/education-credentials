// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title EducationCredentials
 * @dev Decentralized platform for issuing and verifying educational certificates, skill badges, and achievements
 * @notice This contract enables educational institutions to issue verifiable credentials on the Celo blockchain
 */
contract EducationCredentials is Ownable, ReentrancyGuard {
    
    // ============ State Variables ============
    
    uint256 public totalInstitutions;
    uint256 public totalStudents;
    uint256 public totalCertificates;
    uint256 public totalSkillBadges;
    uint256 public totalAchievements;
    
    // Platform fee for certificate issuance (in basis points: 100 = 1%)
    uint256 public platformFeePercent = 100; // 1%
    uint256 public constant BASIS_POINTS = 10000;
    
    // Minimum reward for achievement completion
    uint256 public minReward = 0.01 ether;
    
    // ============ Enums ============
    
    enum InstitutionStatus { Pending, Verified, Suspended }
    enum CertificateType { Diploma, Degree, Course, Training, Workshop }
    enum SkillLevel { Beginner, Intermediate, Advanced, Expert }
    
    // ============ Structs ============
    
    struct Institution {
        address institutionAddress;
        string name;
        string registrationNumber;
        string country;
        string website;
        InstitutionStatus status;
        uint256 certificatesIssued;
        uint256 reputation; // 0-1000 score
        uint256 registeredAt;
        bool exists;
    }
    
    struct Student {
        address studentAddress;
        string name;
        string email;
        string studentId;
        uint256 certificatesEarned;
        uint256 skillBadgesEarned;
        uint256 achievementPoints;
        uint256 registeredAt;
        bool exists;
    }
    
    struct Certificate {
        uint256 certificateId;
        address institutionAddress;
        address studentAddress;
        CertificateType certificateType;
        string courseName;
        string major;
        uint256 issueDate;
        uint256 completionDate;
        string grade;
        string ipfsHash; // For storing certificate document
        bool isRevoked;
        string revocationReason;
    }
    
    struct SkillBadge {
        uint256 badgeId;
        address issuer;
        address holder;
        string skillName;
        SkillLevel level;
        string description;
        uint256 issuedAt;
        uint256 expiresAt; // 0 means never expires
        bool isValid;
        string verificationProof;
    }
    
    struct Achievement {
        uint256 achievementId;
        string name;
        string description;
        uint256 pointsRequired;
        uint256 rewardAmount;
        bool isActive;
        uint256 timesCompleted;
    }
    
    struct StudentAchievement {
        uint256 achievementId;
        address studentAddress;
        uint256 completedAt;
        uint256 rewardClaimed;
    }
    
    // ============ Mappings ============
    
    mapping(address => Institution) public institutions;
    mapping(address => Student) public students;
    mapping(uint256 => Certificate) public certificates;
    mapping(uint256 => SkillBadge) public skillBadges;
    mapping(uint256 => Achievement) public achievements;
    mapping(bytes32 => bool) public certificateHashes; // For uniqueness verification
    
    // Student achievements tracking
    mapping(address => mapping(uint256 => StudentAchievement)) public studentAchievements;
    mapping(address => uint256[]) public studentCertificateIds;
    mapping(address => uint256[]) public studentSkillBadgeIds;
    mapping(address => uint256[]) public institutionCertificateIds;
    
    // ============ Events ============
    
    event InstitutionRegistered(address indexed institutionAddress, string name, uint256 timestamp);
    event InstitutionVerified(address indexed institutionAddress, uint256 timestamp);
    event InstitutionSuspended(address indexed institutionAddress, string reason);
    
    event StudentRegistered(address indexed studentAddress, string name, uint256 timestamp);
    
    event CertificateIssued(
        uint256 indexed certificateId,
        address indexed institutionAddress,
        address indexed studentAddress,
        string courseName,
        uint256 timestamp
    );
    
    event CertificateRevoked(
        uint256 indexed certificateId,
        address indexed institutionAddress,
        string reason,
        uint256 timestamp
    );
    
    event SkillBadgeIssued(
        uint256 indexed badgeId,
        address indexed issuer,
        address indexed holder,
        string skillName,
        SkillLevel level,
        uint256 timestamp
    );
    
    event AchievementCreated(
        uint256 indexed achievementId,
        string name,
        uint256 pointsRequired,
        uint256 rewardAmount
    );
    
    event AchievementCompleted(
        uint256 indexed achievementId,
        address indexed studentAddress,
        uint256 rewardAmount,
        uint256 timestamp
    );
    
    event ReputationUpdated(address indexed institutionAddress, uint256 newReputation);
    event PlatformFeeUpdated(uint256 newFeePercent);
    
    // ============ Modifiers ============
    
    modifier onlyVerifiedInstitution() {
        require(institutions[msg.sender].exists, "Institution not registered");
        require(institutions[msg.sender].status == InstitutionStatus.Verified, "Institution not verified");
        _;
    }
    
    modifier onlyRegisteredStudent() {
        require(students[msg.sender].exists, "Student not registered");
        _;
    }
    
    modifier certificateExists(uint256 _certificateId) {
        require(_certificateId > 0 && _certificateId <= totalCertificates, "Certificate does not exist");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() Ownable(msg.sender) {
        // Contract is ready to use
    }
    
    // ============ Institution Functions ============
    
    /**
     * @dev Register a new educational institution
     */
    function registerInstitution(
        string memory _name,
        string memory _registrationNumber,
        string memory _country,
        string memory _website
    ) external {
        require(!institutions[msg.sender].exists, "Institution already registered");
        require(bytes(_name).length > 0, "Name required");
        require(bytes(_registrationNumber).length > 0, "Registration number required");
        
        institutions[msg.sender] = Institution({
            institutionAddress: msg.sender,
            name: _name,
            registrationNumber: _registrationNumber,
            country: _country,
            website: _website,
            status: InstitutionStatus.Pending,
            certificatesIssued: 0,
            reputation: 500, // Start with neutral reputation
            registeredAt: block.timestamp,
            exists: true
        });
        
        totalInstitutions++;
        
        emit InstitutionRegistered(msg.sender, _name, block.timestamp);
    }
    
    /**
     * @dev Verify an institution (only owner)
     */
    function verifyInstitution(address _institutionAddress) external onlyOwner {
        require(institutions[_institutionAddress].exists, "Institution not found");
        institutions[_institutionAddress].status = InstitutionStatus.Verified;
        
        emit InstitutionVerified(_institutionAddress, block.timestamp);
    }
    
    /**
     * @dev Suspend an institution (only owner)
     */
    function suspendInstitution(address _institutionAddress, string memory _reason) external onlyOwner {
        require(institutions[_institutionAddress].exists, "Institution not found");
        institutions[_institutionAddress].status = InstitutionStatus.Suspended;
        
        emit InstitutionSuspended(_institutionAddress, _reason);
    }
    
    /**
     * @dev Update institution reputation
     */
    function updateInstitutionReputation(address _institutionAddress, uint256 _newReputation) external onlyOwner {
        require(institutions[_institutionAddress].exists, "Institution not found");
        require(_newReputation <= 1000, "Reputation must be <= 1000");
        
        institutions[_institutionAddress].reputation = _newReputation;
        
        emit ReputationUpdated(_institutionAddress, _newReputation);
    }
    
    // ============ Student Functions ============
    
    /**
     * @dev Register a new student
     */
    function registerStudent(
        string memory _name,
        string memory _email,
        string memory _studentId
    ) external {
        require(!students[msg.sender].exists, "Student already registered");
        require(bytes(_name).length > 0, "Name required");
        
        students[msg.sender] = Student({
            studentAddress: msg.sender,
            name: _name,
            email: _email,
            studentId: _studentId,
            certificatesEarned: 0,
            skillBadgesEarned: 0,
            achievementPoints: 0,
            registeredAt: block.timestamp,
            exists: true
        });
        
        totalStudents++;
        
        emit StudentRegistered(msg.sender, _name, block.timestamp);
    }
    
    /**
     * @dev Get student details
     */
    function getStudent(address _studentAddress) external view returns (Student memory) {
        require(students[_studentAddress].exists, "Student not found");
        return students[_studentAddress];
    }
    
    // ============ Certificate Functions ============
    
    /**
     * @dev Issue a new certificate to a student
     */
    function issueCertificate(
        address _studentAddress,
        CertificateType _certificateType,
        string memory _courseName,
        string memory _major,
        uint256 _completionDate,
        string memory _grade,
        string memory _ipfsHash
    ) external payable onlyVerifiedInstitution nonReentrant {
        require(students[_studentAddress].exists, "Student not registered");
        require(bytes(_courseName).length > 0, "Course name required");
        require(_completionDate <= block.timestamp, "Completion date cannot be in future");
        
        // Calculate platform fee
        uint256 platformFee = (msg.value * platformFeePercent) / BASIS_POINTS;
        require(msg.value >= platformFee, "Insufficient fee");
        
        // Create unique hash to prevent duplicate certificates
        bytes32 certHash = keccak256(abi.encodePacked(
            _studentAddress,
            _courseName,
            _major,
            _completionDate,
            msg.sender
        ));
        require(!certificateHashes[certHash], "Certificate already issued");
        
        totalCertificates++;
        
        certificates[totalCertificates] = Certificate({
            certificateId: totalCertificates,
            institutionAddress: msg.sender,
            studentAddress: _studentAddress,
            certificateType: _certificateType,
            courseName: _courseName,
            major: _major,
            issueDate: block.timestamp,
            completionDate: _completionDate,
            grade: _grade,
            ipfsHash: _ipfsHash,
            isRevoked: false,
            revocationReason: ""
        });
        
        certificateHashes[certHash] = true;
        studentCertificateIds[_studentAddress].push(totalCertificates);
        institutionCertificateIds[msg.sender].push(totalCertificates);
        
        // Update counters
        students[_studentAddress].certificatesEarned++;
        students[_studentAddress].achievementPoints += 100; // Award points for certificate
        institutions[msg.sender].certificatesIssued++;
        
        emit CertificateIssued(
            totalCertificates,
            msg.sender,
            _studentAddress,
            _courseName,
            block.timestamp
        );
    }
    
    /**
     * @dev Revoke a certificate
     */
    function revokeCertificate(
        uint256 _certificateId,
        string memory _reason
    ) external onlyVerifiedInstitution certificateExists(_certificateId) {
        Certificate storage cert = certificates[_certificateId];
        require(cert.institutionAddress == msg.sender, "Not certificate issuer");
        require(!cert.isRevoked, "Certificate already revoked");
        require(bytes(_reason).length > 0, "Reason required");
        
        cert.isRevoked = true;
        cert.revocationReason = _reason;
        
        // Decrease student's certificate count
        if (students[cert.studentAddress].certificatesEarned > 0) {
            students[cert.studentAddress].certificatesEarned--;
        }
        
        emit CertificateRevoked(_certificateId, msg.sender, _reason, block.timestamp);
    }
    
    /**
     * @dev Verify if a certificate is valid
     */
    function verifyCertificate(uint256 _certificateId) 
        external 
        view 
        certificateExists(_certificateId) 
        returns (bool isValid, Certificate memory cert) 
    {
        cert = certificates[_certificateId];
        isValid = !cert.isRevoked && institutions[cert.institutionAddress].status == InstitutionStatus.Verified;
        return (isValid, cert);
    }
    
    /**
     * @dev Get all certificates for a student
     */
    function getStudentCertificates(address _studentAddress) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return studentCertificateIds[_studentAddress];
    }
    
    /**
     * @dev Get all certificates issued by an institution
     */
    function getInstitutionCertificates(address _institutionAddress) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return institutionCertificateIds[_institutionAddress];
    }
    
    // ============ Skill Badge Functions ============
    
    /**
     * @dev Issue a skill badge to a student
     */
    function issueSkillBadge(
        address _holder,
        string memory _skillName,
        SkillLevel _level,
        string memory _description,
        uint256 _expiresAt,
        string memory _verificationProof
    ) external onlyVerifiedInstitution {
        require(students[_holder].exists, "Holder must be registered student");
        require(bytes(_skillName).length > 0, "Skill name required");
        
        totalSkillBadges++;
        
        skillBadges[totalSkillBadges] = SkillBadge({
            badgeId: totalSkillBadges,
            issuer: msg.sender,
            holder: _holder,
            skillName: _skillName,
            level: _level,
            description: _description,
            issuedAt: block.timestamp,
            expiresAt: _expiresAt,
            isValid: true,
            verificationProof: _verificationProof
        });
        
        studentSkillBadgeIds[_holder].push(totalSkillBadges);
        students[_holder].skillBadgesEarned++;
        students[_holder].achievementPoints += 50; // Award points for skill badge
        
        emit SkillBadgeIssued(
            totalSkillBadges,
            msg.sender,
            _holder,
            _skillName,
            _level,
            block.timestamp
        );
    }
    
    /**
     * @dev Check if a skill badge is currently valid
     */
    function isSkillBadgeValid(uint256 _badgeId) external view returns (bool) {
        require(_badgeId > 0 && _badgeId <= totalSkillBadges, "Badge does not exist");
        SkillBadge memory badge = skillBadges[_badgeId];
        
        if (!badge.isValid) return false;
        if (badge.expiresAt == 0) return true; // Never expires
        if (badge.expiresAt > block.timestamp) return true; // Not expired yet
        
        return false;
    }
    
    /**
     * @dev Get all skill badges for a student
     */
    function getStudentSkillBadges(address _studentAddress) 
        external 
        view 
        returns (uint256[] memory) 
    {
        return studentSkillBadgeIds[_studentAddress];
    }
    
    // ============ Achievement Functions ============
    
    /**
     * @dev Create a new achievement (only owner)
     */
    function createAchievement(
        string memory _name,
        string memory _description,
        uint256 _pointsRequired,
        uint256 _rewardAmount
    ) external payable onlyOwner {
        require(bytes(_name).length > 0, "Name required");
        require(_pointsRequired > 0, "Points must be greater than 0");
        require(_rewardAmount >= minReward, "Reward too low");
        require(msg.value >= _rewardAmount, "Must fund achievement reward");
        
        totalAchievements++;
        
        achievements[totalAchievements] = Achievement({
            achievementId: totalAchievements,
            name: _name,
            description: _description,
            pointsRequired: _pointsRequired,
            rewardAmount: _rewardAmount,
            isActive: true,
            timesCompleted: 0
        });
        
        emit AchievementCreated(totalAchievements, _name, _pointsRequired, _rewardAmount);
    }
    
    /**
     * @dev Claim an achievement reward
     */
    function claimAchievement(uint256 _achievementId) external onlyRegisteredStudent nonReentrant {
        require(_achievementId > 0 && _achievementId <= totalAchievements, "Achievement does not exist");
        require(achievements[_achievementId].isActive, "Achievement not active");
        require(
            studentAchievements[msg.sender][_achievementId].completedAt == 0,
            "Achievement already claimed"
        );
        
        Achievement storage achievement = achievements[_achievementId];
        Student storage student = students[msg.sender];
        
        require(
            student.achievementPoints >= achievement.pointsRequired,
            "Insufficient achievement points"
        );
        
        // Ensure contract has enough balance for reward
        require(address(this).balance >= achievement.rewardAmount, "Insufficient contract balance");
        
        // Record achievement completion
        studentAchievements[msg.sender][_achievementId] = StudentAchievement({
            achievementId: _achievementId,
            studentAddress: msg.sender,
            completedAt: block.timestamp,
            rewardClaimed: achievement.rewardAmount
        });
        
        achievement.timesCompleted++;
        
        // Transfer reward
        (bool success, ) = payable(msg.sender).call{value: achievement.rewardAmount}("");
        require(success, "Reward transfer failed");
        
        emit AchievementCompleted(_achievementId, msg.sender, achievement.rewardAmount, block.timestamp);
    }
    
    /**
     * @dev Check if student has completed an achievement
     */
    function hasCompletedAchievement(address _studentAddress, uint256 _achievementId) 
        external 
        view 
        returns (bool) 
    {
        return studentAchievements[_studentAddress][_achievementId].completedAt > 0;
    }
    
    /**
     * @dev Get achievement details
     */
    function getAchievement(uint256 _achievementId) external view returns (Achievement memory) {
        require(_achievementId > 0 && _achievementId <= totalAchievements, "Achievement does not exist");
        return achievements[_achievementId];
    }
    
    // ============ Admin Functions ============
    
    /**
     * @dev Update platform fee
     */
    function updatePlatformFee(uint256 _newFeePercent) external onlyOwner {
        require(_newFeePercent <= 1000, "Fee cannot exceed 10%"); // Max 10%
        platformFeePercent = _newFeePercent;
        
        emit PlatformFeeUpdated(_newFeePercent);
    }
    
    /**
     * @dev Update minimum reward
     */
    function updateMinReward(uint256 _newMinReward) external onlyOwner {
        minReward = _newMinReward;
    }
    
    /**
     * @dev Withdraw platform fees
     */
    function withdrawFees() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev Fund contract for achievement rewards
     */
    function fundAchievementRewards() external payable onlyOwner {
        require(msg.value > 0, "Must send funds");
    }
    
    // ============ View Functions ============
    
    /**
     * @dev Get contract statistics
     */
    function getStats() external view returns (
        uint256 _totalInstitutions,
        uint256 _totalStudents,
        uint256 _totalCertificates,
        uint256 _totalSkillBadges,
        uint256 _totalAchievements,
        uint256 _platformFeePercent
    ) {
        return (
            totalInstitutions,
            totalStudents,
            totalCertificates,
            totalSkillBadges,
            totalAchievements,
            platformFeePercent
        );
    }
    
    /**
     * @dev Get institution details
     */
    function getInstitution(address _institutionAddress) external view returns (Institution memory) {
        require(institutions[_institutionAddress].exists, "Institution not found");
        return institutions[_institutionAddress];
    }
    
    /**
     * @dev Get certificate details
     */
    function getCertificate(uint256 _certificateId) 
        external 
        view 
        certificateExists(_certificateId) 
        returns (Certificate memory) 
    {
        return certificates[_certificateId];
    }
    
    /**
     * @dev Get skill badge details
     */
    function getSkillBadge(uint256 _badgeId) external view returns (SkillBadge memory) {
        require(_badgeId > 0 && _badgeId <= totalSkillBadges, "Badge does not exist");
        return skillBadges[_badgeId];
    }
    
    // Allow contract to receive ETH
    receive() external payable {}
}
