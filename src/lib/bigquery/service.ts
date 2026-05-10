import { bigQueryClient, getTableId, BQ_CONFIG, isBigQueryConfigured } from './config';

/**
 * BigQuery Service for CareerLens Resume Builder
 * 
 * Provides methods to query job market data, resume keywords, and career insights
 */

export interface JobMarketData {
    job_id: string;
    job_role: string;
    industry: string;
    required_skills: string[];
    trending_skills: string[];
    average_salary: number;
    salary_min: number;
    salary_max: number;
    region: string;
    experience_level: string;
    demand_score: number;
    ats_keywords: string[];
    job_description: string;
    company_size: string;
    remote_friendly: boolean;
}

export interface ResumeKeywords {
    keyword_id: string;
    role: string;
    industry: string;
    high_impact_keywords: string[];
    ats_keywords: string[];
    soft_skills: string[];
    technical_skills: string[];
    action_verbs: string[];
    certifications: string[];
    keyword_weight: number;
    effectiveness_score: number;
}

export interface CareerInsights {
    insight_id: string;
    domain: string;
    future_opportunities: string[];
    certifications: string[];
    demand_score: number;
    growth_rate: number;
    avg_career_progression_years: number;
    top_companies: string[];
    emerging_technologies: string[];
    skill_gap_analysis: string;
    salary_growth_potential: number;
    job_openings_count: number;
    geographic_hotspots: string[];
}

export interface SkillGapAnalysis {
    role: string;
    requiredSkills: string[];
    trendingSkills: string[];
    missingSkills: string[];
    matchPercentage: number;
    recommendations: string[];
}

export interface ResumeOptimizationSuggestions {
    atsScore: number;
    missingKeywords: string[];
    suggestedKeywords: string[];
    actionVerbs: string[];
    improvementAreas: string[];
    strengths: string[];
}

/**
 * Get skills for a specific role
 */
export async function getSkillsForRole(
    role: string,
    industry?: string
): Promise<JobMarketData[]> {
    if (!isBigQueryConfigured()) {
        return getMockSkillsForRole(role);
    }

    try {
        const query = `
      SELECT 
        job_role,
        industry,
        required_skills,
        trending_skills,
        average_salary,
        salary_min,
        salary_max,
        demand_score,
        ats_keywords,
        experience_level,
        region
      FROM \`${getTableId(BQ_CONFIG.tables.jobMarketData)}\`
      WHERE LOWER(job_role) LIKE LOWER(@role)
      ${industry ? 'AND LOWER(industry) = LOWER(@industry)' : ''}
      ORDER BY demand_score DESC
      LIMIT 20
    `;

        const options = {
            query,
            params: { role: `%${role}%`, ...(industry && { industry }) },
        };

        const [rows] = await bigQueryClient.query(options);
        return rows as JobMarketData[];
    } catch (error) {
        console.warn(`⚠️ BigQuery unavailable for role "${role}", using role-aware mock data. Error:`, (error as Error).message);
        return getMockSkillsForRole(role);
    }
}

/**
 * Get trending skills for an industry
 */
export async function getTrendingSkills(
    industry: string,
    limit: number = 10
): Promise<{ skill: string; demand_score: number; frequency: number }[]> {
    if (!isBigQueryConfigured()) {
        return getMockTrendingSkills(industry);
    }

    try {
        const query = `
      WITH skills_unnested AS (
        SELECT 
          skill,
          demand_score
        FROM \`${getTableId(BQ_CONFIG.tables.jobMarketData)}\`,
        UNNEST(trending_skills) AS skill
        WHERE LOWER(industry) = LOWER(@industry)
      )
      SELECT 
        skill,
        AVG(demand_score) as demand_score,
        COUNT(*) as frequency
      FROM skills_unnested
      GROUP BY skill
      ORDER BY demand_score DESC, frequency DESC
      LIMIT @limit
    `;

        const options = {
            query,
            params: { industry, limit },
        };

        const [rows] = await bigQueryClient.query(options);
        return rows as { skill: string; demand_score: number; frequency: number }[];
    } catch (error) {
        console.warn(`⚠️ BigQuery unavailable for trending skills in "${industry}", using mock data. Error:`, (error as Error).message);
        return getMockTrendingSkills(industry);
    }
}

