import { useState, useRef } from "react";
import { Upload, Loader2, Scissors, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { removeBackground, fileToBase64 } from "@/utils/apiHelpers";
import { useToast } from "@/hooks/use-toast";

const WorkflowRemoveBg = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [originalUrl, setOriginalUrl] = useState("");
  const [resultUrl, setResultUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Invalid File", description: "Please upload an image.", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "File Too Large", description: "Max 10MB.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    setResultUrl("");
    try {
      const base64 = await fileToBase64(file);
      setOriginalUrl(base64);
      const result = await removeBackground(base64);
      setResultUrl(result);
    } catch (err: unknown) {
      toast({ title: "Background Removal Failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (!resultUrl) return;
    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = "no-background.png";
    link.click();
  };

  const handleReset = () => {
    setOriginalUrl("");
    setResultUrl("");
  };

  return (
    <div className="space-y-6">
      {!originalUrl && !isLoading && (
        <div
          onClick={() => fileRef.current?.click()}
          className="glass rounded-xl border-2 border-dashed border-border/50 hover:border-primary/50 transition-colors cursor-pointer flex flex-col items-center justify-center py-16 space-y-4"
        >
          <div className="h-16 w-16 rounded-2xl gradient-accent flex items-center justify-center">
            <Scissors className="h-7 w-7 text-accent-foreground" />
          </div>
          <div className="text-center">
            <p className="font-display font-medium text-foreground">Upload image to remove background</p>
            <p className="text-sm text-muted-foreground mt-1">AI will isolate the main subject</p>
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

      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Removing background...</p>
        </div>
      )}

      {resultUrl && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="glass rounded-xl overflow-hidden">
              <img src={originalUrl} alt="Original" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center">
                <span className="text-sm font-medium text-muted-foreground">Original</span>
              </div>
            </div>
            <div className="rounded-xl overflow-hidden" style={{ background: "repeating-conic-gradient(hsl(var(--secondary)) 0% 25%, hsl(var(--muted)) 0% 50%) 50% / 20px 20px" }}>
              <img src={resultUrl} alt="No Background" className="w-full aspect-square object-cover" />
              <div className="p-3 text-center bg-card/80 backdrop-blur">
                <span className="text-sm font-medium text-foreground">Background Removed</span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleDownload} className="gradient-primary text-primary-foreground hover:opacity-90">
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button variant="outline" onClick={handleReset}>
              Try Another
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowRemoveBg;
