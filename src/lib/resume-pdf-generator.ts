'use client';

/**
 * Resume PDF Generator Service
 * Creates professional resume PDFs with customizable themes
 */

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ResumeData, ResumeTheme } from '@/lib/types';

// Default theme configurations
export const RESUME_THEMES: Record<string, ResumeTheme> = {
  formal: {
    id: 'formal',
    name: 'Formal',
    primaryColor: '#1a365d',
    secondaryColor: '#2d3748',
    accentColor: '#3182ce',
    fontFamily: 'Times',
    fontSize: 11,
    headerFontSize: 14,
    spacing: 'comfortable',
  },
  modern: {
    id: 'modern',
    name: 'Modern',
    primaryColor: '#2563eb',
    secondaryColor: '#374151',
    accentColor: '#60a5fa',
    fontFamily: 'Helvetica',
    fontSize: 10,
    headerFontSize: 13,
    spacing: 'compact',
  },
  creative: {
    id: 'creative',
    name: 'Creative',
    primaryColor: '#7c3aed',
    secondaryColor: '#4b5563',
    accentColor: '#a78bfa',
    fontFamily: 'Helvetica',
    fontSize: 11,
    headerFontSize: 14,
    spacing: 'comfortable',
  },
  minimal: {
    id: 'minimal',
    name: 'Minimal',
    primaryColor: '#000000',
    secondaryColor: '#374151',
    accentColor: '#6b7280',
    fontFamily: 'Helvetica',
    fontSize: 10,
    headerFontSize: 12,
    spacing: 'compact',
  },
};

/**
 * Generate professional resume PDF
 */
