import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import {
  CONTRACT_ADDRESS,
  CONTRACT_ABI,
  CELO_SEPOLIA_CONFIG,
  CERTIFICATE_TYPES,
  SKILL_LEVELS,
  INSTITUTION_STATUS,
  CERTIFICATE_FEE,
  MIN_REWARD,
  formatDate,
  formatAddress,
  getCertificateTypeName,
  getSkillLevelName,
  getInstitutionStatusName,
  getExplorerUrl,
  getTxUrl
} from './config'
import './App.css'

function App() {
  // ============================================
  // State Management
  // ============================================
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [contract, setContract] = useState(null)
  const [balance, setBalance] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Tab management
  const [activeTab, setActiveTab] = useState('home')
  
  // User role detection
  const [isOwner, setIsOwner] = useState(false)
  const [isInstitution, setIsInstitution] = useState(false)
  const [isStudent, setIsStudent] = useState(false)
  const [institutionData, setInstitutionData] = useState(null)
  const [studentData, setStudentData] = useState(null)
  
  // Contract stats
  const [stats, setStats] = useState({
    totalInstitutions: 0,
    totalStudents: 0,
    totalCertificates: 0,
    totalSkillBadges: 0,
    totalAchievements: 0,
    platformFeePercent: 0
  })
  
  // Data lists
  const [certificates, setCertificates] = useState([])
  const [skillBadges, setSkillBadges] = useState([])
  const [achievements, setAchievements] = useState([])
  
  // Form states - Institution Registration
  const [instForm, setInstForm] = useState({
    name: '',
    registrationNumber: '',
    country: '',
    website: ''
  })
  
  // Form states - Student Registration
  const [studentForm, setStudentForm] = useState({
    name: '',
    email: '',
    studentId: ''
  })
  
  // Form states - Certificate Issuance
  const [certForm, setCertForm] = useState({
    studentAddress: '',
    certificateType: 0,
    courseName: '',
    major: '',
    completionDate: '',
    grade: '',
    ipfsHash: '',
    fee: CERTIFICATE_FEE
  })
  
  // Form states - Skill Badge Issuance
  const [badgeForm, setBadgeForm] = useState({
    holderAddress: '',
    skillName: '',
    level: 0,
    description: '',
    expiresAt: '',
    verificationProof: ''
  })
  
  // Form states - Achievement Creation
  const [achievementForm, setAchievementForm] = useState({
    name: '',
    description: '',
    pointsRequired: '',
    rewardAmount: MIN_REWARD
  })
  
  // Certificate verification
  const [verifyCertId, setVerifyCertId] = useState('')
  const [verificationResult, setVerificationResult] = useState(null)
  
  // ============================================
  // Wallet Connection & Network Setup
  // ============================================
  const connectWallet = async () => {
    try {
      setError('')
      
      if (!window.ethereum) {
        setError('Please install MetaMask to use this DApp')
        return
      }
      
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      
      const web3Provider = new ethers.BrowserProvider(window.ethereum)
      const signer = await web3Provider.getSigner()
      const userAddress = await signer.getAddress()
      
      const eduContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      )
      
      setAccount(userAddress)
      setProvider(web3Provider)
      setContract(eduContract)
      
      const bal = await web3Provider.getBalance(userAddress)
      setBalance(ethers.formatEther(bal))
      
      // Check user roles
      await checkUserRoles(eduContract, userAddress)
      
      // Load contract stats
      await loadContractStats(eduContract)
      
      setSuccess('Wallet connected successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Connection error:', err)
      setError('Failed to connect wallet: ' + err.message)
    }
  }
  
  const switchToCeloSepolia = async () => {
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: CELO_SEPOLIA_CONFIG.chainId }],
      })
    } catch (switchError) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [CELO_SEPOLIA_CONFIG],
          })
        } catch (addError) {
          setError('Failed to add Celo Sepolia network: ' + addError.message)
        }
      } else {
        setError('Failed to switch network: ' + switchError.message)
      }
    }
  }
  
  const checkUserRoles = async (contractInstance, userAddress) => {
    try {
      // Check if owner
      const ownerAddress = await contractInstance.owner()
      setIsOwner(ownerAddress.toLowerCase() === userAddress.toLowerCase())
      
      // Check if institution
      try {
        const inst = await contractInstance.institutions(userAddress)
        if (inst.exists) {
          setIsInstitution(true)
          setInstitutionData(inst)
        }
      } catch (err) {
        setIsInstitution(false)
      }
      
      // Check if student
      try {
        const student = await contractInstance.students(userAddress)
        if (student.exists) {
          setIsStudent(true)
          setStudentData(student)
        }
      } catch (err) {
        setIsStudent(false)
      }
    } catch (err) {
      console.error('Error checking user roles:', err)
    }
  }
  
  const loadContractStats = async (contractInstance) => {
    try {
      const statsData = await contractInstance.getStats()
      setStats({
        totalInstitutions: Number(statsData[0]),
        totalStudents: Number(statsData[1]),
        totalCertificates: Number(statsData[2]),
        totalSkillBadges: Number(statsData[3]),
        totalAchievements: Number(statsData[4]),
        platformFeePercent: Number(statsData[5])
      })
    } catch (err) {
      console.error('Error loading stats:', err)
    }
  }
  
  // ============================================
  // Institution Functions
  // ============================================
  const registerInstitution = async () => {
    if (!contract) return
    
    try {
      setLoading(true)
      setError('')
      
      const tx = await contract.registerInstitution(
        instForm.name,
        instForm.registrationNumber,
        instForm.country,
        instForm.website
      )
      
      await tx.wait()
      
      setSuccess('Institution registered successfully! Waiting for admin verification.')
      setInstForm({ name: '', registrationNumber: '', country: '', website: '' })
      
      // Refresh user roles
      await checkUserRoles(contract, account)
      await loadContractStats(contract)
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      console.error('Registration error:', err)
      setError('Failed to register institution: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // ============================================
  // Student Functions
  // ============================================
  const registerStudent = async () => {
    if (!contract) return
    
    try {
      setLoading(true)
      setError('')
      
      const tx = await contract.registerStudent(
        studentForm.name,
        studentForm.email,
        studentForm.studentId
      )
      
      await tx.wait()
      
      setSuccess('Student registered successfully!')
      setStudentForm({ name: '', email: '', studentId: '' })
      
      // Refresh user roles
      await checkUserRoles(contract, account)
      await loadContractStats(contract)
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      console.error('Registration error:', err)
      setError('Failed to register student: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const loadStudentCredentials = async () => {
    if (!contract || !account) return
    
    try {
      setLoading(true)
      
      // Load certificates
      const certIds = await contract.getStudentCertificates(account)
      const certPromises = certIds.map(async (id) => {
        const cert = await contract.getCertificate(id)
        const inst = await contract.getInstitution(cert.institutionAddress)
        return { ...cert, institutionName: inst.name }
      })
      const certs = await Promise.all(certPromises)
      setCertificates(certs)
      
      // Load skill badges
      const badgeIds = await contract.getStudentSkillBadges(account)
      const badgePromises = badgeIds.map(async (id) => {
        const badge = await contract.getSkillBadge(id)
        const inst = await contract.getInstitution(badge.issuer)
        return { ...badge, issuerName: inst.name }
      })
      const badges = await Promise.all(badgePromises)
      setSkillBadges(badges)
      
    } catch (err) {
      console.error('Error loading credentials:', err)
      setError('Failed to load credentials: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const claimAchievement = async (achievementId) => {
    if (!contract) return
    
    try {
      setLoading(true)
      setError('')
      
      const tx = await contract.claimAchievement(achievementId)
      await tx.wait()
      
      setSuccess('Achievement claimed successfully! Reward sent to your wallet.')
      
      // Refresh student data
      await checkUserRoles(contract, account)
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      console.error('Claim error:', err)
      setError('Failed to claim achievement: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // ============================================
  // Certificate Functions
  // ============================================
  const issueCertificate = async () => {
    if (!contract) return
    
    try {
      setLoading(true)
      setError('')
      
      // Convert completion date to timestamp
      const completionTimestamp = Math.floor(new Date(certForm.completionDate).getTime() / 1000)
      
      const tx = await contract.issueCertificate(
        certForm.studentAddress,
        certForm.certificateType,
        certForm.courseName,
        certForm.major,
        completionTimestamp,
        certForm.grade,
        certForm.ipfsHash,
        { value: ethers.parseEther(certForm.fee) }
      )
      
      await tx.wait()
      
      setSuccess('Certificate issued successfully!')
      setCertForm({
        studentAddress: '',
        certificateType: 0,
        courseName: '',
        major: '',
        completionDate: '',
        grade: '',
        ipfsHash: '',
        fee: CERTIFICATE_FEE
      })
      
      await loadContractStats(contract)
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      console.error('Issuance error:', err)
      setError('Failed to issue certificate: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const verifyCertificate = async () => {
    if (!contract || !verifyCertId) return
    
    try {
      setLoading(true)
      setError('')
      
      const result = await contract.verifyCertificate(verifyCertId)
      const inst = await contract.getInstitution(result.cert.institutionAddress)
      
      setVerificationResult({
        isValid: result.isValid,
        certificate: result.cert,
        institutionName: inst.name,
        institutionStatus: inst.status
      })
      
    } catch (err) {
      console.error('Verification error:', err)
      setError('Failed to verify certificate: ' + err.message)
      setVerificationResult(null)
    } finally {
      setLoading(false)
    }
  }
  
  const loadInstitutionCertificates = async () => {
    if (!contract || !account) return
    
    try {
      setLoading(true)
      
      const certIds = await contract.getInstitutionCertificates(account)
      const certPromises = certIds.map(async (id) => {
        const cert = await contract.getCertificate(id)
        const student = await contract.getStudent(cert.studentAddress)
        return { ...cert, studentName: student.name }
      })
      const certs = await Promise.all(certPromises)
      setCertificates(certs)
      
    } catch (err) {
      console.error('Error loading certificates:', err)
      setError('Failed to load certificates: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // ============================================
  // Skill Badge Functions
  // ============================================
  const issueSkillBadge = async () => {
    if (!contract) return
    
    try {
      setLoading(true)
      setError('')
      
      // Convert expiry date to timestamp (0 for never expire)
      const expiryTimestamp = badgeForm.expiresAt 
        ? Math.floor(new Date(badgeForm.expiresAt).getTime() / 1000)
        : 0
      
      const tx = await contract.issueSkillBadge(
        badgeForm.holderAddress,
        badgeForm.skillName,
        badgeForm.level,
        badgeForm.description,
        expiryTimestamp,
        badgeForm.verificationProof
      )
      
      await tx.wait()
      
      setSuccess('Skill badge issued successfully!')
      setBadgeForm({
        holderAddress: '',
        skillName: '',
        level: 0,
        description: '',
        expiresAt: '',
        verificationProof: ''
      })
      
      await loadContractStats(contract)
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      console.error('Badge issuance error:', err)
      setError('Failed to issue skill badge: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // ============================================
  // Achievement Functions
  // ============================================
  const createAchievement = async () => {
    if (!contract) return
    
    try {
      setLoading(true)
      setError('')
      
      const tx = await contract.createAchievement(
        achievementForm.name,
        achievementForm.description,
        achievementForm.pointsRequired,
        ethers.parseEther(achievementForm.rewardAmount),
        { value: ethers.parseEther(achievementForm.rewardAmount) }
      )
      
      await tx.wait()
      
      setSuccess('Achievement created successfully!')
      setAchievementForm({
        name: '',
        description: '',
        pointsRequired: '',
        rewardAmount: MIN_REWARD
      })
      
      await loadContractStats(contract)
      await loadAllAchievements()
      
      setTimeout(() => setSuccess(''), 5000)
    } catch (err) {
      console.error('Achievement creation error:', err)
      setError('Failed to create achievement: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  const loadAllAchievements = async () => {
    if (!contract) return
    
    try {
      const total = await contract.totalAchievements()
      const achievementPromises = []
      
      for (let i = 1; i <= Number(total); i++) {
        achievementPromises.push(contract.getAchievement(i))
      }
      
      const achievementsData = await Promise.all(achievementPromises)
      
      // Check completion status if student
      if (isStudent && account) {
        const achievementsWithStatus = await Promise.all(
          achievementsData.map(async (ach) => {
            const completed = await contract.hasCompletedAchievement(account, ach.achievementId)
            return { ...ach, completed }
          })
        )
        setAchievements(achievementsWithStatus)
      } else {
        setAchievements(achievementsData)
      }
      
    } catch (err) {
      console.error('Error loading achievements:', err)
    }
  }
  
  // ============================================
  // Admin Functions
  // ============================================
  const verifyInstitution = async (institutionAddress) => {
    if (!contract) return
    
    try {
      setLoading(true)
      setError('')
      
      const tx = await contract.verifyInstitution(institutionAddress)
      await tx.wait()
      
      setSuccess('Institution verified successfully!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Verification error:', err)
      setError('Failed to verify institution: ' + err.message)
    } finally {
      setLoading(false)
    }
  }
  
  // ============================================
  // Effect Hooks
  // ============================================
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          window.location.reload()
        } else {
          setAccount(null)
          setContract(null)
        }
      })
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload()
      })
    }
  }, [])
  
  useEffect(() => {
    if (contract && account) {
      if (activeTab === 'myCredentials' && isStudent) {
        loadStudentCredentials()
      } else if (activeTab === 'myCertificates' && isInstitution) {
        loadInstitutionCertificates()
      } else if (activeTab === 'achievements') {
        loadAllAchievements()
      }
    }
  }, [activeTab, contract, account, isStudent, isInstitution])
  
  // ============================================
  // Render Functions
  // ============================================
  const renderHome = () => (
    <div className="home-section">
      <div className="hero">
        <h1>🎓 Education Credentials Platform</h1>
        <p className="subtitle">Decentralized credential verification on Celo blockchain</p>
        <p className="description">
          Issue, manage, and verify educational certificates, skill badges, and achievements with blockchain security.
        </p>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-number">{stats.totalInstitutions}</div>
          <div className="stat-label">Institutions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalStudents}</div>
          <div className="stat-label">Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalCertificates}</div>
          <div className="stat-label">Certificates</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalSkillBadges}</div>
          <div className="stat-label">Skill Badges</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.totalAchievements}</div>
          <div className="stat-label">Achievements</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{stats.platformFeePercent / 100}%</div>
          <div className="stat-label">Platform Fee</div>
        </div>
      </div>
      
      <div className="features-grid">
        <div className="feature-card">
          <h3>🏛️ For Institutions</h3>
          <p>Register your institution, issue verified certificates, and award skill badges to students.</p>
        </div>
        <div className="feature-card">
          <h3>👨‍🎓 For Students</h3>
          <p>Build your digital credentials portfolio and claim achievement rewards.</p>
        </div>
        <div className="feature-card">
          <h3>✅ For Verifiers</h3>
          <p>Instantly verify the authenticity of any certificate or credential.</p>
        </div>
      </div>
      
      {account && (
        <div className="user-status">
          <h3>Your Status</h3>
          <div className="status-badges">
            {isOwner && <span className="badge owner">👑 Platform Owner</span>}
            {isInstitution && (
              <span className={`badge institution ${institutionData?.status === 1 ? 'verified' : 'pending'}`}>
                🏛️ Institution ({getInstitutionStatusName(institutionData?.status)})
              </span>
            )}
            {isStudent && <span className="badge student">👨‍🎓 Student</span>}
            {!isInstitution && !isStudent && !isOwner && (
              <span className="badge unregistered">⚠️ Not Registered</span>
            )}
          </div>
          
          {studentData && (
            <div className="student-stats">
              <p><strong>Achievement Points:</strong> {Number(studentData.achievementPoints)}</p>
              <p><strong>Certificates:</strong> {Number(studentData.certificatesEarned)}</p>
              <p><strong>Skill Badges:</strong> {Number(studentData.skillBadgesEarned)}</p>
            </div>
          )}
          
          {institutionData && (
            <div className="institution-stats">
              <p><strong>Reputation:</strong> {Number(institutionData.reputation)}/1000</p>
              <p><strong>Certificates Issued:</strong> {Number(institutionData.certificatesIssued)}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
  
  const renderRegister = () => (
    <div className="register-section">
      <h2>Register</h2>
      
      {!isInstitution && (
        <div className="form-container">
          <h3>🏛️ Register as Institution</h3>
          <div className="form-group">
            <label>Institution Name *</label>
            <input
              type="text"
              placeholder="e.g., Harvard University"
              value={instForm.name}
              onChange={(e) => setInstForm({...instForm, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Registration Number *</label>
            <input
              type="text"
              placeholder="e.g., REG-2025-001"
              value={instForm.registrationNumber}
              onChange={(e) => setInstForm({...instForm, registrationNumber: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Country *</label>
            <input
              type="text"
              placeholder="e.g., United States"
              value={instForm.country}
              onChange={(e) => setInstForm({...instForm, country: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              placeholder="https://institution.edu"
              value={instForm.website}
              onChange={(e) => setInstForm({...instForm, website: e.target.value})}
            />
          </div>
          <button 
            className="btn btn-primary"
            onClick={registerInstitution}
            disabled={loading || !instForm.name || !instForm.registrationNumber || !instForm.country}
          >
            {loading ? 'Registering...' : 'Register Institution'}
          </button>
          <p className="info-text">⚠️ After registration, wait for platform admin verification.</p>
        </div>
      )}
      
      {!isStudent && (
        <div className="form-container">
          <h3>👨‍🎓 Register as Student</h3>
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              placeholder="e.g., Alice Johnson"
              value={studentForm.name}
              onChange={(e) => setStudentForm({...studentForm, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Email *</label>
            <input
              type="email"
              placeholder="alice@example.com"
              value={studentForm.email}
              onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Student ID</label>
            <input
              type="text"
              placeholder="e.g., STU-2025-001"
              value={studentForm.studentId}
              onChange={(e) => setStudentForm({...studentForm, studentId: e.target.value})}
            />
          </div>
          <button 
            className="btn btn-primary"
            onClick={registerStudent}
            disabled={loading || !studentForm.name || !studentForm.email}
          >
            {loading ? 'Registering...' : 'Register Student'}
          </button>
        </div>
      )}
      
      {(isInstitution || isStudent) && (
        <div className="success-message">
          <p>✅ You are already registered!</p>
        </div>
      )}
    </div>
  )
  
  const renderIssueCertificate = () => (
    <div className="issue-section">
      <h2>📜 Issue Certificate</h2>
      
      {!isInstitution ? (
        <div className="error-message">
          <p>⚠️ Only registered institutions can issue certificates.</p>
        </div>
      ) : institutionData?.status !== 1 ? (
        <div className="error-message">
          <p>⚠️ Your institution must be verified to issue certificates.</p>
        </div>
      ) : (
        <div className="form-container">
          <div className="form-group">
            <label>Student Address *</label>
            <input
              type="text"
              placeholder="0x..."
              value={certForm.studentAddress}
              onChange={(e) => setCertForm({...certForm, studentAddress: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Certificate Type *</label>
            <select
              value={certForm.certificateType}
              onChange={(e) => setCertForm({...certForm, certificateType: Number(e.target.value)})}
            >
              <option value={0}>Diploma</option>
              <option value={1}>Degree</option>
              <option value={2}>Course</option>
              <option value={3}>Training</option>
              <option value={4}>Workshop</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Course Name *</label>
            <input
              type="text"
              placeholder="e.g., Blockchain Development"
              value={certForm.courseName}
              onChange={(e) => setCertForm({...certForm, courseName: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Major / Program *</label>
            <input
              type="text"
              placeholder="e.g., Computer Science"
              value={certForm.major}
              onChange={(e) => setCertForm({...certForm, major: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Completion Date *</label>
            <input
              type="date"
              value={certForm.completionDate}
              onChange={(e) => setCertForm({...certForm, completionDate: e.target.value})}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="form-group">
            <label>Grade *</label>
            <input
              type="text"
              placeholder="e.g., A+, 95%, Distinction"
              value={certForm.grade}
              onChange={(e) => setCertForm({...certForm, grade: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>IPFS Hash (optional)</label>
            <input
              type="text"
              placeholder="QmXxx... (certificate document hash)"
              value={certForm.ipfsHash}
              onChange={(e) => setCertForm({...certForm, ipfsHash: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Platform Fee (CELO) *</label>
            <input
              type="text"
              value={certForm.fee}
              onChange={(e) => setCertForm({...certForm, fee: e.target.value})}
            />
            <p className="info-text">Minimum: {CERTIFICATE_FEE} CELO</p>
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={issueCertificate}
            disabled={loading || !certForm.studentAddress || !certForm.courseName || !certForm.major || !certForm.completionDate || !certForm.grade}
          >
            {loading ? 'Issuing...' : 'Issue Certificate'}
          </button>
        </div>
      )}
    </div>
  )
  
  const renderIssueSkillBadge = () => (
    <div className="issue-section">
      <h2>🏅 Issue Skill Badge</h2>
      
      {!isInstitution ? (
        <div className="error-message">
          <p>⚠️ Only registered institutions can issue skill badges.</p>
        </div>
      ) : institutionData?.status !== 1 ? (
        <div className="error-message">
          <p>⚠️ Your institution must be verified to issue skill badges.</p>
        </div>
      ) : (
        <div className="form-container">
          <div className="form-group">
            <label>Student Address *</label>
            <input
              type="text"
              placeholder="0x..."
              value={badgeForm.holderAddress}
              onChange={(e) => setBadgeForm({...badgeForm, holderAddress: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Skill Name *</label>
            <input
              type="text"
              placeholder="e.g., Smart Contract Development"
              value={badgeForm.skillName}
              onChange={(e) => setBadgeForm({...badgeForm, skillName: e.target.value})}
            />
          </div>
          
          <div className="form-group">
            <label>Skill Level *</label>
            <select
              value={badgeForm.level}
              onChange={(e) => setBadgeForm({...badgeForm, level: Number(e.target.value)})}
            >
              <option value={0}>Beginner</option>
              <option value={1}>Intermediate</option>
              <option value={2}>Advanced</option>
              <option value={3}>Expert</option>
            </select>
          </div>
          
          <div className="form-group">
            <label>Description *</label>
            <textarea
              placeholder="Describe the skill assessment..."
              value={badgeForm.description}
              onChange={(e) => setBadgeForm({...badgeForm, description: e.target.value})}
              rows={3}
            />
          </div>
          
          <div className="form-group">
            <label>Expiration Date (optional)</label>
            <input
              type="date"
              value={badgeForm.expiresAt}
              onChange={(e) => setBadgeForm({...badgeForm, expiresAt: e.target.value})}
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="info-text">Leave empty for lifetime validity</p>
          </div>
          
          <div className="form-group">
            <label>Verification Proof (optional)</label>
            <input
              type="text"
              placeholder="Test scores, project links, etc."
              value={badgeForm.verificationProof}
              onChange={(e) => setBadgeForm({...badgeForm, verificationProof: e.target.value})}
            />
          </div>
          
          <button 
            className="btn btn-primary"
            onClick={issueSkillBadge}
            disabled={loading || !badgeForm.holderAddress || !badgeForm.skillName || !badgeForm.description}
          >
            {loading ? 'Issuing...' : 'Issue Skill Badge'}
          </button>
        </div>
      )}
    </div>
  )
  
  const renderMyCredentials = () => (
    <div className="credentials-section">
      <h2>📚 My Credentials</h2>
      
      {!isStudent ? (
        <div className="error-message">
          <p>⚠️ Only registered students can view credentials.</p>
        </div>
      ) : (
        <>
          <div className="credentials-header">
            <div className="student-info">
              <h3>{studentData?.name}</h3>
              <p>Student ID: {studentData?.studentId}</p>
              <p>Email: {studentData?.email}</p>
              <p className="achievement-points">
                🏆 Achievement Points: <strong>{Number(studentData?.achievementPoints)}</strong>
              </p>
            </div>
          </div>
          
          <div className="credentials-tabs">
            <h3>📜 Certificates ({certificates.length})</h3>
            {loading ? (
              <p>Loading...</p>
            ) : certificates.length === 0 ? (
              <p className="empty-state">No certificates yet.</p>
            ) : (
              <div className="certificates-grid">
                {certificates.map((cert, index) => (
                  <div key={index} className="certificate-card">
                    <div className="cert-header">
                      <span className="cert-type">{getCertificateTypeName(cert.certificateType)}</span>
                      {cert.isRevoked && <span className="badge revoked">Revoked</span>}
                    </div>
                    <h4>{cert.courseName}</h4>
                    <p><strong>Major:</strong> {cert.major}</p>
                    <p><strong>Grade:</strong> {cert.grade}</p>
                    <p><strong>Institution:</strong> {cert.institutionName}</p>
                    <p><strong>Issued:</strong> {formatDate(cert.issueDate)}</p>
                    <p><strong>Completed:</strong> {formatDate(cert.completionDate)}</p>
                    <p className="cert-id">ID: #{Number(cert.certificateId)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="credentials-tabs">
            <h3>🏅 Skill Badges ({skillBadges.length})</h3>
            {loading ? (
              <p>Loading...</p>
            ) : skillBadges.length === 0 ? (
              <p className="empty-state">No skill badges yet.</p>
            ) : (
              <div className="badges-grid">
                {skillBadges.map((badge, index) => (
                  <div key={index} className="badge-card">
                    <div className="badge-header">
                      <span className={`level-badge ${getSkillLevelName(badge.level).toLowerCase()}`}>
                        {getSkillLevelName(badge.level)}
                      </span>
                    </div>
                    <h4>{badge.skillName}</h4>
                    <p>{badge.description}</p>
                    <p><strong>Issuer:</strong> {badge.issuerName}</p>
                    <p><strong>Issued:</strong> {formatDate(badge.issuedAt)}</p>
                    {Number(badge.expiresAt) > 0 && (
                      <p><strong>Expires:</strong> {formatDate(badge.expiresAt)}</p>
                    )}
                    <p className="badge-id">ID: #{Number(badge.badgeId)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
  
  const renderMyCertificates = () => (
    <div className="certificates-section">
      <h2>📋 My Issued Certificates</h2>
      
      {!isInstitution ? (
        <div className="error-message">
          <p>⚠️ Only registered institutions can view issued certificates.</p>
        </div>
      ) : (
        <>
          {loading ? (
            <p>Loading...</p>
          ) : certificates.length === 0 ? (
            <p className="empty-state">No certificates issued yet.</p>
          ) : (
            <div className="certificates-list">
              {certificates.map((cert, index) => (
                <div key={index} className="certificate-item">
                  <div className="cert-info">
                    <h4>{cert.courseName} ({getCertificateTypeName(cert.certificateType)})</h4>
                    <p><strong>Student:</strong> {cert.studentName} ({formatAddress(cert.studentAddress)})</p>
                    <p><strong>Major:</strong> {cert.major}</p>
                    <p><strong>Grade:</strong> {cert.grade}</p>
                    <p><strong>Issued:</strong> {formatDate(cert.issueDate)}</p>
                    <p><strong>Completed:</strong> {formatDate(cert.completionDate)}</p>
                    <p className="cert-id">Certificate ID: #{Number(cert.certificateId)}</p>
                  </div>
                  <div className="cert-status">
                    {cert.isRevoked ? (
                      <span className="badge revoked">Revoked</span>
                    ) : (
                      <span className="badge active">Active</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
  
  const renderVerify = () => (
    <div className="verify-section">
      <h2>✅ Verify Certificate</h2>
      <p className="subtitle">Anyone can verify the authenticity of a certificate</p>
      
      <div className="form-container">
        <div className="form-group">
          <label>Certificate ID *</label>
          <input
            type="number"
            placeholder="Enter certificate ID"
            value={verifyCertId}
            onChange={(e) => setVerifyCertId(e.target.value)}
            min="1"
          />
        </div>
        
        <button 
          className="btn btn-primary"
          onClick={verifyCertificate}
          disabled={loading || !verifyCertId}
        >
          {loading ? 'Verifying...' : 'Verify Certificate'}
        </button>
      </div>
      
      {verificationResult && (
        <div className={`verification-result ${verificationResult.isValid ? 'valid' : 'invalid'}`}>
          <h3>{verificationResult.isValid ? '✅ Valid Certificate' : '❌ Invalid Certificate'}</h3>
          
          <div className="cert-details">
            <h4>Certificate Details:</h4>
            <p><strong>Course:</strong> {verificationResult.certificate.courseName}</p>
            <p><strong>Type:</strong> {getCertificateTypeName(verificationResult.certificate.certificateType)}</p>
            <p><strong>Major:</strong> {verificationResult.certificate.major}</p>
            <p><strong>Grade:</strong> {verificationResult.certificate.grade}</p>
            <p><strong>Issue Date:</strong> {formatDate(verificationResult.certificate.issueDate)}</p>
            <p><strong>Completion Date:</strong> {formatDate(verificationResult.certificate.completionDate)}</p>
            <p><strong>Student:</strong> {formatAddress(verificationResult.certificate.studentAddress)}</p>
            <p><strong>Institution:</strong> {verificationResult.institutionName}</p>
            <p><strong>Institution Status:</strong> {getInstitutionStatusName(verificationResult.institutionStatus)}</p>
            
            {verificationResult.certificate.isRevoked && (
              <div className="revocation-info">
                <p className="revoked-text">⚠️ This certificate has been revoked</p>
                <p><strong>Reason:</strong> {verificationResult.certificate.revocationReason}</p>
              </div>
            )}
            
            {verificationResult.certificate.ipfsHash && (
              <p><strong>Document Hash:</strong> {verificationResult.certificate.ipfsHash}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
  
  const renderAchievements = () => (
    <div className="achievements-section">
      <h2>🏆 Achievements</h2>
      
      {isOwner && (
        <div className="form-container create-achievement">
          <h3>Create New Achievement</h3>
          <div className="form-group">
            <label>Name *</label>
            <input
              type="text"
              placeholder="e.g., First Certificate"
              value={achievementForm.name}
              onChange={(e) => setAchievementForm({...achievementForm, name: e.target.value})}
            />
          </div>
          <div className="form-group">
            <label>Description *</label>
            <textarea
              placeholder="Achievement description..."
              value={achievementForm.description}
              onChange={(e) => setAchievementForm({...achievementForm, description: e.target.value})}
              rows={2}
            />
          </div>
          <div className="form-group">
            <label>Points Required *</label>
            <input
              type="number"
              placeholder="e.g., 100"
              value={achievementForm.pointsRequired}
              onChange={(e) => setAchievementForm({...achievementForm, pointsRequired: e.target.value})}
              min="1"
            />
          </div>
          <div className="form-group">
            <label>Reward Amount (CELO) *</label>
            <input
              type="text"
              placeholder="e.g., 0.05"
              value={achievementForm.rewardAmount}
              onChange={(e) => setAchievementForm({...achievementForm, rewardAmount: e.target.value})}
            />
            <p className="info-text">Minimum: {MIN_REWARD} CELO</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={createAchievement}
            disabled={loading || !achievementForm.name || !achievementForm.description || !achievementForm.pointsRequired || !achievementForm.rewardAmount}
          >
            {loading ? 'Creating...' : 'Create Achievement'}
          </button>
        </div>
      )}
      
      {loading ? (
        <p>Loading achievements...</p>
      ) : achievements.length === 0 ? (
        <p className="empty-state">No achievements available yet.</p>
      ) : (
        <div className="achievements-grid">
          {achievements.map((ach, index) => (
            <div key={index} className={`achievement-card ${ach.completed ? 'completed' : ''}`}>
              <div className="achievement-header">
                <h4>{ach.name}</h4>
                {ach.completed && <span className="badge completed">✅ Completed</span>}
                {!ach.isActive && <span className="badge inactive">Inactive</span>}
              </div>
              <p>{ach.description}</p>
              <div className="achievement-details">
                <p><strong>Points Required:</strong> {Number(ach.pointsRequired)}</p>
                <p><strong>Reward:</strong> {ethers.formatEther(ach.rewardAmount)} CELO</p>
                <p><strong>Times Completed:</strong> {Number(ach.timesCompleted)}</p>
              </div>
              
              {isStudent && ach.isActive && !ach.completed && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => claimAchievement(ach.achievementId)}
                  disabled={loading || Number(studentData?.achievementPoints) < Number(ach.pointsRequired)}
                >
                  {Number(studentData?.achievementPoints) >= Number(ach.pointsRequired) 
                    ? 'Claim Reward' 
                    : `Need ${Number(ach.pointsRequired) - Number(studentData?.achievementPoints)} more points`
                  }
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
  
  // ============================================
  // Main Render
  // ============================================
  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1 className="app-title">🎓 Education Credentials</h1>
          <div className="header-actions">
            {!account ? (
              <button className="btn btn-connect" onClick={connectWallet}>
                Connect Wallet
              </button>
            ) : (
              <div className="wallet-info">
                <div className="account-info">
                  <span className="account-address">{formatAddress(account)}</span>
                  <span className="account-balance">{Number(balance).toFixed(4)} CELO</span>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {account && (
          <nav className="nav-tabs">
            <button 
              className={activeTab === 'home' ? 'active' : ''}
              onClick={() => setActiveTab('home')}
            >
              🏠 Home
            </button>
            <button 
              className={activeTab === 'register' ? 'active' : ''}
              onClick={() => setActiveTab('register')}
            >
              📝 Register
            </button>
            {isInstitution && institutionData?.status === 1 && (
              <>
                <button 
                  className={activeTab === 'issueCertificate' ? 'active' : ''}
                  onClick={() => setActiveTab('issueCertificate')}
                >
                  📜 Issue Certificate
                </button>
                <button 
                  className={activeTab === 'issueSkillBadge' ? 'active' : ''}
                  onClick={() => setActiveTab('issueSkillBadge')}
                >
                  🏅 Issue Badge
                </button>
                <button 
                  className={activeTab === 'myCertificates' ? 'active' : ''}
                  onClick={() => setActiveTab('myCertificates')}
                >
                  📋 My Issued
                </button>
              </>
            )}
            {isStudent && (
              <button 
                className={activeTab === 'myCredentials' ? 'active' : ''}
                onClick={() => setActiveTab('myCredentials')}
              >
                📚 My Credentials
              </button>
            )}
            <button 
              className={activeTab === 'verify' ? 'active' : ''}
              onClick={() => setActiveTab('verify')}
            >
              ✅ Verify
            </button>
            <button 
              className={activeTab === 'achievements' ? 'active' : ''}
              onClick={() => setActiveTab('achievements')}
            >
              🏆 Achievements
            </button>
          </nav>
        )}
      </header>
      
      <main className="app-main">
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
            <button className="alert-close" onClick={() => setError('')}>×</button>
          </div>
        )}
        
        {success && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <span>{success}</span>
            <button className="alert-close" onClick={() => setSuccess('')}>×</button>
          </div>
        )}
        
        {!account ? (
          <div className="connect-prompt">
            <h2>Welcome to Education Credentials Platform</h2>
            <p>Connect your wallet to get started</p>
            <button className="btn btn-primary btn-large" onClick={connectWallet}>
              Connect MetaMask
            </button>
          </div>
        ) : (
          <>
            {activeTab === 'home' && renderHome()}
            {activeTab === 'register' && renderRegister()}
            {activeTab === 'issueCertificate' && renderIssueCertificate()}
            {activeTab === 'issueSkillBadge' && renderIssueSkillBadge()}
            {activeTab === 'myCredentials' && renderMyCredentials()}
            {activeTab === 'myCertificates' && renderMyCertificates()}
            {activeTab === 'verify' && renderVerify()}
            {activeTab === 'achievements' && renderAchievements()}
          </>
        )}
      </main>
      
      <footer className="app-footer">
        <p>
          🌍 Deployed on Celo Sepolia | 
          <a href={getExplorerUrl(CONTRACT_ADDRESS)} target="_blank" rel="noopener noreferrer">
            View Contract
          </a>
        </p>
        <p className="footer-note">
          Empowering education through blockchain technology 🎓
        </p>
      </footer>
    </div>
  )
}

export default App
