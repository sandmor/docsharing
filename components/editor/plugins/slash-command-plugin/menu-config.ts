import {
  Type,
  List,
  ListOrdered,
  Code,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Minus,
} from "lucide-react";
import { MenuConfig } from "@/components/ui/context-menu";

export const slashCommandMenuConfig: MenuConfig = {
  title: "Insert Block",
  showHeader: true,
  alignment: "left",
  items: [
    { label: "Text", icon: Type, action: "insert-text" },
    { label: "Heading 1", icon: Heading1, action: "insert-h1" },
    { label: "Heading 2", icon: Heading2, action: "insert-h2" },
    { label: "Heading 3", icon: Heading3, action: "insert-h3" },
    { label: "Heading 4", icon: Heading4, action: "insert-h4" },
    { label: "Heading 5", icon: Heading5, action: "insert-h5" },
    { label: "Heading 6", icon: Heading6, action: "insert-h6" },
    { label: "Bulleted List", icon: List, action: "insert-bullet-list" },
    {
      label: "Numbered List",
      icon: ListOrdered,
      action: "insert-ordered-list",
    },
    { label: "Code Block", icon: Code, action: "insert-code" },
    { label: "Quote", icon: Quote, action: "insert-quote" },
    { label: "Divider", icon: Minus, action: "insert-divider" },
  ],
};
