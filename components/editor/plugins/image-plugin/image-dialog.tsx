
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ImageDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string) => void;
}

export default function ImageDialog({
  isOpen,
  onClose,
  onSubmit,
}: ImageDialogProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = () => {
    onSubmit(url);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Insert Image</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Enter image URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <DialogFooter>
          <Button onClick={handleSubmit}>Insert</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
