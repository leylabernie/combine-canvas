import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";

interface Selection {
  inspirations: string[];
  productTypes: string[];
  colorSchemes: string[];
  designConcepts: string[];
}

interface GeneratedListing {
  title?: string;
  description?: string;
  features?: string[];
  tags?: string[];
  priceRange?: string;
  rawContent?: string;
}

const Index = () => {
  const [selections, setSelections] = useState<Selection>({
    inspirations: [],
    productTypes: [],
    colorSchemes: [],
    designConcepts: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [generatedListing, setGeneratedListing] = useState<GeneratedListing | null>(null);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showListingDialog, setShowListingDialog] = useState(false);

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

  const handleGeneratePNG = async () => {
    setIsGenerating(true);
    try {
      toast.info("Generating design image...");
      
      const { data, error } = await supabase.functions.invoke("generate-design-png", {
        body: { selections },
      });

      if (error) throw error;

      // Load the generated image
      toast.info("Removing background...");
      const response = await fetch(data.imageUrl);
      const blob = await response.blob();
      const imageElement = await loadImage(blob);
      
      // Remove background
      const transparentBlob = await removeBackground(imageElement);
      const transparentUrl = URL.createObjectURL(transparentBlob);
      
      setGeneratedImage(transparentUrl);
      setShowImageDialog(true);
      toast.success("PNG with transparent background generated!");
    } catch (error) {
      console.error("Error generating PNG:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate PNG");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateListing = async () => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-listing", {
        body: { selections },
      });

      if (error) throw error;

      setGeneratedListing(data.listing);
      setShowListingDialog(true);
      toast.success("Listing generated successfully!");
    } catch (error) {
      console.error("Error generating listing:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate listing");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportListing = () => {
    const exportData = {
      ...selections,
      generatedImage,
      generatedListing,
      timestamp: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `design-listing-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Listing exported successfully!");
  };

  const downloadImage = () => {
    if (!generatedImage) return;
    const a = document.createElement('a');
    a.href = generatedImage;
    a.download = `design-${Date.now()}.png`;
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


        {/* Footer */}
        {hasSelections && (
          <div className="flex justify-center gap-4 flex-wrap">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90" 
              onClick={handleGeneratePNG}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate PNG on Transparent Background"}
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              onClick={handleGenerateListing}
              disabled={isGenerating}
            >
              {isGenerating ? "Generating..." : "Generate Listing"}
            </Button>
            <Button 
              size="lg" 
              variant="secondary" 
              onClick={handleExportListing}
            >
              Export Full Listing
            </Button>
          </div>
        )}

        {/* Image Dialog */}
        <Dialog open={showImageDialog} onOpenChange={setShowImageDialog}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Generated Design</DialogTitle>
            </DialogHeader>
            {generatedImage && (
              <div className="space-y-4">
                <img src={generatedImage} alt="Generated design" className="w-full rounded-lg" />
                <Button onClick={downloadImage} className="w-full">
                  Download PNG
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Listing Dialog */}
        <Dialog open={showListingDialog} onOpenChange={setShowListingDialog}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Generated Product Listing</DialogTitle>
            </DialogHeader>
            {generatedListing && (
              <div className="space-y-4">
                {generatedListing.title && (
                  <div>
                    <h3 className="font-semibold mb-2">Title:</h3>
                    <p>{generatedListing.title}</p>
                  </div>
                )}
                {generatedListing.description && (
                  <div>
                    <h3 className="font-semibold mb-2">Description:</h3>
                    <p className="text-sm text-muted-foreground">{generatedListing.description}</p>
                  </div>
                )}
                {generatedListing.features && (
                  <div>
                    <h3 className="font-semibold mb-2">Features:</h3>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {generatedListing.features.map((feature: string, i: number) => (
                        <li key={i}>{feature}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {generatedListing.tags && (
                  <div>
                    <h3 className="font-semibold mb-2">Tags:</h3>
                    <div className="flex flex-wrap gap-2">
                      {generatedListing.tags.map((tag: string, i: number) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {generatedListing.priceRange && (
                  <div>
                    <h3 className="font-semibold mb-2">Price Range:</h3>
                    <p className="text-sm">{generatedListing.priceRange}</p>
                  </div>
                )}
                {generatedListing.rawContent && (
                  <div>
                    <h3 className="font-semibold mb-2">Content:</h3>
                    <p className="text-sm whitespace-pre-wrap">{generatedListing.rawContent}</p>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;