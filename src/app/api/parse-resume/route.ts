import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('API: Received parse-resume request');
  
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    console.log('API: File received:', file?.name, file?.type, file?.size);
    
    if (!file) {
      console.error('API: No file provided');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Get file buffer
    console.log('API: Converting to buffer...');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    console.log('API: Buffer size:', buffer.length);

    // Parse PDF using pdf-parse with better error handling
    console.log('API: Importing pdf-parse...');
    let pdfParse: any;
    try {
      // pdf-parse is a CommonJS module, import it differently
      pdfParse = require('pdf-parse');
      console.log('API: pdf-parse loaded, type:', typeof pdfParse);
    } catch (importError: any) {
      console.error('API: Failed to import pdf-parse:', importError);
      return NextResponse.json(
        { 
          error: 'PDF parsing library not available',
          details: 'Server configuration error. Please contact support.'
        },
        { status: 500 }
      );
    }
    
    console.log('API: Parsing PDF...');
    let data;
    try {
      data = await pdfParse(buffer, {
        max: 0, // Parse all pages
        version: 'v1.10.100' // Specify PDF.js version
      });
    } catch (parseError: any) {
      console.error('API: PDF parse error:', parseError);
      return NextResponse.json(
        { 
          error: 'Failed to parse PDF',
          details: parseError.message || 'The PDF file may be corrupted, password-protected, or contain only images.'
        },
        { status: 400 }
      );
    }
    
    console.log('API: Parse successful. Text length:', data.text?.length, 'Pages:', data.numpages);

    if (!data.text || data.text.trim().length === 0) {
      console.error('API: No text extracted from PDF');
      return NextResponse.json(
        { 
          error: 'No text content found in PDF',
          details: 'The PDF may contain only images (scanned document) or be corrupted. Try converting to DOCX or TXT format.'
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      text: data.text,
      pages: data.numpages,
      info: data.info,
      success: true
    });
  } catch (error: any) {
    console.error('API: PDF parsing error:', error);
    console.error('API: Error stack:', error.stack);
    return NextResponse.json(
      { 
        error: 'Failed to parse PDF file',
        details: error.message || 'Unknown error occurred',
        type: error.name || 'Error'
      },
      { status: 500 }
    );
  }
}