/**
 * Get high-impact keywords for resume optimization
 */
export async function getResumeKeywords(
    role: string,
    industry?: string
): Promise<ResumeKeywords | null> {
    if (!isBigQueryConfigured()) {
        return getMockResumeKeywords(role);
    }

    try {
        const query = `
      SELECT 
        role,
        industry,
        high_impact_keywords,
        ats_keywords,
        soft_skills,
        technical_skills,
        action_verbs,
        certifications,
        keyword_weight,
        effectiveness_score
      FROM \`${getTableId(BQ_CONFIG.tables.resumeKeywords)}\`
      WHERE LOWER(role) = LOWER(@role)
      ${industry ? 'AND LOWER(industry) = LOWER(@industry)' : ''}
      ORDER BY effectiveness_score DESC
      LIMIT 1
    `;

        const options = {
            query,
            params: { role, ...(industry && { industry }) },
        };

        const [rows] = await bigQueryClient.query(options);
        return rows.length > 0 ? (rows[0] as ResumeKeywords) : getMockResumeKeywords(role);
    } catch (error) {
        console.error('Error querying resume keywords:', error);
        return getMockResumeKeywords(role);
    }
}

/**
 * Get career insights for a domain
 */
export async function getCareerInsights(domain: string): Promise<CareerInsights | null> {
    if (!isBigQueryConfigured()) {
        return getMockCareerInsights(domain);
    }

    try {
        const query = `
      SELECT 
        domain,
        future_opportunities,
        certifications,
        demand_score,
        growth_rate,
        avg_career_progression_years,
        top_companies,
        emerging_technologies,
        skill_gap_analysis,
        salary_growth_potential,
        job_openings_count,
        geographic_hotspots
      FROM \`${getTableId(BQ_CONFIG.tables.careerInsights)}\`
      WHERE LOWER(domain) LIKE LOWER(@domain)
      ORDER BY demand_score DESC
      LIMIT 1
    `;

        const options = {
            query,
            params: { domain: `%${domain}%` },
        };

        const [rows] = await bigQueryClient.query(options);
        return rows.length > 0 ? (rows[0] as CareerInsights) : getMockCareerInsights(domain);
    } catch (error) {
        console.error('Error querying career insights:', error);
        return getMockCareerInsights(domain);
    }
}

/**
 * Get salary range for a role
 */
export async function getSalaryRange(
    role: string,
    region?: string
): Promise<{ min: number; max: number; average: number } | null> {
    if (!isBigQueryConfigured()) {
        return { min: 80000, max: 150000, average: 115000 };
    }

    try {
        const query = `
      SELECT 
        AVG(salary_min) as min,
        AVG(salary_max) as max,
        AVG(average_salary) as average
      FROM \`${getTableId(BQ_CONFIG.tables.jobMarketData)}\`
      WHERE LOWER(job_role) LIKE LOWER(@role)
      ${region ? 'AND LOWER(region) = LOWER(@region)' : ''}
    `;

        const options = {
            query,
            params: { role: `%${role}%`, ...(region && { region }) },
        };

        const [rows] = await bigQueryClient.query(options);
        return rows.length > 0 ? rows[0] : null;
    } catch (error) {
        console.error('Error querying salary range:', error);
        return { min: 80000, max: 150000, average: 115000 };
    }
}

/**
 * Analyze skill gap for a resume
 */
