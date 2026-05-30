import React from "react";
import {
  Image as LucideImage, Layout, Columns2, FileText, Award,
  LayoutTemplate, Type, Quote, List, Tag, PanelBottom, Grid3x3, Square
} from "lucide-react";
import { FormatSpec, Layer } from "./types";

export const POSTER_DIMS = [
  { label: "Instagram (4:5)", dim: "1080×1350", w: 1080, h: 1350 },
  { label: "WhatsApp (1:1)", dim: "1080×1080", w: 1080, h: 1080 },
  { label: "A3 Print", dim: "3508×4961", w: 3508, h: 4961 },
];

export const FORMATS: FormatSpec[] = [
  { id: "a3-poster", label: "A3 Poster", dim: "3508×4961", width: 3508, height: 4961, icon: LucideImage, previewH: 800 },
  { id: "ig-poster", label: "Instagram Poster", dim: "1080×1350", width: 1080, height: 1350, icon: LucideImage, previewH: 675 },
  { id: "wa-poster", label: "WhatsApp Poster", dim: "1080×1080", width: 1080, height: 1080, icon: LucideImage, previewH: 540 },
  { id: "banner", label: "Banner", dim: "2400×3000", width: 2400, height: 3000, icon: Layout, previewH: 400 },
  { id: "standee", label: "Standee", dim: "900×1500", width: 900, height: 1500, icon: Columns2, previewH: 500 },
  { id: "forms-header", label: "Forms Header", dim: "1600×400", width: 1600, height: 400, icon: FileText, previewH: 200 },
  { id: "certificate", label: "Certificates", dim: "Canva", width: 0, height: 0, icon: Award, previewH: 0 },
];

export const ARTBOARD_POSITIONS = {
  "a3-poster": { x: 100, y: 100, w: 3508, h: 4961 }, 
  "ig-poster": { x: 3800, y: 100, w: 1080, h: 1350 },
  "wa-poster": { x: 5000, y: 100, w: 1080, h: 1080 },
  "banner": { x: 100, y: 6200, w: 2400, h: 3000 },
  "standee": { x: 2700, y: 6200, w: 900, h: 1500 },
  "forms-header": { x: 3800, y: 6200, w: 1600, h: 400 },
  "certificate": { x: 3800, y: 6800, w: 600, h: 400 }
};

export const EFFECT_CSS: Record<string, React.CSSProperties> = {
  "shadow": { textShadow: "2px 4px 12px rgba(0,0,0,0.8)" },
  "shadow-depth": { textShadow: "3px 3px 0px rgba(0,0,0,0.9), 6px 6px 0px rgba(0,0,0,0.4)" },
  "emboss": { textShadow: "1px 1px 0px rgba(255,255,255,0.3), -1px -1px 0px rgba(0,0,0,0.8)" },
  "gradient-gold": { background: "linear-gradient(180deg, #fde68a, #f59e0b, #b45309)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" },
  "neon-glow": { textShadow: "0 0 5px #fff, 0 0 10px #fff, 0 0 20px #f59e0b, 0 0 30px #f59e0b, 0 0 40px #f59e0b", color: "#fff" },
};

export function getCertificateUrl(subType?: string): string {
  const templates: Record<string, string> = {
    "Hackathon": "https://www.canva.com/certificates/templates/?query=hackathon+certificate",
    "Workshop": "https://www.canva.com/certificates/templates/?query=workshop+certificate",
    "Competition": "https://www.canva.com/certificates/templates/?query=competition+certificate",
    "Conference": "https://www.canva.com/certificates/templates/?query=conference+certificate",
  };
  return templates[subType || ""] || "https://www.canva.com/certificates/templates/?query=event+certificate";
}

export const LAYER_ICONS: Partial<Record<Layer, React.ElementType>> = {
  header: LayoutTemplate,
  title: Type,
  tagline: Quote,
  details: List,
  tags: Tag,
  footer: PanelBottom,
  background: LucideImage,
  custom_artboard: Grid3x3,
  custom_element: Square
};
