import { NextRequest, NextResponse } from 'next/server';
import type { StudentPreferences, CollegeRecommendation } from '@/lib/types/community';
import { fetchCollegeReviews } from '@/lib/services/reddit-service';
import { generateAISummary } from '@/lib/services/review-summarizer';

// Mock college data for demonstration (in production, fetch from Firestore)
function getMockColleges(preferences: StudentPreferences): CollegeRecommendation[] {
  const mockColleges = [
    // ============= JEE MAIN/ADVANCED COLLEGES =============
    // Top NITs and IITs
    {
      id: 'iit-bombay',
      name: 'Indian Institute of Technology Bombay',
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      state: 'Maharashtra',
      type: 'Government' as const,
      affiliation: 'IIT',
      established: 1958,
      courses: ['B.Tech', 'M.Tech', 'PhD'],
      cutoffs: { JEE: { 'Computer Science': 150, 'Information Technology': 250, 'Electronics & Communication': 400, 'Mechanical': 800, 'Civil': 1200, 'Electrical': 600 }, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: { 'Computer Science': 550, 'Mechanical': 650 }, CAT: {} },
      nirf_rank: 3,
      autonomous: true,
      placement_stats: {
        highest_package: 15000000,
        average_package: 2100000,
        median_package: 1800000,
        placement_percentage: 99,
        top_recruiters: ['Google', 'Microsoft', 'Goldman Sachs', 'Amazon', 'Facebook'],
        year: 2024
      },
      facilities: ['World-class Library', 'Research Labs', 'Hostel', 'Sports Complex', 'High-speed WiFi', 'Innovation Center'],
      website: 'https://www.iitb.ac.in',
      score: 100,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil', 'Electrical']
    },
    {
      id: 'iit-delhi',
      name: 'Indian Institute of Technology Delhi',
      location: 'New Delhi, Delhi',
      city: 'Delhi',
      state: 'Delhi',
      type: 'Government' as const,
      affiliation: 'IIT',
      established: 1961,
      courses: ['B.Tech', 'M.Tech', 'PhD'],
      cutoffs: { JEE: { 'Computer Science': 120, 'Information Technology': 280, 'Electronics & Communication': 380, 'Mechanical': 750, 'Civil': 1100, 'Electrical': 550 }, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: { 'Computer Science': 530, 'Mechanical': 640 }, CAT: {} },
      nirf_rank: 2,
      autonomous: true,
      placement_stats: {
        highest_package: 14500000,
        average_package: 2000000,
        median_package: 1750000,
        placement_percentage: 99,
        top_recruiters: ['Microsoft', 'Google', 'Apple', 'McKinsey', 'BCG'],
        year: 2024
      },
      facilities: ['Central Library', 'Research Centers', 'Hostel', 'Stadium', 'WiFi Campus', 'Maker Space'],
      website: 'https://www.iitd.ac.in',
      score: 99,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil', 'Electrical']
    },
    {
      id: 'iit-madras',
      name: 'Indian Institute of Technology Madras',
      location: 'Chennai, Tamil Nadu',
      city: 'Chennai',
      state: 'Tamil Nadu',
      type: 'Government' as const,
      affiliation: 'IIT',
      established: 1959,
      courses: ['B.Tech', 'M.Tech', 'PhD'],
      cutoffs: { JEE: { 'Computer Science': 100, 'Information Technology': 230, 'Electronics & Communication': 350, 'Mechanical': 700, 'Civil': 1050, 'Electrical': 520 }, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: { 'Computer Science': 520, 'Mechanical': 630 }, CAT: {} },
      nirf_rank: 1,
      autonomous: true,
      placement_stats: {
        highest_package: 16000000,
        average_package: 2200000,
        median_package: 1900000,
        placement_percentage: 99,
        top_recruiters: ['Microsoft', 'Google', 'Amazon', 'Apple', 'Intel'],
        year: 2024
      },
      facilities: ['Central Library', 'Advanced Labs', 'Hostel', 'Sports Complex', 'WiFi', 'Incubation Center'],
      website: 'https://www.iitm.ac.in',
      score: 100,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil', 'Electrical']
    },
    {
      id: 'nitk-surathkal',
      name: 'National Institute of Technology Karnataka',
      location: 'Surathkal, Karnataka',
      city: 'Surathkal',
      state: 'Karnataka',
      type: 'Government' as const,
      affiliation: 'NIT',
      established: 1960,
      courses: ['B.Tech', 'M.Tech', 'PhD'],
      cutoffs: { JEE: { 'Computer Science': 5000, 'Information Technology': 7000, 'Electronics & Communication': 9000, 'Mechanical': 15000, 'Civil': 22000, 'Electrical': 12000 }, KCET: { 'Computer Science': 500, 'Information Technology': 800, 'Electronics & Communication': 1200, 'Mechanical': 2500, 'Civil': 4000 }, COMEDK: { 'Computer Science': 200, 'Information Technology': 350 }, NEET: {}, CET: {}, GATE: { 'Computer Science': 600, 'Mechanical': 700 }, CAT: {} },
      nirf_rank: 13,
      autonomous: true,
      placement_stats: {
        highest_package: 4500000,
        average_package: 1200000,
        median_package: 900000,
        placement_percentage: 95,
        top_recruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Flipkart'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Hostel', 'Sports Complex', 'WiFi', 'Gym'],
      website: 'https://nitk.ac.in',
      score: 95,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil', 'Electrical']
    },
    {
      id: 'nit-trichy',
      name: 'National Institute of Technology Tiruchirappalli',
      location: 'Tiruchirappalli, Tamil Nadu',
      city: 'Tiruchirappalli',
      state: 'Tamil Nadu',
      type: 'Government' as const,
      affiliation: 'NIT',
      established: 1964,
      courses: ['B.Tech', 'M.Tech', 'PhD'],
      cutoffs: { JEE: { 'Computer Science': 4500, 'Information Technology': 6500, 'Electronics & Communication': 8500, 'Mechanical': 14000, 'Civil': 20000, 'Electrical': 11000 }, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: { 'Computer Science': 590, 'Mechanical': 690 }, CAT: {} },
      nirf_rank: 9,
      autonomous: true,
      placement_stats: {
        highest_package: 4300000,
        average_package: 1150000,
        median_package: 850000,
        placement_percentage: 94,
        top_recruiters: ['Microsoft', 'Amazon', 'Goldman Sachs', 'Oracle', 'Adobe'],
        year: 2024
      },
      facilities: ['Central Library', 'Research Labs', 'Hostel', 'Sports', 'WiFi', 'Innovation Lab'],
      website: 'https://www.nitt.edu',
      score: 94,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil', 'Electrical']
    },
    {
      id: 'nit-warangal',
      name: 'National Institute of Technology Warangal',
      location: 'Warangal, Telangana',
      city: 'Warangal',
      state: 'Telangana',
      type: 'Government' as const,
      affiliation: 'NIT',
      established: 1959,
      courses: ['B.Tech', 'M.Tech', 'PhD'],
      cutoffs: { JEE: { 'Computer Science': 5500, 'Information Technology': 7500, 'Electronics & Communication': 9500, 'Mechanical': 16000, 'Civil': 24000, 'Electrical': 13000 }, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: { 'Computer Science': 610, 'Mechanical': 710 }, CAT: {} },
      nirf_rank: 19,
      autonomous: true,
      placement_stats: {
        highest_package: 4100000,
        average_package: 1100000,
        median_package: 820000,
        placement_percentage: 93,
        top_recruiters: ['Microsoft', 'Amazon', 'Google', 'Qualcomm', 'Samsung'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Hostel', 'Sports Complex', 'WiFi'],
      website: 'https://www.nitw.ac.in',
      score: 93,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil', 'Electrical']
    },

    // ============= KCET COLLEGES (Karnataka) =============
    // Top KCET Colleges
    {
      id: 'rvce',
      name: 'RV College of Engineering',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Autonomous' as const,
      affiliation: 'VTU',
      established: 1963,
      courses: ['B.E', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 1000, 'Information Technology': 1500, 'Electronics & Communication': 2000, 'Mechanical': 3500, 'Civil': 5000 }, COMEDK: { 'Computer Science': 500, 'Information Technology': 800 }, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 85,
      autonomous: true,
      placement_stats: {
        highest_package: 4200000,
        average_package: 800000,
        median_package: 650000,
        placement_percentage: 90,
        top_recruiters: ['Infosys', 'TCS', 'Wipro'],
        year: 2024
      },
      facilities: ['Library', 'Gym', 'Labs', 'Cafeteria'],
      website: 'https://rvce.edu.in',
      score: 88,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil', 'Electrical']
    },
    {
      id: 'bmsce',
      name: 'BMS College of Engineering',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Autonomous' as const,
      affiliation: 'VTU',
      established: 1946,
      courses: ['B.E', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 1200, 'Information Technology': 1800, 'Electronics & Communication': 2500, 'Mechanical': 4000, 'Civil': 6000 }, COMEDK: { 'Computer Science': 600 }, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 95,
      autonomous: true,
      placement_stats: {
        highest_package: 3800000,
        average_package: 750000,
        median_package: 600000,
        placement_percentage: 88,
        top_recruiters: ['IBM', 'Oracle', 'Samsung'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Sports', 'Hostel'],
      website: 'https://bmsce.ac.in',
      score: 82,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    {
      id: 'msrit',
      name: 'MS Ramaiah Institute of Technology',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'VTU',
      established: 1962,
      courses: ['B.E', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 800, 'Information Technology': 1200, 'Electronics & Communication': 1800, 'Mechanical': 3000, 'Civil': 4500 }, COMEDK: { 'Computer Science': 400 }, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 78,
      autonomous: false,
      placement_stats: {
        highest_package: 4000000,
        average_package: 850000,
        median_package: 700000,
        placement_percentage: 92,
        top_recruiters: ['Cisco', 'Intel', 'Dell'],
        year: 2024
      },
      facilities: ['Library', 'Innovation Center', 'Hostel', 'Labs'],
      website: 'https://msrit.edu',
      score: 86,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    {
      id: 'pesit',
      name: 'PES Institute of Technology',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'VTU',
      established: 1988,
      courses: ['B.Tech', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 1500, 'Information Technology': 2000, 'Electronics & Communication': 2800, 'Mechanical': 4200, 'Civil': 6500 }, COMEDK: { 'Computer Science': 700 }, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 102,
      autonomous: false,
      placement_stats: {
        highest_package: 3500000,
        average_package: 700000,
        median_package: 550000,
        placement_percentage: 85,
        top_recruiters: ['Cognizant', 'Tech Mahindra', 'Mindtree'],
        year: 2024
      },
      facilities: ['Library', 'Gym', 'Computer Center', 'Cafeteria'],
      website: 'https://pes.edu',
      score: 78,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    // Mid Tier Colleges (Rank 5000 - 20000)
    {
      id: 'dsce',
      name: 'Dayananda Sagar College of Engineering',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'VTU',
      established: 1979,
      courses: ['B.E', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 3000, 'Information Technology': 4000, 'Electronics & Communication': 5000, 'Mechanical': 8000, 'Civil': 12000 }, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 150,
      autonomous: false,
      placement_stats: {
        highest_package: 3000000,
        average_package: 600000,
        median_package: 500000,
        placement_percentage: 80,
        top_recruiters: ['Accenture', 'Capgemini', 'L&T'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Sports', 'Hostel'],
      website: 'https://dsce.edu.in',
      score: 75,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    {
      id: 'sjce-mysore',
      name: 'Sri Jayachamarajendra College of Engineering',
      location: 'Mysore, Karnataka',
      city: 'Mysore',
      state: 'Karnataka',
      type: 'Government' as const,
      affiliation: 'JSS',
      established: 1963,
      courses: ['B.E', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 4000, 'Information Technology': 6000, 'Electronics & Communication': 7000, 'Mechanical': 10000, 'Civil': 15000 }, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 180,
      autonomous: false,
      placement_stats: {
        highest_package: 2500000,
        average_package: 550000,
        median_package: 450000,
        placement_percentage: 75,
        top_recruiters: ['Infosys', 'Wipro', 'TCS'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Hostel', 'Sports Ground'],
      website: 'https://sjce.ac.in',
      score: 72,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    {
      id: 'nitte',
      name: 'NMAM Institute of Technology',
      location: 'Nitte, Karnataka',
      city: 'Nitte',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'VTU',
      established: 1986,
      courses: ['B.E', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 5000, 'Information Technology': 7000, 'Electronics & Communication': 8000, 'Mechanical': 12000, 'Civil': 18000 }, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 200,
      autonomous: false,
      placement_stats: {
        highest_package: 2200000,
        average_package: 500000,
        median_package: 400000,
        placement_percentage: 70,
        top_recruiters: ['HCL', 'Tech Mahindra', 'Mindtree'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Hostel'],
      website: 'https://nitte.edu.in',
      score: 68,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    // Good Colleges (Rank 20000 - 40000)
    {
      id: 'cmrit',
      name: 'CMR Institute of Technology',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'VTU',
      established: 2000,
      courses: ['B.E', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 8000, 'Information Technology': 12000, 'Electronics & Communication': 15000, 'Mechanical': 20000, 'Civil': 30000 }, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 250,
      autonomous: false,
      placement_stats: {
        highest_package: 1800000,
        average_package: 450000,
        median_package: 350000,
        placement_percentage: 65,
        top_recruiters: ['Cognizant', 'TCS', 'Wipro'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Cafeteria'],
      website: 'https://cmrit.ac.in',
      score: 65,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    {
      id: 'bnmit',
      name: 'BNM Institute of Technology',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'VTU',
      established: 1997,
      courses: ['B.E', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 10000, 'Information Technology': 15000, 'Electronics & Communication': 18000, 'Mechanical': 25000, 'Civil': 35000 }, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 280,
      autonomous: false,
      placement_stats: {
        highest_package: 1500000,
        average_package: 400000,
        median_package: 320000,
        placement_percentage: 60,
        top_recruiters: ['Infosys', 'TCS', 'Accenture'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Sports'],
      website: 'https://bnmit.org',
      score: 62,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    {
      id: 'rnsit',
      name: 'RNS Institute of Technology',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'VTU',
      established: 2001,
      courses: ['B.E', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 12000, 'Information Technology': 18000, 'Electronics & Communication': 22000, 'Mechanical': 28000, 'Civil': 38000 }, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 300,
      autonomous: false,
      placement_stats: {
        highest_package: 1400000,
        average_package: 380000,
        median_package: 300000,
        placement_percentage: 58,
        top_recruiters: ['TCS', 'Wipro', 'Capgemini'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Canteen'],
      website: 'https://rnsit.ac.in',
      score: 60,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    {
      id: 'siddaganga',
      name: 'Siddaganga Institute of Technology',
      location: 'Tumkur, Karnataka',
      city: 'Tumkur',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'VTU',
      established: 1963,
      courses: ['B.E', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 6000, 'Information Technology': 9000, 'Electronics & Communication': 12000, 'Mechanical': 18000, 'Civil': 25000 }, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 220,
      autonomous: false,
      placement_stats: {
        highest_package: 2000000,
        average_package: 480000,
        median_package: 380000,
        placement_percentage: 68,
        top_recruiters: ['Infosys', 'TCS', 'IBM'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Hostel', 'Sports'],
      website: 'https://sit.ac.in',
      score: 70,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    {
      id: 'atria',
      name: 'Atria Institute of Technology',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'VTU',
      established: 2000,
      courses: ['B.E', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 15000, 'Information Technology': 20000, 'Electronics & Communication': 25000, 'Mechanical': 32000, 'Civil': 42000 }, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 320,
      autonomous: false,
      placement_stats: {
        highest_package: 1200000,
        average_package: 360000,
        median_package: 280000,
        placement_percentage: 55,
        top_recruiters: ['TCS', 'Wipro', 'Tech Mahindra'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Cafeteria'],
      website: 'https://atria.edu',
      score: 58,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    {
      id: 'sjbit',
      name: 'SJB Institute of Technology',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'VTU',
      established: 2002,
      courses: ['B.E', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 18000, 'Information Technology': 24000, 'Electronics & Communication': 28000, 'Mechanical': 35000, 'Civil': 45000 }, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 350,
      autonomous: false,
      placement_stats: {
        highest_package: 1100000,
        average_package: 340000,
        median_package: 260000,
        placement_percentage: 52,
        top_recruiters: ['Infosys', 'TCS', 'Accenture'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Sports'],
      website: 'https://sjbit.edu.in',
      score: 56,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    // Decent Options (Rank 40000+)
    {
      id: 'gsss',
      name: 'GSSS Institute of Engineering and Technology for Women',
      location: 'Mysore, Karnataka',
      city: 'Mysore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'VTU',
      established: 1993,
      courses: ['B.E', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 25000, 'Information Technology': 32000, 'Electronics & Communication': 35000, 'Mechanical': 42000, 'Civil': 50000 }, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 400,
      autonomous: false,
      placement_stats: {
        highest_package: 900000,
        average_package: 320000,
        median_package: 240000,
        placement_percentage: 48,
        top_recruiters: ['TCS', 'Wipro', 'Cognizant'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Hostel'],
      website: 'https://gsss.edu.in',
      score: 54,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    {
      id: 'vemana',
      name: 'Vemana Institute of Technology',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'VTU',
      established: 2009,
      courses: ['B.E'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 22000, 'Information Technology': 28000, 'Electronics & Communication': 32000, 'Mechanical': 38000, 'Civil': 48000 }, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 420,
      autonomous: false,
      placement_stats: {
        highest_package: 850000,
        average_package: 310000,
        median_package: 230000,
        placement_percentage: 45,
        top_recruiters: ['Infosys', 'TCS', 'Tech Mahindra'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Canteen'],
      website: 'https://vit.ac.in',
      score: 52,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    {
      id: 'biet',
      name: 'Bangalore Institute of Engineering and Technology',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'VTU',
      established: 2012,
      courses: ['B.E'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 28000, 'Information Technology': 35000, 'Electronics & Communication': 38000, 'Mechanical': 44000, 'Civil': 52000 }, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 450,
      autonomous: false,
      placement_stats: {
        highest_package: 800000,
        average_package: 290000,
        median_package: 220000,
        placement_percentage: 42,
        top_recruiters: ['TCS', 'Wipro', 'Capgemini'],
        year: 2024
      },
      facilities: ['Library', 'Labs'],
      website: 'https://biet.ac.in',
      score: 50,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },

    // ============= COMEDK COLLEGES (Karnataka Private) =============
    {
      id: 'comedk-pes-university',
      name: 'PES University',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'Autonomous',
      established: 1988,
      courses: ['B.Tech', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: { 'Computer Science': 1500, 'Information Technology': 2000 }, COMEDK: { 'Computer Science': 500, 'Information Technology': 800, 'Electronics & Communication': 1200, 'Mechanical': 2000, 'Civil': 3500 }, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 92,
      autonomous: true,
      placement_stats: {
        highest_package: 4200000,
        average_package: 800000,
        median_package: 650000,
        placement_percentage: 88,
        top_recruiters: ['Microsoft', 'Amazon', 'Oracle', 'SAP', 'Cisco'],
        year: 2024
      },
      facilities: ['Library', 'Innovation Center', 'Labs', 'Sports', 'Hostel', 'WiFi'],
      website: 'https://pes.edu',
      score: 86,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil']
    },
    {
      id: 'comedk-manipal',
      name: 'Manipal Institute of Technology',
      location: 'Manipal, Karnataka',
      city: 'Manipal',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'MAHE',
      established: 1957,
      courses: ['B.Tech', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: { 'Computer Science': 600, 'Information Technology': 900, 'Electronics & Communication': 1400, 'Mechanical': 2500, 'Civil': 4000 }, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 47,
      autonomous: true,
      placement_stats: {
        highest_package: 4000000,
        average_package: 850000,
        median_package: 700000,
        placement_percentage: 90,
        top_recruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Morgan Stanley'],
        year: 2024
      },
      facilities: ['Central Library', 'Research Labs', 'Hostel', 'Sports Complex', 'Hospital', 'WiFi'],
      website: 'https://manipal.edu/mit.html',
      score: 88,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil', 'Electrical']
    },
    {
      id: 'comedk-christ',
      name: 'CHRIST (Deemed to be University)',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'Deemed University',
      established: 1969,
      courses: ['B.Tech', 'M.Tech'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: { 'Computer Science': 1500, 'Information Technology': 2200, 'Electronics & Communication': 3000, 'Mechanical': 4500 }, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 65,
      autonomous: true,
      placement_stats: {
        highest_package: 3200000,
        average_package: 650000,
        median_package: 520000,
        placement_percentage: 82,
        top_recruiters: ['Infosys', 'TCS', 'Wipro', 'Cognizant', 'Accenture'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Sports', 'Hostel', 'Chapel', 'WiFi'],
      website: 'https://christuniversity.in',
      score: 80,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical']
    },

    // ============= NEET MEDICAL COLLEGES =============
    {
      id: 'aiims-delhi',
      name: 'All India Institute of Medical Sciences',
      location: 'New Delhi, Delhi',
      city: 'Delhi',
      state: 'Delhi',
      type: 'Government' as const,
      affiliation: 'AIIMS',
      established: 1956,
      courses: ['MBBS', 'MD', 'MS', 'DM', 'MCh'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: { 'Medicine': 50, 'Surgery': 60, 'Pediatrics': 70, 'Radiology': 80, 'Anesthesiology': 90 }, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 1,
      autonomous: true,
      placement_stats: {
        highest_package: 5000000,
        average_package: 1800000,
        median_package: 1500000,
        placement_percentage: 100,
        top_recruiters: ['AIIMS Hospitals', 'Apollo', 'Fortis', 'Max Healthcare', 'Medanta'],
        year: 2024
      },
      facilities: ['Medical Library', 'Super-specialty Hospitals', 'Research Labs', 'Hostel', 'Sports', 'WiFi'],
      website: 'https://www.aiims.edu',
      score: 100,
      matchBranches: ['Medicine', 'Surgery', 'Pediatrics', 'Radiology', 'Anesthesiology', 'Orthopedics']
    },
    {
      id: 'christian-medical-college',
      name: 'Christian Medical College',
      location: 'Vellore, Tamil Nadu',
      city: 'Vellore',
      state: 'Tamil Nadu',
      type: 'Private' as const,
      affiliation: 'CMC',
      established: 1900,
      courses: ['MBBS', 'MD', 'MS'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: { 'Medicine': 150, 'Surgery': 180, 'Pediatrics': 200, 'Radiology': 220, 'Anesthesiology': 250 }, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 2,
      autonomous: true,
      placement_stats: {
        highest_package: 4500000,
        average_package: 1600000,
        median_package: 1400000,
        placement_percentage: 100,
        top_recruiters: ['CMC Hospital', 'Apollo', 'Manipal Hospitals', 'Fortis', 'Columbia Asia'],
        year: 2024
      },
      facilities: ['Medical Library', 'Hospital', 'Research Centers', 'Hostel', 'Chapel', 'WiFi'],
      website: 'https://www.cmch-vellore.edu',
      score: 98,
      matchBranches: ['Medicine', 'Surgery', 'Pediatrics', 'Radiology', 'Anesthesiology', 'Orthopedics']
    },
    {
      id: 'kmc-manipal',
      name: 'Kasturba Medical College',
      location: 'Manipal, Karnataka',
      city: 'Manipal',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'MAHE',
      established: 1953,
      courses: ['MBBS', 'MD', 'MS'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: { 'Medicine': 300, 'Surgery': 350, 'Pediatrics': 400, 'Radiology': 450, 'Anesthesiology': 500 }, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 8,
      autonomous: true,
      placement_stats: {
        highest_package: 4000000,
        average_package: 1400000,
        median_package: 1200000,
        placement_percentage: 98,
        top_recruiters: ['Kasturba Hospital', 'Apollo', 'Manipal Hospitals', 'Narayana Health', 'Columbia Asia'],
        year: 2024
      },
      facilities: ['Medical Library', 'Teaching Hospital', 'Research Labs', 'Hostel', 'Sports', 'WiFi'],
      website: 'https://manipal.edu/kmc-manipal.html',
      score: 92,
      matchBranches: ['Medicine', 'Surgery', 'Pediatrics', 'Radiology', 'Anesthesiology', 'Orthopedics']
    },
    {
      id: 'kims-bangalore',
      name: 'Kempegowda Institute of Medical Sciences',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Government' as const,
      affiliation: 'RGUHS',
      established: 1980,
      courses: ['MBBS', 'MD', 'MS'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: { 'Medicine': 600, 'Surgery': 700, 'Pediatrics': 800, 'Radiology': 900, 'Anesthesiology': 1000 }, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 45,
      autonomous: false,
      placement_stats: {
        highest_package: 3500000,
        average_package: 1200000,
        median_package: 1000000,
        placement_percentage: 95,
        top_recruiters: ['KIMS Hospital', 'Apollo', 'Fortis', 'Manipal Hospitals', 'Columbia Asia'],
        year: 2024
      },
      facilities: ['Medical Library', 'Hospital', 'Labs', 'Hostel', 'Sports', 'Cafeteria'],
      website: 'https://kims-hospital.org',
      score: 85,
      matchBranches: ['Medicine', 'Surgery', 'Pediatrics', 'Radiology', 'Anesthesiology', 'Orthopedics']
    },
    {
      id: 'st-johns-medical',
      name: 'St. Johns Medical College',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Private' as const,
      affiliation: 'RGUHS',
      established: 1963,
      courses: ['MBBS', 'MD', 'MS'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: { 'Medicine': 500, 'Surgery': 600, 'Pediatrics': 700, 'Radiology': 800, 'Anesthesiology': 900 }, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 18,
      autonomous: false,
      placement_stats: {
        highest_package: 3800000,
        average_package: 1300000,
        median_package: 1100000,
        placement_percentage: 97,
        top_recruiters: ['St. Johns Hospital', 'Apollo', 'Manipal Hospitals', 'Fortis', 'Narayana Health'],
        year: 2024
      },
      facilities: ['Medical Library', 'Hospital', 'Research Labs', 'Hostel', 'Chapel', 'WiFi'],
      website: 'https://www.stjohns.in',
      score: 88,
      matchBranches: ['Medicine', 'Surgery', 'Pediatrics', 'Radiology', 'Anesthesiology', 'Orthopedics']
    },

    // ============= CET MBA COLLEGES =============
    {
      id: 'iim-bangalore',
      name: 'Indian Institute of Management Bangalore',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Government' as const,
      affiliation: 'IIM',
      established: 1973,
      courses: ['MBA', 'PGPM', 'Executive MBA'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: {}, CET: { 'MBA': 150, 'Finance': 200, 'Marketing': 250, 'HR': 300 }, GATE: {}, CAT: { 'MBA': 98, 'Finance': 98.5, 'Marketing': 98, 'HR': 97 } },
      nirf_rank: 1,
      autonomous: true,
      placement_stats: {
        highest_package: 12500000,
        average_package: 3500000,
        median_package: 3200000,
        placement_percentage: 100,
        top_recruiters: ['McKinsey', 'BCG', 'Bain', 'Goldman Sachs', 'Amazon', 'Google'],
        year: 2024
      },
      facilities: ['Library', 'Case Study Rooms', 'Hostel', 'Sports Complex', 'WiFi', 'Innovation Lab'],
      website: 'https://www.iimb.ac.in',
      score: 100,
      matchBranches: ['MBA', 'Finance', 'Marketing', 'HR', 'Operations', 'Strategy']
    },
    {
      id: 'iim-ahmedabad',
      name: 'Indian Institute of Management Ahmedabad',
      location: 'Ahmedabad, Gujarat',
      city: 'Ahmedabad',
      state: 'Gujarat',
      type: 'Government' as const,
      affiliation: 'IIM',
      established: 1961,
      courses: ['MBA', 'PGPM'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: { 'MBA': 99, 'Finance': 99, 'Marketing': 98.5, 'HR': 98 } },
      nirf_rank: 1,
      autonomous: true,
      placement_stats: {
        highest_package: 13000000,
        average_package: 3600000,
        median_package: 3300000,
        placement_percentage: 100,
        top_recruiters: ['McKinsey', 'BCG', 'Bain', 'Goldman Sachs', 'JP Morgan', 'Microsoft'],
        year: 2024
      },
      facilities: ['Louis Kahn Plaza', 'Library', 'Hostel', 'Sports', 'WiFi', 'Incubation Center'],
      website: 'https://www.iima.ac.in',
      score: 100,
      matchBranches: ['MBA', 'Finance', 'Marketing', 'HR', 'Operations', 'Strategy']
    },
    {
      id: 'iim-calcutta',
      name: 'Indian Institute of Management Calcutta',
      location: 'Kolkata, West Bengal',
      city: 'Kolkata',
      state: 'West Bengal',
      type: 'Government' as const,
      affiliation: 'IIM',
      established: 1961,
      courses: ['MBA', 'PGPM'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: { 'MBA': 98.5, 'Finance': 99, 'Marketing': 98, 'HR': 97.5 } },
      nirf_rank: 3,
      autonomous: true,
      placement_stats: {
        highest_package: 12000000,
        average_package: 3400000,
        median_package: 3100000,
        placement_percentage: 100,
        top_recruiters: ['McKinsey', 'BCG', 'Goldman Sachs', 'Deloitte', 'EY', 'KPMG'],
        year: 2024
      },
      facilities: ['Library', 'Computing Center', 'Hostel', 'Sports', 'WiFi', 'Alumni Hall'],
      website: 'https://www.iimcal.ac.in',
      score: 99,
      matchBranches: ['MBA', 'Finance', 'Marketing', 'HR', 'Operations', 'Strategy']
    },
    {
      id: 'iisc-bangalore-mgmt',
      name: 'Indian Institute of Science - Management',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Government' as const,
      affiliation: 'IISc',
      established: 2009,
      courses: ['MBA', 'Executive MBA'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: {}, CET: { 'MBA': 250, 'Finance': 300 }, GATE: { 'MBA': 650 }, CAT: { 'MBA': 95, 'Finance': 96 } },
      nirf_rank: 15,
      autonomous: true,
      placement_stats: {
        highest_package: 10000000,
        average_package: 2800000,
        median_package: 2500000,
        placement_percentage: 98,
        top_recruiters: ['Google', 'Amazon', 'Microsoft', 'Deloitte', 'McKinsey', 'BCG'],
        year: 2024
      },
      facilities: ['Library', 'Research Labs', 'Hostel', 'Sports', 'WiFi', 'Innovation Center'],
      website: 'https://www.iisc.ac.in/mba',
      score: 94,
      matchBranches: ['MBA', 'Finance', 'Technology Management', 'Operations']
    },
    {
      id: 'xlri-jamshedpur',
      name: 'Xavier School of Management',
      location: 'Jamshedpur, Jharkhand',
      city: 'Jamshedpur',
      state: 'Jharkhand',
      type: 'Private' as const,
      affiliation: 'Autonomous',
      established: 1949,
      courses: ['MBA', 'PGPM', 'Executive MBA'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: { 'MBA': 95, 'Finance': 96, 'Marketing': 95, 'HR': 94 } },
      nirf_rank: 8,
      autonomous: true,
      placement_stats: {
        highest_package: 11000000,
        average_package: 3000000,
        median_package: 2700000,
        placement_percentage: 100,
        top_recruiters: ['Accenture', 'Deloitte', 'EY', 'KPMG', 'Amazon', 'Flipkart'],
        year: 2024
      },
      facilities: ['Library', 'Computer Center', 'Hostel', 'Sports', 'Chapel', 'WiFi'],
      website: 'https://www.xlri.ac.in',
      score: 96,
      matchBranches: ['MBA', 'Finance', 'Marketing', 'HR', 'Operations', 'Strategy']
    },

    // ============= GATE M.Tech COLLEGES =============
    {
      id: 'iisc-bangalore',
      name: 'Indian Institute of Science',
      location: 'Bangalore, Karnataka',
      city: 'Bangalore',
      state: 'Karnataka',
      type: 'Government' as const,
      affiliation: 'IISc',
      established: 1909,
      courses: ['M.Tech', 'ME', 'PhD'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: { 'Computer Science': 450, 'Mechanical': 500, 'Electrical': 480, 'Electronics & Communication': 470, 'Civil': 550 }, CAT: {} },
      nirf_rank: 1,
      autonomous: true,
      placement_stats: {
        highest_package: 8000000,
        average_package: 1800000,
        median_package: 1500000,
        placement_percentage: 95,
        top_recruiters: ['Google', 'Microsoft', 'Amazon', 'Intel', 'Qualcomm', 'ISRO'],
        year: 2024
      },
      facilities: ['Central Library', 'Advanced Research Labs', 'Hostel', 'Sports', 'WiFi', 'Supercomputing Center'],
      website: 'https://www.iisc.ac.in',
      score: 100,
      matchBranches: ['Computer Science', 'Mechanical', 'Electrical', 'Electronics & Communication', 'Civil', 'Aerospace']
    },
    {
      id: 'gate-iit-bombay-mtech',
      name: 'IIT Bombay M.Tech',
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      state: 'Maharashtra',
      type: 'Government' as const,
      affiliation: 'IIT',
      established: 1958,
      courses: ['M.Tech', 'MS', 'PhD'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: { 'Computer Science': 500, 'Mechanical': 550, 'Electrical': 520, 'Electronics & Communication': 510, 'Civil': 580 }, CAT: {} },
      nirf_rank: 3,
      autonomous: true,
      placement_stats: {
        highest_package: 7500000,
        average_package: 1600000,
        median_package: 1400000,
        placement_percentage: 94,
        top_recruiters: ['Google', 'Microsoft', 'Amazon', 'Goldman Sachs', 'Intel', 'Qualcomm'],
        year: 2024
      },
      facilities: ['Library', 'Research Labs', 'Hostel', 'Sports', 'WiFi', 'Innovation Center'],
      website: 'https://www.iitb.ac.in/mtech',
      score: 98,
      matchBranches: ['Computer Science', 'Mechanical', 'Electrical', 'Electronics & Communication', 'Civil', 'Aerospace']
    },

    // ============= CAT MBA COLLEGES =============
    {
      id: 'sp-jain',
      name: 'S.P. Jain Institute of Management and Research',
      location: 'Mumbai, Maharashtra',
      city: 'Mumbai',
      state: 'Maharashtra',
      type: 'Private' as const,
      affiliation: 'Autonomous',
      established: 1981,
      courses: ['MBA', 'PGDM'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: { 'MBA': 90, 'Finance': 92, 'Marketing': 90, 'HR': 88 } },
      nirf_rank: 12,
      autonomous: true,
      placement_stats: {
        highest_package: 9500000,
        average_package: 2600000,
        median_package: 2300000,
        placement_percentage: 100,
        top_recruiters: ['Deloitte', 'EY', 'KPMG', 'Amazon', 'Flipkart', 'Infosys'],
        year: 2024
      },
      facilities: ['Library', 'Case Study Rooms', 'Hostel', 'Sports', 'WiFi', 'Entrepreneurship Cell'],
      website: 'https://www.spjimr.org',
      score: 92,
      matchBranches: ['MBA', 'Finance', 'Marketing', 'HR', 'Operations']
    },
    {
      id: 'fms-delhi',
      name: 'Faculty of Management Studies, Delhi',
      location: 'New Delhi, Delhi',
      city: 'Delhi',
      state: 'Delhi',
      type: 'Government' as const,
      affiliation: 'Delhi University',
      established: 1954,
      courses: ['MBA'],
      cutoffs: { JEE: {}, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: { 'MBA': 98, 'Finance': 98.5, 'Marketing': 98, 'HR': 97 } },
      nirf_rank: 11,
      autonomous: false,
      placement_stats: {
        highest_package: 11000000,
        average_package: 3100000,
        median_package: 2800000,
        placement_percentage: 100,
        top_recruiters: ['McKinsey', 'BCG', 'Goldman Sachs', 'Deloitte', 'Amazon', 'Microsoft'],
        year: 2024
      },
      facilities: ['Library', 'Computer Lab', 'Auditorium', 'WiFi', 'Cafeteria'],
      website: 'https://www.fms.edu',
      score: 96,
      matchBranches: ['MBA', 'Finance', 'Marketing', 'HR', 'Operations', 'Strategy']
    },

    // ============= MORE JEE COLLEGES (Different States) =============
    {
      id: 'bits-pilani',
      name: 'Birla Institute of Technology and Science, Pilani',
      location: 'Pilani, Rajasthan',
      city: 'Pilani',
      state: 'Rajasthan',
      type: 'Private' as const,
      affiliation: 'Deemed University',
      established: 1964,
      courses: ['B.E', 'M.E', 'PhD'],
      cutoffs: { JEE: { 'Computer Science': 8000, 'Information Technology': 10000, 'Electronics & Communication': 12000, 'Mechanical': 18000, 'Civil': 25000, 'Electrical': 14000 }, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: { 'Computer Science': 620, 'Mechanical': 720 }, CAT: {} },
      nirf_rank: 25,
      autonomous: true,
      placement_stats: {
        highest_package: 6000000,
        average_package: 1100000,
        median_package: 900000,
        placement_percentage: 92,
        top_recruiters: ['Microsoft', 'Amazon', 'Google', 'Oracle', 'Adobe', 'Samsung'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Hostel', 'Sports Complex', 'WiFi', 'Innovation Center'],
      website: 'https://www.bits-pilani.ac.in',
      score: 91,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil', 'Electrical']
    },
    {
      id: 'vit-vellore',
      name: 'Vellore Institute of Technology',
      location: 'Vellore, Tamil Nadu',
      city: 'Vellore',
      state: 'Tamil Nadu',
      type: 'Private' as const,
      affiliation: 'Deemed University',
      established: 1984,
      courses: ['B.Tech', 'M.Tech', 'PhD'],
      cutoffs: { JEE: { 'Computer Science': 12000, 'Information Technology': 15000, 'Electronics & Communication': 18000, 'Mechanical': 25000, 'Civil': 35000, 'Electrical': 20000 }, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: {}, CAT: {} },
      nirf_rank: 11,
      autonomous: true,
      placement_stats: {
        highest_package: 7500000,
        average_package: 800000,
        median_package: 650000,
        placement_percentage: 85,
        top_recruiters: ['TCS', 'Infosys', 'Wipro', 'Cognizant', 'Amazon', 'Microsoft'],
        year: 2024
      },
      facilities: ['Library', 'Labs', 'Hostel', 'Sports', 'WiFi', 'Hospital'],
      website: 'https://vit.ac.in',
      score: 84,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication', 'Mechanical', 'Civil', 'Electrical']
    },
    {
      id: 'iiit-hyderabad',
      name: 'International Institute of Information Technology, Hyderabad',
      location: 'Hyderabad, Telangana',
      city: 'Hyderabad',
      state: 'Telangana',
      type: 'Private' as const,
      affiliation: 'Deemed University',
      established: 1998,
      courses: ['B.Tech', 'M.Tech', 'PhD'],
      cutoffs: { JEE: { 'Computer Science': 3000, 'Information Technology': 4500, 'Electronics & Communication': 6000 }, KCET: {}, COMEDK: {}, NEET: {}, CET: {}, GATE: { 'Computer Science': 540 }, CAT: {} },
      nirf_rank: 62,
      autonomous: true,
      placement_stats: {
        highest_package: 7400000,
        average_package: 1400000,
        median_package: 1200000,
        placement_percentage: 96,
        top_recruiters: ['Google', 'Microsoft', 'Amazon', 'Facebook', 'Goldman Sachs', 'Oracle'],
        year: 2024
      },
      facilities: ['Library', 'Research Labs', 'Hostel', 'Sports', 'WiFi', 'Innovation Lab'],
      website: 'https://www.iiit.ac.in',
      score: 93,
      matchBranches: ['Computer Science', 'Information Technology', 'Electronics & Communication']
    }
  ];

  // Filter and score colleges
  const scoredColleges = mockColleges
    .filter(college => {
      const cutoffs = college.cutoffs[preferences.exam_type];
      if (!cutoffs || Object.keys(cutoffs).length === 0) return false;
      
      const hasBranch = preferences.branch_preferences.some(branch => 
        college.matchBranches.includes(branch)
      );
      return hasBranch;
    })
    .map(college => {
      let matchScore = 50;
      
      // Location match (+25)
      if (preferences.location_preferences?.includes(college.city) || 
          preferences.location_preferences?.includes('Any')) {
        matchScore += 25;
      }
      
      // College type match (+15)
      if (!preferences.college_type_preferences || preferences.college_type_preferences.length === 0 ||
          preferences.college_type_preferences.includes(college.type)) {
        matchScore += 15;
      }
      
      // NIRF ranking (+10)
      if (college.nirf_rank && college.nirf_rank <= 50) matchScore += 10;
      else if (college.nirf_rank && college.nirf_rank <= 100) matchScore += 5;
      
      matchScore = Math.min(100, matchScore);
      
      // Calculate admission chance
      const cutoffs = college.cutoffs[preferences.exam_type];
      const firstBranch = preferences.branch_preferences[0];
      const cutoff = (cutoffs as any)[firstBranch] || 999999;
      
      let admissionChance = 50;
      if (preferences.score <= cutoff * 0.8) admissionChance = 95;
      else if (preferences.score <= cutoff * 0.9) admissionChance = 85;
      else if (preferences.score <= cutoff) admissionChance = 70;
      else if (preferences.score <= cutoff * 1.2) admissionChance = 45;
      else admissionChance = 20;

      return {
        college: {
          ...college,
          logo_url: undefined,
          cutoffs: college.cutoffs as any
        },
        match_score: matchScore,
        predicted_admission_chance: admissionChance,
        reasons: [
          `Offers ${preferences.branch_preferences[0]} program`,
          `${college.placement_stats.placement_percentage}% placement rate`,
          college.autonomous ? 'Autonomous institution' : 'Affiliated college',
          `Located in ${college.city}`,
          `NIRF Rank: ${college.nirf_rank || 'Unranked'}`
        ],
        pros: [
          'Strong placement record',
          'Experienced faculty',
          'Good infrastructure'
        ],
        cons: [
          'High competition',
          'Limited seats'
        ],
        trending: false,
        highly_rated: matchScore > 80,
        recent_feedback: 'none' as const,
        review_summary: {
          college_id: college.id,
          total_reviews: 0,
          average_sentiment: 0,
          sentiment_distribution: { positive: 0, neutral: 0, negative: 0, mixed: 0 },
          topic_ratings: {},
          recent_trend: 'stable' as const,
          last_updated: Date.now()
        }
      };
    })
    .sort((a, b) => {
      // Prioritize admission chance if it's decent (>30%)
      if (a.predicted_admission_chance > 30 && b.predicted_admission_chance > 30) {
        if (b.match_score !== a.match_score) return b.match_score - a.match_score;
        return b.predicted_admission_chance - a.predicted_admission_chance;
      }
      // Otherwise, sort by admission chance first
      if (b.predicted_admission_chance !== a.predicted_admission_chance) {
        return b.predicted_admission_chance - a.predicted_admission_chance;
      }
      return b.match_score - a.match_score;
    });

  // Return more colleges based on exam type and score
  let maxResults = 15; // Default
  
  if (preferences.exam_type === 'JEE') {
    maxResults = preferences.score > 50000 ? 30 : preferences.score > 20000 ? 25 : preferences.score > 10000 ? 20 : 15;
  } else if (preferences.exam_type === 'KCET') {
    maxResults = preferences.score > 20000 ? 25 : preferences.score > 10000 ? 20 : 15;
  } else if (preferences.exam_type === 'COMEDK') {
    maxResults = preferences.score > 10000 ? 25 : preferences.score > 5000 ? 20 : 15;
  } else if (preferences.exam_type === 'NEET') {
    maxResults = preferences.score > 50000 ? 30 : preferences.score > 20000 ? 25 : preferences.score > 10000 ? 20 : 15;
  } else if (preferences.exam_type === 'GATE' || preferences.exam_type === 'CAT' || preferences.exam_type === 'CET') {
    maxResults = preferences.score > 90 ? 15 : preferences.score > 80 ? 20 : preferences.score > 70 ? 25 : 30;
  }
  
  return scoredColleges.slice(0, maxResults);
}

export async function POST(request: NextRequest) {
  try {
    const preferences: StudentPreferences = await request.json();
    
    console.log('Received college recommendation request:', {
      exam: preferences.exam_type,
      score: preferences.score,
      branches: preferences.branch_preferences
    });
    
    // Validate input
    if (!preferences.exam_type || !preferences.score || !preferences.branch_preferences || preferences.branch_preferences.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: exam_type, score, and branch_preferences' },
        { status: 400 }
      );
    }
    
    // Generate recommendations using mock data
    const recommendations = getMockColleges(preferences);
    
    console.log(`✅ Generated ${recommendations.length} recommendations`);
    
    // Fetch Reddit reviews for each college in parallel
    console.log('🔍 Fetching Reddit reviews for colleges...');
    const recommendationsWithReviews = await Promise.all(
      recommendations.map(async (rec) => {
        try {
          // Call the Reddit search API route (server-side, no CORS issues)
          // Must use internal fetch (server-side) to avoid CORS
          const redditResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/reddit-search`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ collegeName: rec.college.name })
          });

          if (!redditResponse.ok) {
            console.warn(`Could not fetch Reddit reviews for ${rec.college.name}`);
            return rec;
          }

          const redditData = await redditResponse.json();
          const reviews = redditData.reviews || [];
          
          console.log(`📊 Found ${reviews.length} reviews for ${rec.college.name}`);
          
          if (reviews.length > 0) {
            // Calculate sentiment distribution
            const sentimentDist = { positive: 0, neutral: 0, negative: 0, mixed: 0 };
            reviews.forEach((review: any) => {
              const sentiment = review.sentiment || 'neutral';
              if (sentiment === 'mixed') {
                sentimentDist.mixed++;
              } else if (sentiment === 'positive') {
                sentimentDist.positive++;
              } else if (sentiment === 'negative') {
                sentimentDist.negative++;
              } else {
                sentimentDist.neutral++;
              }
            });
            
            // Calculate average sentiment score
            const sentimentScores: Record<string, number> = {
              positive: 1,
              mixed: 0.5,
              neutral: 0,
              negative: -1
            };
            const avgSentiment = reviews.reduce((sum: number, review: any) => {
              const sentiment = review.sentiment || 'neutral';
              return sum + (sentimentScores[sentiment] || 0);
            }, 0) / reviews.length;
            
            // Extract topic ratings
            const topicCounts: Record<string, { total: number, score: number, recent: number }> = {};
            reviews.forEach((review: any) => {
              const isRecent = Date.now() - review.created_utc * 1000 < 90 * 24 * 60 * 60 * 1000;
              const topics = review.topics || [];
              topics.forEach((topic: string) => {
                if (!topicCounts[topic]) {
                  topicCounts[topic] = { total: 0, score: 0, recent: 0 };
                }
                topicCounts[topic].total++;
                const sentiment = review.sentiment || 'neutral';
                topicCounts[topic].score += (sentimentScores[sentiment] || 0);
                if (isRecent) topicCounts[topic].recent++;
              });
            });
            
            // Build topic ratings with proper structure
            const topicRatings: Record<string, any> = {};
            Object.entries(topicCounts).forEach(([topic, data]) => {
              const avgScore = data.score / data.total;
              topicRatings[topic] = {
                topic,
                average_rating: Math.max(0, Math.min(5, (avgScore + 1) * 2.5)), // Convert -1 to 1 range to 0-5
                mention_count: data.total,
                recent_mentions: data.recent,
                sentiment: avgScore > 0.3 ? 'positive' : avgScore < -0.3 ? 'negative' : 'neutral',
                key_points: []
              };
            });
            
            // Determine recent trend
            const recentReviews = reviews.filter((r: any) => 
              Date.now() - r.created_utc * 1000 < 90 * 24 * 60 * 60 * 1000 // Last 90 days
            );
            const recentAvgSentiment = recentReviews.length > 0
              ? recentReviews.reduce((sum: number, r: any) => {
                  const sentiment = r.sentiment || 'neutral';
                  return sum + (sentimentScores[sentiment] || 0);
                }, 0) / recentReviews.length
              : 0;
            
            let recentTrend: 'improving' | 'declining' | 'stable' = 'stable';
            if (recentAvgSentiment > avgSentiment + 0.2) recentTrend = 'improving';
            else if (recentAvgSentiment < avgSentiment - 0.2) recentTrend = 'declining';
            
            // Update review summary
            rec.review_summary = {
              college_id: rec.college.id,
              total_reviews: reviews.length,
              average_sentiment: avgSentiment,
              sentiment_distribution: sentimentDist,
              topic_ratings: topicRatings,
              recent_trend: recentTrend,
              last_updated: Date.now()
            };
            
            // Update pros and cons based on reviews
            const positiveTrends = Object.entries(topicRatings)
              .filter(([_, rating]: [string, any]) => rating.sentiment === 'positive')
              .map(([topic]) => `Good ${topic.toLowerCase()} (${topicRatings[topic].mention_count} reviews)`);
            
            const negativeTrends = Object.entries(topicRatings)
              .filter(([_, rating]: [string, any]) => rating.sentiment === 'negative')
              .map(([topic]) => `Concerns about ${topic.toLowerCase()} (${topicRatings[topic].mention_count} reviews)`);
            
            if (positiveTrends.length > 0) {
              rec.pros = [...positiveTrends.slice(0, 3), ...rec.pros].slice(0, 5);
            }
            
            if (negativeTrends.length > 0) {
              rec.cons = [...negativeTrends.slice(0, 2), ...rec.cons].slice(0, 4);
            }
            
            // Mark as highly rated if lots of positive reviews
            if (sentimentDist.positive > reviews.length * 0.6) {
              rec.highly_rated = true;
            }
            
            // Set trending flag if recent positive activity
            if (recentReviews.length > 3 && recentAvgSentiment > 0.5) {
              rec.trending = true;
            }
            
            // Set recent feedback status
            if (recentReviews.length > 5) {
              rec.recent_feedback = recentAvgSentiment > 0.3 ? 'positive' : 
                                   recentAvgSentiment < -0.3 ? 'negative' : 'mixed';
            }
          }
          
          return rec;
        } catch (error) {
          console.error(`Error fetching reviews for ${rec.college.name}:`, error);
          return rec; // Return recommendation without reviews if fetch fails
        }
      })
    );
    
    console.log(`✅ Completed! Returning ${recommendationsWithReviews.length} recommendations with Reddit reviews`);
    
    return NextResponse.json({
      success: true,
      recommendations: recommendationsWithReviews,
      total: recommendationsWithReviews.length,
      reviews_loaded: true
    });
    
  } catch (error) {
    console.error('❌ Error in college recommendations API:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate recommendations', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