export async function analyzeSkillGap(
    targetRole: string,
    currentSkills: string[],
    industry?: string
): Promise<SkillGapAnalysis> {
    const jobData = await getSkillsForRole(targetRole, industry);

    if (jobData.length === 0) {
        return {
            role: targetRole,
            requiredSkills: [],
            trendingSkills: [],
            missingSkills: [],
            matchPercentage: 0,
            recommendations: ['Unable to find job data for this role.'],
        };
    }

    // Aggregate all required and trending skills
    const allRequiredSkills = new Set<string>();
    const allTrendingSkills = new Set<string>();

    jobData.forEach((job) => {
        job.required_skills?.forEach((skill) => allRequiredSkills.add(skill.toLowerCase()));
        job.trending_skills?.forEach((skill) => allTrendingSkills.add(skill.toLowerCase()));
    });

    const requiredSkillsArray = Array.from(allRequiredSkills);
    const trendingSkillsArray = Array.from(allTrendingSkills);

    // Normalize current skills
    const normalizedCurrentSkills = currentSkills.map((s) => s.toLowerCase());

    // Find missing skills
    const missingRequiredSkills = requiredSkillsArray.filter(
        (skill) => !normalizedCurrentSkills.includes(skill)
    );
    const missingTrendingSkills = trendingSkillsArray.filter(
        (skill) => !normalizedCurrentSkills.includes(skill) && !missingRequiredSkills.includes(skill)
    );

    // Calculate match percentage
    const totalRequiredSkills = requiredSkillsArray.length;
    const matchedSkills = totalRequiredSkills - missingRequiredSkills.length;
    const matchPercentage = totalRequiredSkills > 0
        ? Math.round((matchedSkills / totalRequiredSkills) * 100)
        : 0;

    // Generate recommendations
    const recommendations: string[] = [];
    if (missingRequiredSkills.length > 0) {
        recommendations.push(
            `Focus on acquiring these essential skills: ${missingRequiredSkills.slice(0, 5).join(', ')}`
        );
    }
    if (missingTrendingSkills.length > 0) {
        recommendations.push(
            `Consider learning these trending skills to stay competitive: ${missingTrendingSkills.slice(0, 5).join(', ')}`
        );
    }
    if (matchPercentage >= 80) {
        recommendations.push('Great match! You have most of the required skills for this role.');
    } else if (matchPercentage >= 60) {
        recommendations.push('Good foundation. Focus on filling the skill gaps to become more competitive.');
    } else {
        recommendations.push('Significant skill gap detected. Consider focused learning or transitional roles.');
    }

    return {
        role: targetRole,
        requiredSkills: requiredSkillsArray,
        trendingSkills: trendingSkillsArray,
        missingSkills: [...missingRequiredSkills, ...missingTrendingSkills],
        matchPercentage,
        recommendations,
    };
}

/**
 * Get resume optimization suggestions based on keywords
 */
export async function getResumeOptimization(
    role: string,
    resumeText: string,
    industry?: string
): Promise<ResumeOptimizationSuggestions> {
    const keywords = await getResumeKeywords(role, industry);

    if (!keywords) {
        return {
            atsScore: 0,
            missingKeywords: [],
            suggestedKeywords: [],
            actionVerbs: [],
            improvementAreas: ['Unable to fetch keyword data for this role.'],
            strengths: [],
        };
    }

    // Normalize resume text for comparison
    const normalizedResume = resumeText.toLowerCase();

    // Check for missing ATS keywords
    const missingAtsKeywords = keywords.ats_keywords.filter(
        (kw) => !normalizedResume.includes(kw.toLowerCase())
    );

    // Check for missing high-impact keywords
    const missingHighImpactKeywords = keywords.high_impact_keywords.filter(
        (kw) => !normalizedResume.includes(kw.toLowerCase())
    );

    // Check for action verbs
    const usedActionVerbs = keywords.action_verbs.filter(
        (verb) => normalizedResume.includes(verb.toLowerCase())
    );
    const missingActionVerbs = keywords.action_verbs.filter(
        (verb) => !normalizedResume.includes(verb.toLowerCase())
    );

    // Calculate ATS score
    const totalKeywords = keywords.ats_keywords.length;
    const foundKeywords = totalKeywords - missingAtsKeywords.length;
    const atsScore = totalKeywords > 0
        ? Math.round((foundKeywords / totalKeywords) * 100)
        : 0;

    // Generate suggestions
    const improvementAreas: string[] = [];
    const strengths: string[] = [];

    if (missingAtsKeywords.length > 0) {
        improvementAreas.push(
            `Add ${missingAtsKeywords.length} critical ATS keywords: ${missingAtsKeywords.slice(0, 5).join(', ')}`
        );
    }

    if (missingHighImpactKeywords.length > 0) {
        improvementAreas.push(
            `Include high-impact keywords: ${missingHighImpactKeywords.slice(0, 3).join(', ')}`
        );
    }

    if (missingActionVerbs.length > keywords.action_verbs.length * 0.5) {
        improvementAreas.push(
            `Use more action verbs like: ${missingActionVerbs.slice(0, 5).join(', ')}`
        );
    }

    if (usedActionVerbs.length >= keywords.action_verbs.length * 0.5) {
        strengths.push(`Good use of action verbs (${usedActionVerbs.length} found)`);
    }

    if (atsScore >= 70) {
        strengths.push('Strong ATS compatibility');
    }

    return {
        atsScore,
        missingKeywords: [...new Set([...missingAtsKeywords, ...missingHighImpactKeywords])],
        suggestedKeywords: keywords.high_impact_keywords.slice(0, 10),
        actionVerbs: missingActionVerbs.slice(0, 10),
        improvementAreas: improvementAreas.length > 0
            ? improvementAreas
            : ['Your resume is well-optimized!'],
        strengths: strengths.length > 0
            ? strengths
            : ['Continue refining your resume content.'],
    };
}

