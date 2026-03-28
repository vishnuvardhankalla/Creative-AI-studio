import { useState } from "react";
import { Loader2, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { summarizeText } from "@/utils/apiHelpers";
import { useToast } from "@/hooks/use-toast";

const WorkflowSummarize = () => {
  const [text, setText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSummarize = async () => {
    if (!text.trim()) return;
    setIsLoading(true);
    setSummary("");
    try {
      const result = await summarizeText(text);
      setSummary(result);
    } catch (err: unknown) {
      toast({ title: "Summarization Failed", description: err instanceof Error ? err.message : "Unknown error", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Textarea
          placeholder="Paste or type any text you want to summarize..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-[160px] bg-secondary/50 border-border/50 focus:border-primary resize-none font-body"
        />
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSummarize}
            disabled={!text.trim() || isLoading}
            className="gradient-primary text-primary-foreground hover:opacity-90"
          >
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
            Summarize
          </Button>
          <span className="text-xs text-muted-foreground">{text.length} characters</span>
        </div>
      </div>

      {summary && (
        <div className="glass rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-medium text-accent uppercase tracking-wider">
            <Sparkles className="h-3 w-3" /> AI Summary
          </div>
          <p className="text-foreground leading-relaxed">{summary}</p>
        </div>
      )}
    </div>
  );
};

export default WorkflowSummarize;
