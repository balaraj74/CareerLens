import { NextResponse } from 'next/server';
import { scrapeNPTELCourses } from '@/lib/web-scraper-service';

export async function GET() {
  try {
    const courses = await scrapeNPTELCourses();
    
    return NextResponse.json({
      success: true,
      count: courses.length,
      sample: courses[0] || null,
      message: `Successfully scraped ${courses.length} courses from NPTEL`
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
