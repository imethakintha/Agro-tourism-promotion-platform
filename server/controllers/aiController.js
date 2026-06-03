import { GoogleGenAI } from "@google/genai";
import fs from 'fs';
import PlantInfo from '../models/PlantInfo.js';
import Activity from '../models/Activity.js';
import ActivityTag from '../models/ActivityTag.js';
import AIConversation from '../models/AIConversation.js';
import Farm from '../models/Farm.js';
import axios from 'axios';
import User from '../models/User.js';
import { SUPPORT_BOT_PROMPT } from '../config/systemPrompts.js';


const client = new GoogleGenAI({ apiKey: process.env.GOOGLE_GEMINI_API_KEY });

export const identifyPlant = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an image' });
        }

        const imagePath = req.file.path;

        const imageBuffer = fs.readFileSync(imagePath);
        const base64Image = imageBuffer.toString('base64');
        const mimeType = req.file.mimetype;

        console.log("🌱 Starting Plant Analysis...");

        const prompt = `
You are an expert Agricultural Botanist and Plant Pathologist. 
Your task is to analyze the image provided by a user of the "AgroLK" agrotourism platform.

STEP 1: VERIFICATION
- Determine if the image contains a plant, fruit, vegetable, or crop.
- If it is NOT a plant (e.g., a person, building, animal), set "isPlant" to false and stop analysis.

STEP 2: IDENTIFICATION
- Identify the Common Name (in English).
- Identify the Scientific Name.
- Identify the Family.

STEP 3: GENERATE KNOWLEDGE FOR DATABASE
- "description": Write a short, engaging paragraph (30-40 words) describing what this plant is for a tourist.
- "medicinalValue": List key medicinal uses.
- "usage": List culinary or other uses.
- "marketTips": 1 sentence tip for farmers about selling this.
- "cultivationTips": 1 sentence tip for farmers about growing this.
- "seasonality": 1 sentence tip for farmers about growing this.
- "careAdvice": 1 sentence tip for farmers about growing this.

STEP 4: HEALTH ANALYSIS
- Analyze the leaves, stems, and fruits for specific symptoms:
  - Look closely for spots, discoloration, holes, curling, or pests.
  - Discoloration (Yellowing, Browning, Spots)
  - Pest damage (Holes, Insects visible)
  - Fungal or Bacterial signs (Powdery mildew, Rot)
  - Dehydration or Nutrient deficiency.
- If ANY symptom is visible, mark "healthStatus" as "Diseased" or "Warning".
- **"diseasePrediction"**: Name the SPECIFIC disease or pest if visible (e.g., "Leaf Curl", "Black Spot", "Mealybugs"). If healthy, set to "None".
- **"symptomAnalysis"**: Describe exactly what the signs are (e.g., "Brown spots with yellow halos on lower leaves").

STEP 5: RECOMMENDATION & SEARCH KEYWORDS
- If diseased: Suggest a brief organic or general treatment.
- If healthy: Provide a quick care tip (Watering/Sunlight).
- "searchKeywords": Generate 5-7 relevant keywords for searching this plant in Sinhala and English.

OUTPUT FORMAT:
Return ONLY a raw JSON object (no Markdown, no \`\`\`json tags). Follow this exact structure:

{
  "isPlant": boolean,
  "plantName": "Common Name",
  "scientificName": "Scientific Name",
  "family": "Family Name",
  "description": "General description for tourists...",
  "medicinalValue": "string",
  "usage": "string",
  "marketTips": "string",
  "cultivationTips": "string",
  "healthStatus": "Healthy" or "Diseased" or "Unknown",
  "confidence": number (0-100),
  "searchKeywords": ["Keyword1", "Keyword2","Keyword3"],
  "visualDescription": "A detailed 2-sentence description of what you see, including specific symptoms if any.",
  "seasonality": "string",
  "careAdvice": "Treatment suggestion if sick, or maintenance tip if healthy.",
  "diseasePrediction": "string",  // <--- NEW FIELD
  "symptomAnalysis": "string"
}
`;

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    parts: [
                        { inlineData: { mimeType: mimeType, data: base64Image } },
                        { text: prompt }
                    ]
                }
            ],
            config: {
                responseMimeType: "application/json" 
            }
        });

        const aiText = response.text; 
        let aiData;

        try {
            aiData = JSON.parse(aiText);
        } catch (error) {
            console.error("❌ JSON Parse Error:", error);
            aiData = { plantName: "Unknown", visualDescription: "Analysis failed." };
        }

        console.log("🤖 AI Identified:", aiData.plantName);
        console.log("🔑 AI Keywords:", aiData.searchKeywords);

        const identifiedName = aiData.plantName;

        let knowledgeBaseData = null;

        if (aiData.isPlant && identifiedName && identifiedName !== "Unknown") {
            let dbPlantInfo = await PlantInfo.findOne({
                commonName: { $regex: new RegExp(`^${identifiedName}`, 'i') }
            });

            if (dbPlantInfo) {
                console.log("✅ Plant found in Database:", dbPlantInfo.commonName);
                knowledgeBaseData = dbPlantInfo; 
            } else {
                console.log("🆕 New Plant detected! Saving to Database:", identifiedName);

                try {
                    const newPlant = new PlantInfo({
                        commonName: aiData.plantName,
                        scientificName: aiData.scientificName,
                        family: aiData.family,
                        localNames: { sinhala: "Update Needed", tamil: "Update Needed" },
                        touristInfo: {
                            quickDescription: aiData.description,
                            medicinalValue: aiData.medicinalValue,
                            usage: aiData.usage
                        },
                        farmerInfo: {
                            commonPestsText: "See Disease Check tab",
                            marketTips: aiData.marketTips,
                            cultivationTips: aiData.cultivationTips,
                            seasonality: aiData.seasonality,
                            careAdvice: aiData.careAdvice
                        },
                        relatedTags: aiData.searchKeywords
                    });

                    knowledgeBaseData = await newPlant.save();
                    console.log("💾 Successfully Saved to PlantInfo!");
                } catch (saveError) {
                    console.error("⚠️ Failed to save PlantInfo:", saveError.message);
                    knowledgeBaseData = {
                        commonName: aiData.plantName,
                        scientificName: aiData.scientificName,
                        family: aiData.family,
                        touristInfo: {
                            quickDescription: aiData.description,
                            medicinalValue: aiData.medicinalValue,
                            usage: aiData.usage
                        }
                    };
                }
            }
        }

        let recommendations = [];

        const searchKeywords = (aiData.searchKeywords && aiData.searchKeywords.length > 0)
            ? aiData.searchKeywords
            : [identifiedName];

        const validKeywords = searchKeywords.filter(k => k && k !== "Unknown");

        if (validKeywords.length > 0) {
            const regexQueries = validKeywords.map(keyword => new RegExp(keyword, 'i'));

            console.log("🔍 Searching DB with Queries:", regexQueries);
            recommendations = await Activity.find({
                status: 'Active',
                $or: [
                    { customTitle: { $in: regexQueries } }, 
                    { customDescription: { $in: regexQueries } }  
                ]
            })
                .populate('farmId', 'farmName')
                .select('customTitle pricePerPerson images farmId averageRating')
                .limit(4);

            console.log("✅ Found Activities:", recommendations.length);
        }

        await AIConversation.create({
            userId: req.user.id,
            type: 'PlantIdentification',
            imageUrl: `/uploads/${req.file.filename}`,
            identifiedPlant: identifiedName,
            aiResponseRaw: aiData
        });

        res.status(200).json({
            success: true,
            data: {
                aiAnalysis: aiData,
                knowledgeBase: knowledgeBaseData,
                recommendations: recommendations
            }
        });

    } catch (error) {
        console.error("🔥 Error in identifyPlant:", error);
        next(error);
    }
};

