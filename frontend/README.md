# Education Credentials Frontend

Modern, responsive React frontend for the Education Credentials DApp deployed on Celo blockchain.

## 🎓 Overview

The Education Credentials frontend provides a comprehensive interface for three types of users:

- **🏛️ Institutions** - Register, issue certificates, and award skill badges
- **👨‍🎓 Students** - Build digital portfolios and claim achievement rewards
- **✅ Verifiers** - Instantly verify credential authenticity

## 🌟 Features

### For All Users
- 🔐 MetaMask wallet connection
- 🌍 Automatic Celo Sepolia network detection
- 📊 Real-time contract statistics
- ✅ Certificate verification system
- 🏆 Achievement tracking

### For Institutions
- 📝 Institution registration
- 📜 Certificate issuance (5 types)
- 🏅 Skill badge awards (4 levels)
- 📋 View issued certificates
- 📊 Track reputation score

### For Students
- 👤 Student registration
- 📚 View all credentials
- 🏅 Track skill badges
- 🏆 Claim achievement rewards
- 📈 Monitor achievement points

### For Platform Owner
- ✅ Verify institutions
- 🏆 Create achievements
- 💰 Manage platform fees
- 📊 Monitor platform activity

## 🚀 Quick Start

### Prerequisites

- Node.js v18+ and npm
- MetaMask browser extension
- CELO tokens on Sepolia testnet

