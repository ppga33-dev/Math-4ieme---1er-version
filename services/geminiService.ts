
import { GoogleGenAI, Type, Modality } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const SYSTEM_CONTEXT = "Tu es un professeur de mathématiques expert du programme officiel de 4ième (Cycle 4, France). Ta mission est d'être encourageant, clair et rigoureux.";

const getFriendlyErrorMessage = (error: any): string => {
  console.error("Gemini Error:", error);
  
  const errorMessage = (error.message || error.toString() || "").toLowerCase();
  const status = error.status || error.code;
  
  const isSafetyBlock = errorMessage.includes("safety") || 
                        errorMessage.includes("blocked") || 
                        errorMessage.includes("candidate") || 
                        errorMessage.includes("finish_reason_safety") ||
                        (error.response?.candidates?.[0]?.finishReason === "SAFETY");

  if (error.message === "API_KEY_MISSING" || errorMessage.includes("api key")) {
    return "⚠️ Un petit souci de configuration : La clé API est manquante ou invalide. Pas de panique, contacte ton professeur ou l'administrateur !";
  }

  if (status === 429 || errorMessage.includes("quota") || errorMessage.includes("limit") || errorMessage.includes("too many requests")) {
    return "⏳ Oups ! J'ai reçu un peu trop de questions d'un coup. Je reprends mon souffle... Réessaie dans une petite minute, je serai de nouveau prêt à t'aider !";
  }
  
  if (errorMessage.includes("network") || errorMessage.includes("fetch") || errorMessage.includes("failed to connect") || !navigator.onLine) {
    return "🌐 Oh non, on dirait que la connexion fait des siennes ! Vérifie que tu es bien connecté à Internet pour que je puisse te répondre.";
  }

  if (isSafetyBlock) {
    return "🛡️ Par mesure de sécurité et de bienveillance, je ne peux pas répondre à cette demande précise. Essayons de reformuler ta question sur un sujet mathématique !";
  }

  if (status === 500 || status === 503 || errorMessage.includes("internal error") || errorMessage.includes("overloaded") || errorMessage.includes("service unavailable")) {
    return "⚙️ Mes serveurs sont un peu fatigués en ce moment ou en maintenance. Ils font une petite pause technique. Réessaie dans quelques instants !";
  }

  return "❌ Zut, j'ai rencontré une petite difficulté technique imprévue. Ne te décourage pas, la persévérance est la clé en maths ! Réessaie dans un moment. (" + (error.message || "Erreur mystérieuse") + ")";
};

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
    return getFriendlyErrorMessage(error);
  }
};

export const generateQuiz = async (topic: string) => {
  try {
    if (!process.env.API_KEY) throw new Error("API_KEY_MISSING");
    
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
    throw new Error(getFriendlyErrorMessage(error));
  }
};

export const generateExercise = async (topic: string) => {
  try {
    if (!process.env.API_KEY) throw new Error("API_KEY_MISSING");

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
    throw new Error(getFriendlyErrorMessage(error));
  }
};

export const searchMathResources = async (query: string, activeFilters: string[]) => {
  try {
    if (!process.env.API_KEY) throw new Error("API_KEY_MISSING");

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Ressources de maths 4ième (France) pour : "${query}". ${activeFilters.join(', ')}`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const links = groundingChunks.filter((chunk: any) => chunk.web).map((chunk: any) => ({ title: chunk.web.title, uri: chunk.web.uri }));
    return { text: response.text || '', links };
  } catch (error) {
    return { text: getFriendlyErrorMessage(error), links: [] };
  }
};

export const generateLessonSpeech = async (text: string, tone: 'encouraging' | 'enthusiastic' | 'patient' | 'academic' = 'encouraging') => {
  try {
    if (!process.env.API_KEY) throw new Error("API_KEY_MISSING");

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
    throw new Error(getFriendlyErrorMessage(error));
  }
};

export const checkAnswerWithAI = async (question: string, userAnswer: string, correctAnswer: string) => {
  try {
    if (!process.env.API_KEY) throw new Error("API_KEY_MISSING");

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
    throw new Error(getFriendlyErrorMessage(error));
  }
};

export const getMathExample = async (topic: string) => {
  try {
    if (!process.env.API_KEY) throw new Error("API_KEY_MISSING");

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `${SYSTEM_CONTEXT} Donne un exemple d'exercice rédigé sur ${topic}.`,
    });
    return response.text || '';
  } catch (error) {
    return getFriendlyErrorMessage(error);
  }
};

export const getCheatSheetFormulas = async (topic: string) => {
  try {
    if (!process.env.API_KEY) throw new Error("API_KEY_MISSING");

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
    throw new Error(getFriendlyErrorMessage(error));
  }
};

export const getEducationalVideos = async (topic: string) => {
  try {
    if (!process.env.API_KEY) throw new Error("API_KEY_MISSING");

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
    throw new Error(getFriendlyErrorMessage(error));
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
