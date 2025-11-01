const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting Education Credentials deployment to Celo Sepolia...\n");

  // Get the contract factory
  const EducationCredentials = await hre.ethers.getContractFactory("EducationCredentials");
  
  console.log("📝 Deploying EducationCredentials contract...");
  
  // Deploy the contract
  const contract = await EducationCredentials.deploy();
  await contract.waitForDeployment();
  
  const contractAddress = await contract.getAddress();
  console.log(`✅ EducationCredentials deployed to: ${contractAddress}`);

  // Get deployment transaction
  const deploymentTx = contract.deploymentTransaction();
  console.log(`📋 Deployment transaction hash: ${deploymentTx.hash}`);
  
  // Wait for a few block confirmations
  console.log("\n⏳ Waiting for block confirmations...");
  await deploymentTx.wait(5);
  console.log("✅ Contract deployment confirmed!");

  // Get contract details
  const owner = await contract.owner();
  const stats = await contract.getStats();
  const platformFee = await contract.platformFeePercent();
  const minReward = await contract.minReward();

  console.log("\n📊 Contract Details:");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`Contract Address:     ${contractAddress}`);
  console.log(`Owner:                ${owner}`);
  console.log(`Platform Fee:         ${platformFee.toString()} basis points (${Number(platformFee)/100}%)`);
  console.log(`Min Reward:           ${hre.ethers.formatEther(minReward)} CELO`);
  console.log(`Total Institutions:   ${stats._totalInstitutions.toString()}`);
  console.log(`Total Students:       ${stats._totalStudents.toString()}`);
  console.log(`Total Certificates:   ${stats._totalCertificates.toString()}`);
  console.log(`Total Skill Badges:   ${stats._totalSkillBadges.toString()}`);
  console.log(`Total Achievements:   ${stats._totalAchievements.toString()}`);
  console.log("═══════════════════════════════════════════════════════");

  // Save deployment information
  const network = hre.network.name;
  const deploymentInfo = {
    network: network,
    contractName: "EducationCredentials",
    contractAddress: contractAddress,
    deployer: owner,
    deploymentTransaction: deploymentTx.hash,
    blockNumber: deploymentTx.blockNumber,
    timestamp: new Date().toISOString(),
    platformFeePercent: platformFee.toString(),
    minReward: minReward.toString(),
    compiler: {
      version: "0.8.20",
      optimizer: true,
      runs: 200
    },
    explorerUrl: `https://sepolia.celoscan.io/address/${contractAddress}`,
    verifyCommand: `npx hardhat verify --network ${network} ${contractAddress}`
  };

  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentFile = path.join(deploymentsDir, `deployment-${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));

  console.log(`\n💾 Deployment info saved to: ${deploymentFile}`);

  console.log("\n🔗 Useful Links:");
  console.log("═══════════════════════════════════════════════════════");
  console.log(`Explorer: https://sepolia.celoscan.io/address/${contractAddress}`);
  console.log(`Transaction: https://sepolia.celoscan.io/tx/${deploymentTx.hash}`);
  console.log("═══════════════════════════════════════════════════════");

  console.log("\n✨ Deployment completed successfully!");
  console.log("\n📝 Next Steps:");
  console.log("1. Verify the contract on Celoscan:");
  console.log(`   npx hardhat verify --network ${network} ${contractAddress}`);
  console.log("2. Register institutions and start issuing certificates");
  console.log("3. Create achievements to incentivize students");
  
  return contractAddress;
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:");
    console.error(error);
    process.exitCode = 1;
  });
