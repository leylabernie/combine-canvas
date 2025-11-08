import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import JSZip from "jszip";
import { User, Session } from "@supabase/supabase-js";
import { AuthForm } from "@/components/AuthForm";
import { FavoritesSection } from "@/components/FavoritesSection";
import { Heart, Sparkles, LogOut } from "lucide-react";

interface Selection {
  inspirations: string[];
  productTypes: string[];
  colorSchemes: string[];
  designConcepts: string[];
}

const Index = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [selections, setSelections] = useState<Selection>({
    inspirations: [],
    productTypes: [],
    colorSchemes: [],
    designConcepts: [],
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [designVariations, setDesignVariations] = useState<string[]>([]);
  const [selectedDesigns, setSelectedDesigns] = useState<string[]>([]);
  const [mockupVariations, setMockupVariations] = useState<string[]>([]);
  const [selectedMockups, setSelectedMockups] = useState<string[]>([]);
  const [generatedListing, setGeneratedListing] = useState<any>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

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

  const toggleDesignSelection = (designUrl: string) => {
    setSelectedDesigns(prev => 
      prev.includes(designUrl)
        ? prev.filter(url => url !== designUrl)
        : [...prev, designUrl]
    );
  };

  const toggleMockupSelection = (mockupUrl: string) => {
    setSelectedMockups(prev => 
      prev.includes(mockupUrl)
        ? prev.filter(url => url !== mockupUrl)
        : [...prev, mockupUrl]
    );
  };

  const selectAllDesigns = () => {
    setSelectedDesigns([...designVariations]);
  };

  const deselectAllDesigns = () => {
    setSelectedDesigns([]);
  };

  const selectAllMockups = () => {
    setSelectedMockups([...mockupVariations]);
  };

  const deselectAllMockups = () => {
    setSelectedMockups([]);
  };

  const hasSelections = Object.values(selections).some((arr) => arr.length > 0);

  const handleSurpriseMe = () => {
    const randomInspiration = inspirationOptions[Math.floor(Math.random() * inspirationOptions.length)];
    const randomProductCategory = productTypeOptions[Math.floor(Math.random() * productTypeOptions.length)];
    const randomProduct = randomProductCategory.items[Math.floor(Math.random() * randomProductCategory.items.length)];
    const randomColor = colorSchemeOptions[Math.floor(Math.random() * colorSchemeOptions.length)];
    const randomConcept = designConceptOptions[Math.floor(Math.random() * designConceptOptions.length)];

    setSelections({
      inspirations: [randomInspiration.name],
      productTypes: [randomProduct.name],
      colorSchemes: [randomColor.name],
      designConcepts: [randomConcept.name],
    });

    toast.success("Surprise! Random selections made for you!");
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Signed out successfully");
  };

  const addToFavorites = async (designUrl: string, designType: string) => {
    if (!user) {
      setShowAuthForm(true);
      toast.error("Please sign in to save favorites");
      return;
    }

    try {
      const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        design_url: designUrl,
        design_type: designType,
      });

      if (error) throw error;
      toast.success("Added to favorites!");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const inspirationOptions = [
    // Upcoming Holidays 2025
    { id: "new-year", emoji: "🎆", name: "New Year 2025", desc: "Fresh beginnings" },
    { id: "valentines", emoji: "💝", name: "Valentine's Day", desc: "Love & romance" },
    { id: "st-patricks", emoji: "☘️", name: "St. Patrick's Day", desc: "Irish luck" },
    { id: "easter", emoji: "🐰", name: "Easter", desc: "Spring celebration" },
    { id: "earth-day", emoji: "🌍", name: "Earth Day", desc: "Environmental awareness" },
    { id: "mothers-day", emoji: "👩", name: "Mother's Day", desc: "Honoring mothers" },
    { id: "memorial-day", emoji: "🇺🇸", name: "Memorial Day", desc: "Remembrance" },
    { id: "fathers-day", emoji: "👨", name: "Father's Day", desc: "Celebrating dads" },
    { id: "independence-day", emoji: "🎆", name: "4th of July", desc: "Independence" },
    { id: "halloween", emoji: "🎃", name: "Halloween", desc: "Spooky season" },
    { id: "thanksgiving", emoji: "🦃", name: "Thanksgiving", desc: "Gratitude & harvest" },
    { id: "christmas", emoji: "🎄", name: "Christmas", desc: "Holiday Spirit" },
    { id: "hanukkah", emoji: "🕎", name: "Hanukkah", desc: "Festival of Lights" },
    
    // Cultural & Festivals
    { id: "diwali", emoji: "🪔", name: "Diwali", desc: "Festival of Lights" },
    { id: "holi", emoji: "🎨", name: "Holi", desc: "Festival of Colors" },
    { id: "lunar-new-year", emoji: "🧧", name: "Lunar New Year", desc: "Asian celebration" },
    { id: "cinco-de-mayo", emoji: "🌮", name: "Cinco de Mayo", desc: "Mexican heritage" },
    
    // Themes
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
    { id: "tropical", emoji: "🌺", name: "Tropical", desc: "Island vibes" },
    { id: "vintage", emoji: "📻", name: "Vintage", desc: "Retro aesthetics" },
    { id: "boho", emoji: "🌙", name: "Bohemian", desc: "Free-spirited" },
    { id: "nautical", emoji: "⚓", name: "Nautical", desc: "Ocean & ships" },
  ];

  const productTypeOptions = [
    { category: "Decor", items: [
      { id: "ornament", emoji: "🎄", name: "Ornament", desc: "Tree decorations" },
      { id: "wreath", emoji: "🌿", name: "Wreath", desc: "Door decorations" },
      { id: "wall-art", emoji: "🖼️", name: "Wall Art", desc: "Framed pieces" },
      { id: "poster", emoji: "📜", name: "Poster", desc: "Prints & posters" },
      { id: "candle", emoji: "🕯️", name: "Candle Holder", desc: "Light fixtures" },
      { id: "garland", emoji: "🎀", name: "Garland", desc: "Hanging decorations" },
      { id: "banner", emoji: "🎊", name: "Banner", desc: "Celebration banners" },
      { id: "table-runner", emoji: "🏛️", name: "Table Runner", desc: "Table decor" },
    ]},
    { category: "Kitchenware", items: [
      { id: "mug", emoji: "☕", name: "Mug", desc: "Coffee & tea" },
      { id: "wine-glass", emoji: "🍷", name: "Wine Glass", desc: "Drinkware" },
      { id: "coaster", emoji: "☕", name: "Coaster", desc: "Drink coasters" },
      { id: "cutting-board", emoji: "🔪", name: "Cutting Board", desc: "Kitchen tools" },
      { id: "apron", emoji: "👨‍🍳", name: "Apron", desc: "Cooking apparel" },
      { id: "dish-towel", emoji: "🧽", name: "Dish Towel", desc: "Kitchen textiles" },
    ]},
    { category: "Apparel", items: [
      { id: "tshirt", emoji: "👕", name: "T-Shirt", desc: "Clothing" },
      { id: "hoodie", emoji: "🧥", name: "Hoodie", desc: "Sweatshirts" },
      { id: "tank-top", emoji: "🎽", name: "Tank Top", desc: "Sleeveless" },
      { id: "sweatshirt", emoji: "👔", name: "Sweatshirt", desc: "Casual wear" },
      { id: "hat", emoji: "🧢", name: "Hat", desc: "Headwear" },
      { id: "socks", emoji: "🧦", name: "Socks", desc: "Footwear" },
    ]},
    { category: "Home", items: [
      { id: "pillow", emoji: "🛋️", name: "Throw Pillow", desc: "Cushions" },
      { id: "blanket", emoji: "🛏️", name: "Throw Blanket", desc: "Cozy blankets" },
      { id: "doormat", emoji: "🚪", name: "Doormat", desc: "Welcome mats" },
      { id: "shower-curtain", emoji: "🚿", name: "Shower Curtain", desc: "Bathroom decor" },
      { id: "tapestry", emoji: "🎨", name: "Tapestry", desc: "Wall hangings" },
    ]},
    { category: "Accessories", items: [
      { id: "tote", emoji: "👜", name: "Tote Bag", desc: "Bags" },
      { id: "sticker", emoji: "✨", name: "Sticker", desc: "Vinyl stickers" },
      { id: "phone", emoji: "📱", name: "Phone Case", desc: "Device covers" },
      { id: "keychain", emoji: "🔑", name: "Keychain", desc: "Key accessories" },
      { id: "pin", emoji: "📌", name: "Enamel Pin", desc: "Collectible pins" },
      { id: "magnet", emoji: "🧲", name: "Magnet", desc: "Fridge magnets" },
      { id: "patch", emoji: "🎖️", name: "Patch", desc: "Iron-on patches" },
    ]},
    { category: "Stationery", items: [
      { id: "notebook", emoji: "📓", name: "Notebook", desc: "Journals" },
      { id: "card", emoji: "💌", name: "Greeting Card", desc: "Holiday cards" },
      { id: "calendar", emoji: "📅", name: "Calendar", desc: "Wall calendars" },
      { id: "bookmark", emoji: "🔖", name: "Bookmark", desc: "Reading markers" },
      { id: "planner", emoji: "📔", name: "Planner", desc: "Organizers" },
      { id: "pen", emoji: "🖊️", name: "Pen", desc: "Writing tools" },
    ]},
    { category: "Tech", items: [
      { id: "laptop-sleeve", emoji: "💻", name: "Laptop Sleeve", desc: "Device protection" },
      { id: "mouse-pad", emoji: "🖱️", name: "Mouse Pad", desc: "Desk accessories" },
      { id: "phone-wallet", emoji: "💳", name: "Phone Wallet", desc: "Card holders" },
      { id: "airpod-case", emoji: "🎧", name: "AirPod Case", desc: "Earbud protection" },
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
    { id: "rose-gold", name: "Rose Gold", colors: ["#B76E79", "#E8C4C8", "#F4E4E6"] },
    { id: "mint-fresh", name: "Mint Fresh", colors: ["#00B8A9", "#5FD3C1", "#C8F4EE"] },
    { id: "lavender-fields", name: "Lavender Fields", colors: ["#9B59B6", "#C39BD3", "#E8DAEF"] },
    { id: "autumn-spice", name: "Autumn Spice", colors: ["#D2691E", "#E89C5C", "#F5DEB3"] },
    { id: "peachy-keen", name: "Peachy Keen", colors: ["#FF9A8B", "#FFBB96", "#FFE5D9"] },
    { id: "navy-blue", name: "Navy Blue", colors: ["#003366", "#4A7BA7", "#A8D0E6"] },
    { id: "cherry-blossom", name: "Cherry Blossom", colors: ["#FFB7C5", "#FFC9D4", "#FFE4E9"] },
    { id: "sage-green", name: "Sage Green", colors: ["#8A9A5B", "#B5C99A", "#E1ECC8"] },
    { id: "coral-reef", name: "Coral Reef", colors: ["#FF6F61", "#FF8B7B", "#FFB5A7"] },
    { id: "midnight-sky", name: "Midnight Sky", colors: ["#191970", "#4169E1", "#87CEEB"] },
    { id: "champagne-gold", name: "Champagne Gold", colors: ["#F7E7CE", "#E6D5AC", "#D4C4A8"] },
    { id: "berry-fusion", name: "Berry Fusion", colors: ["#8E44AD", "#C0392B", "#E74C3C"] },
    { id: "turquoise-wave", name: "Turquoise Wave", colors: ["#1ABC9C", "#48C9B0", "#76D7C4"] },
  ];

  const designConceptOptions = [
    { 
      id: "minimalist-vector", 
      name: "Minimalist Vector", 
      desc: "Clean silhouettes & simple shapes",
      example: "Like Jesus tree or dog designs"
    },
    { 
      id: "detailed-illustration", 
      name: "Detailed Illustration", 
      desc: "Highly detailed, photorealistic",
      example: "Like book stack or gnome truck"
    },
    { 
      id: "typography-art", 
      name: "Typography Art", 
      desc: "Creative text-focused designs",
      example: "Like 'Bark the Herald' design"
    },
    { 
      id: "quirky-humorous", 
      name: "Quirky & Humorous", 
      desc: "Playful, personality-driven",
      example: "Like festive skeleton design"
    },
    { 
      id: "line-art", 
      name: "Simple Line Art", 
      desc: "Clean line drawings, minimal colors",
      example: "Clean, modern outline style"
    },
    { 
      id: "whimsical", 
      name: "Whimsical", 
      desc: "Dreamy, magical, fantastical",
      example: "Fairy tale and enchanted themes"
    },
    { 
      id: "cartoon", 
      name: "Cartoon", 
      desc: "Fun, animated character style",
      example: "Bold outlines and expressive features"
    },
    { 
      id: "flat-vector", 
      name: "Flat Vector", 
      desc: "Modern, geometric, bold colors",
      example: "Material design aesthetic"
    },
    { 
      id: "watercolor", 
      name: "Watercolor", 
      desc: "Soft, artistic, painterly",
      example: "Flowing colors and textures"
    },
    { 
      id: "retro-vintage", 
      name: "Retro Vintage", 
      desc: "Classic, nostalgic aesthetics",
      example: "50s-80s inspired designs"
    },
    { 
      id: "hand-drawn", 
      name: "Hand Drawn", 
      desc: "Sketchy, organic, authentic",
      example: "Pencil or ink illustration style"
    },
    { 
      id: "3d-render", 
      name: "3D Render", 
      desc: "Dimensional, realistic depth",
      example: "Modern 3D graphics"
    },
    { 
      id: "abstract", 
      name: "Abstract", 
      desc: "Non-representational, artistic",
      example: "Shapes, patterns, and colors"
    },
    { 
      id: "pixel-art", 
      name: "Pixel Art", 
      desc: "8-bit, retro gaming style",
      example: "Blocky, nostalgic graphics"
    },
  ];

  const handleGenerateDesigns = async () => {
    setIsGenerating(true);
    setDesignVariations([]);
    setSelectedDesigns([]);
    setMockupVariations([]);
    setSelectedMockups([]);
    setGeneratedListing(null);
    
    try {
      const effectiveSelections = hasSelections ? selections : {
        inspirations: [],
        productTypes: [],
        colorSchemes: [],
        designConcepts: []
      };
      
      if (!hasSelections) {
        toast.info("No selections made - generating best design ideas for you!");
      } else {
        toast.info("Generating 3 design variations with different compositions...");
      }
      
      // Generate 3 variations with different compositional layouts
      const promises = Array(3).fill(null).map((_, variationIndex) => 
        supabase.functions.invoke("generate-design-png", {
          body: { 
            selections: effectiveSelections,
            variationIndex, // Pass variation index for compositional diversity
            autoGenerate: !hasSelections // Flag for AI to choose best options
          },
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
      toast.success(`${imageUrls.length} design variations generated with unique compositions!`);
    } catch (error: any) {
      console.error("Error generating designs:", error);
      toast.error(error.message || "Failed to generate designs");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateMockups = async () => {
    if (selectedDesigns.length === 0) {
      toast.error("Please select at least one design first");
      return;
    }

    setIsGenerating(true);
    setMockupVariations([]);
    setSelectedMockups([]);
    const allMockups: string[] = [];

    try {
      // Generate 10 mockups for EACH selected design
      for (let designIndex = 0; designIndex < selectedDesigns.length; designIndex++) {
        const designUrl = selectedDesigns[designIndex];
        toast.info(`Generating mockups for design ${designIndex + 1}/${selectedDesigns.length}...`);
        
        // Generate 10 mockups for this design
        for (let i = 0; i < 10; i++) {
          toast.info(`Mockup ${i + 1}/10 for design ${designIndex + 1}/${selectedDesigns.length}...`);
          
          const { data, error } = await supabase.functions.invoke("generate-mockup", {
            body: { 
              selections, 
              imageUrl: designUrl,
              promptIndex: i
            },
          });

          if (error) {
            console.error(`Error generating mockup ${i + 1} for design ${designIndex + 1}:`, error);
            if (error.message?.includes("Payment required")) {
              toast.error("Out of credits. Please add credits to your Lovable workspace in Settings → Usage.");
              setIsGenerating(false);
              return;
            } else if (error.message?.includes("Rate limit")) {
              toast.error("Rate limit exceeded. Please wait and try again.");
              setIsGenerating(false);
              return;
            }
            continue;
          }
          
          if (data?.mockupUrl) {
            allMockups.push(data.mockupUrl);
            setMockupVariations([...allMockups]); // Update UI progressively
          }
        }
      }

      if (allMockups.length > 0) {
        toast.success(`Successfully generated ${allMockups.length} total mockups for ${selectedDesigns.length} design(s)!`);
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
    if (selectedMockups.length === 0) {
      toast.error("Please select at least one mockup first");
      return;
    }
    
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
      toast.info("Creating export package...");
      const zip = new JSZip();

      // Add listing data as JSON
      const listingData = {
        title: generatedListing.title,
        description: generatedListing.description,
        features: generatedListing.features,
        tags: generatedListing.tags,
        priceRange: generatedListing.priceRange,
        selections: selections,
        designCount: selectedDesigns.length,
        mockupCount: selectedMockups.length,
        exportedAt: new Date().toISOString(),
      };
      zip.file('listing.json', JSON.stringify(listingData, null, 2));

      // Create folders for organization
      const designsFolder = zip.folder('designs');
      const mockupsFolder = zip.folder('mockups');

      // Add all selected designs
      if (selectedDesigns.length > 0 && designsFolder) {
        for (let i = 0; i < selectedDesigns.length; i++) {
          toast.info(`Adding design ${i + 1}/${selectedDesigns.length} to export...`);
          const response = await fetch(selectedDesigns[i]);
          const blob = await response.blob();
          designsFolder.file(`design-${i + 1}.png`, blob);
        }
      }

      // Add all selected mockups
      if (selectedMockups.length > 0 && mockupsFolder) {
        for (let i = 0; i < selectedMockups.length; i++) {
          toast.info(`Adding mockup ${i + 1}/${selectedMockups.length} to export...`);
          const response = await fetch(selectedMockups[i]);
          const blob = await response.blob();
          mockupsFolder.file(`mockup-${i + 1}.png`, blob);
        }
      }

      // Generate and download ZIP
      toast.info("Compressing files...");
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `product-listing-${Date.now()}.zip`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${selectedDesigns.length} designs & ${selectedMockups.length} mockups successfully!`);
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
          <div className="flex justify-end gap-2 mb-6">
            {user ? (
              <>
                <Button variant="outline" onClick={() => setShowFavorites(!showFavorites)}>
                  <Heart className="h-4 w-4 mr-2" />
                  My Favorites
                </Button>
                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button variant="outline" onClick={() => setShowAuthForm(true)}>
                Sign In
              </Button>
            )}
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Product Design Studio
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create unique product designs by selecting your preferred elements. All choices are optional - mix and match to your heart's content!
          </p>
        </header>

        {/* Favorites Section */}
        {showFavorites && user && (
          <div className="mb-12">
            <FavoritesSection />
          </div>
        )}

        {/* Summary Card */}
        <Card className="mb-12 p-6 bg-gradient-to-br from-card to-muted/30 border-2 shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-semibold">Your Design Summary</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleSurpriseMe}>
                <Sparkles className="h-4 w-4 mr-2" />
                Surprise Me
              </Button>
              {hasSelections && (
                <Button variant="outline" size="sm" onClick={clearAllSelections}>
                  Clear All
                </Button>
              )}
            </div>
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

        {/* Design Variations Gallery - With multiple selection */}
        {designVariations.length > 0 && !isGenerating && (
          <section className="mb-12">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-2xl font-bold">Select Your Favorite Designs</h3>
                  <p className="text-muted-foreground">
                    {selectedDesigns.length > 0 
                      ? `${selectedDesigns.length} design${selectedDesigns.length > 1 ? 's' : ''} selected`
                      : "Choose one or more designs to create mockups"
                    }
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllDesigns}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllDesigns}>
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {designVariations.map((imageUrl, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg border-4 transition-all hover:shadow-xl relative ${
                      selectedDesigns.includes(imageUrl)
                        ? "border-primary shadow-lg"
                        : "border-transparent hover:border-primary/50"
                    }`}
                    onClick={() => toggleDesignSelection(imageUrl)}
                  >
                    {selectedDesigns.includes(imageUrl) && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-2 z-10">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="bg-checkerboard rounded-lg p-4">
                      <img
                        src={imageUrl}
                        alt={`Design variation ${index + 1}`}
                        className="w-full h-auto mx-auto"
                      />
                    </div>
                    <div className="text-center p-3 flex items-center justify-between">
                      <p className="font-semibold">Design {index + 1}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToFavorites(imageUrl, 'design');
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedDesigns.length > 0 && (
                <div className="mt-6 text-center">
                  <Button 
                    onClick={handleGenerateMockups} 
                    disabled={isGenerating}
                    size="lg"
                  >
                    {isGenerating 
                      ? "Generating..." 
                      : `Generate Mockups for ${selectedDesigns.length} Design${selectedDesigns.length > 1 ? 's' : ''}`
                    }
                  </Button>
                </div>
              )}
            </Card>
          </section>
        )}

        {/* Mockup Variations Gallery - With multiple selection */}
        {mockupVariations.length > 0 && (
          <section className="mb-12">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-2xl font-bold">Select Your Favorite Mockups</h3>
                  <p className="text-muted-foreground">
                    {selectedMockups.length > 0 
                      ? `${selectedMockups.length} mockup${selectedMockups.length > 1 ? 's' : ''} selected`
                      : "Choose one or more mockups for the final listing"
                    }
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllMockups}>
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={deselectAllMockups}>
                    Deselect All
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {mockupVariations.map((mockupUrl, index) => (
                  <div
                    key={index}
                    className={`cursor-pointer rounded-lg border-4 transition-all hover:shadow-xl relative ${
                      selectedMockups.includes(mockupUrl)
                        ? "border-primary shadow-lg"
                        : "border-transparent hover:border-primary/50"
                    }`}
                    onClick={() => toggleMockupSelection(mockupUrl)}
                  >
                    {selectedMockups.includes(mockupUrl) && (
                      <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-2 z-10">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                    <div className="bg-muted/30 rounded-lg p-4">
                      <img
                        src={mockupUrl}
                        alt={`Mockup variation ${index + 1}`}
                        className="w-full h-auto mx-auto"
                      />
                    </div>
                    <div className="text-center p-3 flex items-center justify-between">
                      <p className="font-semibold">Mockup {index + 1}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          addToFavorites(mockupUrl, 'mockup');
                        }}
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              
              {selectedMockups.length > 0 && (
                <div className="mt-6 text-center">
                  <Button 
                    onClick={handleGenerateListing} 
                    disabled={isGenerating}
                    size="lg"
                  >
                    {isGenerating 
                      ? "Generating..." 
                      : `Generate Listing with ${selectedMockups.length} Mockup${selectedMockups.length > 1 ? 's' : ''}`
                    }
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
              {/* Selected Designs Gallery */}
              {selectedDesigns.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-2xl font-bold mb-4">Selected Designs ({selectedDesigns.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                    {selectedDesigns.map((designUrl, index) => (
                      <div key={index} className="space-y-2">
                        <div className="bg-checkerboard rounded-lg p-4">
                          <img
                            src={designUrl}
                            alt={`Selected design ${index + 1}`}
                            className="w-full h-auto mx-auto"
                          />
                        </div>
                        <Button 
                          onClick={() => downloadImage(designUrl, `design-${index + 1}`)} 
                          className="w-full"
                          variant="outline"
                        >
                          Download Design {index + 1}
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Selected Mockups Gallery */}
              {selectedMockups.length > 0 && (
                <Card className="p-6">
                  <h3 className="text-2xl font-bold mb-4">Selected Mockups ({selectedMockups.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-4">
                    {selectedMockups.map((mockupUrl, index) => (
                      <div key={index} className="space-y-2">
                        <div className="rounded-lg p-4 bg-muted/30">
                          <img
                            src={mockupUrl}
                            alt={`Selected mockup ${index + 1}`}
                            className="w-full h-auto mx-auto"
                          />
                        </div>
                        <Button 
                          onClick={() => downloadImage(mockupUrl, `mockup-${index + 1}`)} 
                          className="w-full"
                          variant="outline"
                        >
                          Download Mockup {index + 1}
                        </Button>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
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

      {/* Auth Dialog */}
      <Dialog open={showAuthForm} onOpenChange={setShowAuthForm}>
        <DialogContent>
          <AuthForm onSuccess={() => setShowAuthForm(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
