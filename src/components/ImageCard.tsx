import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageCardProps {
  imageUrl: string;
  title: string;
  description?: string;
}

const ImageCard = ({ imageUrl, title, description }: ImageCardProps) => {
  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `${title.toLowerCase().replace(/\s+/g, "-")}.png`;
    link.click();
  };

  return (
    <div className="glass rounded-xl overflow-hidden group">
      <div className="relative">
        <img src={imageUrl} alt={title} className="w-full aspect-square object-cover" />
        <div className="absolute inset-0 bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <Button size="sm" variant="outline" onClick={handleDownload} className="bg-card/80 backdrop-blur">
            <Download className="mr-2 h-4 w-4" /> Download
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-1">
        <h3 className="font-display font-semibold text-foreground">{title}</h3>
        {description && <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>}
      </div>
    </div>
  );
};

export default ImageCard;
