// Mock data for resume analysis results

export interface SkillMatch {
  skill: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  isMatched: boolean;
  importance: 'High' | 'Medium' | 'Low';
}

export interface AnalysisResult {
  jobRole: string;
  company: string;
  matchPercentage: number;
  timeSaved: string;
  reportDate: string;
  matchedSkills: SkillMatch[];
  missingSkills: SkillMatch[];
  recommendations: string[];
  overallScore: {
    technical: number;
    experience: number;
    education: number;
    certifications: number;
  };
  atsScore?: {
    overall_ats_score: number;
    keyword_density_score: number;
    skills_match_score: number;
    structure_score: number;
    experience_score: number;
    education_score: number;
    ats_grade: string;
    ats_recommendations: string[];
  };
}

export const mockAnalysisResult: AnalysisResult = {
  jobRole: 'Senior Frontend Developer',
  company: 'TechCorp Inc.',
  matchPercentage: 87,
  timeSaved: '2.5 hours',
  reportDate: new Date().toLocaleDateString(),
  matchedSkills: [
    { skill: 'React.js', proficiency: 'Expert', isMatched: true, importance: 'High' },
    { skill: 'TypeScript', proficiency: 'Advanced', isMatched: true, importance: 'High' },
    { skill: 'JavaScript ES6+', proficiency: 'Expert', isMatched: true, importance: 'High' },
    { skill: 'CSS3 & Tailwind', proficiency: 'Advanced', isMatched: true, importance: 'Medium' },
    { skill: 'Git Version Control', proficiency: 'Advanced', isMatched: true, importance: 'Medium' },
    { skill: 'Responsive Design', proficiency: 'Expert', isMatched: true, importance: 'High' },
    { skill: 'RESTful APIs', proficiency: 'Advanced', isMatched: true, importance: 'Medium' },
    { skill: 'Agile/Scrum', proficiency: 'Intermediate', isMatched: true, importance: 'Medium' },
  ],
  missingSkills: [
    { skill: 'Next.js', proficiency: 'Beginner', isMatched: false, importance: 'High' },
    { skill: 'GraphQL', proficiency: 'Beginner', isMatched: false, importance: 'Medium' },
    { skill: 'Docker', proficiency: 'Beginner', isMatched: false, importance: 'Medium' },
    { skill: 'Testing (Jest/Cypress)', proficiency: 'Intermediate', isMatched: false, importance: 'High' },
    { skill: 'AWS Services', proficiency: 'Beginner', isMatched: false, importance: 'Low' },
  ],
  recommendations: [
    'Learn Next.js framework - highly valued for this role and commonly used at TechCorp',
    'Strengthen testing skills with Jest and Cypress - critical for senior positions',
    'Gain basic Docker knowledge for containerization and deployment',
    'Consider GraphQL tutorials to complement your REST API experience',
    'Highlight your React expertise more prominently in your resume summary',
    'Add specific project examples demonstrating responsive design skills',
    'Quantify your achievements with metrics and impact numbers',
  ],
  overallScore: {
    technical: 85,
    experience: 92,
    education: 78,
    certifications: 65,
  },
  atsScore: {
    overall_ats_score: 78.5,
    structure_score: 85,
    formatting_score: 75,
    keyword_density_score: 80,
    contact_score: 70,
    ats_grade: "B+",
    ats_recommendations: [
      "Add missing essential sections like Summary or Objective",
      "Use bullet points to organize your experience and achievements",
      "Include more keywords from the job description throughout your resume",
      "Add complete contact information including email and phone"
    ]
  },
};

export const featuresData = [
  {
    title: 'AI-Powered Analysis',
    description: 'Advanced machine learning for precise resume optimization',
    icon: '🎯',
    benefits: ['95% accuracy rate', 'Industry-specific insights', 'ATS compatibility check']
  },
  {
    title: 'Instant Results',
    description: 'Complete analysis in under 60 seconds',
    icon: '⚡',
    benefits: ['Real-time processing', 'Detailed breakdown', 'Export to PDF']
  },
  {
    title: 'Skill Gap Analysis',
    description: 'Identify missing skills and get learning recommendations',
    icon: '📊',
    benefits: ['Gap identification', 'Learning paths', 'Progress tracking']
  },
  {
    title: 'Career Acceleration',
    description: 'Boost interview rates by 300% with optimized resumes',
    icon: '🚀',
    benefits: ['Proven success rate', 'Interview tips', 'Salary insights']
  },
  {
    title: 'Privacy First',
    description: 'Enterprise-grade security for your data',
    icon: '🛡️',
    benefits: ['Data encryption', 'No storage policy', 'GDPR compliant']
  },
  {
    title: 'Expert Guidance',
    description: 'Career coaching from industry professionals',
    icon: '🎓',
    benefits: ['1-on-1 sessions', 'Industry expertise', 'Personalized advice']
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your career development over time',
    icon: '📈',
    benefits: ['Historical data', 'Improvement metrics', 'Goal setting']
  },
  {
    title: 'Unlimited Analysis',
    description: 'Analyze multiple positions with Pro plan',
    icon: '🔄',
    benefits: ['Unlimited scans', 'Multiple formats', 'Bulk processing']
  }
];

export const jobDescriptionSample = `
We are seeking a Senior Frontend Developer to join our innovative team at TechCorp Inc. 

Key Responsibilities:
• Develop and maintain responsive web applications using React.js and Next.js
• Collaborate with UX/UI designers to implement pixel-perfect designs
• Write clean, testable code using TypeScript and modern JavaScript
• Implement comprehensive testing strategies using Jest and Cypress
• Work with GraphQL APIs and RESTful services
• Deploy applications using Docker and AWS services
• Participate in Agile development processes and code reviews

Required Skills:
• 5+ years of experience with React.js and modern frontend technologies
• Proficiency in TypeScript, JavaScript ES6+, HTML5, and CSS3
• Experience with Next.js framework
• Strong testing skills with Jest, Cypress, or similar frameworks
• Knowledge of GraphQL and RESTful API integration
• Familiarity with Docker containerization
• Experience with cloud platforms (AWS preferred)
• Understanding of Agile/Scrum methodologies

Preferred Qualifications:
• Bachelor's degree in Computer Science or related field
• Experience with Tailwind CSS or similar utility frameworks
• Knowledge of performance optimization techniques
• Familiarity with CI/CD pipelines
• Previous experience in a startup environment
`;

export const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'Software Engineer at Google',
    content: 'Elevatr helped me identify key skills I was missing for my dream job. Got hired within 3 weeks!',
    avatar: '👩‍💻',
    rating: 5,
  },
  {
    name: 'Michael Rodriguez',
    role: 'Product Manager at Microsoft',
    content: 'The AI analysis is incredibly accurate. It saved me hours of resume optimization work.',
    avatar: '👨‍💼',
    rating: 5,
  },
  {
    name: 'Emily Johnson',
    role: 'UX Designer at Airbnb',
    content: 'The personalized recommendations were spot-on. My interview rate increased by 300%!',
    avatar: '👩‍🎨',
    rating: 5,
  },
];