import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google GenAI SDK using environment variables

const genAI = new GoogleGenerativeAI(process.env.gapi);

export const geminiGenerate = async (req, res) => {
    try {
        const internalPrompt = `You are a women's safety expert in Bangalore.

Create a VERY SHORT safety guide.

Rules:
- Only 3 sections (not 7)
- Each section = 3 rules only
- Each rule = max 8 words
- One short tip per section (max 10 words)

Sections:
1. Travel Safety
2. Night Safety
3. Emergency

Also add:
- 3 safety apps
- 3 emergency numbers
- 2 items to carry

IMPORTANT:
- Keep everything minimal
- No explanations
- No long sentences
- Bullet points only
- Max total response: 150 words`;

        // Use the correct model name (e.g., 'gemini-1.5-flash')
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent(internalPrompt);
        const responseText = result.response.text();

        res.json({
            status: "success",
            output: responseText
        });

    } catch (error) {
        console.error("❌ Error generating content:", error);
        res.status(500).json({ 
            status: "error", 
            message: error.message 
        });
    }
};