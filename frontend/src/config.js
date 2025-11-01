// Education Credentials Contract Configuration
export const CONTRACT_ADDRESS = "0x77068916dE6AD4Adb330E7b3d5ca60C10C3942d6";

// Celo Sepolia Testnet configuration
export const CELO_SEPOLIA_CONFIG = {
  chainId: "0xAA044C", // 11142220 in hex
  chainName: "Celo Sepolia Testnet",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18
  },
  rpcUrls: ["https://forno.celo-sepolia.celo-testnet.org"],
  blockExplorerUrls: ["https://sepolia.celoscan.io"]
};

// Contract ABI - All essential functions
export const CONTRACT_ABI = [
  // Institution Management
  "function registerInstitution(string name, string registrationNumber, string country, string website) external",
  "function verifyInstitution(address institutionAddress) external",
  "function suspendInstitution(address institutionAddress, string reason) external",
  "function updateInstitutionReputation(address institutionAddress, uint256 newReputation) external",
  
  // Student Management
  "function registerStudent(string name, string email, string studentId) external",
  "function getStudent(address studentAddress) external view returns (tuple(address studentAddress, string name, string email, string studentId, uint256 certificatesEarned, uint256 skillBadgesEarned, uint256 achievementPoints, uint256 registeredAt, bool exists))",
  
  // Certificate Management
  "function issueCertificate(address studentAddress, uint8 certificateType, string courseName, string major, uint256 completionDate, string grade, string ipfsHash) external payable",
  "function revokeCertificate(uint256 certificateId, string reason) external",
  "function verifyCertificate(uint256 certificateId) external view returns (bool isValid, tuple(uint256 certificateId, address institutionAddress, address studentAddress, uint8 certificateType, string courseName, string major, uint256 issueDate, uint256 completionDate, string grade, string ipfsHash, bool isRevoked, string revocationReason) cert)",
  "function getCertificate(uint256 certificateId) external view returns (tuple(uint256 certificateId, address institutionAddress, address studentAddress, uint8 certificateType, string courseName, string major, uint256 issueDate, uint256 completionDate, string grade, string ipfsHash, bool isRevoked, string revocationReason))",
  "function getStudentCertificates(address studentAddress) external view returns (uint256[] memory)",
  "function getInstitutionCertificates(address institutionAddress) external view returns (uint256[] memory)",
  
  // Skill Badge Management
  "function issueSkillBadge(address holder, string skillName, uint8 level, string description, uint256 expiresAt, string verificationProof) external",
  "function isSkillBadgeValid(uint256 badgeId) external view returns (bool)",
  "function getSkillBadge(uint256 badgeId) external view returns (tuple(uint256 badgeId, address issuer, address holder, string skillName, uint8 level, string description, uint256 issuedAt, uint256 expiresAt, bool isValid, string verificationProof))",
  "function getStudentSkillBadges(address studentAddress) external view returns (uint256[] memory)",
  
  // Achievement Management
  "function createAchievement(string name, string description, uint256 pointsRequired, uint256 rewardAmount) external payable",
  "function claimAchievement(uint256 achievementId) external",
  "function hasCompletedAchievement(address studentAddress, uint256 achievementId) external view returns (bool)",
  "function getAchievement(uint256 achievementId) external view returns (tuple(uint256 achievementId, string name, string description, uint256 pointsRequired, uint256 rewardAmount, bool isActive, uint256 timesCompleted))",
  
  // View Functions
  "function getStats() external view returns (uint256 totalInstitutions, uint256 totalStudents, uint256 totalCertificates, uint256 totalSkillBadges, uint256 totalAchievements, uint256 platformFeePercent)",
  "function getInstitution(address institutionAddress) external view returns (tuple(address institutionAddress, string name, string registrationNumber, string country, string website, uint8 status, uint256 certificatesIssued, uint256 reputation, uint256 registeredAt, bool exists))",
  "function institutions(address) external view returns (address institutionAddress, string name, string registrationNumber, string country, string website, uint8 status, uint256 certificatesIssued, uint256 reputation, uint256 registeredAt, bool exists)",
  "function students(address) external view returns (address studentAddress, string name, string email, string studentId, uint256 certificatesEarned, uint256 skillBadgesEarned, uint256 achievementPoints, uint256 registeredAt, bool exists)",
  
  // Admin Functions
  "function updatePlatformFee(uint256 newFeePercent) external",
  "function updateMinReward(uint256 newMinReward) external",
  "function withdrawFees() external",
  "function fundAchievementRewards() external payable",
  "function owner() external view returns (address)",
  
  // Public state variables
  "function totalInstitutions() external view returns (uint256)",
  "function totalStudents() external view returns (uint256)",
  "function totalCertificates() external view returns (uint256)",
  "function totalSkillBadges() external view returns (uint256)",
  "function totalAchievements() external view returns (uint256)",
  "function platformFeePercent() external view returns (uint256)",
  "function minReward() external view returns (uint256)",
  
  // Events
  "event InstitutionRegistered(address indexed institutionAddress, string name, uint256 timestamp)",
  "event InstitutionVerified(address indexed institutionAddress, uint256 timestamp)",
  "event InstitutionSuspended(address indexed institutionAddress, string reason)",
  "event StudentRegistered(address indexed studentAddress, string name, uint256 timestamp)",
  "event CertificateIssued(uint256 indexed certificateId, address indexed institutionAddress, address indexed studentAddress, string courseName, uint256 timestamp)",
  "event CertificateRevoked(uint256 indexed certificateId, address indexed institutionAddress, string reason, uint256 timestamp)",
  "event SkillBadgeIssued(uint256 indexed badgeId, address indexed issuer, address indexed holder, string skillName, uint8 level, uint256 timestamp)",
  "event AchievementCreated(uint256 indexed achievementId, string name, uint256 pointsRequired, uint256 rewardAmount)",
  "event AchievementCompleted(uint256 indexed achievementId, address indexed studentAddress, uint256 rewardAmount, uint256 timestamp)",
  "event ReputationUpdated(address indexed institutionAddress, uint256 newReputation)",
  "event PlatformFeeUpdated(uint256 newFeePercent)"
];

