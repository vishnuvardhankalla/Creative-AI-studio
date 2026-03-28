import { useState, useRef } from "react";
import { Upload, Loader2, Eye, Palette, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { analyzeImage, fileToBase64 } from "@/utils/apiHelpers";
import { useToast } from "@/hooks/use-toast";
import ImageCard from "./ImageCard";

type Step = "upload" | "analyzing" | "result";

const WorkflowImage = () => {
  const [step, setStep] = useState<Step>("upload");
  const [previewUrl, setPreviewUrl] = useState("");
  const [analysis, setAnalysis] = useState<Record<string, unknown> | null>(null);
  const [variationUrl, setVariationUrl] = useState("");
  const [variationPrompt, setVariationPrompt] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid File", description: "Please upload an image file.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Max file size is 10MB.", variant: "destructive" });
      return;
    }

    setStep("analyzing");
    try {
      const base64 = await fileToBase64(file);
      setPreviewUrl(base64);
      const result = await analyzeImage(base64);
      setAnalysis(result.analysis);
      setVariationUrl(result.variationUrl || "");
      setVariationPrompt(result.variationPrompt);
      setStep("result");
    } catch (err: unknown) {
      toast({ title: "Analysis Failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
      setStep("upload");
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleReset = () => {
    setStep("upload");
    setPreviewUrl("");
    setAnalysis(null);
    setVariationUrl("");
  };

  return (
    <div className="space-y-6">
      {step === "upload" && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="glass rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center py-16 space-y-4"
        >
          <div className="h-16 w-16 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
            <Upload className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="text-center">
            <p className="font-display font-medium text-foreground">Drop an image or click to upload</p>
            <p className="text-sm text-muted-foreground mt-1">Supports JPG, PNG, WebP · Max 10MB</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}

      {step === "analyzing" && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Analyzing image & generating variation...</p>
          <p className="text-xs text-muted-foreground/60">This may take 30-60 seconds</p>
        </div>
      )}

      {step === "result" && analysis && (
        <div className="space-y-6">
          {/* Analysis Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <AnalysisCard icon={<Eye className="h-4 w-4" />} title="Subjects" value={Array.isArray((analysis as any).subjects) ? (analysis as any).subjects.join(", ") : "N/A"} />
            <AnalysisCard icon={<Palette className="h-4 w-4" />} title="Colors" value={Array.isArray((analysis as any).colors) ? (analysis as any).colors.join(", ") : "N/A"} />
            <AnalysisCard icon={<ImageIcon className="h-4 w-4" />} title="Style" value={String((analysis as any).style || "N/A")} />
          </div>

          {/* Images Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {previewUrl && <ImageCard imageUrl={previewUrl} title="Original" description={`Mood: ${(analysis as any).mood || "N/A"}`} />}
            {variationUrl && <ImageCard imageUrl={variationUrl} title="AI Variation" description={variationPrompt} />}
          </div>

          <Button variant="outline" onClick={handleReset}>
            Analyze Another Image
          </Button>
        </div>
      )}
    </div>
  );
};

const AnalysisCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => (
  <div className="glass rounded-xl p-4 space-y-2">
    <div className="flex items-center gap-2 text-xs font-medium text-accent uppercase tracking-wider">
      {icon} {title}
    </div>
    <p className="text-sm text-foreground">{value}</p>
  </div>
);

export default WorkflowImage;
