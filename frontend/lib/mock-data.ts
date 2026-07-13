import type {
  LibraryDocument,
  StatCard,
  UploadRecord,
  Conversation,
  Recommendation,
  UserProfile,
} from '@/types'

export const DEPARTMENTS = [
  'Radar & Communications',
  'Missile Systems',
  'Aeronautics',
  'Naval Systems',
  'Materials Science',
  'Cyber & AI',
  'Electronic Warfare',
  'Documentation Sciences',
]

export const CATEGORIES = [
  'Signal Processing',
  'Propulsion',
  'Navigation',
  'Cryptography',
  'Metallurgy',
  'Machine Learning',
  'Sensors',
  'Systems Engineering',
]

export const DOCUMENT_TYPES = [
  'Book',
  'Research Paper',
  'Technical Report',
  'Scanned PDF',
] as const

export const stats: StatCard[] = [
  { id: '1', label: 'Total Documents', value: '48,392', change: '+1,204', trend: 'up', icon: 'FileText' },
  { id: '2', label: 'Books', value: '12,847', change: '+86', trend: 'up', icon: 'BookOpen' },
  { id: '3', label: 'Research Papers', value: '26,410', change: '+742', trend: 'up', icon: 'FileStack' },
  { id: '4', label: 'Scanned Documents', value: '9,135', change: '+376', trend: 'up', icon: 'ScanLine' },
  { id: '5', label: 'AI Questions Today', value: '1,928', change: '+12.4%', trend: 'up', icon: 'Bot' },
  { id: '6', label: 'Active Researchers', value: '742', change: '-8', trend: 'down', icon: 'Users' },
]

export const documents: LibraryDocument[] = [
  {
    id: 'doc-1',
    title: 'Advanced Radar Signal Processing for Target Detection',
    author: 'Dr. A. Ramachandran',
    year: 2024,
    department: 'Radar & Communications',
    keywords: ['Radar', 'Signal Processing', 'Target Detection', 'DSP'],
    type: 'Research Paper',
    fileSize: '4.2 MB',
    pages: 42,
    bookmarked: true,
    abstract:
      'A comprehensive study of adaptive filtering techniques applied to modern phased-array radar systems for improved low-observable target detection.',
  },
  {
    id: 'doc-2',
    title: 'Solid Propellant Chemistry: Principles and Applications',
    author: 'Dr. S. Venkatesh',
    year: 2022,
    department: 'Missile Systems',
    keywords: ['Propulsion', 'Chemistry', 'Solid Propellant'],
    type: 'Book',
    fileSize: '18.6 MB',
    pages: 512,
    bookmarked: false,
    abstract:
      'A foundational reference on the formulation, combustion behaviour, and performance characterisation of composite solid propellants.',
  },
  {
    id: 'doc-3',
    title: 'Autonomous UAV Navigation in GPS-Denied Environments',
    author: 'Dr. Priya Nair',
    year: 2024,
    department: 'Aeronautics',
    keywords: ['UAV', 'Navigation', 'SLAM', 'Autonomy'],
    type: 'Research Paper',
    fileSize: '6.8 MB',
    pages: 58,
    bookmarked: true,
    abstract:
      'Presents a sensor-fusion framework combining visual-inertial odometry and terrain matching for resilient UAV navigation without satellite positioning.',
  },
  {
    id: 'doc-4',
    title: 'Corrosion-Resistant Alloys for Naval Platforms',
    author: 'Dr. M. Krishnan',
    year: 2021,
    department: 'Naval Systems',
    keywords: ['Metallurgy', 'Corrosion', 'Alloys', 'Marine'],
    type: 'Technical Report',
    fileSize: '9.1 MB',
    pages: 124,
    bookmarked: false,
    abstract:
      'Evaluation of high-performance stainless and titanium alloys under prolonged marine exposure for next-generation surface combatants.',
  },
  {
    id: 'doc-5',
    title: 'Post-Quantum Cryptographic Protocols for Secure Comms',
    author: 'Dr. R. Iyer',
    year: 2023,
    department: 'Cyber & AI',
    keywords: ['Cryptography', 'Post-Quantum', 'Security'],
    type: 'Research Paper',
    fileSize: '3.4 MB',
    pages: 36,
    bookmarked: false,
    abstract:
      'A survey and benchmark of lattice-based key-exchange schemes suitable for constrained tactical communication hardware.',
  },
  {
    id: 'doc-6',
    title: 'Electronic Warfare Systems: Field Handbook (Scanned)',
    author: 'DESIDOC Archives',
    year: 2009,
    department: 'Electronic Warfare',
    keywords: ['EW', 'Jamming', 'Countermeasures'],
    type: 'Scanned PDF',
    fileSize: '54.2 MB',
    pages: 388,
    bookmarked: true,
    abstract:
      'Digitised archival handbook covering electronic countermeasure doctrine, emitter identification, and threat libraries.',
  },
  {
    id: 'doc-7',
    title: 'Deep Learning for Synthetic Aperture Radar Imagery',
    author: 'Dr. Neha Gupta',
    year: 2024,
    department: 'Cyber & AI',
    keywords: ['Machine Learning', 'SAR', 'Computer Vision'],
    type: 'Research Paper',
    fileSize: '7.7 MB',
    pages: 49,
    bookmarked: false,
    abstract:
      'Convolutional and transformer architectures for automatic target recognition in high-resolution SAR datasets.',
  },
  {
    id: 'doc-8',
    title: 'Thermal Management of Airborne Electronics',
    author: 'Dr. K. Subramanian',
    year: 2020,
    department: 'Aeronautics',
    keywords: ['Thermal', 'Electronics', 'Cooling'],
    type: 'Technical Report',
    fileSize: '11.3 MB',
    pages: 96,
    bookmarked: false,
    abstract:
      'Design methodologies for conduction and forced-convection cooling of avionics operating in high-altitude environments.',
  },
  {
    id: 'doc-9',
    title: 'Fundamentals of Guided Missile Aerodynamics',
    author: 'Dr. V. Deshpande',
    year: 2018,
    department: 'Missile Systems',
    keywords: ['Aerodynamics', 'Missiles', 'Flight Dynamics'],
    type: 'Book',
    fileSize: '22.9 MB',
    pages: 640,
    bookmarked: false,
    abstract:
      'A rigorous treatment of aerodynamic forces, stability, and control for tactical and strategic guided missile systems.',
  },
  {
    id: 'doc-10',
    title: 'Metamaterial Antennas for Wideband Applications',
    author: 'Dr. A. Banerjee',
    year: 2023,
    department: 'Radar & Communications',
    keywords: ['Antennas', 'Metamaterials', 'RF'],
    type: 'Research Paper',
    fileSize: '5.1 MB',
    pages: 44,
    bookmarked: true,
    abstract:
      'Novel metamaterial-loaded antenna structures achieving broadband performance with reduced form factor for airborne platforms.',
  },
  {
    id: 'doc-11',
    title: 'Battlefield Sensor Networks: Architecture & Protocols',
    author: 'Dr. S. Rao',
    year: 2022,
    department: 'Electronic Warfare',
    keywords: ['Sensors', 'Networks', 'IoT', 'Tactical'],
    type: 'Technical Report',
    fileSize: '8.4 MB',
    pages: 108,
    bookmarked: false,
    abstract:
      'A layered architecture for resilient, low-latency battlefield sensor networks with energy-aware routing protocols.',
  },
  {
    id: 'doc-12',
    title: 'Documentation Standards for Defence Research (Scanned)',
    author: 'DESIDOC Archives',
    year: 2005,
    department: 'Documentation Sciences',
    keywords: ['Documentation', 'Standards', 'Archival'],
    type: 'Scanned PDF',
    fileSize: '31.7 MB',
    pages: 210,
    bookmarked: false,
    abstract:
      'Legacy manual defining metadata, classification, and archival standards for scientific and technical reports.',
  },
]

