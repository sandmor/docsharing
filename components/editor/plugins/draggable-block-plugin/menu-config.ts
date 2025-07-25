import {
  Copy,
  Trash2,
  Type,
  List,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Heading4,
  Heading5,
  Heading6,
  Quote,
} from "lucide-react";
import { MenuConfig } from "@/components/ui/context-menu";

export const commonBlockMenuConfig: MenuConfig = {
  title: "Block Actions",
  showHeader: true,
  alignment: "left",
  items: [
    {
      label: "Turn into",
      icon: Type,
      submenu: [
        { label: "Text", icon: Type, action: "turn-into-text" },
        { label: "Heading 1", icon: Heading1, action: "turn-into-h1" },
        { label: "Heading 2", icon: Heading2, action: "turn-into-h2" },
        { label: "Heading 3", icon: Heading3, action: "turn-into-h3" },
        { label: "Heading 4", icon: Heading4, action: "turn-into-h4" },
        { label: "Heading 5", icon: Heading5, action: "turn-into-h5" },
        { label: "Heading 6", icon: Heading6, action: "turn-into-h6" },
        {
          label: "Bulleted list",
          icon: List,
          action: "turn-into-bullet-list",
        },
        {
          label: "Ordered list",
          icon: List,
          action: "turn-into-ordered-list",
        },
        { label: "Code", icon: Code, action: "turn-into-code" },
        { label: "Quote", icon: Quote, action: "turn-into-quote" },
      ],
    },
    { label: "Duplicate", icon: Copy, action: "duplicate" },
    { label: "Delete", icon: Trash2, action: "delete", destructive: true },
  ],
};

export const specialBlockMenuConfig: MenuConfig = {
  title: "Block Actions",
  showHeader: true,
  alignment: "left",
  items: [
    { label: "Duplicate", icon: Copy, action: "duplicate" },
    { label: "Delete", icon: Trash2, action: "delete", destructive: true },
  ],
};
