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
import { confirmUpload } from "@/lib/actions/file";
import { toast } from "sonner";

interface ImageDialogProps {
  documentId: string;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, altText: string) => void;
}

export default function ImageDialog({
  documentId,
  isOpen,
  onClose,
  onSubmit,
}: ImageDialogProps) {
  const [url, setUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fileKey, setFileKey] = useState("");

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
      const { url, fields, key } = await res.json();
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) => {
        formData.append(key, value as string);
      });
      formData.append("file", file);
      await fetch(url, {
        method: "POST",
        body: formData,
      });
      setUrl(`${window.location.origin}/api/file/${key}`);
      setFileKey(key);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (fileKey) {
      try {
        await confirmUpload({ fileKey, documentId });
      } catch (error) {
        toast.error("Failed to confirm image upload.");
        return;
      }
    }
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