export const recentUploads = documents.slice(0, 4).map((d, i) => ({
  id: d.id,
  title: d.title,
  author: d.author,
  type: d.type,
  time: ['2 min ago', '18 min ago', '1 hr ago', '3 hrs ago'][i],
}))

export const recentlyViewed = documents.slice(4, 8).map((d, i) => ({
  id: d.id,
  title: d.title,
  author: d.author,
  type: d.type,
  time: ['Just now', '25 min ago', '2 hrs ago', 'Yesterday'][i],
}))

export const recentConversations = [
  { id: 'c1', title: 'Radar signal processing methods', preview: 'Summarise adaptive filtering approaches...', time: '10 min ago' },
  { id: 'c2', title: 'UAV navigation comparison', preview: 'Compare VIO vs terrain matching...', time: '1 hr ago' },
  { id: 'c3', title: 'IEEE citation for SAR paper', preview: 'Generate a citation for the deep learning...', time: 'Yesterday' },
]

export const trendingTopics = [
  { id: 't1', topic: 'Synthetic Aperture Radar', count: 342, change: '+24%' },
  { id: 't2', topic: 'Post-Quantum Cryptography', count: 289, change: '+18%' },
  { id: 't3', topic: 'Autonomous Navigation', count: 256, change: '+15%' },
  { id: 't4', topic: 'Hypersonic Propulsion', count: 198, change: '+11%' },
  { id: 't5', topic: 'Metamaterials', count: 174, change: '+9%' },
]

export const uploadHistory: UploadRecord[] = [
  { id: 'u1', title: 'Advanced Radar Signal Processing', type: 'Research Paper', department: 'Radar & Communications', date: '2026-07-13', status: 'Completed', size: '4.2 MB' },
  { id: 'u2', title: 'UAV Navigation Framework v2', type: 'Research Paper', department: 'Aeronautics', date: '2026-07-12', status: 'Completed', size: '6.8 MB' },
  { id: 'u3', title: 'Naval Alloy Test Matrix', type: 'Technical Report', department: 'Naval Systems', date: '2026-07-12', status: 'Processing', size: '9.1 MB' },
  { id: 'u4', title: 'EW Field Handbook Scan', type: 'Scanned PDF', department: 'Electronic Warfare', date: '2026-07-11', status: 'Completed', size: '54.2 MB' },
  { id: 'u5', title: 'Propellant Chemistry Draft', type: 'Book', department: 'Missile Systems', date: '2026-07-10', status: 'Failed', size: '18.6 MB' },
]

