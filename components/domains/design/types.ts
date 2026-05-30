import React from "react";
import {
  Image as LucideImage, Layout, Columns2, FileText, Award,
  LayoutTemplate, Type, Quote, List, Tag, PanelBottom
} from "lucide-react";

export interface VibeData {
  vibe: string;
  description?: string;
  colors?: string[];
  titleFont: string;
  bodyFont: string;
  fontUrl?: string;
  fontFamily?: string;
  effectStyle: string;
  unsplashQuery?: string;
  exposure?: number;
  contrast?: number;
  saturation?: number;
  temperature?: number;
  tint?: number;
  layerBlur?: number;
  grainOpacity?: number;
  backgroundFill?: FillSettings;
}

export interface ColorStop {
  id: string;
  color: string;
  opacity: number;
  position: number;
}

export interface FillSettings {
  type: 'solid' | 'linear' | 'radial';
  stops: ColorStop[];
  angle: number;
  isReversed: boolean;
  globalOpacity: number;
}

export type DesignTab = "a3-poster" | "ig-poster" | "wa-poster" | "banner" | "standee" | "certificate" | "forms-header";

export interface FormatSpec {
  id: DesignTab;
  label: string;
  dim: string;
  width: number;
  height: number;
  icon: React.ElementType;
  previewH: number;
}

export type Layer = 
  | "header" | "header-logo" | "header-club" | "header-collab" | "header-intro" | "header-extra" | "header-extra2"
  | "title" | "title-text" 
  | "tagline" | "tagline-text" 
  | "details" | "details-date" | "details-time" | "details-venue" | "details-fee" 
  | "tags" | "tags-teamsize" | "tags-prizepool" 
  | "footer" | "footer-poc1" | "footer-poc2" | "footer-qrbox" | "footer-qrscan"
  | "background" 
  | "custom_artboard" | "custom_element";

export const NATIVE_LAYER_IDS: string[] = [
  "header", "header-logo", "header-club", "header-collab", "header-intro", "header-extra", "header-extra2",
  "title", "title-text",
  "tagline", "tagline-text",
  "details", "details-date", "details-time", "details-venue", "details-fee",
  "tags", "tags-teamsize", "tags-prizepool",
  "footer", "footer-poc1", "footer-poc2", "footer-qrbox", "footer-qrscan",
  "background"
];

export const NATIVE_SUBLAYERS_MAP: Record<string, { id: string, label: string }[]> = {
  header: [
    { id: "header-logo", label: "Logo" },
    { id: "header-club", label: "Club" },
    { id: "header-collab", label: "Collab" },
    { id: "header-extra", label: "Extra Logo 1" },
    { id: "header-extra2", label: "Extra Logo 2" },
    { id: "header-intro", label: "Intro" }
  ],
  title: [
    { id: "title-text", label: "Title Text" }
  ],
  tagline: [
    { id: "tagline-text", label: "Tagline Text" }
  ],
  details: [
    { id: "details-date", label: "Date" },
    { id: "details-time", label: "Time" },
    { id: "details-venue", label: "Venue" },
    { id: "details-fee", label: "Registration Fee" }
  ],
  tags: [
    { id: "tags-teamsize", label: "Team Size" },
    { id: "tags-prizepool", label: "Prize Pool" }
  ],
  footer: [
    { id: "footer-poc1", label: "POC 1" },
    { id: "footer-poc2", label: "POC 2" },
    { id: "footer-qrbox", label: "QR Box" },
    { id: "footer-qrscan", label: "Scan QR Text" }
  ],
  background: []
};

export type ActiveTool = "select" | "artboard" | "shape" | "pen" | "text" | "hand" | "image";
export type ShapeType = "rectangle" | "ellipse" | "polygon" | "star" | "line";

export type EffectType = 'dropShadow' | 'innerShadow' | 'layerBlur' | 'backgroundBlur' | 'noise' | 'texture' | 'glass';

export interface EffectSettings {
  id: string;
  type: EffectType;
  isVisible: boolean;
  x?: number;
  y?: number;
  blur?: number;
  color?: string;
  opacity?: number;
  blurType?: 'uniform' | 'progressive';
  density?: number;
  radius?: number; // Texture size/radius
}

export interface CustomElement {
  id: string;
  parentArtboardId?: string;
  parentLayerId?: string;
  type: ActiveTool;
  subType?: ShapeType;
  x: number;
  y: number;
  width: number;
  height: number;
  imageUrl?: string;
  rotation?: number;
  fill?: string | FillSettings;
  stroke?: string | FillSettings;
  strokeWidth?: number;
  strokeOpacity?: number;
  strokePosition?: string;
  cornerRadius?: number;
  cornerRadii?: [number, number, number, number];
  text?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  fontStyle?: string;
  lineHeight?: string;
  letterSpacing?: number;
  textAlign?: string;
  points?: {x: number, y: number}[];
  edges?: number;

  opacity?: number;
  isClosed?: boolean;
  textOffsetY?: number; // vertical offset of text anchor from box top (for top-edge resize without moving text)
  effects?: EffectSettings[];
}

export interface CustomArtboard {
  id: string;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fill: string;
}

export interface LayerOverride {
  id: string; // The native layer ID (e.g. "title", "header", "tagline")
  x: number;
  y: number;
  dx?: number;
  dy?: number;
  width?: number;
  height?: number;
  text?: string;
  effects?: EffectSettings[];
  // Image Adjustments for logo layers
  exposure?: number;
  contrast?: number;
  saturation?: number;
  temperature?: number;
  tint?: number;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string;
  fontStyle?: string;
  textAlign?: string;
  lineHeight?: string;
  letterSpacing?: string | number;
}
