import { parseGeminiVerificationResponse } from '../src/ai';

describe('Gemini verification parsing', () => {
  it('detects poster-to-event date mismatches and preserves structured fields', () => {
    const raw = `
    {
      "qualityScore": 48,
      "trustScore": 36,
      "riskLevel": "HIGH",
      "confidence": 92,
      "recommendation": "REQUEST_CHANGES",
      "summary": "Poster date conflicts with the submitted event date.",
      "explanation": "The poster clearly lists September 17, 2026 while the form states September 15, 2026.",
      "suggestedActions": [
        "Correct the poster date.",
        "Confirm the event date in the registration link."
      ],
      "descriptionResult": {
        "qualityScore": 70,
        "trustScore": 68,
        "missingInformation": ["venue"],
        "spamProbability": 0.12,
        "issues": ["Event details are mostly complete."]
      },
      "imageResult": {
        "qualityScore": 88,
        "trustScore": 80,
        "extractedInformation": "Poster date reads September 17, 2026.",
        "mismatches": ["Poster date differs from event date: September 17, 2026 vs September 15, 2026."],
        "issues": ["Poster/event mismatch detected."]
      },
      "urlResult": {
        "qualityScore": 73,
        "trustScore": 75,
        "urlHost": "example.com",
        "qrDetected": false,
        "qrUrl": null,
        "issues": []
      },
      "findings": [
        {
          "severity": "high",
          "source": "poster",
          "message": "POSTER / EVENT MISMATCH: Poster date is September 17, 2026 while the event date is September 15, 2026."
        }
      ]
    }
    `;

    const result = parseGeminiVerificationResponse(raw);

    expect(result).not.toBeNull();
    expect(result?.riskLevel).toBe('HIGH');
    expect(result?.findings[0]?.message).toContain('POSTER / EVENT MISMATCH');
    expect(result?.explanation).toContain('September 17, 2026');
    expect(result?.suggestedActions).toContain('Correct the poster date.');
  });

  it('returns null for malformed AI JSON', () => {
    expect(parseGeminiVerificationResponse('not-json')).toBeNull();
  });
});