export const chatBot = async (req, res, next) => {
    try {
        const { message, sessionId, context } = req.body;
        const userId = req.user.id;

        let conversation;
        if (sessionId) {
            conversation = await AIConversation.findOne({ sessionId, userId, type: 'ChatBot' });
        }

        if (!conversation) {
            conversation = new AIConversation({
                userId,
                type: 'ChatBot',
                sessionId: sessionId || `session-${Date.now()}`,
                messages: [],
                context: context || {}
            });
        }

        // 3. System Prompt construction
        const systemPrompt = SUPPORT_BOT_PROMPT;

        // 4. Prepare History for Gemini
        const history = conversation.messages.map(m => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const response = await client.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                ...history,
                { role: 'user', parts: [{ text: message }] }
            ],
            config: {
                systemInstruction: systemPrompt 
            }
        });

        const responseText = response.text;

        // 6. Save to Database
        conversation.messages.push({ role: 'user', content: message });
        conversation.messages.push({ role: 'assistant', content: responseText });
        await conversation.save();

        res.status(200).json({
            success: true,
            data: {
                response: responseText,
                sessionId: conversation.sessionId
            }
        });

    } catch (error) {
        next(error);
    }
};

export const getChatHistory = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const conversation = await AIConversation.findOne({
            sessionId,
            userId: req.user.id,
            type: 'ChatBot'
        });

        if (!conversation) {
            return res.status(200).json({ success: true, data: [] });
        }

        res.status(200).json({ success: true, data: conversation.messages });
    } catch (error) {
        next(error);
    }
};

