import { useState } from "react";
import { Sparkles, ArrowRight, Check, Loader2, Wand2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { enhancePrompt, generateImage, generateMultiStyle } from "@/utils/apiHelpers";
import { useToast } from "@/hooks/use-toast";
import ImageCard from "./ImageCard";

type Step = "input" | "enhancing" | "approval" | "generating" | "result";

const STYLE_OPTIONS = [
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🌆" },
  { id: "watercolor", label: "Watercolor", emoji: "🎨" },
  { id: "oil-painting", label: "Oil Painting", emoji: "🖼️" },
  { id: "pop-art", label: "Pop Art", emoji: "💥" },
  { id: "anime", label: "Anime", emoji: "✨" },
  { id: "3d-render", label: "3D Render", emoji: "🧊" },
];

const WorkflowText = () => {
  const [step, setStep] = useState<Step>("input");
  const [userPrompt, setUserPrompt] = useState("");
  const [enhancedPrompt, setEnhancedPrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState("");
  const [multiStyleMode, setMultiStyleMode] = useState(false);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [multiResults, setMultiResults] = useState<Array<{ style: string; imageUrl?: string; error?: string }>>([]);
  const { toast } = useToast();

  const handleEnhance = async () => {
    if (!userPrompt.trim()) return;
    setStep("enhancing");
    try {
      const result = await enhancePrompt(userPrompt);
      setEnhancedPrompt(result);
      setStep("approval");
    } catch (err: unknown) {
      toast({ title: "Enhancement Failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
      setStep("input");
    }
  };

  const handleGenerate = async () => {
    setStep("generating");
    try {
      if (multiStyleMode && selectedStyles.length > 0) {
        const { results } = await generateMultiStyle(enhancedPrompt, selectedStyles);
        setMultiResults(results);
        setStep("result");
      } else {
        const { imageUrl } = await generateImage(enhancedPrompt);
        setGeneratedImage(imageUrl);
        setStep("result");
      }
    } catch (err: unknown) {
      toast({ title: "Generation Failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
      setStep("approval");
    }
  };

  const toggleStyle = (id: string) => {
    setSelectedStyles((prev) => prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]);
  };

  const handleReset = () => {
    setStep("input");
    setUserPrompt("");
    setEnhancedPrompt("");
    setGeneratedImage("");
    setMultiResults([]);
    setSelectedStyles([]);
    setMultiStyleMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Step Indicators */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
        {["Describe", "Enhance", "Approve", "Generate"].map((label, i) => {
          const stepMap: Step[] = ["input", "enhancing", "approval", "generating"];
          const currentIdx = stepMap.indexOf(step === "result" ? "generating" : step);
          const isActive = i <= currentIdx;
          return (
            <div key={label} className="flex items-center gap-2">
              <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium transition-colors ${isActive ? "gradient-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
                {i < currentIdx || step === "result" ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span className={isActive ? "text-foreground font-medium" : ""}>{label}</span>
              {i < 3 && <ArrowRight className="h-3 w-3 text-muted-foreground/40" />}
            </div>
          );
        })}
      </div>

      {/* Input Step */}
      {step === "input" && (
        <div className="space-y-4">
          <Textarea
            placeholder="Describe the image you want to create... e.g., 'A cat sitting on a mountain'"
            value={userPrompt}
            onChange={(e) => setUserPrompt(e.target.value)}
            className="min-h-[120px] bg-secondary/50 border-border/50 focus:border-primary resize-none font-body"
          />
          <Button onClick={handleEnhance} disabled={!userPrompt.trim()} className="gradient-primary text-primary-foreground hover:opacity-90 transition-opacity">
            <Wand2 className="mr-2 h-4 w-4" /> Enhance Prompt
          </Button>
        </div>
      )}

      {/* Enhancing */}
      {step === "enhancing" && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <div className="relative">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-accent animate-pulse" />
          </div>
          <p className="text-muted-foreground">AI is enhancing your prompt...</p>
        </div>
      )}

      {/* Approval Step */}
      {step === "approval" && (
        <div className="space-y-4">
          <div className="glass rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-medium text-accent uppercase tracking-wider">
              <Sparkles className="h-3 w-3" /> AI Enhanced Prompt
            </div>
            <Textarea
              value={enhancedPrompt}
              onChange={(e) => setEnhancedPrompt(e.target.value)}
              className="min-h-[100px] bg-transparent border-none focus:ring-0 resize-none text-foreground"
            />
          </div>

          {/* Multi-Style Toggle */}
          <div className="glass rounded-xl p-4 space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={multiStyleMode}
                onChange={(e) => setMultiStyleMode(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <div className="flex items-center gap-2">
                <Palette className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-foreground">Generate in multiple styles</span>
              </div>
            </label>

            {multiStyleMode && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                {STYLE_OPTIONS.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => toggleStyle(style.id)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      selectedStyles.includes(style.id)
                        ? "gradient-primary text-primary-foreground shadow-glow"
                        : "bg-secondary text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {style.emoji} {style.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={multiStyleMode && selectedStyles.length === 0}
              className="gradient-primary text-primary-foreground hover:opacity-90"
            >
              <Check className="mr-2 h-4 w-4" />
              {multiStyleMode ? `Generate ${selectedStyles.length} Styles` : "Approve & Generate"}
            </Button>
            <Button variant="outline" onClick={() => setStep("input")}>
              Edit Original
            </Button>
          </div>
        </div>
      )}

      {/* Generating */}
      {step === "generating" && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {multiStyleMode ? `Generating ${selectedStyles.length} style variations...` : "Generating your image..."}
          </p>
          <p className="text-xs text-muted-foreground/60">
            {multiStyleMode ? "This may take 1-2 minutes for multiple styles" : "This may take 15-30 seconds"}
          </p>
        </div>
      )}

      {/* Result */}
      {step === "result" && (
        <div className="space-y-4">
          {multiResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {multiResults.map((r) =>
                r.imageUrl ? (
                  <ImageCard
                    key={r.style}
                    imageUrl={r.imageUrl}
                    title={STYLE_OPTIONS.find((s) => s.id === r.style)?.label || r.style}
                    description={enhancedPrompt}
                  />
                ) : (
                  <div key={r.style} className="glass rounded-xl p-4 flex items-center justify-center min-h-[200px]">
                    <p className="text-sm text-destructive">{r.error || "Failed"}</p>
                  </div>
                )
              )}
            </div>
          ) : (
            generatedImage && <ImageCard imageUrl={generatedImage} title="Generated Image" description={enhancedPrompt} />
          )}
          <Button variant="outline" onClick={handleReset}>
            Create Another
          </Button>
        </div>
      )}
    </div>
  );
};

export default WorkflowText;
