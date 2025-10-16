import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { selections } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const inspirations = selections.inspirations?.join(", ") || "";
    const productTypes = selections.productTypes?.join(", ") || "";
    const colorSchemes = selections.colorSchemes?.join(", ") || "";
    const designConcepts = selections.designConcepts?.join(", ") || "";

    const prompt = `Generate an SEO-optimized e-commerce product listing for a print-on-demand product with these details:
- Inspiration: ${inspirations || "modern design"}
- Product type: ${productTypes || "decorative item"}
- Color scheme: ${colorSchemes || "vibrant colors"}
- Design style: ${designConcepts || "contemporary"}

Return a JSON object with this exact structure:
{
  "title": "compelling product title under 60 characters with main keyword",
  "description": "detailed product description 150-200 words highlighting benefits and features",
  "features": ["feature 1", "feature 2", "feature 3", "feature 4", "feature 5"],
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5"],
  "priceRange": "$XX - $XX"
}

Make it professional, appealing, and optimized for search engines.`;

    console.log("Generating listing");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your Lovable workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No listing generated");
    }

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const listing = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(content);

    console.log("Listing generated successfully");

    return new Response(
      JSON.stringify({ listing }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-listing:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
