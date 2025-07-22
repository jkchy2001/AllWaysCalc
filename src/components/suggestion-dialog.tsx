"use client";

import React, { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export function SuggestionDialog({ children }: { children: ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const { toast } = useToast();

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    // In a real app, you'd handle form submission here.
    setOpen(false);
    toast({
      title: "Suggestion Submitted!",
      description: "Thank you for your feedback. We'll review your suggestion soon.",
      variant: "default",
      className: "bg-accent text-accent-foreground",
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Suggest a Calculator</DialogTitle>
            <DialogDescription>
              Have an idea for a new calculator? Let us know! We appreciate your
              input.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid w-full gap-1.5">
              <Label htmlFor="suggestion">Your Suggestion</Label>
              <Textarea
                placeholder="Describe the calculator you'd like to see..."
                id="suggestion"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Submit Suggestion</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
