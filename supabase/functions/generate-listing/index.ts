import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { selections } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context from selections
    const context = {
      inspirations: selections.inspirations || [],
      products: selections.productTypes || [],
      colors: selections.colorSchemes || [],
      styles: selections.designConcepts || [],
    };

    const prompt = `You are a professional product listing writer. Create a compelling, SEO-optimized product listing based on these design elements:

Inspirations: ${context.inspirations.join(", ") || "None"}
Product Types: ${context.products.join(", ") || "None"}
Color Schemes: ${context.colors.join(", ") || "None"}
Design Styles: ${context.styles.join(", ") || "None"}

Generate a complete product listing with:
1. A catchy product title (50-60 characters)
2. A compelling product description (150-200 words) highlighting unique features
3. 5-7 bullet points of key features
4. Suggested tags/keywords for SEO
5. Recommended price range

Format as JSON with keys: title, description, features (array), tags (array), priceRange`;

    console.log("Generating listing with context:", context);

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
            content: prompt,
          },
        ],
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
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`AI gateway error: ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No listing generated");
    }

    // Try to parse JSON from the response
    let listing;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/```\n([\s\S]*?)\n```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      listing = JSON.parse(jsonStr);
    } catch {
      // If parsing fails, return the raw content
      listing = { rawContent: content };
    }

    console.log("Listing generated successfully");

    return new Response(JSON.stringify({ listing }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-listing:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
