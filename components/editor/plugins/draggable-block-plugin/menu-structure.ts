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
} from "lucide-react";
import { MenuItem } from "./types";

export const menuStructure: MenuItem[] = [
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
    ],
  },
  { label: "Duplicate", icon: Copy, action: "duplicate" },
  { label: "Delete", icon: Trash2, action: "delete", destructive: true },
];
