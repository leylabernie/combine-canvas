import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import JSZip from "jszip";

interface Selection {
  inspirations: string[];
  productTypes: string[];
  colorSchemes: string[];
  designConcepts: string[];
}

const Index = () => {
  const [selections, setSelections] = useState<Selection>({
    inspirations: [],
    productTypes: [],
    colorSchemes: [],
    designConcepts: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [designVariations, setDesignVariations] = useState<string[]>([]);
  const [selectedDesign, setSelectedDesign] = useState<string | null>(null);
  const [mockupVariations, setMockupVariations] = useState<string[]>([]);
  const [selectedMockup, setSelectedMockup] = useState<string | null>(null);
  const [generatedListing, setGeneratedListing] = useState<any>(null);

  const toggleSelection = (category: keyof Selection, value: string) => {
    setSelections((prev) => ({
      ...prev,
      [category]: prev[category].includes(value)
        ? prev[category].filter((item) => item !== value)
        : [...prev[category], value],
    }));
  };

  const clearAllSelections = () => {
    setSelections({
      inspirations: [],
      productTypes: [],
      colorSchemes: [],
      designConcepts: [],
    });
  };

  const hasSelections = Object.values(selections).some((arr) => arr.length > 0);

  const inspirationOptions = [
    { id: "diwali", emoji: "🪔", name: "Diwali", desc: "Festival of Lights" },
    { id: "holi", emoji: "🎨", name: "Holi", desc: "Festival of Colors" },
    { id: "christmas", emoji: "🎄", name: "Christmas", desc: "Holiday Spirit" },
    { id: "rangoli", emoji: "✨", name: "Rangoli", desc: "Colorful floor art" },
    { id: "mandala", emoji: "✼", name: "Mandala", desc: "Sacred geometry" },
    { id: "lotus", emoji: "🪷", name: "Lotus", desc: "Sacred flower" },
    { id: "peacock", emoji: "🦚", name: "Peacock", desc: "Majestic bird" },
    { id: "henna", emoji: "🌿", name: "Henna/Mehndi", desc: "Body art patterns" },
    { id: "ganesh", emoji: "🐘", name: "Ganesh", desc: "Lord of beginnings" },
    { id: "sanskrit", emoji: "🕉️", name: "Sanskrit", desc: "Ancient mantras" },
    { id: "nature", emoji: "🌿", name: "Nature", desc: "Natural elements" },
    { id: "geometric", emoji: "◇", name: "Geometric", desc: "Modern patterns" },
    { id: "floral", emoji: "🌸", name: "Floral", desc: "Botanical beauty" },
    { id: "celestial", emoji: "⭐", name: "Celestial", desc: "Stars & Moon" },
  ];

  const productTypeOptions = [
    { category: "Decor", items: [
      { id: "ornament", emoji: "🎄", name: "Ornament", desc: "Tree decorations" },
      { id: "wreath", emoji: "🌿", name: "Wreath", desc: "Door decorations" },
      { id: "wall-art", emoji: "🖼️", name: "Wall Art", desc: "Framed pieces" },
      { id: "poster", emoji: "📜", name: "Poster", desc: "Prints & posters" },
      { id: "candle", emoji: "🕯️", name: "Candle Holder", desc: "Light fixtures" },
    ]},
    { category: "Kitchenware", items: [
      { id: "mug", emoji: "☕", name: "Mug", desc: "Coffee & tea" },
    ]},
    { category: "Apparel", items: [
      { id: "tshirt", emoji: "👕", name: "T-Shirt", desc: "Clothing" },
    ]},
    { category: "Home", items: [
      { id: "pillow", emoji: "🛋️", name: "Throw Pillow", desc: "Cushions" },
    ]},
    { category: "Accessories", items: [
      { id: "tote", emoji: "👜", name: "Tote Bag", desc: "Bags" },
      { id: "sticker", emoji: "✨", name: "Sticker", desc: "Vinyl stickers" },
      { id: "phone", emoji: "📱", name: "Phone Case", desc: "Device covers" },
    ]},
    { category: "Stationery", items: [
      { id: "notebook", emoji: "📓", name: "Notebook", desc: "Journals" },
      { id: "card", emoji: "💌", name: "Greeting Card", desc: "Holiday cards" },
    ]},
  ];

  const colorSchemeOptions = [
    { id: "warm-sunset", name: "Warm Sunset", colors: ["#FF6B35", "#F7931E", "#FDC830"] },
    { id: "cool-ocean", name: "Cool Ocean", colors: ["#0077BE", "#00B4D8", "#90E0EF"] },
    { id: "royal-purple", name: "Royal Purple", colors: ["#6A0572", "#AB83A1", "#E5D4E8"] },
    { id: "forest-green", name: "Forest Green", colors: ["#2D6A4F", "#52B788", "#95D5B2"] },
    { id: "festive-red", name: "Festive Red", colors: ["#C1121F", "#FF6B6B", "#FFE5EC"] },
    { id: "elegant-gold", name: "Elegant Gold", colors: ["#C9A227", "#FFD700", "#FFF8DC"] },
    { id: "pastel-dream", name: "Pastel Dream", colors: ["#FFB3BA", "#BAFFC9", "#BAE1FF"] },
    { id: "monochrome", name: "Monochrome", colors: ["#1A1A1A", "#757575", "#E0E0E0"] },
  ];

  const designConceptOptions = [
    { id: "minimalist", name: "Minimalist", desc: "Clean and simple" },
    { id: "ornate", name: "Ornate", desc: "Detailed & decorative" },
    { id: "modern-fusion", name: "Modern Fusion", desc: "Contemporary blend" },
    { id: "traditional", name: "Traditional", desc: "Classic heritage" },
    { id: "geometric", name: "Geometric", desc: "Clean patterns" },
    { id: "abstract", name: "Abstract", desc: "Artistic freedom" },
  ];

  const handleGenerateDesigns = async () => {
    if (!hasSelections) {
      toast.error("Please make at least one selection");
      return;
    }

    setIsGenerating(true);
    setDesignVariations([]);
    setSelectedDesign(null);
    setMockupVariations([]);
    setSelectedMockup(null);
    setGeneratedListing(null);
    
    try {
      toast.info("Generating 3 design variations...");
      
      const promises = Array(3).fill(null).map(() => 
        supabase.functions.invoke("generate-design-png", {
          body: { selections },
        })
      );
      
      const results = await Promise.all(promises);
      const imageUrls = results
        .filter(({ data, error }) => !error && data?.imageUrl)
        .map(({ data }) => data.imageUrl);

      if (imageUrls.length === 0) {
        const firstError = results.find(({ error }) => error)?.error;
        if (firstError?.message?.includes("Payment required")) {
          toast.error("Out of credits. Please add credits to your Lovable workspace in Settings → Usage.");
        } else if (firstError?.message?.includes("Rate limit")) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else {
          toast.error("Failed to generate designs. Please try again.");
        }
        return;
      }

      setDesignVariations(imageUrls);
      toast.success(`${imageUrls.length} design variations generated!`);
    } catch (error: any) {
      console.error("Error generating designs:", error);
      toast.error(error.message || "Failed to generate designs");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMockups = async () => {
    if (!selectedDesign) return;
    
    setIsGenerating(true);
    setMockupVariations([]);
    setSelectedMockup(null);
    setGeneratedListing(null);
    
    try {
      const mockups: string[] = [];
      
      // Generate 10 mockups sequentially with progress updates
      for (let i = 0; i < 10; i++) {
        toast.info(`Generating 8K mockup ${i + 1} of 10...`);
        
        const { data, error } = await supabase.functions.invoke("generate-mockup", {
          body: { 
            selections, 
            imageUrl: selectedDesign,
            promptIndex: i
          },
        });

        if (error) {
          console.error(`Error generating mockup ${i + 1}:`, error);
          if (error.message?.includes("Payment required")) {
            toast.error("Out of credits. Please add credits to your Lovable workspace in Settings → Usage.");
            break;
          } else if (error.message?.includes("Rate limit")) {
            toast.error("Rate limit exceeded. Please wait and try again.");
            break;
          }
          continue;
        }
        
        if (data?.mockupUrl) {
          mockups.push(data.mockupUrl);
          setMockupVariations([...mockups]); // Update UI progressively
        }
      }

      if (mockups.length > 0) {
        toast.success(`Successfully generated ${mockups.length} 8K mockups!`);
      } else {
        toast.error("No mockups were generated");
      }
    } catch (error: any) {
      console.error("Error generating mockups:", error);
      toast.error(error.message || "Failed to generate mockups");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateListing = async () => {
    setIsGenerating(true);
    try {
      toast.info("Generating SEO-optimized listing...");
      
      const { data, error } = await supabase.functions.invoke("generate-listing", {
        body: { selections },
      });

      if (error) {
        if (error.message?.includes("Payment required")) {
          toast.error("Out of credits. Please add credits to your Lovable workspace in Settings → Usage.");
        } else if (error.message?.includes("Rate limit")) {
          toast.error("Rate limit exceeded. Please try again later.");
        } else {
          toast.error("Failed to generate listing. Please try again.");
        }
        throw error;
      }

      setGeneratedListing(data.listing);
      toast.success("Listing generated successfully!");
    } catch (error: any) {
      console.error("Error generating listing:", error);
      toast.error(error.message || "Failed to generate listing");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportListing = async () => {
    if (!generatedListing) {
      toast.error("No listing to export");
      return;
    }

    try {
      const zip = new JSZip();

      // Add listing data as JSON
      const listingData = {
        title: generatedListing.title,
        description: generatedListing.description,
        features: generatedListing.features,
        tags: generatedListing.tags,
        priceRange: generatedListing.priceRange,
        selections: selections,
        exportedAt: new Date().toISOString(),
      };
      zip.file('listing.json', JSON.stringify(listingData, null, 2));

      // Add selected design if available
      if (selectedDesign) {
        const pngResponse = await fetch(selectedDesign);
        const pngBlob = await pngResponse.blob();
        zip.file('design.png', pngBlob);
      }

      // Add selected mockup if available
      if (selectedMockup) {
        const mockupResponse = await fetch(selectedMockup);
        const mockupBlob = await mockupResponse.blob();
        zip.file('mockup.png', mockupBlob);
      }

      // Generate and download ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-listing-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Listing exported as ZIP successfully!");
    } catch (error) {
      console.error("Error creating ZIP:", error);
      toast.error("Failed to export listing");
    }
  };

  const downloadImage = (imageUrl: string, prefix: string) => {
    if (!imageUrl) return;
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = `${prefix}-${Date.now()}.png`;
    a.click();
  };



  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Product Design Studio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create unique product designs by selecting your preferred elements. All choices are optional - mix and match to your heart's content!
          </p>
        </header>

        {/* Summary Card */}
        <Card className="mb-12 p-6 bg-gradient-to-br from-card to-muted/30 border-2 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">Your Design Summary</h3>
            {hasSelections && (
              <Button variant="outline" size="sm" onClick={clearAllSelections}>
                Clear All
              </Button>
            )}
          </div>
          
          {!hasSelections ? (
            <p className="text-muted-foreground">No selections yet. Start choosing options to see your summary here.</p>
          ) : (
            <div className="space-y-3">
              {selections.inspirations.length > 0 && (
                <div>
                  <span className="font-medium text-sm text-muted-foreground">Inspiration:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selections.inspirations.map((item) => (
                      <Badge key={item} variant="secondary">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selections.productTypes.length > 0 && (
                <div>
                  <span className="font-medium text-sm text-muted-foreground">Products:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selections.productTypes.map((item) => (
                      <Badge key={item} variant="secondary">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selections.colorSchemes.length > 0 && (
                <div>
                  <span className="font-medium text-sm text-muted-foreground">Colors:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selections.colorSchemes.map((item) => (
                      <Badge key={item} variant="secondary">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {selections.designConcepts.length > 0 && (
                <div>
                  <span className="font-medium text-sm text-muted-foreground">Design Style:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {selections.designConcepts.map((item) => (
                      <Badge key={item} variant="secondary">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Inspiration Section */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Choose Your Inspiration</h2>
            <p className="text-muted-foreground">Mix multiple holidays or themes for unique designs (optional)</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {inspirationOptions.map((option) => (
              <Card
                key={option.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                  selections.inspirations.includes(option.name)
                    ? "border-primary border-2 bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => toggleSelection("inspirations", option.name)}
              >
                <div className="text-center">
                  <div className="text-4xl mb-3">{option.emoji}</div>
                  <h3 className="font-semibold mb-1">{option.name}</h3>
                  <p className="text-sm text-muted-foreground">{option.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Product Type Section */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Select Product Type</h2>
            <p className="text-muted-foreground">Choose what type of product you want to create (optional)</p>
          </div>
          {productTypeOptions.map((category) => (
            <div key={category.category} className="mb-8">
              <h3 className="text-xl font-semibold mb-4 text-primary">{category.category}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {category.items.map((option) => (
                  <Card
                    key={option.id}
                    className={`p-4 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                      selections.productTypes.includes(option.name)
                        ? "border-primary border-2 bg-primary/5"
                        : "hover:border-primary/50"
                    }`}
                    onClick={() => toggleSelection("productTypes", option.name)}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">{option.emoji}</div>
                      <h4 className="font-semibold text-sm mb-1">{option.name}</h4>
                      <p className="text-xs text-muted-foreground">{option.desc}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Color Scheme Section */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Pick Your Colors</h2>
            <p className="text-muted-foreground">Select a color palette for your design (optional)</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {colorSchemeOptions.map((option) => (
              <Card
                key={option.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                  selections.colorSchemes.includes(option.name)
                    ? "border-primary border-2 bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => toggleSelection("colorSchemes", option.name)}
              >
                <div className="text-center">
                  <div className="flex justify-center gap-2 mb-3">
                    {option.colors.map((color, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                  <h3 className="font-semibold">{option.name}</h3>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Design Concept Section */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-3xl font-bold mb-2">Choose Design Concept</h2>
            <p className="text-muted-foreground">Select the overall design style (optional)</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {designConceptOptions.map((option) => (
              <Card
                key={option.id}
                className={`p-6 cursor-pointer transition-all hover:shadow-lg hover:scale-105 ${
                  selections.designConcepts.includes(option.name)
                    ? "border-primary border-2 bg-primary/5"
                    : "hover:border-primary/50"
                }`}
                onClick={() => toggleSelection("designConcepts", option.name)}
              >
                <div className="text-center">
                  <h3 className="font-semibold mb-1">{option.name}</h3>
                  <p className="text-sm text-muted-foreground">{option.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Generate Designs Button - Only show if no designs generated yet */}
        {designVariations.length === 0 && (
          <section className="mb-12">
            <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-secondary/5 border-2">
              <h2 className="text-3xl font-bold mb-4">Ready to Create?</h2>
              <p className="text-muted-foreground mb-6">
                Generate 3 unique design variations based on your selections
              </p>
              <Button 
                onClick={handleGenerateDesigns} 
                disabled={isGenerating}
                size="lg"
                className="px-8"
              >
                {isGenerating ? "Generating..." : "Generate Design Variations"}
              </Button>
            </Card>
          </section>
        )}

        {/* Design Variations Gallery - Only show if mockups not generated yet */}
        {designVariations.length > 0 && !isGenerating && mockupVariations.length === 0 && (
          <section className="mb-12">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-4">Select Your Favorite Design</h3>
              <p className="text-muted-foreground mb-6">Choose one design to create mockup variations</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {designVariations.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg border-4 transition-all hover:shadow-xl ${
                      selectedDesign === imageUrl
                        ? "border-primary shadow-lg"
                        : "border-transparent hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedDesign(imageUrl)}
                  >
                    <div className="bg-checkerboard rounded-lg p-4">
                      <img
                        src={imageUrl}
                        alt={`Design variation ${index + 1}`}
                        className="w-full h-auto mx-auto"
                      />
                    </div>
                    <div className="text-center p-3">
                      <p className="font-semibold">Design {index + 1}</p>
                      {selectedDesign === imageUrl && (
                        <Badge className="mt-2">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {selectedDesign && (
                <div className="mt-6 text-center">
                  <Button 
                    onClick={handleGenerateMockups} 
                    disabled={isGenerating}
                    size="lg"
                  >
                    {isGenerating ? "Generating..." : "Generate 7 Mockup Variations"}
                  </Button>
                </div>
              )}
            </Card>
          </section>
        )}

        {/* Mockup Variations Gallery */}
        {mockupVariations.length > 0 && (
          <section className="mb-12">
            <Card className="p-6">
              <h3 className="text-2xl font-bold mb-4">Select Your Favorite Mockup</h3>
              <p className="text-muted-foreground mb-6">Choose one mockup to create the final listing</p>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockupVariations.map((mockupUrl, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg border-4 transition-all hover:shadow-xl ${
                      selectedMockup === mockupUrl
                        ? "border-primary shadow-lg"
                        : "border-transparent hover:border-primary/50"
                    }`}
                    onClick={() => setSelectedMockup(mockupUrl)}
                  >
                    <div className="bg-muted/30 rounded-lg p-4">
                      <img
                        src={mockupUrl}
                        alt={`Mockup variation ${index + 1}`}
                        className="w-full h-auto mx-auto"
                      />
                    </div>
                    <div className="text-center p-3">
                      <p className="font-semibold">Mockup {index + 1}</p>
                      {selectedMockup === mockupUrl && (
                        <Badge className="mt-2">Selected</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {selectedMockup && (
                <div className="mt-6 text-center">
                  <Button 
                    onClick={handleGenerateListing} 
                    disabled={isGenerating}
                    size="lg"
                  >
                    {isGenerating ? "Generating..." : "Generate Full Listing"}
                  </Button>
                </div>
              )}
            </Card>
          </section>
        )}


        {/* Product Listing Section */}
        {generatedListing && (
          <>
            <div className="space-y-8 mb-12">
              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-4">Selected Design</h3>
                <div className="bg-checkerboard rounded-lg p-4 mb-4">
                  <img
                    src={selectedDesign || ''}
                    alt="Selected design"
                    className="max-w-sm h-auto mx-auto"
                  />
                </div>
                <Button onClick={() => downloadImage(selectedDesign || '', 'design')} className="w-full">
                  Download Design PNG
                </Button>
              </Card>

              <Card className="p-6">
                <h3 className="text-2xl font-bold mb-4">Selected Mockup</h3>
                <div className="rounded-lg p-4 mb-4 bg-muted/30">
                  <img
                    src={selectedMockup || ''}
                    alt="Selected mockup"
                    className="max-w-sm h-auto mx-auto"
                  />
                </div>
                <Button onClick={() => downloadImage(selectedMockup || '', 'mockup')} className="w-full">
                  Download Mockup
                </Button>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-2xl font-semibold mb-6">Product Listing</h3>
              <div className="space-y-6">
                {generatedListing.title && (
                  <div>
                    <h4 className="font-semibold mb-2 text-muted-foreground">Title</h4>
                    <p className="text-lg">{generatedListing.title}</p>
                  </div>
                )}
                {generatedListing.description && (
                  <div>
                    <h4 className="font-semibold mb-2 text-muted-foreground">Description</h4>
                    <p className="text-muted-foreground">{generatedListing.description}</p>
                  </div>
                )}
                {generatedListing.features && (
                  <div>
                    <h4 className="font-semibold mb-2 text-muted-foreground">Features</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {generatedListing.features.map((feature: string, i: number) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {generatedListing.tags && (
                  <div>
                    <h4 className="font-semibold mb-2 text-muted-foreground">Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {generatedListing.tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {generatedListing.priceRange && (
                  <div>
                    <h4 className="font-semibold mb-2 text-muted-foreground">Price Range</h4>
                    <p>{generatedListing.priceRange}</p>
                  </div>
                )}
              </div>
              <div className="mt-6">
                <Button onClick={handleExportListing} className="w-full" size="lg">
                  Export as ZIP
                </Button>
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default Index;
