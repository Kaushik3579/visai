// ACRON AI Engine service using Gemini API

const GEMINI_API_KEY = 'AIzaSyCm-GTR9vcPVNSlqwBzAf7QyYYnIP_T3Ds';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent';

/**
 * Call Gemini API with a prompt
 */
const callGeminiAPI = async (prompt, temperature = 0.3) => {
  try {
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
          temperature: temperature,
          maxOutputTokens: 2000,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.statusText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates[0].content.parts[0].text;
    
    return generatedText;
  } catch (error) {
    console.error('ACRON API Error:', error);
    throw error;
  }
};

/**
 * Grammar Check - Identifies grammar issues and provides corrected text
 */
export const checkGrammar = async (selectedText) => {
  if (!selectedText || selectedText.trim().length === 0) {
    throw new Error('No text selected');
  }

  const prompt = `You are a grammar checking assistant.

Analyze the following text for grammar and syntax errors.

IMPORTANT: Respond in this EXACT JSON format:
{
  "mistakes": [
    {"error": "description of error", "correction": "corrected version"}
  ],
  "correctedText": "full corrected text here"
}

Text to check:
"""
${selectedText}
"""

Respond ONLY with valid JSON. No explanations, just the JSON.`;

  try {
    const response = await callGeminiAPI(prompt, 0.2);
    
    // Remove markdown code blocks if present
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const result = JSON.parse(cleanResponse);
    return result;
  } catch (error) {
    console.error('Grammar check error:', error);
    throw new Error('Failed to check grammar. Please try again.');
  }
};

/**
 * Spell Check - Identifies spelling errors and provides corrected text
 */
export const checkSpelling = async (selectedText) => {
  if (!selectedText || selectedText.trim().length === 0) {
    throw new Error('No text selected');
  }

  const prompt = `You are a spelling checking assistant.

Check the following text for spelling errors and typos.

IMPORTANT: Respond in this EXACT JSON format:
{
  "mistakes": [
    {"error": "misspelled word", "correction": "correct spelling"}
  ],
  "correctedText": "full corrected text here"
}

Text to check:
"""
${selectedText}
"""

Respond ONLY with valid JSON. No explanations, just the JSON.`;

  try {
    const response = await callGeminiAPI(prompt, 0.1);
    
    // Remove markdown code blocks if present
    const cleanResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    const result = JSON.parse(cleanResponse);
    return result;
  } catch (error) {
    console.error('Spell check error:', error);
    throw new Error('Failed to check spelling. Please try again.');
  }
};

/**
 * Summarize - Generates a summary of the selected text
 */
export const summarizeText = async (selectedText, summaryType = 'brief') => {
  if (!selectedText || selectedText.trim().length === 0) {
    throw new Error('No text selected');
  }

  const lengthInstruction = summaryType === 'brief' 
    ? 'Create a brief, concise summary in 2-3 sentences.'
    : 'Create a detailed summary covering all main points in 1-2 paragraphs.';

  const prompt = `You are a text summarization assistant.

${lengthInstruction}

Text to summarize:
"""
${selectedText}
"""

Provide only the summary, no additional explanation.`;

  try {
    const summary = await callGeminiAPI(prompt, 0.4);
    return summary.trim();
  } catch (error) {
    console.error('Summarize error:', error);
    throw new Error('Failed to summarize text. Please try again.');
  }
};

/**
 * Generate Citation - Creates a citation from the selected text
 */
export const generateCitation = async (selectedText, citationStyle = 'APA') => {
  if (!selectedText || selectedText.trim().length === 0) {
    throw new Error('No text selected');
  }

  const prompt = `You are a citation generation assistant.

Extract information from the text below and generate a citation in ${citationStyle} format.

Text:
"""
${selectedText}
"""

Generate ONLY the citation in ${citationStyle} format. No explanations.`;

  try {
    const citation = await callGeminiAPI(prompt, 0.2);
    return citation.trim();
  } catch (error) {
    console.error('Citation generation error:', error);
    throw new Error('Failed to generate citation. Please try again.');
  }
};

/**
 * Calculate similarity between two texts using word overlap
 */
const calculateSimilarity = (text1, text2) => {
  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  let intersection = 0;
  set1.forEach(word => {
    if (set2.has(word)) intersection++;
  });
  
  const union = set1.size + set2.size - intersection;
  return union > 0 ? (intersection / union) * 100 : 0;
};

/**
 * Inline Citation Engine - Compares selected text with uploaded PDFs
 * Checks for similarity and generates inline citations
 */
export const generateInlineCitation = async (selectedText, pdfs) => {
  if (!selectedText || selectedText.trim().length === 0) {
    throw new Error('No text selected');
  }

  if (!pdfs || pdfs.length === 0) {
    throw new Error('No PDFs available for citation matching');
  }

  try {
    // Calculate similarity with each PDF
    const similarities = [];
    
    for (const pdf of pdfs) {
      // Get PDF content/metadata text for comparison
      const pdfText = [
        pdf.metadata?.title || '',
        pdf.metadata?.authors || '',
        pdf.metadata?.abstract || '',
        pdf.content || '' // If PDF has extracted text content
      ].join(' ');
      
      if (pdfText.trim().length < 10) continue; // Skip PDFs with no content
      
      const similarity = calculateSimilarity(selectedText, pdfText);
      
      if (similarity > 5) { // Only include PDFs with >5% similarity
        similarities.push({
          pdf: pdf,
          similarity: similarity,
          metadata: pdf.metadata || {}
        });
      }
    }
    
    // Sort by similarity (highest first)
    similarities.sort((a, b) => b.similarity - a.similarity);
    
    // Get top 3 matches
    const topMatches = similarities.slice(0, 3);
    
    if (topMatches.length === 0) {
      return {
        matches: [],
        inlineCitations: [],
        message: 'No similar references found in your uploaded PDFs.'
      };
    }
    
    // Generate inline citations for matches
    const inlineCitations = topMatches.map(match => {
      const meta = match.metadata;
      const authors = meta.authors ? meta.authors.split(',')[0].trim() : 'Unknown';
      const year = meta.year || 'n.d.';
      
      // Extract last name only
      const lastName = authors.includes(' ') 
        ? authors.split(' ').pop() 
        : authors;
      
      return {
        citation: `(${lastName}, ${year})`,
        fullCitation: generateFullCitation(meta),
        similarity: match.similarity.toFixed(1),
        pdfName: match.pdf.name,
        pdfId: match.pdf.id
      };
    });
    
    return {
      matches: topMatches,
      inlineCitations: inlineCitations,
      message: `Found ${topMatches.length} similar reference(s) in your PDFs.`
    };
    
  } catch (error) {
    console.error('Inline citation error:', error);
    throw new Error('Failed to generate inline citation. Please try again.');
  }
};

/**
 * Generate full citation in APA format
 */
const generateFullCitation = (metadata) => {
  const parts = [];
  
  if (metadata.authors) {
    parts.push(metadata.authors);
  }
  
  if (metadata.year) {
    parts.push(`(${metadata.year})`);
  }
  
  if (metadata.title) {
    parts.push(metadata.title);
  }
  
  if (metadata.journal) {
    let journalPart = metadata.journal;
    if (metadata.volume) {
      journalPart += `, ${metadata.volume}`;
      if (metadata.issue) {
        journalPart += `(${metadata.issue})`;
      }
    }
    if (metadata.pages) {
      journalPart += `, ${metadata.pages}`;
    }
    parts.push(journalPart);
  }
  
  if (metadata.doi) {
    parts.push(`https://doi.org/${metadata.doi}`);
  }
  
  return parts.join('. ') + '.';
};

