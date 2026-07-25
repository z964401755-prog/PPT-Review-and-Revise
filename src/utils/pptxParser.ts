import JSZip from 'jszip';
import { PPTFile, Slide, ReviewData } from '../types/ppt';

/**
 * Utility to parse an uploaded .pptx file and build a PPTFile + Slides structure.
 */
export async function parsePPTXFile(file: File): Promise<{ pptFile: PPTFile; initialReviewData: ReviewData }> {
  const pptId = `ppt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const pptName = file.name || '上传的演示文稿.pptx';

  let pageCount = 0;
  const slideTitles: string[] = [];

  try {
    const zip = new JSZip();
    const contents = await zip.loadAsync(file);

    // Find all slide XML files in ppt/slides/slideX.xml
    const slideFiles = Object.keys(contents.files).filter((path) =>
      path.match(/^ppt\/slides\/slide\d+\.xml$/i)
    );

    // Sort by slide index
    slideFiles.sort((a, b) => {
      const matchA = a.match(/\d+/);
      const matchB = b.match(/\d+/);
      const numA = parseInt(matchA ? matchA[0] : '0', 10);
      const numB = parseInt(matchB ? matchB[0] : '0', 10);
      return numA - numB;
    });

    pageCount = slideFiles.length;

    // Extract text/titles from each slide XML
    for (let i = 0; i < slideFiles.length; i++) {
      const path = slideFiles[i];
      const xmlText = await contents.files[path].async('string');

      // Simple regex extraction for slide text/title
      const textMatches = Array.from(xmlText.matchAll(/<a:t[^>]*>(.*?)<\/a:t>/gi)).map((m) => m[1]);
      const slideTitle = textMatches.length > 0 ? textMatches.slice(0, 3).join(' ') : `第 ${i + 1} 页 PPT 内容`;
      slideTitles.push(slideTitle.substring(0, 30));
    }
  } catch (err) {
    console.warn('Zip parsing error fallback to default generated structure:', err);
  }

  // Fallback if zero slides detected
  if (pageCount === 0) {
    pageCount = 8;
  }

  // Color theme generator for slide backgrounds
  const gradients = [
    'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
    'linear-gradient(135deg, #13547a 0%, #80d0c7 100%)',
    'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)',
    'linear-gradient(135deg, #09203f 0%, #537895 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  ];

  const slides: Slide[] = Array.from({ length: pageCount }, (_, i) => {
    const pageNum = i + 1;
    const extractedTitle = slideTitles[i] || `Slide ${pageNum} - 网页导入内容`;
    return {
      id: `${pptId}_s${pageNum}`,
      pageNumber: pageNum,
      title: extractedTitle.length > 2 ? extractedTitle : `第 ${pageNum} 页 PPT - 核心视觉与数据汇报`,
      thumbnail: gradients[i % gradients.length],
      status: 'normal',
      commentCount: 0,
    };
  });

  const pptFile: PPTFile = {
    id: pptId,
    name: pptName,
    totalPages: pageCount,
    reviewerName: '网页在线审阅人',
    slides,
  };

  const initialReviewData: ReviewData = {
    pptId,
    pptName,
    reviewer: '领导 / 在线审阅人',
    createdAt: new Date().toISOString().split('T')[0],
    updatedAt: new Date().toISOString().split('T')[0],
    comments: [],
  };

  return { pptFile, initialReviewData };
}

/**
 * Encode active PPT review data into a URL hash or search string for direct web link sharing
 */
export function generateShareUrl(pptFile: PPTFile, reviewData: ReviewData): string {
  try {
    const sharePayload = {
      ppt: pptFile,
      reviewData,
      v: 1,
      ts: Date.now(),
    };
    const jsonStr = JSON.stringify(sharePayload);
    // Base64 encode
    const encoded = encodeURIComponent(btoa(unescape(encodeURIComponent(jsonStr))));
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return `${baseUrl}?shareData=${encoded}`;
  } catch (err) {
    console.error('Failed to generate share URL:', err);
    return window.location.href;
  }
}

/**
 * Parse share payload from URL search parameter
 */
export function parseShareUrl(): { pptFile: PPTFile; reviewData: ReviewData } | null {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const encodedData = urlParams.get('shareData');
    if (!encodedData) return null;

    const jsonStr = decodeURIComponent(escape(atob(decodeURIComponent(encodedData))));
    const parsed = JSON.parse(jsonStr);

    if (parsed && parsed.ppt && parsed.reviewData) {
      return {
        pptFile: parsed.ppt,
        reviewData: parsed.reviewData,
      };
    }
  } catch (err) {
    console.warn('Failed to parse share URL data:', err);
  }
  return null;
}
