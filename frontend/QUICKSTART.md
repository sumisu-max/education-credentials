# 🚀 Education Credentials Frontend - Quick Start Guide

Get your Education Credentials DApp frontend running in 5 minutes!

## ⚡ Fast Setup

### 1. Install Dependencies

```bash
cd /home/hieu/celo_prs/education-credentials/frontend
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at: **http://localhost:3007**

### 3. Connect MetaMask

1. Open http://localhost:3007 in your browser
2. Click "Connect Wallet"
3. Approve the connection in MetaMask
4. The app will automatically switch to Celo Sepolia network

### 4. Get Test CELO

Visit: https://faucet.celo.org/sepolia

Enter your wallet address and receive test tokens.

## 🎯 Quick Actions

### Register as Institution

1. Click "Register" tab
2. Fill in:
   - Institution Name: "Test University"
   - Registration Number: "REG-2025-001"
   - Country: "United States"
   - Website: "https://test.edu"
3. Click "Register Institution"
4. Wait for admin verification

### Register as Student

1. Click "Register" tab
2. Fill in:
   - Full Name: "Alice Johnson"
   - Email: "alice@example.com"
   - Student ID: "STU-2025-001"
3. Click "Register Student"

### Verify a Certificate

1. Click "Verify" tab
2. Enter certificate ID (e.g., 1)
3. Click "Verify Certificate"
4. View complete certificate details

## 📊 Contract Information

- **Contract Address**: `0x77068916dE6AD4Adb330E7b3d5ca60C10C3942d6`
- **Network**: Celo Sepolia Testnet
- **Chain ID**: 11142220
- **Explorer**: https://sepolia.celoscan.io

## 🔗 Key Features

### 🏛️ Institutions Can:
- ✅ Issue certificates (5 types)
- ✅ Award skill badges (4 levels)
- ✅ Track issued credentials
- ✅ Monitor reputation

### 👨‍🎓 Students Can:
- ✅ View all credentials
- ✅ Track achievement points
- ✅ Claim CELO rewards
- ✅ Build digital portfolio

### ✅ Anyone Can:
- ✅ Verify certificates
- ✅ Check institution status
- ✅ View platform statistics

## 🛠️ Available Scripts

```bash
# Development server (port 3007)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🐛 Common Issues

### "Please install MetaMask"
→ Install MetaMask browser extension

### "Wrong Network"
→ Click "Connect Wallet" to auto-switch

### "Insufficient Balance"
→ Get test CELO from faucet

### "Institution Not Verified"
→ Wait for admin to verify your institution

## 📱 Pages Overview

| Page | Purpose | Available To |
|------|---------|--------------|
| Home | View stats & your status | Everyone |
| Register | Register as institution/student | Unregistered users |
| Issue Certificate | Issue certificates | Verified institutions |
| Issue Badge | Award skill badges | Verified institutions |
| My Credentials | View certificates & badges | Students |
| My Issued | View issued certificates | Institutions |
| Verify | Verify any certificate | Everyone |
| Achievements | View & claim rewards | Everyone |

## 💡 Pro Tips

1. **For Institutions**: Get verified quickly by providing accurate registration details
2. **For Students**: Earn 100 points per certificate and 50 per skill badge
3. **For Verifiers**: Certificate ID starts from 1 and increments
4. **Platform Fee**: 1% minimum 0.001 CELO for certificate issuance

## 🎨 Certificate Types

- **Diploma**: High school diplomas
- **Degree**: University degrees
- **Course**: Individual courses
- **Training**: Professional training
- **Workshop**: Short workshops

## 🏅 Skill Levels

- **Beginner** (Green): Entry-level
- **Intermediate** (Blue): Moderate
- **Advanced** (Orange): High proficiency
- **Expert** (Purple): Master-level

## 🏆 Achievement System

- Owner creates achievements with CELO rewards
- Students earn points from credentials
- Claim rewards when threshold met
- Instant CELO transfer to wallet

## 📞 Need Help?

- **Contract Issues**: Check main README
- **Frontend Bugs**: Check browser console
- **Network Problems**: Try refreshing page
- **Celo Support**: Join Discord at https://chat.celo.org/

## 🔐 Security Notes

- ✅ Never share your private key
- ✅ Always verify contract address
- ✅ Check transaction details before signing
- ✅ This is testnet - no real money involved

## 🌟 Next Steps

1. ✅ Install dependencies
2. ✅ Start dev server
3. ✅ Connect MetaMask
4. ✅ Register your account
5. ✅ Start using the platform!

---

**Happy Learning! 🎓**

For detailed documentation, see the main [README.md](README.md)

Contract deployed on: **Celo Sepolia Testnet**  
Frontend running on: **http://localhost:3007**
