# 🎓 Education Credentials - Decentralized Certification Platform



A comprehensive blockchain-based platform for issuing, managing, and verifying educational certificates, skill badges, and achievements on the Celo network.This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.



## 🌟 OverviewTry running some of the following tasks:



The Education Credentials platform revolutionizes how educational institutions issue and students receive academic credentials. By leveraging blockchain technology on Celo, we create immutable, verifiable, and portable digital certificates that students truly own.```shell

npx hardhat help

## ✨ Key Featuresnpx hardhat test

REPORT_GAS=true npx hardhat test

### For Educational Institutionsnpx hardhat node

- **📜 Certificate Issuance**: Issue diplomas, degrees, courses, training certificatesnpx hardhat ignition deploy ./ignition/modules/Lock.js

- **🎖️ Skill Badge System**: Award skill badges with 4 competency levels```

- **🔐 Institutional Verification**: Verified status and reputation tracking
- **📊 Analytics**: Track all certificates and badges issued

### For Students
- **🎓 Digital Portfolio**: Collect and manage all your credentials
- **🏆 Achievement System**: Earn points and claim CELO rewards
- **✅ Instant Verification**: Share verifiable credentials with employers
- **💼 Career Ready**: Portable credentials accepted globally

### For Employers
- **🔍 Quick Verification**: Verify credentials instantly
- **✔️ Trustworthy**: Check institution status and reputation
- **📋 Comprehensive**: View complete educational history


## 📋 Quick Start

### Installation
```bash
npm install
```

### Compile Contracts
```bash
npm run compile
```

### Run Tests (43 tests, 100% passing)
```bash
npm test
```

### Deploy to Celo Sepolia
```bash
npm run deploy:sepolia
```

## 📖 Usage Examples

### Register as Institution
```javascript
await contract.registerInstitution(
  "MIT",
  "REG-MIT-001",
  "United States",
  "https://mit.edu"
);
```

### Issue Certificate
```javascript
await contract.issueCertificate(
  studentAddress,
  1, // Degree
  "Computer Science",
  "Bachelor of Science",
  completionDate,
  "A",
  "QmIPFSHash...",
  { value: fee }
);
```

### Issue Skill Badge
```javascript
await contract.issueSkillBadge(
  studentAddress,
  "Solidity Development",
  2, // Advanced
  "Expert in smart contracts",
  expiryDate,
  "CERT-2024-001"
);
```

### Verify Certificate
```javascript
const [isValid, cert] = await contract.verifyCertificate(certificateId);
```

## 🛠️ Technology Stack

- **Solidity** 0.8.20 with optimizer
- **OpenZeppelin** Contracts (Ownable, ReentrancyGuard)
- **Hardhat** Development environment
- **Ethers.js** v6
- **Celo** Blockchain (Sepolia Testnet)

## 🔒 Security Features

✅ Access control with Ownable pattern  
✅ Reentrancy protection on payments  
✅ Input validation and duplicate prevention  
✅ Certificate revocation system  
✅ Institution verification and reputation  
✅ 43/43 tests passing (100% coverage)

## 📊 Contract Statistics

- **Total Institutions**: Tracked
- **Total Students**: Tracked
- **Total Certificates**: Issued count
- **Total Skill Badges**: Awarded count
- **Total Achievements**: Available rewards
- **Platform Fee**: 1% (configurable)
- **Min Achievement Reward**: 0.01 CELO

## 🎯 Core Functions

### Institution Management
- `registerInstitution()` - Register new institution
- `verifyInstitution()` - Owner verifies institution
- `suspendInstitution()` - Suspend fraudulent institution
- `updateInstitutionReputation()` - Update reputation score

### Student Management
- `registerStudent()` - Student registration
- `getStudent()` - Get student profile
- `getStudentCertificates()` - List all certificates
- `getStudentSkillBadges()` - List all badges

### Certificate Operations
- `issueCertificate()` - Issue new certificate (with fee)
- `revokeCertificate()` - Revoke certificate
- `verifyCertificate()` - Verify certificate validity
- `getCertificate()` - Get certificate details

### Skill Badge Operations
- `issueSkillBadge()` - Award skill badge
- `isSkillBadgeValid()` - Check badge validity/expiry
- `getSkillBadge()` - Get badge details

### Achievement System
- `createAchievement()` - Owner creates achievement
- `claimAchievement()` - Student claims reward
- `getAchievement()` - Get achievement details

### Admin Functions
- `updatePlatformFee()` - Update fee percentage
- `withdrawFees()` - Withdraw collected fees
- `fundAchievementRewards()` - Fund rewards pool

## 📝 Data Structures

### Certificate Types
0. Diploma
1. Degree
2. Course
3. Training
4. Workshop

### Skill Levels
0. Beginner
1. Intermediate
2. Advanced
3. Expert

### Institution Status
0. Pending
1. Verified
2. Suspended

## 🧪 Testing

Run comprehensive test suite:
```bash
npm test
```

With gas reporting:
```bash
npm run test:gas
```

**Test Coverage**: 43/43 tests passing
- Deployment tests
- Institution registration & verification
- Student registration
- Certificate issuance & revocation
- Certificate verification
- Skill badge issuance & expiry
- Achievement system
- Admin functions
- Security & edge cases

## 📈 Gas Usage

| Function | Average Gas |
|----------|------------|
| registerInstitution | 231,735 |
| registerStudent | 189,402 |
| issueCertificate | 441,587 |
| issueSkillBadge | 358,565 |
| claimAchievement | 157,445 |
| Deployment | 5,007,892 |

## 🌐 Network Configuration

### Celo Sepolia
```javascript
{
  url: "https://forno.celo-sepolia.celo-testnet.org",
  chainId: 11142220,
  accounts: { mnemonic: process.env.MNEMONIC }
}
```

### Celo Mainnet
```javascript
{
  url: "https://forno.celo.org",
  chainId: 42220,
  accounts: { mnemonic: process.env.MNEMONIC }
}
```

## 🚀 Future Enhancements

- [ ] NFT integration for certificates
- [ ] QR code generation
- [ ] Mobile app integration
- [ ] Batch certificate issuance
- [ ] Multi-language support
- [ ] Email notifications
- [ ] DAO governance
- [ ] Cross-chain bridges

## 📞 Support

- **GitHub Issues**: Report bugs
- **Celo Discord**: [Join Community](https://discord.com/invite/celo)
- **Documentation**: [Celo Docs](https://docs.celo.org)
- **Faucet**: [Get Test Tokens](https://faucet.celo.org/sepolia)

## 📄 License

MIT License - Free to use and modify

## 🙏 Acknowledgments

- Celo Foundation for the amazing blockchain
- OpenZeppelin for secure contract libraries
- Hardhat team for development tools
- Education technology pioneers

---

