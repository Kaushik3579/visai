// Gemini API service for extracting bibliographic metadata from PDFs
import * as pdfjsLib from 'pdfjs-dist';

// Configure worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 
  `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

const GEMINI_API_KEY = 'AIzaSyCm-GTR9vcPVNSlqwBzAf7QyYYnIP_T3Ds';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

/**
 * Extract text from PDF file (first 10 pages for metadata extraction)
 */
export const extractTextFromPDF = async (pdfFile) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const typedArray = new Uint8Array(e.target.result);
        
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        const maxPages = Math.min(pdf.numPages, 10); // Only extract first 10 pages
        let fullText = '';
        
        for (let i = 1; i <= maxPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n\n';
        }
        
        resolve(fullText);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = reject;
    reader.readAsArrayBuffer(pdfFile);
  });
};

/**
 * Extract bibliographic metadata using Gemini API
 */
export const extractMetadataWithGemini = async (pdfText, pdfFileName) => {
  try {
    const prompt = `You are a metadata extraction engine.

Your task is to extract academic paper metadata from the provided PDF text.

IMPORTANT RULES:

1. Respond ONLY with valid JSON.
2. Do NOT include explanations.
3. Do NOT include markdown.
4. Do NOT include comments.
5. Do NOT truncate the JSON.
6. All strings must be properly quoted.
7. If a field is not found, return null.
8. Ensure the JSON is syntactically complete and parsable.

Return STRICTLY in this format:

{
  "title": string | null,
  "authors": string | null,
  "year": string | null,
  "journal": string | null,
  "volume": string | null,
  "issue": string | null,
  "pages": string | null,
  "doi": string | null
}

Now extract the metadata from the following text:

---------------------
${pdfText.substring(0, 6000)}
---------------------`;

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 2048,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    console.log('Gemini raw response:', generatedText);
    
    // Extract JSON from response (handle markdown code blocks)
    let jsonText = generatedText.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }
    
    // Clean up common JSON issues
    // Remove any text before the first { and after the last }
    const firstBrace = jsonText.indexOf('{');
    const lastBrace = jsonText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      jsonText = jsonText.substring(firstBrace, lastBrace + 1);
    }
    
    console.log('Cleaned JSON text:', jsonText);
    
    let metadata;
    try {
      metadata = JSON.parse(jsonText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Failed JSON text:', jsonText);
      throw new Error(`Failed to parse Gemini response as JSON: ${parseError.message}`);
    }
    
    // Validate that it's an object with expected fields
    const expectedFields = ['title', 'authors', 'year', 'journal', 'volume', 'issue', 'pages', 'doi'];
    const hasValidStructure = typeof metadata === 'object' && 
                               metadata !== null &&
                               expectedFields.every(field => field in metadata);
    
    if (!hasValidStructure) {
      throw new Error('Invalid metadata format returned by Gemini');
    }
    
    return {
      success: true,
      metadata: {
        ...metadata,
        fileName: pdfFileName,
        extractedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    console.error('Error extracting metadata with Gemini:', error);
    return {
      success: false,
      error: error.message,
      metadata: null
    };
  }
};

/**
 * Main function to process PDF and extract metadata
 */
export const processPDFForMetadata = async (pdfFile) => {
  try {
    // Step 1: Extract text from PDF
    const pdfText = await extractTextFromPDF(pdfFile);
    
    if (!pdfText || pdfText.trim().length < 100) {
      return {
        success: false,
        error: 'Could not extract sufficient text from PDF',
        metadata: null
      };
    }
    
    // Step 2: Extract metadata using Gemini
    const result = await extractMetadataWithGemini(pdfText, pdfFile.name);
    
    return result;
  } catch (error) {
    console.error('Error processing PDF:', error);
    return {
      success: false,
      error: error.message,
      metadata: null
    };
  }
};
