import { useState } from "react";
import { Sparkles, Image, Zap, FileText, Scissors } from "lucide-react";
import WorkflowText from "@/components/WorkflowText";
import WorkflowImage from "@/components/WorkflowImage";
import WorkflowSummarize from "@/components/WorkflowSummarize";
import WorkflowRemoveBg from "@/components/WorkflowRemoveBg";

type Tab = "text" | "image" | "summarize" | "removebg";

const Index = () => {
  const [activeTab, setActiveTab] = useState<Tab>("text");


  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "text", label: "Creative Studio", icon: <Sparkles className="h-4 w-4" /> },
    { id: "image", label: "Style Lab", icon: <Image className="h-4 w-4" /> },
    { id: "summarize", label: "Summarizer", icon: <FileText className="h-4 w-4" /> },
    { id: "removebg", label: "BG Remover", icon: <Scissors className="h-4 w-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="gradient-glow fixed inset-0 pointer-events-none" />

      {/* Navbar */}
      <nav className="relative z-10 border-b border-border/50 glass">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
              <Zap className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground tracking-tight">Pear Media</span>
          </div>
            <span className="text-xs text-muted-foreground font-medium uppercase tracking-widest">AI Prototype</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-10">
        {/* Hero */}
        <div className="text-center mb-10 space-y-3">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            AI Creative <span className="bg-clip-text text-transparent bg-gradient-to-r from-[hsl(250,85%,65%)] to-[hsl(170,75%,50%)]">Studio</span>
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Transform ideas into visuals, summarize text, generate multi-style art, and remove backgrounds — all powered by AI.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex justify-center mb-8">
          <div className="glass rounded-full p-1 inline-flex gap-1 flex-wrap justify-center">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "gradient-primary text-primary-foreground shadow-glow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Workflow Content */}
        <div className="glass rounded-2xl p-6 md:p-8 shadow-card">
          {activeTab === "text" && <WorkflowText />}
          {activeTab === "image" && <WorkflowImage />}
          {activeTab === "summarize" && <WorkflowSummarize />}
          {activeTab === "removebg" && <WorkflowRemoveBg />}
        </div>
      </main>
    </div>
  );
};

export default Index;
