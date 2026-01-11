import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface UserProfile {
  education: string;
  interests: string[];
  skills: string[];
  goals: string;
}

const systemPrompt = `You are an expert career counselor with deep knowledge of the Indian job market. 
Analyze the user's profile and recommend the 4 most suitable careers for them.

For each career, provide:
1. A unique career ID (lowercase, hyphenated, e.g., "data-scientist")
2. Career name
3. A compelling 2-sentence description highlighting opportunities in India
4. Fit score (0-100) based on how well the user's profile matches
5. Top 4 skills needed for this career
6. Average salary range in India (in LPA format like "₹8-15 LPA")
7. Current demand in India ("High", "Medium", or "Low")
8. Realistic time to become job-ready (e.g., "4-6 months")

Consider:
- The user's existing skills as strengths
- Their interests for motivation alignment
- Their educational background for feasibility
- Career goals for long-term fit
- Indian job market trends and salary expectations

Respond ONLY with a valid JSON array of career objects. No markdown, no explanation.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile } = await req.json() as { profile: UserProfile };
    
    if (!profile || !profile.education || !profile.interests?.length || !profile.skills?.length) {
      return new Response(
        JSON.stringify({ error: "Invalid profile data" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userMessage = `Please analyze this profile and recommend careers:

Education Level: ${profile.education}
Interests: ${profile.interests.join(", ")}
Existing Skills: ${profile.skills.join(", ")}
Career Goals: ${profile.goals}

Return exactly 4 career recommendations as a JSON array with this structure:
[
  {
    "id": "career-id",
    "name": "Career Name",
    "description": "Two sentence description.",
    "fitScore": 85,
    "skills": ["Skill1", "Skill2", "Skill3", "Skill4"],
    "avgSalary": "₹X-Y LPA",
    "demand": "High",
    "timeToLearn": "X-Y months"
  }
]`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Empty response from AI");
    }

    // Parse the JSON response - handle potential markdown code blocks
    let careers;
    try {
      // Remove markdown code blocks if present
      const cleanContent = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      careers = JSON.parse(cleanContent);
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      throw new Error("Failed to parse career recommendations");
    }

    // Validate the response structure
    if (!Array.isArray(careers) || careers.length === 0) {
      throw new Error("Invalid career recommendations format");
    }

    // Ensure all careers have required fields
    const validatedCareers = careers.map((career: any, index: number) => ({
      id: career.id || `career-${index}`,
      name: career.name || "Unknown Career",
      description: career.description || "No description available.",
      fitScore: Math.min(100, Math.max(0, Number(career.fitScore) || 50)),
      skills: Array.isArray(career.skills) ? career.skills.slice(0, 4) : [],
      avgSalary: career.avgSalary || "₹5-10 LPA",
      demand: ["High", "Medium", "Low"].includes(career.demand) ? career.demand : "Medium",
      timeToLearn: career.timeToLearn || "3-6 months",
    }));

    return new Response(
      JSON.stringify({ careers: validatedCareers }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Career recommendation error:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Failed to generate recommendations" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
