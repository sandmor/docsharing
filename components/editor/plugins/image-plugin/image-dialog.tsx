
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChangeEvent, useState } from "react";

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, altText: string) => void;
}

export default function ImageDialog({
  isOpen,
  onClose,
  onSubmit,
}: ImageDialogProps) {
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const onUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setIsLoading(true);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: JSON.stringify({
          name: file.name,
          contentType: file.type,
        }),
      });
      const { url, publicUrl } = await res.json();
      await fetch(url, {
        method: "PUT",
        body: file,
      });
      setUrl(publicUrl);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    onSubmit(url, altText);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Enter image URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Input
            placeholder="Enter alt text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
          />
          <Input type="file" onChange={onUpload} />
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} disabled={isLoading}>
            Insert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
