"use client";

import { $isCodeNode } from "@lexical/code";
import {
  $getNearestNodeFromDOMNode,
  $getSelection,
  $setSelection,
  LexicalEditor,
} from "lexical";
import * as React from "react";
import { useState } from "react";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { Check, Copy } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { IconButton } from "@/components/ui/icon-button";

interface Props {
  editor: LexicalEditor;
  getCodeDOMNode: () => HTMLElement | null;
}

export function CopyButton({ editor, getCodeDOMNode }: Props) {
  const [isCopyCompleted, setCopyCompleted] = useState<boolean>(false);

  const removeSuccessIcon = useDebounce(() => {
    setCopyCompleted(false);
  }, 1000);

  async function handleClick(): Promise<void> {
    const codeDOMNode = getCodeDOMNode();

    if (!codeDOMNode) {
      return;
    }

    let content = "";

    editor.update(() => {
      const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);

      if ($isCodeNode(codeNode)) {
        content = codeNode.getTextContent();
      }

      const selection = $getSelection();
      $setSelection(selection);
    });

    try {
      await navigator.clipboard.writeText(content);
      setCopyCompleted(true);
      removeSuccessIcon();
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <IconButton size="sm" variant="ghost" onClick={handleClick}>
          {isCopyCompleted ? (
            <Check className="w-4 h-4 text-green-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </IconButton>
      </TooltipTrigger>
      <TooltipContent>
        {isCopyCompleted ? "Copied!" : "Copy to clipboard"}
      </TooltipContent>
    </Tooltip>
  );
}