export const suggestedPrompts = [
  'Summarize this document',
  'Explain Radar Signal Processing',
  'Find papers on UAV Navigation',
  'Compare two research papers',
  'Generate IEEE citation',
]

export const conversations: Conversation[] = [
  {
    id: 'conv-1',
    title: 'Radar signal processing methods',
    preview: 'Summarise adaptive filtering approaches for phased arrays',
    date: 'Today',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Summarise the adaptive filtering approaches used in modern phased-array radar for target detection.',
        timestamp: '10:24',
      },
      {
        id: 'm2',
        role: 'assistant',
        content:
          'Modern phased-array radar systems primarily rely on three adaptive filtering families. Space-Time Adaptive Processing (STAP) jointly filters across spatial (antenna) and temporal (pulse) domains to suppress clutter and jamming. Least Mean Squares (LMS) and Recursive Least Squares (RLS) adaptive beamformers dynamically steer nulls toward interference. Finally, Kalman-based trackers refine detections across scans. STAP offers the best clutter rejection but is computationally intensive, while RLS converges faster than LMS at higher cost.',
        citations: [
          { id: 'ct1', documentName: 'Advanced Radar Signal Processing for Target Detection', page: 12, confidence: 0.96, reference: 'Ramachandran, A. (2024)' },
          { id: 'ct2', documentName: 'Metamaterial Antennas for Wideband Applications', page: 8, confidence: 0.82, reference: 'Banerjee, A. (2023)' },
        ],
        timestamp: '10:24',
      },
    ],
  },
  {
    id: 'conv-2',
    title: 'UAV navigation comparison',
    preview: 'Compare VIO vs terrain matching for GPS-denied flight',
    date: 'Today',
    messages: [],
  },
  {
    id: 'conv-3',
    title: 'IEEE citation for SAR paper',
    preview: 'Generate a citation for the deep learning SAR paper',
    date: 'Yesterday',
    messages: [],
  },
  {
    id: 'conv-4',
    title: 'Post-quantum protocol overview',
    preview: 'Explain lattice-based key exchange schemes',
    date: 'Yesterday',
    messages: [],
  },
  {
    id: 'conv-5',
    title: 'Corrosion resistance in alloys',
    preview: 'Which alloys perform best under marine exposure?',
    date: 'Jul 10',
    messages: [],
  },
]

export const recommendations: Recommendation[] = [
  { id: 'r1', title: 'Deep Learning for Synthetic Aperture Radar Imagery', author: 'Dr. Neha Gupta', summary: 'Transformer architectures for automatic target recognition in SAR datasets.', score: 98, reason: 'Based on your work in Radar & Communications', type: 'Research Paper', department: 'Cyber & AI' },
  { id: 'r2', title: 'Metamaterial Antennas for Wideband Applications', author: 'Dr. A. Banerjee', summary: 'Novel antenna structures with broadband performance and reduced form factor.', score: 94, reason: 'Because you read "Advanced Radar Signal Processing"', type: 'Research Paper', department: 'Radar & Communications' },
  { id: 'r3', title: 'Autonomous UAV Navigation in GPS-Denied Environments', author: 'Dr. Priya Nair', summary: 'Sensor-fusion framework for resilient navigation without satellite positioning.', score: 91, reason: 'Trending in Aeronautics this week', type: 'Research Paper', department: 'Aeronautics' },
  { id: 'r4', title: 'Post-Quantum Cryptographic Protocols for Secure Comms', author: 'Dr. R. Iyer', summary: 'Benchmark of lattice-based key-exchange schemes for tactical hardware.', score: 88, reason: 'Popular among researchers like you', type: 'Research Paper', department: 'Cyber & AI' },
  { id: 'r5', title: 'Battlefield Sensor Networks: Architecture & Protocols', author: 'Dr. S. Rao', summary: 'Layered architecture for resilient, low-latency sensor networks.', score: 85, reason: 'Complements your recent reading', type: 'Technical Report', department: 'Electronic Warfare' },
  { id: 'r6', title: 'Thermal Management of Airborne Electronics', author: 'Dr. K. Subramanian', summary: 'Cooling design methods for avionics in high-altitude environments.', score: 82, reason: 'Related to Aeronautics topics you follow', type: 'Technical Report', department: 'Aeronautics' },
]

export const userProfile: UserProfile = {
  name: 'Dr. Arjun Mehta',
  role: 'Senior Research Scientist',
  department: 'Radar & Communications',
  email: 'arjun.mehta@desidoc.drdo.in',
  employeeId: 'DRDO-2019-4471',
  location: 'DESIDOC, Metcalfe House, Delhi',
  joined: 'March 2019',
  avatarInitials: 'AM',
}

export const savedDocuments = documents.filter((d) => d.bookmarked)
