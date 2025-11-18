"use strict";
/**
 * Coursera & Learning Platforms Integration Service
 * Fetches latest courses, certifications, and learning opportunities
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchLearningOpportunities = fetchLearningOpportunities;
exports.searchCoursesBySkill = searchCoursesBySkill;
/**
 * Fetch trending courses from multiple platforms
 */
async function fetchLearningOpportunities() {
    const opportunities = [];
    try {
        // Fetch from Google Cloud Skills Boost
        const googleSkills = await fetchGoogleSkillsBoost();
        opportunities.push(...googleSkills);
        // Fetch from Coursera (public courses)
        const courseraPublic = await fetchCourseraPublicCourses();
        opportunities.push(...courseraPublic);
        // Fetch free certifications
        const freeCerts = await fetchFreeCertifications();
        opportunities.push(...freeCerts);
        return opportunities;
    }
    catch (error) {
        console.error('Error fetching learning opportunities:', error);
        return [];
    }
}
/**
 * Fetch courses from Google Cloud Skills Boost
 */
async function fetchGoogleSkillsBoost() {
    const courses = [
        {
            id: 'google-cloud-digital-leader',
            title: 'Google Cloud Digital Leader Certification',
            provider: 'Google Cloud',
            platform: 'google-skills',
            description: 'Learn cloud fundamentals and Google Cloud products',
            duration: '4-6 weeks',
            level: 'beginner',
            skills: ['Cloud Computing', 'Google Cloud Platform', 'Digital Transformation'],
            isFree: true,
            url: 'https://cloud.google.com/learn/certification/cloud-digital-leader',
            certificate: true,
            rating: 4.7
        },
        {
            id: 'google-ai-essentials',
            title: 'Google AI Essentials',
            provider: 'Google',
            platform: 'google-skills',
            description: 'Introduction to Generative AI and practical applications',
            duration: '10 hours',
            level: 'beginner',
            skills: ['Artificial Intelligence', 'Generative AI', 'Prompt Engineering'],
            isFree: true,
            url: 'https://www.cloudskillsboost.google/paths',
            certificate: true,
            rating: 4.8
        },
        {
            id: 'google-cloud-architect',
            title: 'Professional Cloud Architect',
            provider: 'Google Cloud',
            platform: 'google-skills',
            description: 'Design, develop, and manage cloud architecture',
            duration: '8-12 weeks',
            level: 'advanced',
            skills: ['Cloud Architecture', 'GCP', 'Solution Design', 'Infrastructure'],
            isFree: false,
            price: '$200',
            url: 'https://cloud.google.com/learn/certification/cloud-architect',
            certificate: true,
            rating: 4.9
        }
    ];
    return courses;
}
/**
 * Fetch public courses from Coursera
 */
async function fetchCourseraPublicCourses() {
    const courses = [
        {
            id: 'coursera-ml-specialization',
            title: 'Machine Learning Specialization',
            provider: 'Stanford University & DeepLearning.AI',
            platform: 'coursera',
            description: 'Master fundamental AI concepts and develop practical ML skills',
            duration: '3 months',
            level: 'intermediate',
            skills: ['Machine Learning', 'Python', 'TensorFlow', 'Neural Networks'],
            isFree: false,
            price: '$49/month',
            url: 'https://www.coursera.org/specializations/machine-learning-introduction',
            certificate: true,
            rating: 4.9,
            enrollments: 500000
        },
        {
            id: 'coursera-google-it-support',
            title: 'Google IT Support Professional Certificate',
            provider: 'Google',
            platform: 'coursera',
            description: 'Launch your career in IT support',
            duration: '6 months',
            level: 'beginner',
            skills: ['IT Support', 'Troubleshooting', 'Customer Service', 'Linux', 'Networking'],
            isFree: false,
            price: '$49/month',
            url: 'https://www.coursera.org/professional-certificates/google-it-support',
            certificate: true,
            rating: 4.8,
            enrollments: 800000
        },
        {
            id: 'coursera-google-data-analytics',
            title: 'Google Data Analytics Professional Certificate',
            provider: 'Google',
            platform: 'coursera',
            description: 'Get job-ready for an entry-level data analyst role',
            duration: '6 months',
            level: 'beginner',
            skills: ['Data Analysis', 'SQL', 'Tableau', 'R Programming', 'Spreadsheets'],
            isFree: false,
            price: '$49/month',
            url: 'https://www.coursera.org/professional-certificates/google-data-analytics',
            certificate: true,
            rating: 4.8,
            enrollments: 1000000
        },
        {
            id: 'coursera-ibm-full-stack',
            title: 'IBM Full Stack Software Developer',
            provider: 'IBM',
            platform: 'coursera',
            description: 'Launch your career as a full-stack developer',
            duration: '4 months',
            level: 'intermediate',
            skills: ['HTML', 'CSS', 'JavaScript', 'React', 'Node.js', 'MongoDB', 'Docker'],
            isFree: false,
            price: '$49/month',
            url: 'https://www.coursera.org/professional-certificates/ibm-full-stack-cloud-developer',
            certificate: true,
            rating: 4.6,
            enrollments: 300000
        }
    ];
    return courses;
}
/**
 * Fetch free certification opportunities
 */
async function fetchFreeCertifications() {
    const freeCerts = [
        {
            id: 'freecodecamp-responsive-web',
            title: 'Responsive Web Design Certification',
            provider: 'freeCodeCamp',
            platform: 'edx',
            description: 'Learn HTML, CSS, Flexbox, Grid, and Responsive Design',
            duration: '300 hours',
            level: 'beginner',
            skills: ['HTML', 'CSS', 'Responsive Design', 'Web Development'],
            isFree: true,
            url: 'https://www.freecodecamp.org/learn/2022/responsive-web-design/',
            certificate: true,
            rating: 4.9
        },
        {
            id: 'microsoft-azure-fundamentals',
            title: 'Microsoft Azure Fundamentals',
            provider: 'Microsoft',
            platform: 'edx',
            description: 'Learn cloud concepts, Azure services, and cloud governance',
            duration: '4-6 weeks',
            level: 'beginner',
            skills: ['Azure', 'Cloud Computing', 'Microsoft Cloud'],
            isFree: true,
            url: 'https://learn.microsoft.com/en-us/certifications/azure-fundamentals/',
            certificate: true,
            rating: 4.7
        },
        {
            id: 'aws-cloud-practitioner',
            title: 'AWS Cloud Practitioner Essentials',
            provider: 'Amazon Web Services',
            platform: 'edx',
            description: 'Foundational understanding of AWS Cloud',
            duration: '6 hours',
            level: 'beginner',
            skills: ['AWS', 'Cloud Computing', 'Cloud Architecture'],
            isFree: true,
            url: 'https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/',
            certificate: false,
            rating: 4.6
        }
    ];
    return freeCerts;
}
/**
 * Search courses by skill/technology
 */
async function searchCoursesBySkill(skill) {
    const allCourses = await fetchLearningOpportunities();
    return allCourses.filter(course => course.skills.some(s => s.toLowerCase().includes(skill.toLowerCase())) ||
        course.title.toLowerCase().includes(skill.toLowerCase()));
}
//# sourceMappingURL=learning-service.js.map