### Installation

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:3007`

### Get Test CELO

Visit the [Celo Sepolia Faucet](https://faucet.celo.org/sepolia) to get test tokens.

## 🏗️ Project Structure

```
frontend/
├── src/
│   ├── App.jsx          # Main application component
│   ├── App.css          # Application styles
│   ├── config.js        # Contract configuration & ABI
│   └── main.jsx         # React entry point
├── index.html           # HTML template
├── package.json         # Dependencies
└── vite.config.js       # Vite configuration
```

## 🔧 Configuration

### Contract Address

The contract address is configured in `src/config.js`:

```javascript
export const CONTRACT_ADDRESS = "0x77068916dE6AD4Adb330E7b3d5ca60C10C3942d6";
```

### Network Configuration

The app is configured for Celo Sepolia testnet:

```javascript
export const CELO_SEPOLIA_CONFIG = {
  chainId: "0xAA044C", // 11142220
  chainName: "Celo Sepolia Testnet",
  nativeCurrency: {
    name: "CELO",
    symbol: "CELO",
    decimals: 18
  },
  rpcUrls: ["https://forno.celo-sepolia.celo-testnet.org"],
  blockExplorerUrls: ["https://sepolia.celoscan.io"]
};
```

## 📖 User Guides

### 🏛️ Institution Workflow

1. **Register Institution**
   - Connect wallet
   - Go to "Register" tab
   - Fill in institution details
   - Submit registration
   - Wait for admin verification

2. **Issue Certificate**
   - Navigate to "Issue Certificate"
   - Enter student address
   - Select certificate type (Diploma/Degree/Course/Training/Workshop)
   - Fill in course details
   - Pay platform fee (minimum 0.001 CELO)
   - Submit transaction

3. **Issue Skill Badge**
   - Go to "Issue Badge"
   - Enter student address
   - Provide skill name and level
   - Add description and verification proof
   - Submit transaction (no fee)

4. **View Issued Credentials**
   - Check "My Issued" tab
   - See all certificates issued by your institution
   - Monitor student progress

### 👨‍🎓 Student Workflow

1. **Register as Student**
   - Connect wallet
   - Go to "Register" tab
   - Enter your details
   - Submit registration (free)

2. **View Credentials**
   - Navigate to "My Credentials"
   - See all your certificates
   - View skill badges
   - Track achievement points

3. **Claim Achievement Rewards**
   - Go to "Achievements" tab
   - View available achievements
   - Click "Claim Reward" when eligible
   - Receive CELO tokens

### ✅ Verifier Workflow

1. **Verify Certificate**
   - Go to "Verify" tab
   - Enter certificate ID
   - Click "Verify Certificate"
   - View complete certificate details
   - Check institution status and validity

## 🎨 Certificate Types

| Type | Description | Use Case |
|------|-------------|----------|
| Diploma | High school diploma | Secondary education |
| Degree | University degree | Higher education |
| Course | Individual course | Online courses |
| Training | Professional training | Skill development |
| Workshop | Short workshop | Events & seminars |

## 🏅 Skill Levels

| Level | Color | Description |
|-------|-------|-------------|
| Beginner | Green | Entry-level proficiency |
| Intermediate | Blue | Moderate proficiency |
| Advanced | Orange | High proficiency |
| Expert | Purple | Master-level proficiency |

## 🏆 Achievement System

### How It Works

1. **Earn Points**
   - +100 points per certificate earned
   - +50 points per skill badge earned

2. **Claim Rewards**
   - Platform owner creates achievements
   - Students claim when point threshold met
   - Receive CELO token rewards instantly

### Example Achievement

```
Name: First Certificate
Description: Earn your first certificate
Points Required: 100
Reward: 0.05 CELO
```

## 💰 Platform Fees

- **Certificate Issuance**: 1% of transaction value (minimum 0.001 CELO)
- **Skill Badge Issuance**: Free
- **Student Registration**: Free
- **Institution Registration**: Free
- **Verification**: Free

## 🔒 Security Features

- ✅ MetaMask wallet authentication
- ✅ Smart contract validation
- ✅ Institution verification system
- ✅ Certificate revocation capability
- ✅ Secure transaction signing

## 🌐 Network Information

- **Network**: Celo Sepolia Testnet
- **Chain ID**: 11142220 (0xAA044C)
- **RPC URL**: https://forno.celo-sepolia.celo-testnet.org
- **Explorer**: https://sepolia.celoscan.io
- **Faucet**: https://faucet.celo.org/sepolia

## 📱 Responsive Design

The frontend is fully responsive and works on:
- 💻 Desktop browsers
- 📱 Mobile devices
- 🖥️ Tablets

## 🛠️ Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

The production files will be in the `dist/` directory.

## 🐛 Troubleshooting

### MetaMask Not Detected

**Problem**: "Please install MetaMask" error

**Solution**:
1. Install MetaMask browser extension
2. Refresh the page
3. Click "Connect Wallet"

### Wrong Network

**Problem**: Transaction fails or network error

**Solution**:
1. Click "Connect Wallet" - the app will prompt network switch
2. Approve network switch in MetaMask
3. Or manually add Celo Sepolia in MetaMask

### Transaction Fails

**Problem**: Transaction rejected or reverted

**Common Causes**:
- Insufficient CELO balance
- Institution not verified (for issuance)
- Student not registered
- Invalid certificate data
- Insufficient achievement points

**Solution**:
1. Check wallet balance
2. Verify institution status
3. Ensure student is registered
4. Validate all form fields

### Credentials Not Loading

**Problem**: Empty credentials list

**Solution**:
1. Ensure wallet is connected
2. Check if you're registered
3. Refresh the page
4. Check browser console for errors

## 🔗 Important Links

- **Contract**: [0x77068916dE6AD4Adb330E7b3d5ca60C10C3942d6](https://sepolia.celoscan.io/address/0x77068916dE6AD4Adb330E7b3d5ca60C10C3942d6)
- **Celo Docs**: https://docs.celo.org
- **MetaMask**: https://metamask.io
- **Celo Faucet**: https://faucet.celo.org/sepolia

## 📚 Additional Resources

### Smart Contract Documentation

See the main project README for:
- Complete contract documentation
- Testing instructions
- Deployment guide
- Security features

### Celo Development

- [Celo Quickstart](https://docs.celo.org/build-on-celo/quickstart)
- [Celo SDK Documentation](https://docs.celo.org/tooling/libraries-sdks/celo-sdks)
- [Ethers.js Documentation](https://docs.ethers.org/v6/)
- [Viem Documentation](https://viem.sh/)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review smart contract documentation
3. Join [Celo Discord](https://chat.celo.org/)
4. Open an issue on GitHub

## 📄 License

This project is part of the Education Credentials DApp on Celo blockchain.

## 🎯 Future Enhancements

- [ ] IPFS integration for certificate documents
- [ ] QR code generation for certificates
- [ ] Export credentials as PDF
- [ ] Email notifications
- [ ] Multi-language support
- [ ] Mobile app version
- [ ] Bulk certificate issuance
- [ ] Advanced analytics dashboard

---

**Built with ❤️ on Celo Blockchain**

*Empowering education through decentralized technology* 🎓
