import { NextResponse } from "next/server";
import { callGeminiSafe, callGeminiJSON } from "@/lib/gemini";
import { validateRequest, GenerateDocumentSchema } from "@/lib/validation";

export async function POST(req: Request) {
    try {
        const { data: body, error: validationErr } = await validateRequest(req, GenerateDocumentSchema);
        if (validationErr) {
            return NextResponse.json({ error: validationErr }, { status: 400 });
        }

        const { type, event, club, config } = body!;

        let prompt = "";

        const isCollege = config.isCollegeEvent;
        const eventTheme = config.idea || config.theme || event.description || "A professional club gathering.";
        const letterType = body.letterType || 'Permission Letter';

        let recipientBlock = `To,
[Recipient Name/Title]
[Department/Organization]
[Address]`;

        if (isCollege && letterType === "Venue Permission Letter (To Venue In-charge)") {
            recipientBlock = `To,
The Head Of The Department
Department of [Department Name]
[College Name]
[Road nearby/Address]
[City] - [Pincode]`;
        }

        if (type === 'letter') {
            prompt = `
You are a professional administrative assistant for the club "${club.name}".
You need to generate an official letter for the event "${event.name}".
The specific letter requested is: "${letterType}".

Here are the event details:
- Event Name: ${event.name}
- Theme/Idea/Description: ${eventTheme}
- Date: ${config.date || 'TBD'}
- Time: ${config.time || 'TBD'}
- Venue: ${config.venue || 'TBD'}
- Club: ${club.name}
- College Event: ${isCollege ? 'Yes' : 'No'}

CRITICAL: You MUST use the Theme/Idea/Description provided above to write a highly detailed, persuasive, and context-aware letter. Do not write a generic letter. Integrate the core theme and objectives of the event intelligently into the body paragraphs.

If it's a college event, the letter should be addressed to internal college authorities (e.g., The Principal, Head of Department, Hostel Warden, etc. depending on the letter type).
If it's a non-college event, address it to external authorities (e.g., Venue Owner, Municipal Corporation, Superintendent of Police, etc.).

Please follow this exact structural format (which mimics highly professional standards, like IEEE Student Branch standards):

[DATE (e.g., 23rd October, 2025)]

${recipientBlock}

Respected Sir/Ma'am,

Subject: **[Bold and Underlined Subject Line summarizing the request for ${event.name}]**

[Body Paragraph 1: Introduction of the club and the specific details/theme of the event. Mention the dates and venue clearly. Explain *why* the event is being organized based on the theme.]
[Body Paragraph 2: Specific request for permission/sponsorship/etc. relevant to a "${letterType}".]
[Body Paragraph 3: Assurances (e.g., no damage to property, adherence to rules, ensuring smooth conduct).]

Thank you.

Sincerely,

[Club Advisor / Faculty Coordinator Name, if applicable]
Chapter Advisor
${club.name}

[CRITICAL REQUIREMENT: At the very bottom of the letter, you MUST include a horizontal block for the core committee signatures. Follow this EXACT format precisely, leaving the [Name] placeholders if the specific names are not provided. Do not skip any of these 6 roles:

[Name]                   [Name]                       [Name]               [Name]              [Name]                 [Name]
Chairperson              Vice Chairperson             Treasurer            Secretary           Joint Secretary        Joint Secretary

${club.name} Executive Committee 2025-26]
            `;
        } else if (type === 'script') {
            const scriptType = body.scriptType || 'EMCEE Script';
            
            prompt = `
You are the primary scriptwriter for the professional club "${club.name}".
Your task is to write an exhaustive, highly detailed "${scriptType}" for the upcoming event "${event.name}".

--- EVENT CONFIGURATION ---
Theme/Description: ${eventTheme}
Date: ${config.date || 'TBD'}
Time: ${config.time || 'TBD'}
Venue: ${config.venue || 'TBD'}
Prize Pool: ${config.prizePool ? '₹' + config.prizePool : 'N/A'}
---------------------------

`;

            if (scriptType === 'EMCEE Script') {
                prompt += `
ROLE REQUIREMENT: The EMCEE script will be delivered by either the Vice Chairperson or the Secretary. You MUST explicitly introduce the speaker with one of these titles early in the script (e.g. "I am [Name], the Vice Chairperson of ${club.name}").
STRUCTURE REQUIREMENT:
1. Formal Welcome: Welcome all participants, judges, and dignitaries.
2. Event Overview: Explain the theme (${eventTheme}) in a captivating way.
3. Highlights: Announce the prize pool and explicitly introduce the judges/guests.
4. Engagement: Detail how the event rounds will proceed, building excitement and hyping up the participants.
Provide the entire text script word-for-word exactly as it should be spoken on stage, including stage directions in brackets like [Pause for applause].
`;
            } else if (scriptType === 'Vote of Thanks') {
                prompt += `
ROLE REQUIREMENT: The Vote of Thanks is traditionally delivered by the Chairperson. You MUST explicitly introduce the speaker as the Chairperson of "${club.name}" (e.g. "I am [Name], the Chairperson...").
STRUCTURE REQUIREMENT:
1. Formal Conclusion: Acknowledge the successful completion of "${event.name}".
2. Gratitude to Dignitaries: Thank the chief guests and judges for their valuable time and insights.
3. Gratitude to Authorities: Thank the college/venue authorities for their immense support.
4. Gratitude to Team: Thank the executive committee, volunteers, and participants for making it a grand success.
Provide the exact spoken text word-for-word, maintaining a highly formal, grateful, and professional tone.
`;
            } else if (scriptType === 'Volunteer Briefing Document') {
                prompt += `
ROLE REQUIREMENT: This is an internal logistics manual for the volunteers of "${club.name}".
STRUCTURE REQUIREMENT:
1. Event Context: A brief overview of the event scale, timing, and venue logistics.
2. Core Responsibilities: Outline the key duties (e.g., registration desk, crowd management, stage handling, guest hospitality).
3. Rules & Etiquette: Detail the code of conduct, dress code, and expected professional behavior.
4. Chain of Command: Explain the reporting structure to the core committee.
Format this as a clean, highly structured, comprehensive internal document using markdown headers and bullet points. Make it extremely detailed so volunteers know exactly what to do.
`;
            }

        } else if (type === 'sheet') {
            prompt = `
You are a highly professional Event Manager and Data Management Agent for "${club.name}".
Your task is to generate a comprehensive, highly detailed "Event Budget and Logistics Tracker" for the upcoming event "${event.name}".

Theme/Description: ${eventTheme}
Date: ${config.date || 'TBD'}
Time: ${config.time || 'TBD'}
Venue: ${config.venue || 'TBD'}

STRICT CONSTRAINTS:
1. You MUST generate a valid JSON array of objects.
2. The grid must contain at least 10-15 highly specific, realistic rows detailing logistics, marketing, venue setup, speaker travel, prize pools, and miscellaneous contingencies. 
3. Each object MUST have these EXACT keys:
   - "Category" (e.g., Marketing, Logistics, Hospitality)
   - "Item" (Specific description)
   - "Quantity / Units"
   - "Estimated Cost (INR)" (Use realistic numbers)
   - "Status" (e.g., Pending, Approved, Paid)
   - "Assigned To" (Role or Committee)
4. DO NOT include any conversational text. OUTPUT ONLY THE JSON ARRAY.
5. STRICT: Ensure the JSON is perfectly valid. Do NOT leave any trailing commas at the end of lists or objects.
            `;
        } else {
            return NextResponse.json({ error: "Invalid generation type" }, { status: 400 });
        }

        if (type === 'sheet') {
            const jsonResponse = await callGeminiJSON(prompt);
            if (!jsonResponse) {
                return NextResponse.json({ error: "Invalid JSON format returned from AI" }, { status: 500 });
            }
            
            // Sometimes Gemini wraps the array in an object like { "data": [...] }
            let finalArray = jsonResponse;
            if (!Array.isArray(jsonResponse) && typeof jsonResponse === 'object' && jsonResponse !== null) {
                const values = Object.values(jsonResponse);
                const arrayValue = values.find(v => Array.isArray(v));
                if (arrayValue) {
                    finalArray = arrayValue;
                } else {
                    // Wrap the object in an array as a last resort
                    finalArray = [jsonResponse];
                }
            } else if (!Array.isArray(jsonResponse)) {
                finalArray = [];
            }

            return NextResponse.json({ data: finalArray });
        }

        const text = await callGeminiSafe(prompt);
        if (!text) {
            console.error("[generate-document] Gemini failed. Using Fallback Template.");
            const safeLetterType = body.letterType || 'Document';
            const fallbackText = `[DATE]

${recipientBlock}

Respected Sir/Ma'am,

Subject: **Request for ${safeLetterType} regarding ${event.name}**

We are writing on behalf of ${club.name} to formally request ${safeLetterType} for our upcoming event, ${event.name}. The event is designed around the theme of "${eventTheme}", to promote engagement and practical learning among the student body. 

We require the necessary permissions and resources to ensure the successful execution of this event. Detailed logistical requirements and schedules will be shared with your office well in advance. We assure you that all activities will strictly adhere to the institution's guidelines and no property will be damaged.

Thank you for your continuous support and understanding.

Sincerely,

Faculty Coordinator / Chapter Advisor
${club.name}


[Name]                   [Name]                       [Name]               [Name]              [Name]                 [Name]
Chairperson              Vice Chairperson             Treasurer            Secretary           Joint Secretary        Joint Secretary

${club.name} Executive Committee 2025-26`;
            return NextResponse.json({ content: fallbackText });
        }

        return NextResponse.json({ content: text });

    } catch (error: unknown) {
        const err = error as { message?: string };
        console.error("Document Generation Error:", err);
        return NextResponse.json({ error: err.message || "Failed to generate document" }, { status: 500 });
    }
}
