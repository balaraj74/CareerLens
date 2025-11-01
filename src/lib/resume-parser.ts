'use client';

/**
 * Resume Parser Service
 * Extracts text content from PDF and DOCX files
 */

export interface ParsedResumeText {
  rawText: string;
  sections: Record<string, string>;
  metadata: {
    pageCount?: number;
    wordCount: number;
    characterCount: number;
  };
}

/**
 * Parse PDF file using server-side action
 */
async function parsePDF(file: File): Promise<string> {
  try {
    const { parsePDFFromFile } = await import('./resume-parser-server');
    const formData = new FormData();
    formData.append('file', file);
    
    const text = await parsePDFFromFile(formData);
    return text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error('Failed to parse PDF file');
  }
}

/**
 * Parse DOCX file using mammoth (browser-compatible)
 */
async function parseDOCX(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();
    
    // Mammoth can work in browser
    const mammoth = await import('mammoth');
    const result = await mammoth.extractRawText({ arrayBuffer });
    
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file');
  }
}

/**
 * Extract sections from resume text using common section headers
 */
function extractSections(text: string): Record<string, string> {
  const sections: Record<string, string> = {};
  
  const sectionHeaders = [
    'summary',
    'objective',
    'experience',
    'work experience',
    'employment history',
    'education',
    'skills',
    'technical skills',
    'projects',
    'certifications',
    'achievements',
    'awards',
    'publications',
    'languages',
    'interests',
    'references',
  ];
  
  const lines = text.split('\n');
  let currentSection = 'header';
  let currentContent: string[] = [];
  
  lines.forEach((line) => {
    const trimmedLine = line.trim().toLowerCase();
    
    // Check if line is a section header
    const matchedHeader = sectionHeaders.find(
      (header) =>
        trimmedLine === header ||
        trimmedLine === header + ':' ||
        trimmedLine.startsWith(header + ':')
    );
    
    if (matchedHeader) {
      // Save previous section
      if (currentContent.length > 0) {
        sections[currentSection] = currentContent.join('\n').trim();
      }
      
      // Start new section
      currentSection = matchedHeader;
      currentContent = [];
    } else if (line.trim()) {
      currentContent.push(line);
    }
  });
  
  // Save last section
  if (currentContent.length > 0) {
    sections[currentSection] = currentContent.join('\n').trim();
  }
  
  return sections;
}

/**
 * Main resume parsing function
 */
export async function parseResume(file: File): Promise<ParsedResumeText> {
  if (!file) {
    throw new Error('No file provided');
  }
  
  const fileType = file.type;
  let rawText = '';
  
  // Parse based on file type
  if (fileType === 'application/pdf') {
    rawText = await parsePDF(file);
  } else if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileType === 'application/msword'
  ) {
    rawText = await parseDOCX(file);
  } else if (fileType === 'text/plain') {
    rawText = await file.text();
  } else {
    throw new Error('Unsupported file type. Please upload PDF, DOCX, or TXT file.');
  }
  
  // Extract sections
  const sections = extractSections(rawText);
  
  // Calculate metadata
  const wordCount = rawText.split(/\s+/).filter((word) => word.length > 0).length;
  const characterCount = rawText.length;
  
  return {
    rawText,
    sections,
    metadata: {
      wordCount,
      characterCount,
    },
  };
}

/**
 * Validate resume file
 */
export function validateResumeFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/msword',
    'text/plain',
  ];
  
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size must be less than 10MB',
    };
  }
  
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Please upload a PDF, DOCX, or TXT file',
    };
  }
  
  return { valid: true };
}

/**
 * Extract contact information from resume text
 */
export function extractContactInfo(text: string): {
  email?: string;
  phone?: string;
  linkedin?: string;
  github?: string;
} {
  const contact: any = {};
  
  // Email regex
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) contact.email = emailMatch[0];
  
  // Phone regex (various formats)
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) contact.phone = phoneMatch[0];
  
  // LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) contact.linkedin = `https://${linkedinMatch[0]}`;
  
  // GitHub
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) contact.github = `https://${githubMatch[0]}`;
  
  return contact;
}
