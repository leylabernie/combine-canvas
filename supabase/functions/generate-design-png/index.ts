import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function getStylePrompt(styleId: string, inspirations: string, productTypes: string, colorSchemes: string): string {
  const baseRequirements = `
CRITICAL REQUIREMENTS:
- Completely transparent background (PNG format)
- Ultra high resolution, 8K quality
- Professionally designed for print-on-demand
- Centered composition, commercially appealing
- Perfect for ${productTypes || "various products"}
- Etsy-quality design aesthetic`;

  const stylePrompts: Record<string, string> = {
    "minimalist-vector": `Create a MINIMALIST VECTOR-STYLE design with these characteristics:
- Clean silhouette style with simple, bold shapes
- Limited color palette (1-3 colors maximum, or black and white)
- Crisp, sharp edges suitable for vinyl cutting
- Vector art aesthetic (flat colors, no gradients unless minimal)
- Clean lines and geometric simplicity
- Modern, professional look
- Think: simple logos, icon-style designs, clean silhouettes
${baseRequirements}

Theme/Inspiration: ${inspirations || "modern and elegant"}
Color preference: ${colorSchemes || "bold and simple"}`,

    "detailed-illustration": `Create a HIGHLY DETAILED ILLUSTRATION with these characteristics:
- Photorealistic quality with rich textures and depth
- Vibrant, saturated colors with professional color grading
- Intricate details and fine line work
- Digital painting or detailed vector illustration style
- Layered composition with visual depth
- Professional commercial art quality
- Think: detailed digital art, realistic illustrations, rich artwork
${baseRequirements}

Theme/Inspiration: ${inspirations || "festive and detailed"}
Color preference: ${colorSchemes || "vibrant and rich"}`,

    "typography-art": `Create a TYPOGRAPHY-FOCUSED DESIGN with these characteristics:
- Creative, hand-lettered or decorative font style
- Text is the PRIMARY design element
- Playful, artistic typography with personality
- Minimal supporting graphics (small accents only)
- Bold, readable, and visually striking text
- Professional hand-lettering aesthetic
- Think: quote designs, text art, decorative lettering
${baseRequirements}

Text theme: ${inspirations || "festive and cheerful"}
Color preference: ${colorSchemes || "bold and eye-catching"}`,

    "quirky-humorous": `Create a QUIRKY, HUMOROUS DESIGN with these characteristics:
- Playful, stylized illustration with personality
- Fun, whimsical elements and creative concepts
- Cartoon-style or stylized realism
- Unexpected, clever visual elements
- Character-driven or concept-driven design
- Professional but fun aesthetic
- Think: playful characters, clever concepts, humorous illustrations
${baseRequirements}

Theme/Inspiration: ${inspirations || "fun and festive"}
Color preference: ${colorSchemes || "vibrant and playful"}`,

    "line-art": `Create a CLEAN LINE ART DESIGN with these characteristics:
- Simple, clean line drawings
- Minimal color fills (1-2 colors or outline only)
- Hand-drawn aesthetic with smooth, confident lines
- Modern illustration style
- Elegant simplicity with artistic flair
- Clean, minimalist composition
- Think: modern line drawings, elegant sketches, simple illustrations
${baseRequirements}

Theme/Inspiration: ${inspirations || "elegant and simple"}
Color preference: ${colorSchemes || "minimal and refined"}`
  };

  return stylePrompts[styleId] || stylePrompts["minimalist-vector"];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { selections, variationIndex = 0 } = await req.json();
    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured");
    }

    // Build prompt from selections
    const inspirations = selections.inspirations?.join(", ") || "";
    const productTypes = selections.productTypes?.join(", ") || "";
    const colorSchemes = selections.colorSchemes?.join(", ") || "";
    const designConcepts = selections.designConcepts || [];

    // Map user-friendly names to style IDs
    const styleNameToId: Record<string, string> = {
      "Minimalist Vector": "minimalist-vector",
      "Detailed Illustration": "detailed-illustration",
      "Typography Art": "typography-art",
      "Quirky & Fun": "quirky-humorous",
      "Simple Line Art": "line-art"
    };

    const selectedStyleName = designConcepts[0] || "Minimalist Vector";
    const selectedStyleId = styleNameToId[selectedStyleName] || "minimalist-vector";

    // Add variation instruction for compositional diversity
    const variationSuffixes = [
      "",
      "\n\nIMPORTANT VARIATION: Create a different compositional layout, angle, or arrangement compared to a standard centered view. Try a diagonal composition, off-center placement, or unique perspective.",
      "\n\nIMPORTANT VARIATION: Use alternative color emphasis, scale variation, or creative element arrangement for maximum diversity. Try a bold scale contrast or unexpected color distribution."
    ];

    const basePrompt = getStylePrompt(selectedStyleId, inspirations, productTypes, colorSchemes);
    const prompt = basePrompt + variationSuffixes[variationIndex];

    console.log("Generating design with style:", selectedStyleId);
    console.log("Full prompt:", prompt);

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-image-1",
        prompt: prompt,
        n: 1,
        size: "1024x1024",
        quality: "high",
        background: "transparent",
        output_format: "png"
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenAI API error:", response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const base64Image = data.data?.[0]?.b64_json;

    if (!base64Image) {
      throw new Error("No image generated");
    }

    const imageUrl = `data:image/png;base64,${base64Image}`;

    console.log("Design generated successfully");

    return new Response(
      JSON.stringify({ imageUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-design-png:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
