import {
  Plus,
  Copy,
  Trash2,
  ArrowUp,
  ArrowDown,
  Type,
  Image,
  List,
  Quote,
  Code,
  Table,
  Calendar,
  MapPin,
  FileText,
} from "lucide-react";
import { MenuItem } from "./types";

export const menuStructure: MenuItem[] = [
  { label: "Duplicate", icon: Copy, action: "duplicate" },
  { label: "Move Up", icon: ArrowUp, action: "moveUp" },
  { label: "Move Down", icon: ArrowDown, action: "moveDown" },
  {
    label: "Insert Block",
    icon: Plus,
    submenu: [
      { label: "Text", icon: Type, action: "insert-text" },
      { label: "Heading", icon: FileText, action: "insert-heading" },
      { label: "Quote", icon: Quote, action: "insert-quote" },
      {
        label: "Media",
        icon: Image,
        submenu: [
          { label: "Image", icon: Image, action: "insert-image" },
          { label: "Video", icon: FileText, action: "insert-video" },
          {
            label: "Gallery",
            icon: Image,
            submenu: [
              { label: "Photo Grid", icon: Image, action: "insert-photo-grid" },
              { label: "Carousel", icon: Image, action: "insert-carousel" },
              { label: "Slideshow", icon: Image, action: "insert-slideshow" },
            ],
          },
        ],
      },
      {
        label: "Lists",
        icon: List,
        submenu: [
          { label: "Bullet List", icon: List, action: "insert-bullet-list" },
          {
            label: "Numbered List",
            icon: List,
            action: "insert-numbered-list",
          },
          { label: "Checklist", icon: List, action: "insert-checklist" },
        ],
      },
      { label: "Code Block", icon: Code, action: "insert-code" },
      { label: "Table", icon: Table, action: "insert-table" },
      {
        label: "Embeds",
        icon: Calendar,
        submenu: [
          { label: "Calendar", icon: Calendar, action: "insert-calendar" },
          { label: "Map", icon: MapPin, action: "insert-map" },
          {
            label: "Social",
            icon: FileText,
            submenu: [
              { label: "Twitter", icon: FileText, action: "insert-twitter" },
              { label: "YouTube", icon: FileText, action: "insert-youtube" },
              {
                label: "Instagram",
                icon: FileText,
                action: "insert-instagram",
              },
            ],
          },
        ],
      },
    ],
  },
  { label: "Delete", icon: Trash2, action: "delete", destructive: true },
];