export async function generateResumePDF(
  resumeData: ResumeData,
  themeId: string = 'modern'
): Promise<Blob> {
  const theme = RESUME_THEMES[themeId] || RESUME_THEMES.modern;
  const doc = new jsPDF();
  
  let yPosition = 20;
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // Helper function to add section header
  const addSectionHeader = (title: string) => {
    yPosition += 10;
    doc.setFontSize(theme.headerFontSize);
    doc.setTextColor(theme.primaryColor);
    doc.setFont(theme.fontFamily, 'bold');
    doc.text(title.toUpperCase(), margin, yPosition);
    
    // Add underline
    yPosition += 2;
    doc.setDrawColor(theme.accentColor);
    doc.setLineWidth(0.5);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;
  };

  // Helper function to add text with word wrap
  const addText = (text: string, isBold = false, color?: string) => {
    doc.setFontSize(theme.fontSize);
    doc.setTextColor(color || theme.secondaryColor);
    doc.setFont(theme.fontFamily, isBold ? 'bold' : 'normal');
    
    const lines = doc.splitTextToSize(text, contentWidth);
    lines.forEach((line: string) => {
      if (yPosition > doc.internal.pageSize.getHeight() - 20) {
        doc.addPage();
        yPosition = 20;
      }
      doc.text(line, margin, yPosition);
      yPosition += 6;
    });
  };

  // Helper function to check page break
  const checkPageBreak = (heightNeeded: number = 30) => {
    if (yPosition + heightNeeded > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      yPosition = 20;
    }
  };

  // 1. HEADER - Personal Info
  doc.setFontSize(20);
  doc.setTextColor(theme.primaryColor);
  doc.setFont(theme.fontFamily, 'bold');
  doc.text(resumeData.personalInfo.name, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Contact info
  doc.setFontSize(10);
  doc.setTextColor(theme.secondaryColor);
  doc.setFont(theme.fontFamily, 'normal');
  
  const contactInfo: string[] = [];
  if (resumeData.personalInfo.email) contactInfo.push(resumeData.personalInfo.email);
  if (resumeData.personalInfo.phone) contactInfo.push(resumeData.personalInfo.phone);
  if (resumeData.personalInfo.location) contactInfo.push(resumeData.personalInfo.location);
  
  if (contactInfo.length > 0) {
    doc.text(contactInfo.join(' | '), pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
  }

  // Links
  const links: string[] = [];
  if (resumeData.personalInfo.linkedin) links.push(resumeData.personalInfo.linkedin);
  if (resumeData.personalInfo.github) links.push(resumeData.personalInfo.github);
  if (resumeData.personalInfo.portfolio) links.push(resumeData.personalInfo.portfolio);
  
  if (links.length > 0) {
    doc.setTextColor(theme.accentColor);
    doc.text(links.join(' | '), pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 5;
  }

  // 2. SUMMARY
  if (resumeData.summary) {
    addSectionHeader('Professional Summary');
    addText(resumeData.summary);
  }

  // 3. EXPERIENCE
  if (resumeData.experience && resumeData.experience.length > 0) {
    checkPageBreak(40);
    addSectionHeader('Experience');
    
    resumeData.experience.forEach((exp) => {
      checkPageBreak(35);
      
      // Role and title
      doc.setFontSize(theme.fontSize + 1);
      doc.setTextColor(theme.primaryColor);
      doc.setFont(theme.fontFamily, 'bold');
      doc.text(exp.role, margin, yPosition);
      yPosition += 6;
      
      // Company and duration
      doc.setFontSize(theme.fontSize);
      doc.setTextColor(theme.secondaryColor);
      doc.setFont(theme.fontFamily, 'italic');
      doc.text(`${exp.company} | ${exp.duration}`, margin, yPosition);
      yPosition += 8;
      
      // Description bullets
      if (exp.description) {
        doc.setFont(theme.fontFamily, 'normal');
        const bullets = exp.description.split('\n').filter(line => line.trim());
        bullets.forEach((bullet) => {
          const cleanBullet = bullet.replace(/^[-•*]\s*/, '');
          const lines = doc.splitTextToSize(`• ${cleanBullet}`, contentWidth - 5);
          lines.forEach((line: string, index: number) => {
            if (yPosition > doc.internal.pageSize.getHeight() - 20) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, index === 0 ? margin + 2 : margin + 5, yPosition);
            yPosition += 5;
          });
        });
      }
      
      // Achievements
      if (exp.achievements && exp.achievements.length > 0) {
        exp.achievements.forEach((achievement) => {
          const lines = doc.splitTextToSize(`• ${achievement}`, contentWidth - 5);
          lines.forEach((line: string, index: number) => {
            if (yPosition > doc.internal.pageSize.getHeight() - 20) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(line, index === 0 ? margin + 2 : margin + 5, yPosition);
            yPosition += 5;
          });
        });
      }
      yPosition += 3;
    });
  }

  // 4. EDUCATION
  if (resumeData.education && resumeData.education.length > 0) {
    checkPageBreak(40);
    addSectionHeader('Education');
    
    resumeData.education.forEach((edu) => {
      checkPageBreak(25);
      
      doc.setFontSize(theme.fontSize + 1);
      doc.setTextColor(theme.primaryColor);
      doc.setFont(theme.fontFamily, 'bold');
      doc.text(edu.degree, margin, yPosition);
      yPosition += 6;
      
      doc.setFontSize(theme.fontSize);
      doc.setTextColor(theme.secondaryColor);
      doc.setFont(theme.fontFamily, 'italic');
      doc.text(`${edu.institution} | ${edu.year}`, margin, yPosition);
      yPosition += 6;
      
      if (edu.gpa) {
        doc.setFont(theme.fontFamily, 'normal');
        doc.text(`GPA: ${edu.gpa}`, margin, yPosition);
        yPosition += 6;
      }
      yPosition += 2;
    });
  }

  // 5. SKILLS
  if (resumeData.skills && resumeData.skills.length > 0) {
    checkPageBreak(30);
    addSectionHeader('Skills');
    
    // Skills are already grouped by category
    resumeData.skills.forEach((skillGroup) => {
      checkPageBreak(15);
      doc.setFontSize(theme.fontSize);
      doc.setTextColor(theme.primaryColor);
      doc.setFont(theme.fontFamily, 'bold');
      doc.text(`${skillGroup.category}:`, margin, yPosition);
      
      doc.setTextColor(theme.secondaryColor);
      doc.setFont(theme.fontFamily, 'normal');
      const skillsText = skillGroup.items.join(' • ');
      const lines = doc.splitTextToSize(skillsText, contentWidth - 30);
      
      lines.forEach((line: string, index: number) => {
        if (yPosition > doc.internal.pageSize.getHeight() - 20) {
          doc.addPage();
          yPosition = 20;
        }
        doc.text(line, index === 0 ? margin + 30 : margin, yPosition);
        yPosition += 5;
      });
      yPosition += 2;
    });
  }

  // 6. PROJECTS
  if (resumeData.projects && resumeData.projects.length > 0) {
    checkPageBreak(40);
    addSectionHeader('Projects');
    
    resumeData.projects.forEach((project) => {
      checkPageBreak(30);
      
      doc.setFontSize(theme.fontSize + 1);
      doc.setTextColor(theme.primaryColor);
      doc.setFont(theme.fontFamily, 'bold');
      doc.text(project.name, margin, yPosition);
      yPosition += 6;
      
      if (project.technologies) {
        doc.setFontSize(theme.fontSize);
        doc.setTextColor(theme.accentColor);
        doc.setFont(theme.fontFamily, 'italic');
        doc.text(project.technologies.join(', '), margin, yPosition);
        yPosition += 6;
      }
      
      if (project.description) {
        doc.setFont(theme.fontFamily, 'normal');
        doc.setTextColor(theme.secondaryColor);
        const lines = doc.splitTextToSize(project.description, contentWidth);
        lines.forEach((line: string) => {
          if (yPosition > doc.internal.pageSize.getHeight() - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 5;
        });
      }
      
      if (project.link) {
        doc.setTextColor(theme.accentColor);
        doc.textWithLink('View Project', margin, yPosition, { url: project.link });
        yPosition += 6;
      }
      yPosition += 2;
    });
  }

  // 7. CERTIFICATIONS
  if (resumeData.certifications && resumeData.certifications.length > 0) {
    checkPageBreak(30);
    addSectionHeader('Certifications');
    
    resumeData.certifications.forEach((cert) => {
      checkPageBreak(15);
      
      doc.setFontSize(theme.fontSize);
      doc.setTextColor(theme.primaryColor);
      doc.setFont(theme.fontFamily, 'bold');
      doc.text(`• ${cert.name}`, margin, yPosition);
      yPosition += 5;
      
      doc.setTextColor(theme.secondaryColor);
      doc.setFont(theme.fontFamily, 'italic');
      const issuerText = `${cert.issuer}${cert.date ? ' | ' + cert.date : ''}`;
      doc.text(issuerText, margin + 5, yPosition);
      yPosition += 7;
    });
  }

  // Return as Blob
  return doc.output('blob');
}

/**
 * Download resume PDF
 */
export async function downloadResume(
  resumeData: ResumeData,
  themeId: string = 'modern',
  filename?: string
): Promise<void> {
  const blob = await generateResumePDF(resumeData, themeId);
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `${resumeData.personalInfo.name.replace(/\s+/g, '_')}_Resume.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Preview resume PDF in new tab
 */
export async function previewResume(
  resumeData: ResumeData,
  themeId: string = 'modern'
): Promise<void> {
  const blob = await generateResumePDF(resumeData, themeId);
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank');
}
