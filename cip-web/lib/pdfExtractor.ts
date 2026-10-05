import * as pdfjsLib from 'pdfjs-dist';

// Set worker path for PDF.js - use local worker file from public folder
if (typeof window !== 'undefined') {
  // Try local worker first (no CORS issues), fallback to CDN if needed
  pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.mjs';
}

/**
 * Extract text content from a PDF file
 * @param file - PDF file to extract text from
 * @returns Extracted text content
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load PDF document
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;

    let fullText = '';

    // Extract text from each page
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Combine text items with spaces
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');

      fullText += pageText + '\n\n';
    }

    return fullText.trim();
  } catch (error) {
    console.error('❌ [PDF Extractor] Extraction failed:', error);
    throw new Error(`Failed to extract text from PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate resume text from profile data (fallback)
 * @param profileData - User profile data
 * @returns Formatted resume text
 */
export function generateResumeFromProfile(profileData: {
  name?: string;
  email?: string;
  phone?: string;
  college?: string;
  branch?: string;
  year?: number;
  cgpa?: string | number;
  skills?: string[];
  linkedin?: string;
  github?: string;
}): string {
  const sections: string[] = [];
  
  // Header
  if (profileData.name) {
    sections.push(`NAME: ${profileData.name}`);
  }
  
  // Contact
  const contact: string[] = [];
  if (profileData.email) contact.push(`Email: ${profileData.email}`);
  if (profileData.phone) contact.push(`Phone: ${profileData.phone}`);
  if (profileData.linkedin) contact.push(`LinkedIn: ${profileData.linkedin}`);
  if (profileData.github) contact.push(`GitHub: ${profileData.github}`);
  if (contact.length > 0) {
    sections.push(`\nCONTACT:\n${contact.join('\n')}`);
  }
  
  // Education
  if (profileData.college || profileData.branch) {
    const education: string[] = [];
    if (profileData.college) education.push(`Institution: ${profileData.college}`);
    if (profileData.branch) education.push(`Branch: ${profileData.branch}`);
    if (profileData.year) education.push(`Year: ${profileData.year}`);
    if (profileData.cgpa) education.push(`CGPA: ${profileData.cgpa}`);
    sections.push(`\nEDUCATION:\n${education.join('\n')}`);
  }
  
  // Skills
  if (profileData.skills && profileData.skills.length > 0) {
    sections.push(`\nSKILLS:\n${profileData.skills.join(', ')}`);
  }
  
  return sections.join('\n');
}