// ========================================
// Role-Aware Mock Data (for development/fallback)
// ========================================

/**
 * Role-to-domain mapping with comprehensive skill profiles.
 * Maps role keywords to specific career domain data so the AI
 * receives relevant context even when BigQuery is unavailable.
 */
interface RoleProfile {
    keywords: string[];
    required_skills: string[];
    trending_skills: string[];
    ats_keywords: string[];
    salary: { min: number; max: number; avg: number };
    certifications: string[];
    high_impact_keywords: string[];
    technical_skills: string[];
    future_opportunities: string[];
    top_companies: string[];
    emerging_technologies: string[];
}

const ROLE_PROFILES: Record<string, RoleProfile> = {
    'data-science': {
        keywords: ['data scientist', 'data science', 'machine learning engineer', 'ml engineer', 'data analyst', 'analytics'],
        required_skills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Pandas', 'NumPy', 'Scikit-learn', 'TensorFlow', 'Data Visualization', 'R', 'Deep Learning', 'NLP'],
        trending_skills: ['LLMs', 'Generative AI', 'MLOps', 'Feature Engineering', 'PyTorch', 'Hugging Face', 'LangChain', 'Vector Databases'],
        ats_keywords: ['Machine Learning', 'Python', 'SQL', 'TensorFlow', 'Data Analysis', 'Statistical Modeling', 'A/B Testing', 'ETL'],
        salary: { min: 100000, max: 180000, avg: 140000 },
        certifications: ['Google Professional Machine Learning Engineer', 'AWS Machine Learning Specialty', 'TensorFlow Developer Certificate'],
        high_impact_keywords: ['Predictive Modeling', 'Neural Networks', 'Data Pipeline', 'Feature Engineering'],
        technical_skills: ['Python', 'R', 'SQL', 'TensorFlow', 'PyTorch', 'Spark'],
        future_opportunities: ['AI Research Scientist', 'ML Engineering Manager', 'Chief Data Officer'],
        top_companies: ['Google DeepMind', 'OpenAI', 'Meta AI', 'Netflix', 'Spotify'],
        emerging_technologies: ['Foundation Models', 'AutoML', 'Federated Learning', 'Edge AI'],
    },
    'devops': {
        keywords: ['devops', 'sre', 'site reliability', 'platform engineer', 'infrastructure', 'cloud engineer'],
        required_skills: ['Docker', 'Kubernetes', 'CI/CD', 'Terraform', 'AWS', 'Linux', 'Ansible', 'Jenkins', 'Monitoring', 'Shell Scripting', 'Git', 'Networking'],
        trending_skills: ['GitOps', 'ArgoCD', 'Service Mesh', 'Istio', 'Platform Engineering', 'eBPF', 'Pulumi', 'Crossplane'],
        ats_keywords: ['Kubernetes', 'Docker', 'Terraform', 'CI/CD', 'AWS', 'Infrastructure as Code', 'SRE', 'Monitoring'],
        salary: { min: 110000, max: 175000, avg: 142000 },
        certifications: ['AWS DevOps Engineer Professional', 'CKA (Certified Kubernetes Administrator)', 'HashiCorp Terraform Associate'],
        high_impact_keywords: ['Infrastructure as Code', 'Container Orchestration', 'Pipeline Automation', 'Observability'],
        technical_skills: ['Docker', 'Kubernetes', 'Terraform', 'AWS', 'GCP', 'Azure'],
        future_opportunities: ['Platform Engineering Lead', 'Cloud Architect', 'VP of Infrastructure'],
        top_companies: ['Google', 'HashiCorp', 'Datadog', 'GitLab', 'Cloudflare'],
        emerging_technologies: ['eBPF', 'WebAssembly (Wasm)', 'AI-Driven Ops', 'Serverless Containers'],
    },
    'frontend': {
        keywords: ['frontend', 'front-end', 'front end', 'ui developer', 'react developer', 'angular developer', 'vue developer'],
        required_skills: ['JavaScript', 'TypeScript', 'React', 'HTML', 'CSS', 'Git', 'REST APIs', 'Responsive Design', 'Testing', 'State Management'],
        trending_skills: ['Next.js', 'Server Components', 'Tailwind CSS', 'Vite', 'Astro', 'Web Components', 'Playwright'],
        ats_keywords: ['React', 'TypeScript', 'JavaScript', 'CSS', 'Responsive Design', 'Webpack', 'Performance'],
        salary: { min: 85000, max: 155000, avg: 120000 },
        certifications: ['Meta Front-End Developer Certificate', 'AWS Certified Developer'],
        high_impact_keywords: ['Component Architecture', 'Performance Optimization', 'Accessibility', 'Design Systems'],
        technical_skills: ['JavaScript', 'TypeScript', 'React', 'Next.js', 'CSS'],
        future_opportunities: ['Frontend Architect', 'Design Systems Lead', 'Engineering Manager'],
        top_companies: ['Vercel', 'Meta', 'Airbnb', 'Stripe', 'Shopify'],
        emerging_technologies: ['Server Components', 'View Transitions API', 'WebGPU', 'AI-Powered UIs'],
    },
    'backend': {
        keywords: ['backend', 'back-end', 'back end', 'server', 'api developer', 'java developer', 'golang', 'python developer'],
        required_skills: ['Java', 'Python', 'Go', 'SQL', 'REST APIs', 'Microservices', 'Docker', 'Databases', 'Caching', 'Message Queues', 'System Design', 'Spring Boot'],
        trending_skills: ['gRPC', 'GraphQL', 'Rust', 'Event-Driven Architecture', 'Serverless', 'tRPC'],
        ats_keywords: ['Microservices', 'REST', 'SQL', 'NoSQL', 'System Design', 'Scalability', 'API Design'],
        salary: { min: 95000, max: 165000, avg: 130000 },
        certifications: ['AWS Solutions Architect', 'Google Cloud Professional Developer', 'Oracle Java SE Developer'],
        high_impact_keywords: ['Distributed Systems', 'API Architecture', 'Database Optimization', 'High Availability'],
        technical_skills: ['Java', 'Python', 'Go', 'SQL', 'Redis', 'Kafka'],
        future_opportunities: ['Staff Engineer', 'System Architect', 'VP of Engineering'],
        top_companies: ['Google', 'Amazon', 'LinkedIn', 'Uber', 'Netflix'],
        emerging_technologies: ['AI Inference Serving', 'Edge Functions', 'WASM Backends', 'Serverless Containers'],
    },
    'fullstack': {
        keywords: ['full stack', 'fullstack', 'full-stack', 'web developer', 'software engineer', 'software developer', 'mern', 'mean'],
        required_skills: ['JavaScript', 'React', 'Node.js', 'TypeScript', 'AWS', 'SQL', 'Git', 'REST APIs', 'HTML/CSS', 'MongoDB', 'PostgreSQL', 'Docker'],
        trending_skills: ['Next.js', 'AI Integration', 'GraphQL', 'Tailwind CSS', 'Prisma', 'tRPC', 'Turborepo'],
        ats_keywords: ['React', 'Node.js', 'TypeScript', 'AWS', 'CI/CD', 'Full Stack', 'Agile'],
        salary: { min: 90000, max: 160000, avg: 125000 },
        certifications: ['AWS Certified Developer', 'Azure Fundamentals', 'Google Cloud Developer'],
        high_impact_keywords: ['Full Stack Development', 'Cloud Architecture', 'System Design'],
        technical_skills: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'SQL'],
        future_opportunities: ['Cloud Architect', 'Engineering Manager', 'Technical Lead'],
        top_companies: ['Google', 'Meta', 'Amazon', 'Microsoft', 'Stripe'],
        emerging_technologies: ['AI Integration', 'Edge Computing', 'WebAssembly'],
    },
    'cybersecurity': {
        keywords: ['cybersecurity', 'security engineer', 'security analyst', 'penetration tester', 'infosec', 'information security', 'soc analyst'],
        required_skills: ['Network Security', 'SIEM', 'Penetration Testing', 'Vulnerability Assessment', 'Firewalls', 'IDS/IPS', 'Python', 'Linux', 'Incident Response', 'Threat Modeling'],
        trending_skills: ['Zero Trust Architecture', 'Cloud Security (CSPM)', 'AI Threat Detection', 'DevSecOps', 'Supply Chain Security', 'SOAR'],
        ats_keywords: ['SIEM', 'Penetration Testing', 'Risk Assessment', 'Compliance', 'SOC', 'NIST', 'ISO 27001'],
        salary: { min: 95000, max: 170000, avg: 135000 },
        certifications: ['CISSP', 'CEH', 'CompTIA Security+', 'OSCP', 'AWS Security Specialty'],
        high_impact_keywords: ['Threat Intelligence', 'Vulnerability Management', 'Zero Trust', 'Incident Response'],
        technical_skills: ['Python', 'Wireshark', 'Burp Suite', 'Nmap', 'Splunk'],
        future_opportunities: ['CISO', 'Security Architect', 'Threat Intelligence Lead'],
        top_companies: ['CrowdStrike', 'Palo Alto Networks', 'Google', 'Microsoft', 'Mandiant'],
        emerging_technologies: ['AI-Powered SOC', 'Quantum-Resistant Crypto', 'SASE', 'XDR'],
    },
    'product-management': {
        keywords: ['product manager', 'product management', 'product owner', 'program manager', 'technical pm'],
        required_skills: ['Product Strategy', 'User Research', 'Agile/Scrum', 'Data Analysis', 'Roadmap Planning', 'Stakeholder Management', 'A/B Testing', 'SQL', 'Wireframing', 'Market Analysis'],
        trending_skills: ['AI Product Management', 'Product-Led Growth (PLG)', 'Growth Hacking', 'Product Analytics', 'Jobs to Be Done'],
        ats_keywords: ['Product Strategy', 'Agile', 'Scrum', 'User Research', 'KPIs', 'Roadmap', 'Stakeholder'],
        salary: { min: 110000, max: 190000, avg: 150000 },
        certifications: ['CSPO (Certified Scrum Product Owner)', 'PMI-ACP', 'Google Project Management Certificate'],
        high_impact_keywords: ['Product Vision', 'Go-to-Market Strategy', 'User-Centric Design', 'Revenue Growth'],
        technical_skills: ['SQL', 'Jira', 'Amplitude', 'Figma', 'Mixpanel'],
        future_opportunities: ['VP of Product', 'Chief Product Officer', 'Founder/CEO'],
        top_companies: ['Google', 'Apple', 'Meta', 'Airbnb', 'Spotify'],
        emerging_technologies: ['AI-First Products', 'Product Analytics AI', 'No-Code Platforms', 'Voice Interfaces'],
    },
    'ui-ux-design': {
        keywords: ['ui designer', 'ux designer', 'ui/ux', 'product designer', 'interaction designer', 'visual designer', 'design'],
        required_skills: ['Figma', 'User Research', 'Wireframing', 'Prototyping', 'Design Systems', 'Interaction Design', 'Visual Design', 'Usability Testing', 'Information Architecture', 'Typography'],
        trending_skills: ['AI-Powered Design', 'Design Tokens', 'Framer', 'Motion Design', '3D Design (Spline)', 'Accessibility (WCAG 2.2)'],
        ats_keywords: ['Figma', 'User Research', 'Prototyping', 'Design Systems', 'Wireframes', 'A/B Testing'],
        salary: { min: 80000, max: 160000, avg: 120000 },
        certifications: ['Google UX Design Certificate', 'Nielsen Norman UX Certification', 'Interaction Design Foundation'],
        high_impact_keywords: ['User-Centered Design', 'Design Thinking', 'Responsive Design', 'Conversion Optimization'],
        technical_skills: ['Figma', 'Adobe XD', 'Sketch', 'Framer', 'HTML/CSS'],
        future_opportunities: ['Head of Design', 'VP of Design', 'Design Director'],
        top_companies: ['Apple', 'Google', 'Airbnb', 'Figma', 'Spotify'],
        emerging_technologies: ['AI Design Tools', 'Spatial Computing (VisionOS)', 'Variable Fonts', 'Micro-Interactions'],
    },
    'mobile': {
        keywords: ['mobile developer', 'ios developer', 'android developer', 'react native', 'flutter developer', 'mobile engineer', 'app developer'],
        required_skills: ['Swift', 'Kotlin', 'React Native', 'Flutter', 'UI/UX Mobile', 'REST APIs', 'Git', 'Testing', 'CI/CD', 'App Store Deployment'],
        trending_skills: ['Compose Multiplatform', 'SwiftUI', 'Expo', 'KMM (Kotlin Multiplatform)', 'AR/VR Mobile', 'Edge AI on Mobile'],
        ats_keywords: ['iOS', 'Android', 'Swift', 'Kotlin', 'React Native', 'Flutter', 'Mobile Architecture'],
        salary: { min: 95000, max: 170000, avg: 132000 },
        certifications: ['Google Associate Android Developer', 'Apple Developer Certification', 'Meta React Native Certificate'],
        high_impact_keywords: ['Cross-Platform Development', 'Mobile Architecture', 'App Performance', 'Offline-First'],
        technical_skills: ['Swift', 'Kotlin', 'Dart', 'React Native', 'TypeScript'],
        future_opportunities: ['Mobile Architect', 'Engineering Manager', 'Head of Mobile'],
        top_companies: ['Apple', 'Google', 'Meta', 'Uber', 'Airbnb'],
        emerging_technologies: ['On-Device AI', 'Spatial Computing', 'Progressive Web Apps', 'App Clips/Instant Apps'],
    },
    'cloud-architect': {
        keywords: ['cloud architect', 'cloud engineer', 'solutions architect', 'aws architect', 'gcp engineer', 'azure architect'],
        required_skills: ['AWS', 'Azure', 'GCP', 'Terraform', 'Networking', 'Security', 'Microservices', 'Containers', 'Serverless', 'Cost Optimization', 'IAM', 'Load Balancing'],
        trending_skills: ['Multi-Cloud Strategy', 'FinOps', 'Green Computing', 'AI Infrastructure', 'Service Mesh', 'WASM at Edge'],
        ats_keywords: ['AWS', 'Azure', 'GCP', 'Terraform', 'Architecture', 'Scalability', 'High Availability', 'Disaster Recovery'],
        salary: { min: 130000, max: 200000, avg: 165000 },
        certifications: ['AWS Solutions Architect Professional', 'Google Cloud Professional Architect', 'Azure Solutions Architect Expert'],
        high_impact_keywords: ['Cloud-Native Architecture', 'Infrastructure Automation', 'Cost Optimization', 'Well-Architected'],
        technical_skills: ['AWS', 'GCP', 'Azure', 'Terraform', 'Kubernetes', 'Networking'],
        future_opportunities: ['VP of Cloud Infrastructure', 'CTO', 'Distinguished Engineer'],
        top_companies: ['AWS', 'Google Cloud', 'Microsoft Azure', 'Snowflake', 'Databricks'],
        emerging_technologies: ['AI-Optimized Infrastructure', 'Confidential Computing', 'Sovereign Cloud', 'Green Cloud'],
    },
};

