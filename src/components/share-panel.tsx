"use client";

import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Share2, Printer, Copy } from "lucide-react";

interface SharePanelProps {
  resultText: string;
}

export function SharePanel({ resultText }: SharePanelProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(resultText).then(() => {
      toast({
        title: "Copied!",
        description: "Results copied to clipboard.",
        className: "bg-accent text-accent-foreground",
      });
    }).catch(() => {
        toast({
            title: "Error",
            description: "Could not copy to clipboard.",
            variant: "destructive"
        })
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Calculator Results",
          text: resultText,
        });
      } catch (error) {
        // Silently fail or show a toast message if sharing fails
        if (error instanceof DOMException && error.name !== 'AbortError') {
             toast({
                title: "Sharing Failed",
                description: "Could not share the results. Please try again.",
                variant: "destructive",
            })
        }
      }
    } else {
        toast({
            title: "Not Supported",
            description: "Web Share API is not supported in your browser.",
            variant: "destructive",
        })
    }
  };

  return (
    <div className="flex w-full gap-2">
      <Button variant="outline" className="flex-1" onClick={handleCopy}>
        <Copy className="mr-2 h-4 w-4" /> Copy
      </Button>
      <Button variant="outline" className="flex-1" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" /> Print
      </Button>
      <Button variant="outline" className="flex-1" onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" /> Share
      </Button>
    </div>
  );
}
