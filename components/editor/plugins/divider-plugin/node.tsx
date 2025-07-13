import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalCommand,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
} from "lexical";
import type { JSX } from "react";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useLexicalNodeSelection } from "@lexical/react/useLexicalNodeSelection";
import {
  addClassNamesToElement,
  mergeRegister,
  removeClassNamesFromElement,
} from "@lexical/utils";
import {
  $applyNodeReplacement,
  CLICK_COMMAND,
  COMMAND_PRIORITY_LOW,
  createCommand,
  DecoratorNode,
  $isElementNode,
  ElementNode,
} from "lexical";
import * as React from "react";
import { useEffect } from "react";
import { ElementTransformer } from "@lexical/markdown";

export type SerializedDividerNode = SerializedLexicalNode;

export const INSERT_DIVIDER_COMMAND: LexicalCommand<void> = createCommand(
  "INSERT_DIVIDER_COMMAND"
);

function DividerComponent({ nodeKey }: { nodeKey: NodeKey }) {
  const [editor] = useLexicalComposerContext();
  const [isSelected, setSelected, clearSelection] =
    useLexicalNodeSelection(nodeKey);

  useEffect(() => {
    return mergeRegister(
      editor.registerCommand(
        CLICK_COMMAND,
        (event: MouseEvent) => {
          const hrElem = editor.getElementByKey(nodeKey);

          if (event.target === hrElem) {
            if (!event.shiftKey) {
              clearSelection();
            }
            setSelected(!isSelected);
            return true;
          }

          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [clearSelection, editor, isSelected, nodeKey, setSelected]);

  useEffect(() => {
    const hrElem = editor.getElementByKey(nodeKey);
    const isSelectedClassName = editor._config.theme.hrSelected ?? "selected";

    if (hrElem !== null) {
      if (isSelected) {
        addClassNamesToElement(hrElem, isSelectedClassName);
      } else {
        removeClassNamesFromElement(hrElem, isSelectedClassName);
      }
    }
  }, [editor, isSelected, nodeKey]);

  return null;
}

export class DividerNode extends DecoratorNode<JSX.Element> {
  static getType(): string {
    return "divider";
  }

  static clone(node: DividerNode): DividerNode {
    return new DividerNode(node.__key);
  }

  static importJSON(serializedNode: SerializedDividerNode): DividerNode {
    return $createDividerNode().updateFromJSON(serializedNode);
  }

  static importDOM(): DOMConversionMap | null {
    return {
      hr: () => ({
        conversion: $convertDividerElement,
        priority: 0,
      }),
    };
  }

  exportDOM(): DOMExportOutput {
    return { element: document.createElement("hr") };
  }

  static exportMarkdown(): string {
    return "---";
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = document.createElement("div");
    const hr = document.createElement("hr");
    addClassNamesToElement(hr, config.theme.hr);
    element.appendChild(hr);
    element.className = "overflow-hidden"; // Prevents margin collapse
    return element;
  }

  getTextContent(): string {
    return "\n";
  }

  isInline(): false {
    return false;
  }

  updateDOM(): boolean {
    return false;
  }

  decorate(): JSX.Element {
    return <DividerComponent nodeKey={this.__key} />;
  }
}

function $convertDividerElement(): DOMConversionOutput {
  return { node: $createDividerNode() };
}

export function $createDividerNode(): DividerNode {
  return $applyNodeReplacement(new DividerNode());
}

export function $isDividerNode(
  node: LexicalNode | null | undefined
): node is DividerNode {
  return node instanceof DividerNode;
}

export const DIVIDER_TRANSFORMER: ElementTransformer = {
  dependencies: [DividerNode],
  export: (node: LexicalNode) => {
    return $isDividerNode(node) ? "***" : null;
  },
  regExp: /^(---|\*\*\*|___)\s?$/,
  replace: (parentNode, _1, _2, isImport) => {
    const line = $createDividerNode();

    // TODO: Get rid of isImport flag
    if (isImport || parentNode.getNextSibling() != null) {
      parentNode.replace(line);
    } else {
      parentNode.insertBefore(line);
    }

    line.selectNext();
  },
  type: "element",
};
