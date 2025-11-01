const hre = require("hardhat");

// Contract address on Celo Sepolia
const CONTRACT_ADDRESS = "0x77068916dE6AD4Adb330E7b3d5ca60C10C3942d6";

async function main() {
  console.log("🎓 Education Credentials - Interaction Script\n");

  // Get signers
  const [deployer, institution, student, verifier] = await hre.ethers.getSigners();

  console.log("👥 Accounts:");
  console.log(`Deployer (Owner):  ${deployer.address}`);
  console.log(`Institution:       ${institution.address}`);
  console.log(`Student:           ${student.address}`);
  console.log(`Verifier:          ${verifier.address}\n`);

  // Connect to deployed contract
  const EducationCredentials = await hre.ethers.getContractFactory("EducationCredentials");
  const contract = EducationCredentials.attach(CONTRACT_ADDRESS);

  console.log("📊 Current Contract Stats:");
  console.log("═══════════════════════════════════════════════════════");
  const stats = await contract.getStats();
  console.log(`Total Institutions:   ${stats._totalInstitutions.toString()}`);
  console.log(`Total Students:       ${stats._totalStudents.toString()}`);
  console.log(`Total Certificates:   ${stats._totalCertificates.toString()}`);
  console.log(`Total Skill Badges:   ${stats._totalSkillBadges.toString()}`);
  console.log(`Total Achievements:   ${stats._totalAchievements.toString()}`);
  console.log("═══════════════════════════════════════════════════════\n");

  // ========== INSTITUTION REGISTRATION ==========
  console.log("🏫 Step 1: Register Institution");
  console.log("─────────────────────────────────────────────────────");
  
  try {
    const inst = await contract.connect(institution).institutions(institution.address);
    if (inst.exists) {
      console.log("✅ Institution already registered");
      console.log(`   Name: ${inst.name}`);
      console.log(`   Status: ${inst.status === 0n ? "Pending" : inst.status === 1n ? "Verified" : "Suspended"}`);
    } else {
      const tx1 = await contract.connect(institution).registerInstitution(
        "Blockchain University",
        "REG-BCU-2024",
        "Global",
        "https://blockchain-u.edu"
      );
      await tx1.wait();
      console.log("✅ Institution registered successfully");
      console.log(`   Transaction: ${tx1.hash}`);
    }
  } catch (error) {
    console.log("ℹ️  Institution registration skipped:", error.message);
  }

  // ========== INSTITUTION VERIFICATION ==========
  console.log("\n🔐 Step 2: Verify Institution (Owner Only)");
  console.log("─────────────────────────────────────────────────────");
  
  try {
    const inst = await contract.connect(institution).institutions(institution.address);
    if (inst.status === 1n) {
      console.log("✅ Institution already verified");
    } else {
      const tx2 = await contract.connect(deployer).verifyInstitution(institution.address);
      await tx2.wait();
      console.log("✅ Institution verified by owner");
      console.log(`   Transaction: ${tx2.hash}`);
    }
  } catch (error) {
    console.log("ℹ️  Verification skipped:", error.message);
  }

  // ========== STUDENT REGISTRATION ==========
  console.log("\n🎓 Step 3: Register Student");
  console.log("─────────────────────────────────────────────────────");
  
  try {
    const stud = await contract.connect(student).students(student.address);
    if (stud.exists) {
      console.log("✅ Student already registered");
      console.log(`   Name: ${stud.name}`);
      console.log(`   Certificates: ${stud.certificatesEarned.toString()}`);
      console.log(`   Achievement Points: ${stud.achievementPoints.toString()}`);
    } else {
      const tx3 = await contract.connect(student).registerStudent(
        "Alice Johnson",
        "alice@example.com",
        "STU-2024-001"
      );
      await tx3.wait();
      console.log("✅ Student registered successfully");
      console.log(`   Transaction: ${tx3.hash}`);
    }
  } catch (error) {
    console.log("ℹ️  Student registration skipped:", error.message);
  }

  // ========== CERTIFICATE ISSUANCE ==========
  console.log("\n📜 Step 4: Issue Certificate");
  console.log("─────────────────────────────────────────────────────");
  
  try {
    const completionDate = Math.floor(Date.now() / 1000) - 86400; // Yesterday
    const fee = hre.ethers.parseEther("0.001");
    
    const tx4 = await contract.connect(institution).issueCertificate(
      student.address,
      1, // Degree
      "Blockchain Development",
      "Master of Science",
      completionDate,
      "A+",
      "QmExampleIPFSHash123",
      { value: fee }
    );
    await tx4.wait();
    console.log("✅ Certificate issued successfully");
    console.log(`   Transaction: ${tx4.hash}`);
    console.log(`   Fee paid: ${hre.ethers.formatEther(fee)} CELO`);
    
    const newStats = await contract.getStats();
    console.log(`   Total Certificates: ${newStats._totalCertificates.toString()}`);
  } catch (error) {
    console.log("ℹ️  Certificate issuance skipped:", error.message);
  }

  // ========== SKILL BADGE ISSUANCE ==========
  console.log("\n🎖️  Step 5: Issue Skill Badge");
  console.log("─────────────────────────────────────────────────────");
  
  try {
    const oneYear = Math.floor(Date.now() / 1000) + (365 * 24 * 60 * 60);
    
    const tx5 = await contract.connect(institution).issueSkillBadge(
      student.address,
      "Solidity Smart Contracts",
      2, // Advanced
      "Proficient in writing secure smart contracts",
      oneYear, // Expires in 1 year
      "CERT-SOL-2024-001"
    );
    await tx5.wait();
    console.log("✅ Skill badge issued successfully");
    console.log(`   Transaction: ${tx5.hash}`);
    
    const newStats = await contract.getStats();
    console.log(`   Total Badges: ${newStats._totalSkillBadges.toString()}`);
  } catch (error) {
    console.log("ℹ️  Badge issuance skipped:", error.message);
  }

  // ========== VIEW STUDENT CREDENTIALS ==========
  console.log("\n📋 Step 6: View Student Credentials");
  console.log("─────────────────────────────────────────────────────");
  
  try {
    const stud = await contract.getStudent(student.address);
    console.log(`Student: ${stud.name}`);
    console.log(`Email: ${stud.email}`);
    console.log(`Certificates Earned: ${stud.certificatesEarned.toString()}`);
    console.log(`Skill Badges: ${stud.skillBadgesEarned.toString()}`);
    console.log(`Achievement Points: ${stud.achievementPoints.toString()}`);
    
    // Get certificate IDs
    const certIds = await contract.getStudentCertificates(student.address);
    if (certIds.length > 0) {
      console.log(`\nCertificates (${certIds.length}):`);
      for (const id of certIds) {
        const cert = await contract.getCertificate(id);
        console.log(`  • ID ${id}: ${cert.courseName} - Grade: ${cert.grade}`);
      }
    }
    
    // Get badge IDs
    const badgeIds = await contract.getStudentSkillBadges(student.address);
    if (badgeIds.length > 0) {
      console.log(`\nSkill Badges (${badgeIds.length}):`);
      for (const id of badgeIds) {
        const badge = await contract.getSkillBadge(id);
        const isValid = await contract.isSkillBadgeValid(id);
        console.log(`  • ID ${id}: ${badge.skillName} - Valid: ${isValid}`);
      }
    }
  } catch (error) {
    console.log("ℹ️  Could not fetch student data:", error.message);
  }

  // ========== CREATE ACHIEVEMENT ==========
  console.log("\n🏆 Step 7: Create Achievement (Owner Only)");
  console.log("─────────────────────────────────────────────────────");
  
  try {
    const rewardAmount = hre.ethers.parseEther("0.05");
    
    const tx6 = await contract.connect(deployer).createAchievement(
      "First Certificate",
      "Earn your first certificate",
      100, // Requires 100 points
      rewardAmount,
      { value: rewardAmount }
    );
    await tx6.wait();
    console.log("✅ Achievement created successfully");
    console.log(`   Transaction: ${tx6.hash}`);
    console.log(`   Reward: ${hre.ethers.formatEther(rewardAmount)} CELO`);
  } catch (error) {
    console.log("ℹ️  Achievement creation skipped:", error.message);
  }

  // ========== CLAIM ACHIEVEMENT ==========
  console.log("\n🎉 Step 8: Claim Achievement (Student)");
  console.log("─────────────────────────────────────────────────────");
  
  try {
    const stud = await contract.getStudent(student.address);
    const newStats = await contract.getStats();
    const totalAchievements = newStats._totalAchievements;
    
    if (totalAchievements > 0n) {
      const achievement = await contract.getAchievement(1);
      console.log(`Achievement: ${achievement.name}`);
      console.log(`Required Points: ${achievement.pointsRequired.toString()}`);
      console.log(`Student Points: ${stud.achievementPoints.toString()}`);
      
      if (stud.achievementPoints >= achievement.pointsRequired) {
        const hasCompleted = await contract.hasCompletedAchievement(student.address, 1);
        if (!hasCompleted) {
          const balanceBefore = await hre.ethers.provider.getBalance(student.address);
          const tx7 = await contract.connect(student).claimAchievement(1);
          await tx7.wait();
          const balanceAfter = await hre.ethers.provider.getBalance(student.address);
          
          console.log("✅ Achievement claimed successfully!");
          console.log(`   Transaction: ${tx7.hash}`);
          console.log(`   Reward received: ~${hre.ethers.formatEther(achievement.rewardAmount)} CELO`);
        } else {
          console.log("ℹ️  Achievement already claimed");
        }
      } else {
        console.log("ℹ️  Not enough points to claim yet");
      }
    } else {
      console.log("ℹ️  No achievements available yet");
    }
  } catch (error) {
    console.log("ℹ️  Achievement claim skipped:", error.message);
  }

  // ========== VERIFY CERTIFICATE ==========
  console.log("\n✅ Step 9: Verify Certificate (Anyone)");
  console.log("─────────────────────────────────────────────────────");
  
  try {
    const newStats = await contract.getStats();
    if (newStats._totalCertificates > 0n) {
      const [isValid, cert] = await contract.connect(verifier).verifyCertificate(1);
      console.log(`Certificate ID: 1`);
      console.log(`Is Valid: ${isValid}`);
      console.log(`Course: ${cert.courseName}`);
      console.log(`Major: ${cert.major}`);
      console.log(`Grade: ${cert.grade}`);
      console.log(`Issued: ${new Date(Number(cert.issueDate) * 1000).toLocaleDateString()}`);
      console.log(`Is Revoked: ${cert.isRevoked}`);
    } else {
      console.log("ℹ️  No certificates to verify yet");
    }
  } catch (error) {
    console.log("ℹ️  Verification skipped:", error.message);
  }

  // ========== FINAL STATS ==========
  console.log("\n📊 Final Contract Stats:");
  console.log("═══════════════════════════════════════════════════════");
  const finalStats = await contract.getStats();
  console.log(`Total Institutions:   ${finalStats._totalInstitutions.toString()}`);
  console.log(`Total Students:       ${finalStats._totalStudents.toString()}`);
  console.log(`Total Certificates:   ${finalStats._totalCertificates.toString()}`);
  console.log(`Total Skill Badges:   ${finalStats._totalSkillBadges.toString()}`);
  console.log(`Total Achievements:   ${finalStats._totalAchievements.toString()}`);
  console.log("═══════════════════════════════════════════════════════");

  console.log("\n✨ Interaction script completed successfully!");
  console.log("\n🔗 View on Explorer:");
  console.log(`https://sepolia.celoscan.io/address/${CONTRACT_ADDRESS}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error:", error);
    process.exitCode = 1;
  });
