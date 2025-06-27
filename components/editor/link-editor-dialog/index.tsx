import type { LexicalEditor } from "lexical";
import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TOGGLE_LINK_COMMAND } from "@lexical/link";
import { sanitizeUrl } from "../utils/url";
import { $getSelection, $isRangeSelection, $isNodeSelection } from "lexical";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import { $isLinkNode } from "@lexical/link";
import { getSelectedNode } from "../utils/getSelectedNode";
import { $isAutoLinkNode } from "@lexical/link";

interface LinkEditorDialogProps {
  editor: LexicalEditor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LinkEditorDialog({
  editor,
  open,
  onOpenChange,
}: LinkEditorDialogProps): React.JSX.Element {
  const [linkUrl, setLinkUrl] = React.useState("");
  const [initialLinkUrl, setInitialLinkUrl] = React.useState("");

  React.useEffect(() => {
    if (open) {
      editor.getEditorState().read(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = getSelectedNode(selection);
          const linkParent = $findMatchingParent(node, $isLinkNode);
          if (linkParent) {
            setInitialLinkUrl(linkParent.getURL());
            setLinkUrl(linkParent.getURL());
          } else if ($isLinkNode(node)) {
            setInitialLinkUrl(node.getURL());
            setLinkUrl(node.getURL());
          } else {
            setInitialLinkUrl("");
            setLinkUrl("");
          }
        } else if ($isNodeSelection(selection)) {
          const nodes = selection.getNodes();
          if (nodes.length > 0) {
            const node = nodes[0];
            const parent = node.getParent();
            if ($isLinkNode(parent)) {
              setInitialLinkUrl(parent.getURL());
              setLinkUrl(parent.getURL());
            } else if ($isLinkNode(node)) {
              setInitialLinkUrl(node.getURL());
              setLinkUrl(node.getURL());
            } else {
              setInitialLinkUrl("");
              setLinkUrl("");
            }
          }
        }
      });
    }
  }, [editor, open]);

  const handleSave = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(linkUrl));
    onOpenChange(false);
  };

  const handleDelete = () => {
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Link</DialogTitle>
          <DialogDescription>
            Enter the URL for the link. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input
              id="link"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="col-span-4"
              placeholder="https://example.com"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          {initialLinkUrl && (
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          )}
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
