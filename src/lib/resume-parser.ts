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
 * Parse PDF file using server-side API route
 * Uses pdf-parse on Node.js backend to avoid webpack issues
 */
async function parsePDF(file: File): Promise<string> {
  try {
    console.log('Parsing PDF:', file.name, file.type, file.size);
    
    // Create form data to send file
    const formData = new FormData();
    formData.append('file', file);
    
    console.log('Sending to API route /api/parse-resume...');
    
    // Send to API route for server-side parsing
    const response = await fetch('/api/parse-resume', {
      method: 'POST',
      body: formData,
    }).catch((fetchError) => {
      console.error('Fetch error:', fetchError);
      throw new Error('Unable to connect to PDF parsing service. Please restart the dev server (Ctrl+C, then npm run dev).');
    });
    
    console.log('API Response status:', response.status, response.statusText);
    
    // Get response text first
    const responseText = await response.text();
    console.log('API Response:', responseText.substring(0, 500));
    
    // Try to parse as JSON
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('Failed to parse API response as JSON:', parseError);
      throw new Error('Invalid response from parsing service. Response: ' + responseText.substring(0, 100));
    }
    
    if (!response.ok) {
      console.error('API Error:', result);
      const errorMsg = result.details || result.error || 'Failed to parse PDF';
      throw new Error(errorMsg);
    }
    
    console.log('PDF parsed successfully. Text length:', result.text?.length || 0, 'Pages:', result.pages);
    
    if (!result.text || result.text.trim().length === 0) {
      throw new Error('No text content found in PDF. It may be a scanned image or corrupted. Try converting to DOCX format.');
    }
    
    return result.text;
  } catch (error) {
    console.error('Error parsing PDF:', error);
    
    if (error instanceof Error) {
      // Provide helpful error messages
      if (error.message.includes('restart the dev server')) {
        throw error; // Already has helpful message
      }
      if (error.message.includes('scanned')) {
        throw error; // Already has helpful message
      }
      if (error.message.includes('password')) {
        throw new Error('PDF is password-protected. Please remove the password and try again.');
      }
      if (error.message.includes('Invalid response')) {
        throw error; // Already has response details
      }
      throw error;
    }
    
    throw new Error('Failed to parse PDF file. Try converting to DOCX or TXT format, or restart the dev server.');
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
    
    if (!result.value || result.value.trim().length === 0) {
      throw new Error('No text content found in DOCX file');
    }
    
    return result.value;
  } catch (error) {
    console.error('Error parsing DOCX:', error);
    throw new Error('Failed to parse DOCX file. Please ensure the file is not corrupted.');
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
  
  // Validate file first
  const validation = validateResumeFile(file);
  if (!validation.valid) {
    throw new Error(validation.error || 'Invalid file');
  }
  
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  let rawText = '';
  
  try {
    // Parse based on file type
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      rawText = await parsePDF(file);
    } else if (
      fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
      fileType === 'application/msword' ||
      fileName.endsWith('.docx') ||
      fileName.endsWith('.doc')
    ) {
      rawText = await parseDOCX(file);
    } else if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
      rawText = await file.text();
    } else {
      throw new Error(`Unsupported file type: ${fileType}. Please upload PDF, DOCX, or TXT file.`);
    }
    
    // Validate extracted text
    if (!rawText || rawText.trim().length < 50) {
      throw new Error('Extracted text is too short. Please ensure your resume has readable content.');
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
  } catch (error) {
    console.error('Resume parsing error:', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to parse resume. Please try a different file.');
  }
}

/**
 * Validate resume file
 */
export function validateResumeFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/msword', // .doc
    'text/plain', // .txt
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
      error: 'Only .txt, .doc, or .docx files are accepted. PDF format is not supported.',
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
