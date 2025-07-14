"use client";
import {
  $isCodeNode,
  CodeNode
} from "@lexical/code";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getNearestNodeFromDOMNode, isHTMLElement } from "lexical";
import { useEffect, useRef, useState } from "react";
import * as React from "react";
import { createPortal } from "react-dom";
import { CopyButton } from "./copy-button";
import { useDebounce } from "@/lib/hooks/use-debounce";
import { cn } from "@/lib/utils";
import { LanguageSelector } from "./language-selector";
const CODE_PADDING = 8;
interface Position {
  top: string;
  right: string;
}
function CodeActionMenuContainer({
  anchorElem,
}: {
  anchorElem: HTMLElement;
}): React.JSX.Element {
  const [editor] = useLexicalComposerContext();
  const [lang, setLang] = useState("");
  const [isShown, setShown] = useState<boolean>(false);
  const [shouldListenMouseMove, setShouldListenMouseMove] =
    useState<boolean>(false);
  const [position, setPosition] = useState<Position>({
    right: "0",
    top: "0",
  });
  const codeSetRef = useRef<Set<string>>(new Set());
  const codeDOMNodeRef = useRef<HTMLElement | null>(null);
  function getCodeDOMNode(): HTMLElement | null {
    return codeDOMNodeRef.current;
  }
  const debouncedOnMouseMove = useDebounce(
    (event: MouseEvent) => {
      const { codeDOMNode, isOutside } = getMouseInfo(event);
      if (isOutside) {
        setShown(false);
        return;
      }
      if (!codeDOMNode) {
        return;
      }
      codeDOMNodeRef.current = codeDOMNode;
      let codeNode: CodeNode | null = null;
      let _lang = "";
      editor.update(() => {
        const maybeCodeNode = $getNearestNodeFromDOMNode(codeDOMNode);
        if ($isCodeNode(maybeCodeNode)) {
          codeNode = maybeCodeNode;
          _lang = codeNode.getLanguage() || "";
        }
      });
      if (codeNode) {
        const { y: editorElemY, right: editorElemRight } =
          anchorElem.getBoundingClientRect();
        const { y, right } = codeDOMNode.getBoundingClientRect();
        setLang(_lang);
        setShown(true);
        setPosition({
          right: `${editorElemRight - right + CODE_PADDING}px`,
          top: `${y - editorElemY}px`,
        });
      }
    },
    50,
    1000
  );
  useEffect(() => {
    if (!shouldListenMouseMove) {
      return;
    }
    document.addEventListener("mousemove", debouncedOnMouseMove);
    return () => {
      setShown(false);
      debouncedOnMouseMove.cancel();
      document.removeEventListener("mousemove", debouncedOnMouseMove);
    };
  }, [shouldListenMouseMove, debouncedOnMouseMove]);
  useEffect(() => {
    return editor.registerMutationListener(
      CodeNode,
      (mutations) => {
        editor.getEditorState().read(() => {
          for (const [key, type] of mutations) {
            switch (type) {
              case "created":
                codeSetRef.current.add(key);
                break;
              case "destroyed":
                codeSetRef.current.delete(key);
                break;
              default:
                break;
            }
          }
        });
        setShouldListenMouseMove(codeSetRef.current.size > 0);
      },
      { skipInitialization: false }
    );
  }, [editor]);
  const onSelectLang = (newLang: string) => {
    const codeDOMNode = getCodeDOMNode();
    if (!codeDOMNode) {
      return;
    }
    editor.update(() => {
      const codeNode = $getNearestNodeFromDOMNode(codeDOMNode);
      if ($isCodeNode(codeNode)) {
        codeNode.setLanguage(newLang);
      }
    });
  };
  return (
    <>
      {isShown ? (
        <div
          className={cn(
            "absolute z-10 flex items-center rounded-md border bg-background p-1 text-muted-foreground shadow-md code-action-menu",
            "text-xs"
          )}
          style={{ ...position }}
        >
          <LanguageSelector
            value={lang}
            onChange={(value) => {
              onSelectLang(value);
              setLang(value);
            }}
          />
          <CopyButton editor={editor} getCodeDOMNode={getCodeDOMNode} />
        </div>
      ) : null}
    </>
  );
}
function getMouseInfo(event: MouseEvent): {
  codeDOMNode: HTMLElement | null;
  isOutside: boolean;
} {
  const target = event.target;
  if (isHTMLElement(target)) {
    const codeDOMNode = target.closest<HTMLElement>("code.lexical-code");
    const isMenu =
      target.closest<HTMLElement>(".code-action-menu") ||
      target.closest<HTMLElement>("[data-radix-popper-content-wrapper]");
    const isOutside = !(codeDOMNode || isMenu);
    return { codeDOMNode, isOutside };
  } else {
    return { codeDOMNode: null, isOutside: true };
  }
}
export default function CodeActionMenuPlugin({
  anchorElem = document.body,
}: {
  anchorElem?: HTMLElement;
}): React.ReactPortal | null {
  return createPortal(
    <CodeActionMenuContainer anchorElem={anchorElem} />,
    anchorElem
  );
}