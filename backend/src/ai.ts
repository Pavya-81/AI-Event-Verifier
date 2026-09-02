import { GoogleGenAI } from '@google/genai';
import fs from 'fs';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || 'fake-key' });

function normalizeNumber(value: unknown, fallback: number): number {
  const numeric = Number(value);
  if (Number.isFinite(numeric)) {
    return Math.max(0, Math.min(100, numeric));
  }
  return fallback;
}

function normalizeRisk(value: unknown, fallback: 'LOW' | 'MEDIUM' | 'HIGH' = 'MEDIUM'): 'LOW' | 'MEDIUM' | 'HIGH' {
  const normalized = String(value || '').toUpperCase();
  if (normalized === 'LOW' || normalized === 'MEDIUM' || normalized === 'HIGH') {
    return normalized;
  }
  return fallback;
}

function normalizeRecommendation(value: unknown, fallback: 'MANUAL_REVIEW' | 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT' = 'MANUAL_REVIEW') {
  const normalized = String(value || '').toUpperCase();
  if (['APPROVE', 'MANUAL_REVIEW', 'REQUEST_CHANGES', 'REJECT'].includes(normalized)) {
    return normalized as 'MANUAL_REVIEW' | 'APPROVE' | 'REQUEST_CHANGES' | 'REJECT';
  }
  return fallback;
}

function normalizeFindings(findings: unknown): Array<{ severity: string; source: string; message: string }> {
  if (!Array.isArray(findings)) {
    return [];
  }

  return findings
    .map((finding) => {
      if (!finding || typeof finding !== 'object') return null;
      const entry = finding as Record<string, unknown>;
      const message = String(entry.message || entry.summary || 'Verification signal detected');
      const source = String(entry.source || 'description').toLowerCase();
      const severity = String(entry.severity || 'medium').toLowerCase();

      if (!['low', 'medium', 'high'].includes(severity)) {
        return null;
      }

      return {
        severity,
        source: ['description', 'poster', 'url', 'duplicate'].includes(source) ? source : 'description',
        message,
      };
    })
    .filter(Boolean) as Array<{ severity: string; source: string; message: string }>;
}

export function parseGeminiVerificationResponse(raw: string | null | undefined) {
  if (!raw || !raw.trim()) {
    return null;
  }

  try {
    const cleaned = raw.trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    const candidate = jsonMatch ? jsonMatch[0] : cleaned;
    const parsed = JSON.parse(candidate);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export async function runAIVerification(event: any, imagePath: string | null, candidates: any[]) {
  if (!process.env.GEMINI_API_KEY) {
    console.warn('No GEMINI_API_KEY provided. Returning fallback results.');
    return null;
  }

  const prompt = `You are the EventShield AI Verification System.
Analyze the event submission and poster truthfully. Detect mismatches between submitted details and poster content. Do not invent data. If the poster date differs from the form date, call out POSTER / EVENT MISMATCH with both dates.

Return valid JSON only with this exact shape:
{
  "qualityScore": 0,
  "trustScore": 0,
  "riskLevel": "LOW",
  "confidence": 0,
  "recommendation": "APPROVE",
  "summary": "string",
  "explanation": "string",
  "suggestedActions": ["string"],
  "descriptionResult": {
    "qualityScore": 0,
    "trustScore": 0,
    "missingInformation": ["string"],
    "spamProbability": 0,
    "issues": ["string"]
  },
  "imageResult": {
    "qualityScore": 0,
    "trustScore": 0,
    "extractedInformation": "string or null",
    "mismatches": ["string"],
    "issues": ["string"]
  },
  "urlResult": {
    "qualityScore": 0,
    "trustScore": 0,
    "urlHost": "string",
    "qrDetected": false,
    "qrUrl": "string or null",
    "issues": ["string"]
  },
  "findings": [
    { "severity": "low", "source": "poster", "message": "string" }
  ]
}

Event details:
Title: ${event.title}
Description: ${event.description}
Category: ${event.category}
Date: ${event.eventDate}
Venue: ${event.venue}
Location: ${event.location}
Registration URL: ${event.registrationUrl || 'None'}
Contact Email: ${event.contactEmail}

Potential duplicate candidates:
${JSON.stringify(candidates, null, 2)}
`;

  const contents: any[] = [{ text: prompt }];

  if (imagePath && fs.existsSync(imagePath)) {
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const mimeType = imagePath.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';
    contents.push({ inlineData: { data: base64Image, mimeType } });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const parsed = parseGeminiVerificationResponse(response.text);
    if (!parsed) {
      return null;
    }

    const descriptionResult = {
      qualityScore: normalizeNumber(parsed.descriptionResult?.qualityScore ?? parsed.qualityScore ?? 70, 70),
      trustScore: normalizeNumber(parsed.descriptionResult?.trustScore ?? parsed.trustScore ?? 70, 70),
      missingInformation: Array.isArray(parsed.descriptionResult?.missingInformation) ? parsed.descriptionResult.missingInformation.map(String) : [],
      spamProbability: Number(parsed.descriptionResult?.spamProbability ?? 0),
      issues: Array.isArray(parsed.descriptionResult?.issues) ? parsed.descriptionResult.issues.map(String) : [],
    };

    const imageResult = {
      qualityScore: normalizeNumber(parsed.imageResult?.qualityScore ?? parsed.qualityScore ?? 70, 70),
      trustScore: normalizeNumber(parsed.imageResult?.trustScore ?? parsed.trustScore ?? 70, 70),
      extractedInformation: parsed.imageResult?.extractedInformation ?? null,
      mismatches: Array.isArray(parsed.imageResult?.mismatches) ? parsed.imageResult.mismatches.map(String) : [],
      issues: Array.isArray(parsed.imageResult?.issues) ? parsed.imageResult.issues.map(String) : [],
    };

    const urlResult = {
      qualityScore: normalizeNumber(parsed.urlResult?.qualityScore ?? 70, 70),
      trustScore: normalizeNumber(parsed.urlResult?.trustScore ?? 70, 70),
      urlHost: String(parsed.urlResult?.urlHost || ''),
      qrDetected: Boolean(parsed.urlResult?.qrDetected),
      qrUrl: parsed.urlResult?.qrUrl ?? null,
      issues: Array.isArray(parsed.urlResult?.issues) ? parsed.urlResult.issues.map(String) : [],
    };

    const findings = normalizeFindings(parsed.findings);

    return {
      qualityScore: normalizeNumber(parsed.qualityScore ?? 70, 70),
      trustScore: normalizeNumber(parsed.trustScore ?? 70, 70),
      riskLevel: normalizeRisk(parsed.riskLevel, 'MEDIUM'),
      confidence: normalizeNumber(parsed.confidence ?? 80, 80),
      recommendation: normalizeRecommendation(parsed.recommendation, 'MANUAL_REVIEW'),
      summary: String(parsed.summary || 'Verification completed.'),
      explanation: String(parsed.explanation || parsed.summary || 'The system reviewed the event and poster for quality and trust issues.'),
      suggestedActions: Array.isArray(parsed.suggestedActions) ? parsed.suggestedActions.map(String).slice(0, 5) : [],
      descriptionResult,
      imageResult,
      urlResult,
      findings,
    };
  } catch (error) {
    console.error('AI Verification Error:', error);
    return null;
  }
}
