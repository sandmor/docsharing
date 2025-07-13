import type {
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  EditorConfig,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from "lexical";

import { $applyNodeReplacement, DecoratorNode } from "lexical";
import * as React from "react";

export interface ImagePayload {
  altText: string;
  key?: NodeKey;
  src: string;
}

function $convertImageElement(domNode: Node): null | DOMConversionOutput {
  const img = domNode as HTMLImageElement;
  if (img.src.startsWith("file:///")) {
    return null;
  }
  const { alt: altText, src } = img;
  const node = $createImageNode({ altText, src });
  return { node };
}

export type SerializedImageNode = Spread<
  {
    altText: string;
    src: string;
  },
  SerializedLexicalNode
>;

export class ImageNode extends DecoratorNode<React.JSX.Element> {
  __src: string;
  __altText: string;

  static getType(): string {
    return "image";
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(node.__src, node.__altText, node.__key);
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { altText, src } = serializedNode;
    return $createImageNode({
      altText,
      src,
    });
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement("img");
    element.setAttribute("src", this.__src);
    element.setAttribute("alt", this.__altText);
    return { element };
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: (node: Node) => ({
        conversion: $convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(src: string, altText: string, key?: NodeKey) {
    super(key);
    this.__src = src;
    this.__altText = altText;
  }

  exportJSON(): SerializedImageNode {
    return {
      ...super.exportJSON(),
      altText: this.getAltText(),
      src: this.getSrc(),
    };
  }

  createDOM(config: EditorConfig): HTMLElement {
    const span = document.createElement("span");
    const theme = config.theme;
    const className = theme.image;
    if (className !== undefined) {
      span.className = className;
    }
    return span;
  }

  updateDOM(): false {
    return false;
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string {
    return this.__altText;
  }

  decorate(): React.JSX.Element {
    return <img src={this.__src} alt={this.__altText} />;
  }
}

export function $createImageNode({
  altText,
  src,
  key,
}: ImagePayload): ImageNode {
  return $applyNodeReplacement(new ImageNode(src, altText, key));
}

export function $isImageNode(
  node: LexicalNode | null | undefined
): node is ImageNode {
  return node instanceof ImageNode;
}