/**
 * Match a role string to the best-fit profile using keyword matching.
 */
function matchRoleProfile(role: string): RoleProfile {
    const lowerRole = role.toLowerCase().trim();

    for (const profile of Object.values(ROLE_PROFILES)) {
        if (profile.keywords.some(kw => lowerRole.includes(kw) || kw.includes(lowerRole))) {
            return profile;
        }
    }

    // Default fallback: fullstack (most generic software engineering profile)
    return ROLE_PROFILES['fullstack'];
}

function getMockSkillsForRole(role: string): JobMarketData[] {
    const profile = matchRoleProfile(role);
    return [
        {
            job_id: 'mock_001',
            job_role: role,
            industry: 'Technology',
            required_skills: profile.required_skills,
            trending_skills: profile.trending_skills,
            average_salary: profile.salary.avg,
            salary_min: profile.salary.min,
            salary_max: profile.salary.max,
            region: 'United States',
            experience_level: 'Mid-Level',
            demand_score: 8.5,
            ats_keywords: profile.ats_keywords,
            job_description: `Role-specific job profile for ${role}`,
            company_size: 'Enterprise',
            remote_friendly: true,
        },
    ];
}

function getMockTrendingSkills(_industry: string): { skill: string; demand_score: number; frequency: number }[] {
    // Return cross-industry trending skills
    return [
        { skill: 'AI/ML', demand_score: 9.5, frequency: 150 },
        { skill: 'Cloud Computing', demand_score: 9.2, frequency: 200 },
        { skill: 'Generative AI', demand_score: 9.0, frequency: 170 },
        { skill: 'Cybersecurity', demand_score: 8.8, frequency: 160 },
        { skill: 'Data Engineering', demand_score: 8.5, frequency: 140 },
    ];
}

