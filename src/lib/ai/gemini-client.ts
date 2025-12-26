/*
Copyright (C) 2025 AC
SocialConnect - Gemini AI Client with Web Search
*/

const GEMINI_API_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models';

export interface GeminiResponse {
    content: string;
    error?: string;
    sources?: string[];
}

export interface PartnerVerification {
    nom: string;
    adresse?: string;
    email?: string;
    telephone?: string;
    thematique?: string;
    contact?: string;
    confidence: 'high' | 'medium' | 'low';
    sources: string[];
    changes: {
        field: string;
        oldValue: string;
        newValue: string;
        reason: string;
    }[];
    modelUsed?: string;
}

/**
 * Search and verify partner information using Gemini with grounding
 */
export async function verifyPartnerWithGemini(
    partnerName: string,
    currentData: {
        adresse?: string;
        email?: string;
        telephone?: string;
        thematique?: string;
    },
    config?: {
        apiKey?: string;
        model?: string;
    }
): Promise<{ result: PartnerVerification | null; error?: string }> {
    const apiKey = config?.apiKey || process.env.GEMINI_API_KEY;
    const modelId = config?.model || 'gemini-3-flash-preview';

    if (!apiKey) {
        return { result: null, error: 'Clé API Gemini non configurée' };
    }

    const prompt = `Tu es un assistant spécialisé dans la vérification des coordonnées d'organisations en Belgique.

Recherche et vérifie les informations de contact de cette organisation:
**Nom:** ${partnerName}

**Informations actuelles dans notre base:**
- Adresse: ${currentData.adresse || 'Non renseignée'}
- Email: ${currentData.email || 'Non renseigné'}
- Téléphone: ${currentData.telephone || 'Non renseigné'}
- Thématique: ${currentData.thematique || 'Non renseignée'}

**Instructions:**
1. Recherche les informations officielles et à jour de cette organisation
2. Compare avec les données actuelles
3. Signale toute différence ou correction nécessaire
4. Indique ton niveau de confiance (high/medium/low)

**Réponds en JSON strict avec ce format:**
{
  "nom": "Nom officiel de l'organisation",
  "adresse": "Adresse trouvée ou null si non trouvée",
  "email": "Email trouvé ou null si non trouvé",
  "telephone": "Téléphone trouvé ou null si non trouvé",
  "thematique": "Domaine d'activité",
  "confidence": "high|medium|low",
  "sources": ["URL ou source de l'information"],
  "changes": [
    {
      "field": "nom du champ modifié",
      "oldValue": "ancienne valeur",
      "newValue": "nouvelle valeur",
      "reason": "raison de la correction"
    }
  ]
}

Si tu ne trouves pas d'informations fiables, retourne un objet avec confidence: "low" et changes: [].
Réponds UNIQUEMENT avec le JSON, sans texte autour.`;

    try {
        // Use Gemini 3.0 Flash Preview (Correct ID for v1beta)
        const response = await fetch(
            `${GEMINI_API_ENDPOINT}/gemini-3-flash-preview:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: {
                        temperature: 0.1,
                        maxOutputTokens: 2048,
                        response_mime_type: "application/json",
                        // Force strict schema for Gemini 3.0
                        response_schema: {
                            type: "object",
                            properties: {
                                nom: { type: "string" },
                                adresse: { type: "string", nullable: true },
                                email: { type: "string", nullable: true },
                                telephone: { type: "string", nullable: true },
                                thematique: { type: "string", nullable: true },
                                confidence: { type: "string", enum: ["high", "medium", "low"] },
                                sources: { type: "array", items: { type: "string" } },
                                changes: {
                                    type: "array",
                                    items: {
                                        type: "object",
                                        properties: {
                                            field: { type: "string" },
                                            oldValue: { type: "string" },
                                            newValue: { type: "string" },
                                            reason: { type: "string" }
                                        },
                                        required: ["field", "oldValue", "newValue", "reason"]
                                    }
                                }
                            },
                            required: ["nom", "confidence", "sources", "changes"]
                        }
                    },
                    // Enable Google Search grounding
                    tools: [{ googleSearch: {} }]
                }),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[Gemini] API Error:', errorData);

            if (response.status === 429) {
                return {
                    result: null,
                    error: "Quota API Gemini 3.0 dépassé. Veuillez vérifier vos limites sur Google AI Studio."
                };
            }

            return {
                result: null,
                error: errorData.error?.message || `Erreur Gemini: ${response.status}`
            };
        }

        const data = await response.json();
        let textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textContent) {
            return { result: null, error: 'Réponse vide de Gemini' };
        }

        // Clean grounding noise (citations like [1], [2] inside text)
        // Gemini grounding often adds these even in JSON mode if not careful
        textContent = textContent.replace(/\[\d+\]/g, '');

        // Robust JSON extraction
        let jsonStr = textContent.trim();

        // Remove markdown block if present
        if (jsonStr.includes('```')) {
            const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
            if (match) jsonStr = match[1].trim();
        }

        // Final safety: find first '{' and last '}'
        const start = jsonStr.indexOf('{');
        const end = jsonStr.lastIndexOf('}');
        if (start !== -1 && end !== -1 && end > start) {
            jsonStr = jsonStr.substring(start, end + 1);
        }

        try {
            const parsed = JSON.parse(jsonStr) as PartnerVerification;
            parsed.modelUsed = 'Gemini 3.0 Flash';
            // Validate minimal structure even after parse
            if (!parsed.nom || !parsed.confidence) {
                throw new Error('Champs obligatoires manquants après parsing');
            }
            return { result: parsed };
        } catch (parseError) {
            console.error('[Gemini] JSON Parse Error:', parseError);
            console.error('[Gemini] Raw response to parse:', jsonStr);
            return { result: null, error: 'Structure de réponse IA invalide' };
        }

    } catch (error: any) {
        console.error('[Gemini] Request Error:', error);
        return { result: null, error: error.message || 'Erreur de connexion à Gemini' };
    }
}
