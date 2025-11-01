const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture, time } = require("@nomicfoundation/hardhat-network-helpers");

describe("EducationCredentials", function () {
  // Fixture to deploy contract
  async function deployEducationCredentialsFixture() {
    const [owner, institution1, institution2, student1, student2, student3] = await ethers.getSigners();

    const EducationCredentials = await ethers.getContractFactory("EducationCredentials");
    const contract = await EducationCredentials.deploy();

    return { contract, owner, institution1, institution2, student1, student2, student3 };
  }

  describe("Deployment", function () {
    it("Should set the correct owner", async function () {
      const { contract, owner } = await loadFixture(deployEducationCredentialsFixture);
      expect(await contract.owner()).to.equal(owner.address);
    });

    it("Should initialize with zero counts", async function () {
      const { contract } = await loadFixture(deployEducationCredentialsFixture);
      const stats = await contract.getStats();
      expect(stats._totalInstitutions).to.equal(0);
      expect(stats._totalStudents).to.equal(0);
      expect(stats._totalCertificates).to.equal(0);
      expect(stats._totalSkillBadges).to.equal(0);
      expect(stats._totalAchievements).to.equal(0);
    });

    it("Should set correct platform fee", async function () {
      const { contract } = await loadFixture(deployEducationCredentialsFixture);
      expect(await contract.platformFeePercent()).to.equal(100); // 1%
    });
  });

  describe("Institution Registration", function () {
    it("Should allow institution to register", async function () {
      const { contract, institution1 } = await loadFixture(deployEducationCredentialsFixture);
      
      await expect(
        contract.connect(institution1).registerInstitution(
          "MIT",
          "REG-MIT-001",
          "USA",
          "https://mit.edu"
        )
      ).to.emit(contract, "InstitutionRegistered")
        .withArgs(institution1.address, "MIT", await time.latest() + 1);

      const inst = await contract.getInstitution(institution1.address);
      expect(inst.name).to.equal("MIT");
      expect(inst.status).to.equal(0); // Pending
      expect(inst.reputation).to.equal(500);
    });

    it("Should not allow duplicate registration", async function () {
      const { contract, institution1 } = await loadFixture(deployEducationCredentialsFixture);
      
      await contract.connect(institution1).registerInstitution(
        "MIT",
        "REG-MIT-001",
        "USA",
        "https://mit.edu"
      );

      await expect(
        contract.connect(institution1).registerInstitution(
          "MIT2",
          "REG-MIT-002",
          "USA",
          "https://mit.edu"
        )
      ).to.be.revertedWith("Institution already registered");
    });

    it("Should require name and registration number", async function () {
      const { contract, institution1 } = await loadFixture(deployEducationCredentialsFixture);
      
      await expect(
        contract.connect(institution1).registerInstitution("", "REG-001", "USA", "https://test.com")
      ).to.be.revertedWith("Name required");

      await expect(
        contract.connect(institution1).registerInstitution("Test", "", "USA", "https://test.com")
      ).to.be.revertedWith("Registration number required");
    });

    it("Should increment total institutions", async function () {
      const { contract, institution1, institution2 } = await loadFixture(deployEducationCredentialsFixture);
      
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      expect(await contract.totalInstitutions()).to.equal(1);

      await contract.connect(institution2).registerInstitution("Harvard", "REG-002", "USA", "https://harvard.edu");
      expect(await contract.totalInstitutions()).to.equal(2);
    });
  });

  describe("Institution Verification", function () {
    it("Should allow owner to verify institution", async function () {
      const { contract, owner, institution1 } = await loadFixture(deployEducationCredentialsFixture);
      
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      
      await expect(
        contract.connect(owner).verifyInstitution(institution1.address)
      ).to.emit(contract, "InstitutionVerified")
        .withArgs(institution1.address, await time.latest() + 1);

      const inst = await contract.getInstitution(institution1.address);
      expect(inst.status).to.equal(1); // Verified
    });

    it("Should not allow non-owner to verify", async function () {
      const { contract, institution1, institution2 } = await loadFixture(deployEducationCredentialsFixture);
      
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      
      await expect(
        contract.connect(institution2).verifyInstitution(institution1.address)
      ).to.be.revertedWithCustomError(contract, "OwnableUnauthorizedAccount");
    });

    it("Should allow owner to suspend institution", async function () {
      const { contract, owner, institution1 } = await loadFixture(deployEducationCredentialsFixture);
      
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      await contract.connect(owner).verifyInstitution(institution1.address);
      
      await expect(
        contract.connect(owner).suspendInstitution(institution1.address, "Fraudulent activities")
      ).to.emit(contract, "InstitutionSuspended");

      const inst = await contract.getInstitution(institution1.address);
      expect(inst.status).to.equal(2); // Suspended
    });

    it("Should allow owner to update reputation", async function () {
      const { contract, owner, institution1 } = await loadFixture(deployEducationCredentialsFixture);
      
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      
      await expect(
        contract.connect(owner).updateInstitutionReputation(institution1.address, 850)
      ).to.emit(contract, "ReputationUpdated")
        .withArgs(institution1.address, 850);

      const inst = await contract.getInstitution(institution1.address);
      expect(inst.reputation).to.equal(850);
    });

    it("Should not allow reputation above 1000", async function () {
      const { contract, owner, institution1 } = await loadFixture(deployEducationCredentialsFixture);
      
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      
      await expect(
        contract.connect(owner).updateInstitutionReputation(institution1.address, 1001)
      ).to.be.revertedWith("Reputation must be <= 1000");
    });
  });

  describe("Student Registration", function () {
    it("Should allow student to register", async function () {
      const { contract, student1 } = await loadFixture(deployEducationCredentialsFixture);
      
      await expect(
        contract.connect(student1).registerStudent(
          "Alice Johnson",
          "alice@example.com",
          "STU-001"
        )
      ).to.emit(contract, "StudentRegistered")
        .withArgs(student1.address, "Alice Johnson", await time.latest() + 1);

      const student = await contract.getStudent(student1.address);
      expect(student.name).to.equal("Alice Johnson");
      expect(student.certificatesEarned).to.equal(0);
      expect(student.achievementPoints).to.equal(0);
    });

    it("Should not allow duplicate student registration", async function () {
      const { contract, student1 } = await loadFixture(deployEducationCredentialsFixture);
      
      await contract.connect(student1).registerStudent("Alice", "alice@example.com", "STU-001");
      
      await expect(
        contract.connect(student1).registerStudent("Alice2", "alice2@example.com", "STU-002")
      ).to.be.revertedWith("Student already registered");
    });

    it("Should require student name", async function () {
      const { contract, student1 } = await loadFixture(deployEducationCredentialsFixture);
      
      await expect(
        contract.connect(student1).registerStudent("", "alice@example.com", "STU-001")
      ).to.be.revertedWith("Name required");
    });

    it("Should increment total students", async function () {
      const { contract, student1, student2 } = await loadFixture(deployEducationCredentialsFixture);
      
      await contract.connect(student1).registerStudent("Alice", "alice@example.com", "STU-001");
      expect(await contract.totalStudents()).to.equal(1);

      await contract.connect(student2).registerStudent("Bob", "bob@example.com", "STU-002");
      expect(await contract.totalStudents()).to.equal(2);
    });
  });

  describe("Certificate Issuance", function () {
    async function setupForCertificates() {
      const fixture = await loadFixture(deployEducationCredentialsFixture);
      const { contract, owner, institution1, student1 } = fixture;
      
      // Register and verify institution
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      await contract.connect(owner).verifyInstitution(institution1.address);
      
      // Register student
      await contract.connect(student1).registerStudent("Alice", "alice@example.com", "STU-001");
      
      return fixture;
    }

    it("Should allow verified institution to issue certificate", async function () {
      const { contract, institution1, student1 } = await setupForCertificates();
      
      const completionDate = await time.latest();
      const fee = ethers.parseEther("0.001");
      
      await expect(
        contract.connect(institution1).issueCertificate(
          student1.address,
          1, // Degree
          "Computer Science",
          "Bachelor of Science",
          completionDate,
          "A",
          "QmTestHash123",
          { value: fee }
        )
      ).to.emit(contract, "CertificateIssued")
        .withArgs(1, institution1.address, student1.address, "Computer Science", completionDate + 1);

      expect(await contract.totalCertificates()).to.equal(1);
      
      const cert = await contract.getCertificate(1);
      expect(cert.courseName).to.equal("Computer Science");
      expect(cert.grade).to.equal("A");
      expect(cert.isRevoked).to.equal(false);
    });

    it("Should update student certificate count and points", async function () {
      const { contract, institution1, student1 } = await setupForCertificates();
      
      const completionDate = await time.latest();
      const fee = ethers.parseEther("0.001");
      
      await contract.connect(institution1).issueCertificate(
        student1.address,
        1,
        "Computer Science",
        "Bachelor",
        completionDate,
        "A",
        "QmHash",
        { value: fee }
      );

      const student = await contract.getStudent(student1.address);
      expect(student.certificatesEarned).to.equal(1);
      expect(student.achievementPoints).to.equal(100);
    });

    it("Should not allow unverified institution to issue certificate", async function () {
      const { contract, institution2, student1 } = await setupForCertificates();
      
      // Register but don't verify institution2
      await contract.connect(institution2).registerInstitution("Harvard", "REG-002", "USA", "https://harvard.edu");
      
      const completionDate = await time.latest();
      const fee = ethers.parseEther("0.001");
      
      await expect(
        contract.connect(institution2).issueCertificate(
          student1.address,
          1,
          "Mathematics",
          "Bachelor",
          completionDate,
          "A",
          "QmHash",
          { value: fee }
        )
      ).to.be.revertedWith("Institution not verified");
    });

    it("Should not allow certificate to unregistered student", async function () {
      const { contract, institution1, student2 } = await setupForCertificates();
      
      const completionDate = await time.latest();
      const fee = ethers.parseEther("0.001");
      
      await expect(
        contract.connect(institution1).issueCertificate(
          student2.address, // Not registered
          1,
          "Computer Science",
          "Bachelor",
          completionDate,
          "A",
          "QmHash",
          { value: fee }
        )
      ).to.be.revertedWith("Student not registered");
    });

    it("Should not allow duplicate certificates", async function () {
      const { contract, institution1, student1 } = await setupForCertificates();
      
      const completionDate = await time.latest();
      const fee = ethers.parseEther("0.001");
      
      // Issue first certificate
      await contract.connect(institution1).issueCertificate(
        student1.address,
        1,
        "Computer Science",
        "Bachelor",
        completionDate,
        "A",
        "QmHash",
        { value: fee }
      );

      // Try to issue same certificate again
      await expect(
        contract.connect(institution1).issueCertificate(
          student1.address,
          1,
          "Computer Science",
          "Bachelor",
          completionDate,
          "A",
          "QmHash2",
          { value: fee }
        )
      ).to.be.revertedWith("Certificate already issued");
    });

    it("Should track student certificates", async function () {
      const { contract, institution1, student1 } = await setupForCertificates();
      
      const completionDate = await time.latest();
      const fee = ethers.parseEther("0.001");
      
      await contract.connect(institution1).issueCertificate(
        student1.address,
        1,
        "Computer Science",
        "Bachelor",
        completionDate,
        "A",
        "QmHash1",
        { value: fee }
      );

      await contract.connect(institution1).issueCertificate(
        student1.address,
        0, // Diploma
        "Web Development",
        "Fullstack",
        completionDate,
        "A+",
        "QmHash2",
        { value: fee }
      );

      const certIds = await contract.getStudentCertificates(student1.address);
      expect(certIds.length).to.equal(2);
      expect(certIds[0]).to.equal(1);
      expect(certIds[1]).to.equal(2);
    });
  });

  describe("Certificate Revocation", function () {
    async function setupWithCertificate() {
      const fixture = await loadFixture(deployEducationCredentialsFixture);
      const { contract, owner, institution1, student1 } = fixture;
      
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      await contract.connect(owner).verifyInstitution(institution1.address);
      await contract.connect(student1).registerStudent("Alice", "alice@example.com", "STU-001");
      
      const completionDate = await time.latest();
      const fee = ethers.parseEther("0.001");
      
      await contract.connect(institution1).issueCertificate(
        student1.address,
        1,
        "Computer Science",
        "Bachelor",
        completionDate,
        "A",
        "QmHash",
        { value: fee }
      );
      
      return fixture;
    }

    it("Should allow issuer to revoke certificate", async function () {
      const { contract, institution1 } = await setupWithCertificate();
      
      await expect(
        contract.connect(institution1).revokeCertificate(1, "Academic misconduct")
      ).to.emit(contract, "CertificateRevoked");

      const cert = await contract.getCertificate(1);
      expect(cert.isRevoked).to.equal(true);
      expect(cert.revocationReason).to.equal("Academic misconduct");
    });

    it("Should not allow non-issuer to revoke", async function () {
      const { contract, owner, institution2 } = await setupWithCertificate();
      
      await contract.connect(institution2).registerInstitution("Harvard", "REG-002", "USA", "https://harvard.edu");
      await contract.connect(owner).verifyInstitution(institution2.address);
      
      await expect(
        contract.connect(institution2).revokeCertificate(1, "Test")
      ).to.be.revertedWith("Not certificate issuer");
    });

    it("Should not allow revoking already revoked certificate", async function () {
      const { contract, institution1 } = await setupWithCertificate();
      
      await contract.connect(institution1).revokeCertificate(1, "First reason");
      
      await expect(
        contract.connect(institution1).revokeCertificate(1, "Second reason")
      ).to.be.revertedWith("Certificate already revoked");
    });

    it("Should require revocation reason", async function () {
      const { contract, institution1 } = await setupWithCertificate();
      
      await expect(
        contract.connect(institution1).revokeCertificate(1, "")
      ).to.be.revertedWith("Reason required");
    });
  });

  describe("Certificate Verification", function () {
    async function setupWithCertificate() {
      const fixture = await loadFixture(deployEducationCredentialsFixture);
      const { contract, owner, institution1, student1 } = fixture;
      
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      await contract.connect(owner).verifyInstitution(institution1.address);
      await contract.connect(student1).registerStudent("Alice", "alice@example.com", "STU-001");
      
      const completionDate = await time.latest();
      const fee = ethers.parseEther("0.001");
      
      await contract.connect(institution1).issueCertificate(
        student1.address,
        1,
        "Computer Science",
        "Bachelor",
        completionDate,
        "A",
        "QmHash",
        { value: fee }
      );
      
      return fixture;
    }

    it("Should verify valid certificate", async function () {
      const { contract } = await setupWithCertificate();
      
      const [isValid, cert] = await contract.verifyCertificate(1);
      expect(isValid).to.equal(true);
      expect(cert.courseName).to.equal("Computer Science");
    });

    it("Should invalidate revoked certificate", async function () {
      const { contract, institution1 } = await setupWithCertificate();
      
      await contract.connect(institution1).revokeCertificate(1, "Test reason");
      
      const [isValid] = await contract.verifyCertificate(1);
      expect(isValid).to.equal(false);
    });

    it("Should invalidate certificate from suspended institution", async function () {
      const { contract, owner, institution1 } = await setupWithCertificate();
      
      await contract.connect(owner).suspendInstitution(institution1.address, "Fraudulent");
      
      const [isValid] = await contract.verifyCertificate(1);
      expect(isValid).to.equal(false);
    });
  });

  describe("Skill Badges", function () {
    async function setupForBadges() {
      const fixture = await loadFixture(deployEducationCredentialsFixture);
      const { contract, owner, institution1, student1 } = fixture;
      
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      await contract.connect(owner).verifyInstitution(institution1.address);
      await contract.connect(student1).registerStudent("Alice", "alice@example.com", "STU-001");
      
      return fixture;
    }

    it("Should allow institution to issue skill badge", async function () {
      const { contract, institution1, student1 } = await setupForBadges();
      
      const expiresAt = (await time.latest()) + 365 * 24 * 60 * 60; // 1 year
      
      await expect(
        contract.connect(institution1).issueSkillBadge(
          student1.address,
          "Solidity Development",
          2, // Advanced
          "Proficient in smart contract development",
          expiresAt,
          "Certification-ABC-123"
        )
      ).to.emit(contract, "SkillBadgeIssued");

      expect(await contract.totalSkillBadges()).to.equal(1);
      
      const badge = await contract.getSkillBadge(1);
      expect(badge.skillName).to.equal("Solidity Development");
      expect(badge.level).to.equal(2);
    });

    it("Should update student badge count and points", async function () {
      const { contract, institution1, student1 } = await setupForBadges();
      
      const expiresAt = (await time.latest()) + 365 * 24 * 60 * 60;
      
      await contract.connect(institution1).issueSkillBadge(
        student1.address,
        "React Development",
        1, // Intermediate
        "Building React applications",
        expiresAt,
        "CERT-123"
      );

      const student = await contract.getStudent(student1.address);
      expect(student.skillBadgesEarned).to.equal(1);
      expect(student.achievementPoints).to.equal(50);
    });

    it("Should validate badge expiry", async function () {
      const { contract, institution1, student1 } = await setupForBadges();
      
      const expiresAt = (await time.latest()) + 100; // Expires in 100 seconds
      
      await contract.connect(institution1).issueSkillBadge(
        student1.address,
        "Temporary Skill",
        0,
        "Test",
        expiresAt,
        "CERT"
      );

      // Should be valid initially
      expect(await contract.isSkillBadgeValid(1)).to.equal(true);
      
      // Fast forward time past expiry
      await time.increase(101);
      
      // Should be invalid now
      expect(await contract.isSkillBadgeValid(1)).to.equal(false);
    });

    it("Should handle badges that never expire", async function () {
      const { contract, institution1, student1 } = await setupForBadges();
      
      await contract.connect(institution1).issueSkillBadge(
        student1.address,
        "Lifetime Skill",
        3, // Expert
        "Never expires",
        0, // 0 means never expires
        "CERT"
      );

      expect(await contract.isSkillBadgeValid(1)).to.equal(true);
      
      // Even after long time
      await time.increase(365 * 24 * 60 * 60 * 10); // 10 years
      expect(await contract.isSkillBadgeValid(1)).to.equal(true);
    });

    it("Should track student skill badges", async function () {
      const { contract, institution1, student1 } = await setupForBadges();
      
      await contract.connect(institution1).issueSkillBadge(
        student1.address,
        "Skill 1",
        0,
        "Test",
        0,
        "CERT-1"
      );

      await contract.connect(institution1).issueSkillBadge(
        student1.address,
        "Skill 2",
        1,
        "Test",
        0,
        "CERT-2"
      );

      const badgeIds = await contract.getStudentSkillBadges(student1.address);
      expect(badgeIds.length).to.equal(2);
    });
  });

  describe("Achievements", function () {
    it("Should allow owner to create achievement", async function () {
      const { contract, owner } = await loadFixture(deployEducationCredentialsFixture);
      
      const rewardAmount = ethers.parseEther("0.1");
      
      await expect(
        contract.connect(owner).createAchievement(
          "Certificate Master",
          "Earn 5 certificates",
          500, // Points required
          rewardAmount,
          { value: rewardAmount }
        )
      ).to.emit(contract, "AchievementCreated")
        .withArgs(1, "Certificate Master", 500, rewardAmount);

      const achievement = await contract.getAchievement(1);
      expect(achievement.name).to.equal("Certificate Master");
      expect(achievement.isActive).to.equal(true);
    });

    it("Should allow student to claim achievement", async function () {
      const { contract, owner, student1, institution1 } = await loadFixture(deployEducationCredentialsFixture);
      
      // Register student
      await contract.connect(student1).registerStudent("Alice", "alice@example.com", "STU-001");
      
      // Create achievement
      const rewardAmount = ethers.parseEther("0.1");
      await contract.connect(owner).createAchievement(
        "Early Achiever",
        "First 100 points",
        100,
        rewardAmount,
        { value: rewardAmount }
      );
      
      // Register and verify institution
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      await contract.connect(owner).verifyInstitution(institution1.address);
      
      // Issue certificate to give student points
      const completionDate = await time.latest();
      const fee = ethers.parseEther("0.001");
      await contract.connect(institution1).issueCertificate(
        student1.address,
        0,
        "Course",
        "Test",
        completionDate,
        "A",
        "Hash",
        { value: fee }
      );
      
      // Student should have 100 points now
      const studentBefore = await contract.getStudent(student1.address);
      expect(studentBefore.achievementPoints).to.equal(100);
      
      // Claim achievement
      const balanceBefore = await ethers.provider.getBalance(student1.address);
      
      await expect(
        contract.connect(student1).claimAchievement(1)
      ).to.emit(contract, "AchievementCompleted");
      
      const balanceAfter = await ethers.provider.getBalance(student1.address);
      expect(balanceAfter).to.be.gt(balanceBefore); // Should have received reward
      
      // Verify claim recorded
      expect(await contract.hasCompletedAchievement(student1.address, 1)).to.equal(true);
    });

    it("Should not allow claiming without enough points", async function () {
      const { contract, owner, student1 } = await loadFixture(deployEducationCredentialsFixture);
      
      await contract.connect(student1).registerStudent("Alice", "alice@example.com", "STU-001");
      
      const rewardAmount = ethers.parseEther("0.1");
      await contract.connect(owner).createAchievement(
        "High Achiever",
        "Need 500 points",
        500,
        rewardAmount,
        { value: rewardAmount }
      );
      
      // Student has 0 points
      await expect(
        contract.connect(student1).claimAchievement(1)
      ).to.be.revertedWith("Insufficient achievement points");
    });

    it("Should not allow claiming same achievement twice", async function () {
      const { contract, owner, student1, institution1 } = await loadFixture(deployEducationCredentialsFixture);
      
      await contract.connect(student1).registerStudent("Alice", "alice@example.com", "STU-001");
      
      const rewardAmount = ethers.parseEther("0.1");
      await contract.connect(owner).createAchievement(
        "Achiever",
        "100 points",
        100,
        rewardAmount,
        { value: rewardAmount }
      );
      
      // Setup to earn points
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      await contract.connect(owner).verifyInstitution(institution1.address);
      
      const completionDate = await time.latest();
      const fee = ethers.parseEther("0.001");
      await contract.connect(institution1).issueCertificate(
        student1.address,
        0,
        "Course",
        "Test",
        completionDate,
        "A",
        "Hash",
        { value: fee }
      );
      
      // Claim first time
      await contract.connect(student1).claimAchievement(1);
      
      // Try to claim again
      await expect(
        contract.connect(student1).claimAchievement(1)
      ).to.be.revertedWith("Achievement already claimed");
    });
  });

  describe("Admin Functions", function () {
    it("Should allow owner to update platform fee", async function () {
      const { contract, owner } = await loadFixture(deployEducationCredentialsFixture);
      
      await expect(
        contract.connect(owner).updatePlatformFee(200)
      ).to.emit(contract, "PlatformFeeUpdated")
        .withArgs(200);

      expect(await contract.platformFeePercent()).to.equal(200);
    });

    it("Should not allow platform fee above 10%", async function () {
      const { contract, owner } = await loadFixture(deployEducationCredentialsFixture);
      
      await expect(
        contract.connect(owner).updatePlatformFee(1001)
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });

    it("Should allow owner to withdraw fees", async function () {
      const { contract, owner, institution1, student1 } = await loadFixture(deployEducationCredentialsFixture);
      
      // Setup
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      await contract.connect(owner).verifyInstitution(institution1.address);
      await contract.connect(student1).registerStudent("Alice", "alice@example.com", "STU-001");
      
      // Issue certificate with fee
      const completionDate = await time.latest();
      const fee = ethers.parseEther("1");
      await contract.connect(institution1).issueCertificate(
        student1.address,
        0,
        "Course",
        "Test",
        completionDate,
        "A",
        "Hash",
        { value: fee }
      );
      
      // Contract should have balance
      const contractBalance = await ethers.provider.getBalance(await contract.getAddress());
      expect(contractBalance).to.be.gt(0);
      
      // Withdraw
      const ownerBalanceBefore = await ethers.provider.getBalance(owner.address);
      await contract.connect(owner).withdrawFees();
      const ownerBalanceAfter = await ethers.provider.getBalance(owner.address);
      
      expect(ownerBalanceAfter).to.be.gt(ownerBalanceBefore);
    });

    it("Should allow funding for achievement rewards", async function () {
      const { contract, owner } = await loadFixture(deployEducationCredentialsFixture);
      
      const fundAmount = ethers.parseEther("10");
      await contract.connect(owner).fundAchievementRewards({ value: fundAmount });
      
      const contractBalance = await ethers.provider.getBalance(await contract.getAddress());
      expect(contractBalance).to.equal(fundAmount);
    });
  });

  describe("View Functions", function () {
    it("Should return correct stats", async function () {
      const { contract, owner, institution1, student1 } = await loadFixture(deployEducationCredentialsFixture);
      
      await contract.connect(institution1).registerInstitution("MIT", "REG-001", "USA", "https://mit.edu");
      await contract.connect(student1).registerStudent("Alice", "alice@example.com", "STU-001");
      await contract.connect(owner).createAchievement(
        "Test",
        "Test",
        100,
        ethers.parseEther("0.1"),
        { value: ethers.parseEther("0.1") }
      );
      
      const stats = await contract.getStats();
      expect(stats._totalInstitutions).to.equal(1);
      expect(stats._totalStudents).to.equal(1);
      expect(stats._totalAchievements).to.equal(1);
    });
  });
});