// Institution Status
export const INSTITUTION_STATUS = {
  0: "Pending",
  1: "Verified",
  2: "Suspended",
  Pending: 0,
  Verified: 1,
  Suspended: 2
};

// Certificate Types
export const CERTIFICATE_TYPES = {
  0: "Diploma",
  1: "Degree",
  2: "Course",
  3: "Training",
  4: "Workshop",
  Diploma: 0,
  Degree: 1,
  Course: 2,
  Training: 3,
  Workshop: 4
};

// Skill Levels
export const SKILL_LEVELS = {
  0: "Beginner",
  1: "Intermediate",
  2: "Advanced",
  3: "Expert",
  Beginner: 0,
  Intermediate: 1,
  Advanced: 2,
  Expert: 3
};

// Constants
export const PLATFORM_FEE_PERCENT = 1; // 1%
export const MIN_REWARD = "0.01"; // 0.01 CELO
export const CERTIFICATE_FEE = "0.001"; // Minimum fee for certificate issuance

// Helper Functions
export const formatDate = (timestamp) => {
  if (!timestamp || timestamp === 0) return "N/A";
  return new Date(Number(timestamp) * 1000).toLocaleString();
};

export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
};

export const getCertificateTypeName = (type) => {
  return CERTIFICATE_TYPES[type] || "Unknown";
};

export const getSkillLevelName = (level) => {
  return SKILL_LEVELS[level] || "Unknown";
};

export const getInstitutionStatusName = (status) => {
  return INSTITUTION_STATUS[status] || "Unknown";
};

export const getExplorerUrl = (address) => {
  return `${CELO_SEPOLIA_CONFIG.blockExplorerUrls[0]}/address/${address}`;
};

export const getTxUrl = (txHash) => {
  return `${CELO_SEPOLIA_CONFIG.blockExplorerUrls[0]}/tx/${txHash}`;
};
