import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { BookOpen, Download, Wand2, Loader2, Sparkles } from "lucide-react";
import { toPng } from "html-to-image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { generateBookDetails, generateCoverImage, BookCoverData } from "@/src/lib/gemini";

export default function App() {
  const [theme, setTheme] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverData, setCoverData] = useState<BookCoverData | null>(null);
  const coverRef = useRef<HTMLDivElement>(null);

  const handleGenerate = async () => {
    if (!theme.trim()) return;
    setIsGenerating(true);
    try {
      const details = await generateBookDetails(theme);
      const imageUrl = await generateCoverImage(details.visualDescription);
      setCoverData({ ...details, imageUrl });
    } catch (error) {
      console.error("Error generating cover:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (coverRef.current) {
      try {
        const dataUrl = await toPng(coverRef.current, { cacheBust: true });
        const link = document.createElement("a");
        link.download = `${coverData?.title || "book-cover"}.png`;
        link.href = dataUrl;
        link.click();
      } catch (err) {
        console.error("Error downloading image:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] font-sans selection:bg-[#1a1a1a] selection:text-[#f5f2ed]">
      {/* Header */}
      <header className="border-b border-[#1a1a1a]/10 py-6 px-8 flex items-center justify-between bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-[#1a1a1a] p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-[#f5f2ed]" />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">CoverAI</h1>
        </div>
        <div className="text-xs uppercase tracking-widest font-medium opacity-50">
          Premium Book Cover Generator
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        {/* Input Section */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <h2 className="text-4xl font-light leading-tight serif">
              Ciptakan <span className="italic">Mahakarya</span> <br />
              Hanya dengan Satu Tema.
            </h2>
            <p className="text-[#1a1a1a]/60 max-w-md">
              Masukkan tema atau konsep buku Anda, dan biarkan AI kami merancang sampul yang memukau dan profesional untuk Anda.
            </p>
          </div>

          <Card className="border-[#1a1a1a]/10 bg-white shadow-xl shadow-[#1a1a1a]/5 overflow-hidden">
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme" className="text-xs uppercase tracking-widest font-bold opacity-70">
                  Tema Buku
                </Label>
                <Input
                  id="theme"
                  placeholder="Contoh: Petualangan di luar angkasa, Misteri di desa tua..."
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  className="border-[#1a1a1a]/20 focus-visible:ring-[#1a1a1a] h-12 bg-[#f5f2ed]/30"
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                />
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={isGenerating || !theme.trim()}
                className="w-full h-14 bg-[#1a1a1a] hover:bg-[#1a1a1a]/90 text-[#f5f2ed] rounded-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Sedang Merancang...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-5 w-5" />
                    Generate Cover
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {coverData && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-4"
            >
              <Button 
                variant="outline" 
                onClick={handleDownload}
                className="h-12 border-[#1a1a1a] text-[#1a1a1a] hover:bg-[#1a1a1a] hover:text-[#f5f2ed] transition-colors"
              >
                <Download className="mr-2 h-5 w-5" />
                Unduh Cover (PNG)
              </Button>
              <p className="text-center text-xs opacity-40 italic">
                *Hasil dapat bervariasi tergantung pada kejelasan tema.
              </p>
            </motion.div>
          )}
        </motion.div>

        {/* Preview Section */}
        <div className="flex justify-center lg:justify-end">
          <AnimatePresence mode="wait">
            {!coverData && !isGenerating ? (
              <motion.div 
                key="placeholder"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-[350px] h-[500px] border-2 border-dashed border-[#1a1a1a]/20 rounded-2xl flex flex-col items-center justify-center text-[#1a1a1a]/30 gap-4"
              >
                <Sparkles className="w-12 h-12" />
                <p className="font-medium tracking-wide">Pratinjau Cover</p>
              </motion.div>
            ) : isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="w-[350px] h-[500px] bg-white rounded-2xl shadow-2xl p-8 space-y-6"
              >
                <Skeleton className="h-12 w-3/4 bg-[#f5f2ed]" />
                <Skeleton className="h-4 w-1/2 bg-[#f5f2ed]" />
                <Skeleton className="h-[280px] w-full bg-[#f5f2ed] rounded-lg" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full bg-[#f5f2ed]" />
                  <Skeleton className="h-4 w-2/3 bg-[#f5f2ed]" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="cover"
                initial={{ opacity: 0, rotateY: -20, perspective: 1000 }}
                animate={{ opacity: 1, rotateY: 0 }}
                className="relative group"
              >
                {/* The actual cover element to be captured */}
                <div 
                  ref={coverRef}
                  className="w-[350px] h-[500px] bg-white shadow-2xl rounded-sm overflow-hidden flex flex-col relative"
                  style={{ 
                    boxShadow: "20px 20px 60px rgba(0,0,0,0.2), -5px 0 15px rgba(0,0,0,0.05)"
                  }}
                >
                  {/* Background Image */}
                  {coverData.imageUrl && (
                    <div className="absolute inset-0 z-0">
                      <img 
                        src={coverData.imageUrl} 
                        alt="Background" 
                        className="w-full h-full object-cover opacity-90"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </div>
                  )}

                  {/* Content Overlay */}
                  <div className="relative z-10 flex flex-col h-full p-8 text-white">
                    <div className="mt-auto space-y-4">
                      <div className="space-y-1">
                        <p className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/70">
                          {coverData.subtitle}
                        </p>
                        <h3 className="text-4xl font-bold leading-none tracking-tight serif">
                          {coverData.title}
                        </h3>
                      </div>
                      
                      <div className="w-12 h-[2px] bg-white/50" />
                      
                      <p className="text-sm font-medium tracking-widest uppercase opacity-80">
                        {coverData.author}
                      </p>
                    </div>
                  </div>

                  {/* Book Spine Shadow Effect */}
                  <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent z-20" />
                </div>
                
                {/* Decorative Elements */}
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-[#1a1a1a] rounded-full flex items-center justify-center text-[#f5f2ed] shadow-lg transform rotate-12 group-hover:rotate-0 transition-transform duration-500">
                  <div className="text-[10px] uppercase font-bold tracking-tighter text-center leading-tight">
                    Original<br/>Edition
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-20 border-t border-[#1a1a1a]/5 py-12 px-8 text-center">
        <p className="text-xs uppercase tracking-widest opacity-30">
          Powered by Google Gemini & AI Studio
        </p>
      </footer>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap');
        
        .serif {
          font-family: 'Cormorant Garamond', serif;
        }
      `}</style>
    </div>
  );
}