function getMockResumeKeywords(role: string): ResumeKeywords {
    const profile = matchRoleProfile(role);
    return {
        keyword_id: 'mock_kw_001',
        role,
        industry: 'Technology',
        high_impact_keywords: profile.high_impact_keywords,
        ats_keywords: profile.ats_keywords,
        soft_skills: ['Problem Solving', 'Team Collaboration', 'Communication', 'Critical Thinking'],
        technical_skills: profile.technical_skills,
        action_verbs: ['Developed', 'Architected', 'Implemented', 'Optimized', 'Led', 'Designed', 'Analyzed', 'Delivered'],
        certifications: profile.certifications,
        keyword_weight: 0.95,
        effectiveness_score: 9.1,
    };
}

function getMockCareerInsights(domain: string): CareerInsights {
    const profile = matchRoleProfile(domain);
    return {
        insight_id: 'mock_ins_001',
        domain,
        future_opportunities: profile.future_opportunities,
        certifications: profile.certifications,
        demand_score: 8.7,
        growth_rate: 15.5,
        avg_career_progression_years: 3,
        top_companies: profile.top_companies,
        emerging_technologies: profile.emerging_technologies,
        skill_gap_analysis: `High demand for specialized skills in ${domain}`,
        salary_growth_potential: 25.5,
        job_openings_count: 45000,
        geographic_hotspots: ['San Francisco', 'Seattle', 'New York', 'Austin', 'Bangalore'],
    };
}
