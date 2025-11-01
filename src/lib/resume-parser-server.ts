'use server';

/**
 * Server-side Resume Parser
 * Handles PDF parsing using pdf-parse (Node.js only)
 */

export async function parsePDFServer(fileBuffer: ArrayBuffer): Promise<string> {
  try {
    // Use dynamic import and access the actual function
    const pdfParseModule = await import('pdf-parse');
    // @ts-ignore - pdf-parse has complex module structure
    const pdfParse = pdfParseModule.default || pdfParseModule;
    
    const buffer = Buffer.from(fileBuffer);
    const data = await pdfParse(buffer);
    return data.text;
  } catch (error) {
    console.error('Server-side PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}

export async function parsePDFFromFile(formData: FormData): Promise<string> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      throw new Error('No file provided');
    }

    const arrayBuffer = await file.arrayBuffer();
    return await parsePDFServer(arrayBuffer);
  } catch (error) {
    console.error('Server-side PDF parsing error:', error);
    throw new Error('Failed to parse PDF file');
  }
}
