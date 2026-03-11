
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const SYSTEM_CONTEXT = "Tu es un professeur de mathématiques expert du programme officiel de 4ième (Cycle 4, France). Ta mission est d'être encourageant, clair et rigoureux.";

export const getMathExplanation = async (topic: string, question: string) => {
  try {
    if (!process.env.API_KEY) {
      throw new Error("API_KEY_MISSING");
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${SYSTEM_CONTEXT} Explique de manière pédagogique : ${topic}. L'élève demande : "${question}". Formate en Markdown avec LaTeX pour les formules.`,
    });
    return response.text || '';
  } catch (error: any) {
    console.error("Gemini Error:", error);
    
    if (error.message === "API_KEY_MISSING") {
      return "⚠️ Configuration incomplète : La clé API est manquante. Veuillez contacter l'administrateur.";
    }

    const errorMessage = error.message?.toLowerCase() || "";
    
    if (errorMessage.includes("quota") || errorMessage.includes("429") || errorMessage.includes("limit")) {
      return "⏳ Oups ! J'ai reçu trop de demandes d'un coup. Réessaie dans une petite minute, je serai de nouveau disponible !";
    }
    
    if (errorMessage.includes("network") || errorMessage.includes("fetch") || !navigator.onLine) {
      return "🌐 Problème de connexion : Je n'arrive pas à joindre mes serveurs. Vérifie ta connexion internet.";
    }

    if (errorMessage.includes("safety") || errorMessage.includes("blocked") || errorMessage.includes("candidate")) {
      return "🛡️ Désolé, je ne peux pas traiter cette demande car elle a été filtrée par mes protocoles de sécurité.";
    }

    return "❌ Désolé, je rencontre une difficulté technique imprévue (" + (error.message || "Erreur inconnue") + "). Réessaie plus tard !";
  }
};

export const generateQuiz = async (topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${SYSTEM_CONTEXT} Génère un quiz de 5 questions QCM sur : ${topic}. 4 options par question.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              correctAnswer: { type: Type.STRING },
              explanation: { type: Type.STRING }
            },
            required: ["question", "options", "correctAnswer", "explanation"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Quiz Error:", error);
    return null;
  }
};

export const generateExercise = async (topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${SYSTEM_CONTEXT} Génère un exercice interactif (1 question) sur : ${topic}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            correctAnswer: { type: Type.STRING },
            explanation: { type: Type.STRING }
          },
          required: ["question", "options", "correctAnswer", "explanation"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return null;
  }
};

export const searchMathResources = async (query: string, activeFilters: string[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Ressources de maths 4ième (France) pour : "${query}". ${activeFilters.join(', ')}`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = groundingChunks.filter((chunk: any) => chunk.web).map((chunk: any) => ({ title: chunk.web.title, uri: chunk.web.uri }));
    return { text: response.text || '', links };
  } catch (error) {
    return { text: "Erreur lors de la recherche.", links: [] };
  }
};

export const generateLessonSpeech = async (text: string, tone: 'encouraging' | 'enthusiastic' | 'patient' | 'academic' = 'encouraging') => {
  try {
    let toneInstruction = "de manière naturelle et encourageante";
    if (tone === 'enthusiastic') toneInstruction = "avec beaucoup d'enthousiasme et d'énergie, comme pour féliciter une grande réussite";
    if (tone === 'patient') toneInstruction = "de manière très patiente, douce et rassurante, pour expliquer une erreur sans décourager";
    if (tone === 'academic') toneInstruction = "de manière claire, posée et pédagogique, comme un professeur qui explique un concept important";

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Lis ce texte ${toneInstruction} : ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return null;
  }
};

export const checkAnswerWithAI = async (question: string, userAnswer: string, correctAnswer: string) => {
  try {
    const prompt = userAnswer === correctAnswer 
      ? `Félicite l'élève pour sa réponse "${userAnswer}" à "${question}". 
         Donne : 1) Une analyse courte de la réussite. 
         2) Un conseil d'approfondissement ou un défi pour aller plus loin.`
      : `L'élève a répondu "${userAnswer}" au lieu de "${correctAnswer}" à "${question}". 
         Donne : 1) Une explication pédagogique de l'erreur. 
         2) Un conseil pratique ou une astuce pour ne plus se tromper.`;
         
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${SYSTEM_CONTEXT} ${prompt}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING, description: "L'explication technique de la réponse." },
            coachAdvice: { type: Type.STRING, description: "Un conseil personnalisé, une astuce ou une piste d'approfondissement." }
          },
          required: ["analysis", "coachAdvice"]
        }
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    return { 
      analysis: "Analyse indisponible.", 
      coachAdvice: "Continue tes efforts, la pratique est la clé !" 
    };
  }
};

export const getMathExample = async (topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${SYSTEM_CONTEXT} Donne un exemple d'exercice rédigé sur ${topic}.`,
    });
    return response.text || '';
  } catch (error) {
    return "Exemple indisponible.";
  }
};

export const getCheatSheetFormulas = async (topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${SYSTEM_CONTEXT} Liste les formules mathématiques essentielles pour le sujet : ${topic}. 
                 Donne uniquement les formules sous forme de liste, sans explication superflue. 
                 Utilise LaTeX pour les formules si possible.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("CheatSheet Error:", error);
    return [];
  }
};

export const getEducationalVideos = async (topic: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Trouve des vidéos éducatives YouTube de qualité en français pour le sujet de mathématiques de 4ième : "${topic}". 
                 Privilégie des chaînes comme "Yvan Monka", "L'Antisèche" ou "Maths et Tiques".`,
      config: {
        tools: [{ googleSearch: {} }]
      },
    });

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const videos = groundingChunks
      .filter((chunk: any) => chunk.web && (chunk.web.uri.includes('youtube.com') || chunk.web.uri.includes('youtu.be')))
      .map((chunk: any) => ({
        title: chunk.web.title,
        url: chunk.web.uri,
        thumbnail: `https://img.youtube.com/vi/${extractYoutubeId(chunk.web.uri)}/mqdefault.jpg`
      }));

    return videos;
  } catch (error) {
    console.error("Video Search Error:", error);
    return [];
  }
};

function extractYoutubeId(url: string) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) { bytes[i] = binaryString.charCodeAt(i); }
  return bytes;
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) { channelData[i] = dataInt16[i * numChannels + channel] / 32768.0; }
  }
  return buffer;
}
