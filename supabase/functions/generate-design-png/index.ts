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

    // Build a detailed prompt from selections
    const promptParts = [];
    
    if (selections.inspirations?.length > 0) {
      promptParts.push(`Inspiration: ${selections.inspirations.join(", ")}`);
    }
    if (selections.productTypes?.length > 0) {
      promptParts.push(`Product: ${selections.productTypes.join(", ")}`);
    }
    if (selections.colorSchemes?.length > 0) {
      promptParts.push(`Color palette: ${selections.colorSchemes.join(", ")}`);
    }
    if (selections.designConcepts?.length > 0) {
      promptParts.push(`Design style: ${selections.designConcepts.join(", ")}`);
    }

    const prompt = `Create a beautiful, high-quality product design with transparent background as a PNG image. ${promptParts.join(". ")}. Ultra high resolution, professional design, centered composition, perfect for e-commerce with transparent background.`;

    console.log("Generating image with prompt:", prompt);

    // First generate the image
    let response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        modalities: ["image"],
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
    console.log("AI gateway response:", JSON.stringify(data));
    
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error("No image in response. Full response:", JSON.stringify(data));
      throw new Error("No image generated. The AI model may not have returned an image.");
    }

    // Now use AI to edit the image and ensure transparent background
    console.log("Removing background from generated image...");
    
    response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Remove the background from this image and make it completely transparent. Keep only the product, remove everything else."
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        modalities: ["image"],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error for background removal:", response.status, errorText);
      
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

    const editedData = await response.json();
    const finalImageUrl = editedData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!finalImageUrl) {
      console.error("No edited image in response. Falling back to original image");
      // Fall back to original image if background removal fails
      return new Response(JSON.stringify({ imageUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Image generated and background removed successfully");

    return new Response(JSON.stringify({ imageUrl: finalImageUrl }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-design-png:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
