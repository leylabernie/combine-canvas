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
    const { selections, imageUrl, promptIndex = 0 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const productType = selections.productTypes?.[0] || "mug";
    
    // Define all 10 prompts for each product type
    const mugPrompts = [
      "Photorealistic professional product photography of 11oz white ceramic coffee mug with design printed full wrap around both sides, isolated on transparent background, front view straight-on, ultra sharp focus, perfect lighting and shadows, e-commerce mockup style, 8K resolution",
      "Photorealistic cozy Christmas lifestyle photo of white ceramic mug printed with design full wrap, steaming hot cocoa with marshmallows, on rustic wooden table beside gingerbread cookies and cinnamon sticks, soft bokeh fairy lights in background, warm natural lighting, sharp focus on mug, professional Etsy POD mockup, 8K",
      "Photorealistic image of hands holding white ceramic mug with design, sitting on plush blanket by crackling fireplace, wool socks and holiday book nearby, steam rising, golden hour lighting, hyper-realistic shadows, Etsy POD style, 8K",
      "Photorealistic side profile view of 11oz white ceramic mug showing design wrap around curve perfectly, on saucer with spoon, simple white table, studio lighting, crisp details, product mockup, 8K",
      "Extreme close-up macro photography of design on white ceramic mug surface, showing texture and vibrant colors, subtle reflections, professional print quality, 8K",
      "Photorealistic back view of white ceramic mug with design full wrap, placed on festive knitted coaster, blurred Christmas tree background, natural light, sharp, 8K",
      "Overhead flat lay of white mug with design, surrounded by pine branches, ornaments, and ribbon, minimalist holiday vibe, top-down product photography, 8K",
      "Photorealistic mug with design on office desk with laptop and notebook, morning coffee steam, window light with snow outside, cozy work-from-home scene, 8K",
      "Photorealistic professional product photography of 11oz white ceramic coffee mug with design, alternate clean angle with soft shadows, isolated white background, 8K resolution",
      "Photorealistic lifestyle shot of white mug with design on breakfast table with croissants and fresh flowers, morning sunlight streaming through window, elegant styling, 8K"
    ];

    const giftBoxPrompts = [
      "Photorealistic front view of closed gift box wrapped in paper printed with design on all sides, large gold satin ribbon bow, isolated on white background, straight-on angle, luxury product photography, ultra sharp, 8K",
      "Photorealistic holiday scene: gift box with design wrapping and gold bow under twinkling Christmas tree on plush rug, scattered ornaments, warm ambient lights, cozy living room, sharp focus on box, Etsy POD mockup, 8K",
      "Photorealistic slightly open gift box showing design inside and out, gold ribbon half-untied revealing tissue paper, on marble table with pinecones, elegant unboxing shot, natural light, 8K",
      "Photorealistic 3/4 side view of design gift box with perfect wrap and bow, stacked with smaller gifts, wooden tray, soft shadows, professional styling, 8K",
      "Macro close-up of design wrapping paper texture on gift box, gold ribbon detail and tag, vibrant colors, luxury print quality, bokeh background, 8K",
      "Photorealistic flat lay of 3 design gift boxes in different sizes, ribbons spilling over, surrounded by holly and bells, overhead holiday mockup, 8K",
      "Photorealistic gift box with design on fireplace mantel beside stockings and candles, flickering fire glow, rustic wood, festive atmosphere, 8K",
      "Photorealistic styled scene: design gift box next to matching mug, cookies, and evergreen sprigs on tray, ready-to-gift, warm lighting, 8K",
      "Photorealistic clean product shot of gift box with design wrapping, alternate angle with gold ribbon, white background, professional e-commerce style, 8K",
      "Photorealistic festive table setting with design gift box as centerpiece, candles and pine garland, elegant holiday entertaining, 8K"
    ];

    // Select appropriate prompt based on product type and index
    const prompts = productType.toLowerCase().includes('gift') || productType.toLowerCase().includes('box') 
      ? giftBoxPrompts 
      : mugPrompts;
    
    const prompt = prompts[promptIndex] || prompts[0];
    
    console.log(`Generating mockup ${promptIndex + 1}/10 for ${productType}:`, prompt);

    console.log("Generating mockup with prompt:", prompt);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
                text: prompt
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
        modalities: ["image", "text"]
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

    let data;
    try {
      const responseText = await response.text();
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      throw new Error("Failed to parse AI response - image too large or malformed");
    }
    
    const mockupUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!mockupUrl) {
      throw new Error("No mockup generated");
    }

    console.log("Mockup generated successfully");

    return new Response(
      JSON.stringify({ mockupUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-mockup:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