export const getRecommendations = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const aiResponse = await axios.post('http://localhost:5001/recommend', {
            userId: user._id,
            country: user.countryOfResidence || 'Sri Lanka'
        }, { timeout: 30000 });

        const recommendedActivities = aiResponse.data.recommendations;

        res.status(200).json({
            success: true,
            data: recommendedActivities
        });

    } catch (error) {
        console.error("AI Service Error:", error.message);
        res.status(200).json({ success: true, data: [] });
    }
};

export const checkLanguageAvailability = async (req, res, next) => {
    try {
        const { lat, lng, language } = req.body;

        const aiResponse = await axios.post('http://localhost:5001/predict-language', {
            lat, lng, language
        }, { timeout: 30000 });

        res.status(200).json(aiResponse.data);

    } catch (error) {
        console.error("AI Language Check Error:", error.message);
        res.status(200).json({ success: false, badge: null }); 
    }
};

export const generateTripPlan = async (req, res, next) => {
    try {
        const { startDate, endDate, interests, pace, luxury, needTransport, needGuide, pickupLocation, participantCount, groupType } = req.body;

        const aiResponse = await axios.post('http://localhost:5001/generate-trip', {
            startDate, endDate, interests, pace, luxury, needTransport, needGuide, pickupLocation, participantCount, groupType
        }, { timeout: 30000 });

        res.status(200).json(aiResponse.data);

    } catch (error) {
        console.error("AI Trip Plan Error:", error.message);
        res.status(500).json({ success: false, message: "AI Engine busy. Please try again." });
    }
};

export const getAgroWisdom = async (req, res, next) => {
    try {
        const { query } = req.body;
        const userId = req.user ? req.user.id : 'guest'; // specific user or guest

        const aiResponse = await axios.post('http://localhost:5001/api/ai/agro-guide', {
            query,
            userId
        }, { timeout: 30000 }); 

        res.status(200).json(aiResponse.data);

    } catch (error) {
        console.error("AI Wisdom Hub Error:", error.message);
        res.status(500).json({ success: false, message: "Failed to retrieve wisdom." });
    }
};


export const getSmartPrice = async (req, res, next) => {
    try {
        const { categoryId, tagIds, currentPrice } = req.body;

        const aiResponse = await axios.post('http://localhost:5001/predict-price', {
            categoryId,
            tagIds,
            currentPrice: parseFloat(currentPrice) || 0
        }, { timeout: 30000 });

        res.status(200).json(aiResponse.data);

    } catch (error) {
        console.error("Smart Price Error:", error.message);
        res.status(500).json({ success: false, message: "Pricing Engine Unavailable" });
    }
};

//