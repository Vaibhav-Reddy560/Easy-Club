"use client";
import React, { useRef, useState, useEffect } from "react";
import * as htmlToImage from "html-to-image";
import { ClubEvent, EventConfig, Club } from "@/lib/types";
import { useGenerator } from "@/hooks/useGenerator";
import { Layer, DesignTab, VibeData, FillSettings } from "./design/types";
import { FORMATS, POSTER_DIMS, EFFECT_CSS, ARTBOARD_POSITIONS } from "./design/constants";
import { NATIVE_ALIGNMENTS } from "./design/alignments";
import TopToolbar from "./design/panels/TopToolbar";
import LeftSidebar from "./design/panels/LeftSidebar";
import RightSidebar from "./design/panels/RightSidebar";
import CanvasArea from "./design/panels/CanvasArea";
import BottomToolbar from "./design/panels/BottomToolbar";
import Rulers from "./design/panels/Rulers";
import { motion, AnimatePresence } from "framer-motion";
import { ActiveTool, ShapeType, CustomArtboard, CustomElement, NATIVE_LAYER_IDS } from "./design/types";
import { useMultiplayer } from "@/hooks/useMultiplayer";

interface DesignWorkspaceProps {
  activeEvent: ClubEvent | undefined;
  activeClub?: Club;
  user?: any;
  updateConfig: (newData: Partial<EventConfig>) => void;
  onLogActivity: (domain: 'Design' | 'Content' | 'Social' | 'Management', action: string, details?: string) => void;
  onClose?: () => void;
}

const getPencilHandle = (h: string): string => {
  switch (h) {
    case 'top-left': return 'nw';
    case 'top': return 'n';
    case 'top-right': return 'ne';
    case 'right': return 'e';
    case 'bottom-right': return 'se';
    case 'bottom': return 's';
    case 'bottom-left': return 'sw';
    case 'left': return 'w';
    default: return h;
  }
};

const constrainToAspectRatio = (
  handle: string,
  origRect: { x: number; y: number; width: number; height: number },
  width: number,
  height: number,
  dx: number,
  dy: number
) => {
  let x = handle.includes('w') ? origRect.x + origRect.width - Math.abs(width) : origRect.x;
  const isTop = handle === 'nw' || handle === 'n' || handle === 'ne';
  let y = isTop ? origRect.y + origRect.height - Math.abs(height) : origRect.y;
  const aspect = origRect.width / origRect.height;

  if (handle === 'n' || handle === 's') {
    width = Math.abs(height) * aspect;
    x = origRect.x + (origRect.width - width) / 2;
  } else if (handle === 'e' || handle === 'w') {
    height = Math.abs(width) / aspect;
    y = origRect.y + (origRect.height - height) / 2;
  } else if (Math.abs(dx) > Math.abs(dy)) {
    height = (Math.abs(width) / aspect) * Math.sign(height || 1);
    if (isTop) y = origRect.y + origRect.height - Math.abs(height);
  } else {
    width = Math.abs(height) * aspect * Math.sign(width || 1);
    if (handle.includes('w')) x = origRect.x + origRect.width - Math.abs(width);
  }

  return { x, y, width, height };
};

const isCornerHandle = (handle: string): boolean => {
  if (!handle) return false;
  const h = getPencilHandle(handle);
  return h === 'nw' || h === 'ne' || h === 'se' || h === 'sw';
};

const isNativeTextLayer = (id: string): boolean => {
  return [
    "header-intro",
    "title-text",
    "tagline-text",
    "details-date",
    "details-time",
    "details-venue",
    "details-fee",
    "tags-teamsize",
    "tags-prizepool",
    "footer-poc1",
    "footer-poc2",
    "footer-qrscan"
  ].includes(id);
};

const getDefaultFontSize = (layerId: string): number => {
  if (layerId === 'header-intro' || layerId === 'tagline-text') return 300;
  if (layerId.startsWith('footer-poc')) return 240;
  if (layerId === 'footer-qrscan') return 220;
  if (layerId.startsWith('details-')) return 260;
  if (layerId === 'tags-teamsize') return 220;
  if (layerId === 'tags-prizepool') return 250;
  if (layerId.startsWith('tags-')) return 200;
  return 100;
};


const balanceIntroText = (text: string): string => {
  if (!text) return "";
  if (text.includes('\n')) return text;

  const words = text.split(/\s+/).filter(Boolean);
  if (words.length <= 2) return text;

  // Use 3 lines if length is > 65 characters and there are at least 6 words
  const useThreeLines = text.length > 65 && words.length >= 6;

  if (useThreeLines) {
    let bestSplit = { i: 1, j: 2, score: Infinity };
    
    for (let i = 1; i < words.length - 1; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const l1 = words.slice(0, i).join(" ");
        const l2 = words.slice(i, j).join(" ");
        const l3 = words.slice(j).join(" ");
        
        const len1 = l1.length;
        const len2 = l2.length;
        const len3 = l3.length;
        
        const satisfiesRule = len1 >= len2 && len1 >= len3;
        const maxLen = Math.max(len1, len2, len3);
        const minLen = Math.min(len1, len2, len3);
        const diff = maxLen - minLen;
        const score = diff + (satisfiesRule ? 0 : 1000);
        
        if (score < bestSplit.score) {
          bestSplit = { i, j, score };
        }
      }
    }
    
    const l1 = words.slice(0, bestSplit.i).join(" ");
    const l2 = words.slice(bestSplit.i, bestSplit.j).join(" ");
    const l3 = words.slice(bestSplit.j).join(" ");
    return `${l1}\n${l2}\n${l3}`;
  } else {
    // 2 Lines
    let bestSplit = { i: 1, score: Infinity };
    
    for (let i = 1; i < words.length; i++) {
      const l1 = words.slice(0, i).join(" ");
      const l2 = words.slice(i).join(" ");
      
      const len1 = l1.length;
      const len2 = l2.length;
      
      const satisfiesRule = len1 >= len2;
      const diff = Math.abs(len1 - len2);
      const score = diff + (satisfiesRule ? 0 : 1000);
      
      if (score < bestSplit.score) {
        bestSplit = { i, score };
      }
    }
    
    const l1 = words.slice(0, bestSplit.i).join(" ");
    const l2 = words.slice(bestSplit.i).join(" ");
    return `${l1}\n${l2}`;
  }
};


const calculateResizeRect = (
  rawHandle: string,
  origRect: { x: number; y: number; width: number; height: number },
  dx: number,
  dy: number,
  constrain: boolean
) => {
  const handle = getPencilHandle(rawHandle);
  let { x, y, width, height } = origRect;

  const moveLeft = handle.includes('w');
  const moveRight = handle.includes('e');
  const moveTop = handle === 'nw' || handle === 'n' || handle === 'ne';
  const moveBottom = handle === 'sw' || handle === 's' || handle === 'se';

  if (moveRight) width = origRect.width + dx;
  if (moveLeft) {
    x = origRect.x + dx;
    width = origRect.width - dx;
  }
  if (moveBottom) height = origRect.height + dy;
  if (moveTop) {
    y = origRect.y + dy;
    height = origRect.height - dy;
  }

  if (constrain && origRect.width > 0 && origRect.height > 0) {
    ({ x, y, width, height } = constrainToAspectRatio(handle, origRect, width, height, dx, dy));
  }

  if (width < 0) {
    x += width;
    width = -width;
  }
  if (height < 0) {
    y += height;
    height = -height;
  }

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(Math.max(10, width)),
    height: Math.round(Math.max(10, height))
  };
};

export default function DesignWorkspace({ activeEvent, activeClub, user, updateConfig, onLogActivity, onClose }: DesignWorkspaceProps) {
  const config = activeEvent?.config || {};
  const posterRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Layout State
  const [zoom, setZoom] = useState(0.5);
  const [isPanning, setIsPanning] = useState(false);
  const [pan, setPan] = useState({ x: -1000, y: 0 });

  // Undo/Redo State
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoingRef = useRef(false);

  const handleFitToView = () => { setZoom(0.5); setPan({ x: -1000, y: 0 }); };

  const handleResetLogos = () => {
    isLocalUpdateRef.current = true;
    const logoKeysToReset = [
      'header-logo', 'header-club', 'header-collab', 'header-extra', 'header-extra2', 'header-extra3'
    ];
    setLayerOverrides(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(key => {
        const isMatch = logoKeysToReset.some(id => key === id || key === `${activeTab}_${id}`);
        if (isMatch) {
          delete next[key];
        }
      });
      return next;
    });

    // Reset DOM styles immediately
    logoKeysToReset.forEach(id => {
      const outerNode = activeTab
        ? (document.getElementById(`${activeTab}-${id}`) || document.getElementById(`${id}-${id}`))
        : document.getElementById(`${id}-${id}`);
      if (outerNode) {
        outerNode.style.transform = '';
        outerNode.style.width = '';
        outerNode.style.height = '';
      }
      const innerNode = activeTab
        ? (document.getElementById(`inner-${activeTab}-${id}`) || document.getElementById(`inner-${id}`))
        : document.getElementById(`inner-${id}`);
      if (innerNode) {
        innerNode.style.position = '';
        innerNode.style.left = '';
        innerNode.style.top = '';
        innerNode.style.width = '';
        innerNode.style.height = '';
      }
      const img = outerNode?.querySelector('img');
      if (img) {
        img.style.width = '';
        img.style.height = '';
        img.style.objectFit = '';
      }
    });
  };

  const transformRef = useRef({ zoom, pan });
  const updateTransformThrottled = useRef<NodeJS.Timeout | null>(null);

  const rafRef = useRef<number | null>(null);
  const pendingTransformRef = useRef<{z: number, p: {x: number, y: number}} | null>(null);

  const applyDOMTransform = (z: number, p: {x: number, y: number}) => {
    pendingTransformRef.current = { z, p };
    if (rafRef.current === null) {
      rafRef.current = requestAnimationFrame(() => {
        const state = pendingTransformRef.current;
        if (!state) return;
        
        const panWrap = document.getElementById('canvas-pan-wrapper');
        if (panWrap) panWrap.style.transform = `translate(${state.p.x}px, ${state.p.y}px)`;
        
        const zoomWrap = document.getElementById('canvas-zoom-wrapper');
        if (zoomWrap) zoomWrap.style.zoom = state.z.toString();
        
        const grid = document.getElementById('canvas-dot-grid');
        if (grid) {
          const newBgSize = `${20 * state.z}px ${20 * state.z}px`;
          if (grid.style.backgroundSize !== newBgSize) {
            grid.style.backgroundSize = newBgSize;
          }
          grid.style.transform = `translate(${state.p.x % (20 * state.z)}px, ${state.p.y % (20 * state.z)}px)`;
        }
        
        const peers = document.querySelectorAll('.peer-cursor-wrapper');
        peers.forEach(el => {
          (el as HTMLElement).style.transform = `scale(${1 / state.z})`;
        });
        
        rafRef.current = null;
      });
    }
  };

  useEffect(() => {
    transformRef.current = { zoom, pan };
  }, [zoom, pan]);

  useEffect(() => {
    const el = canvasContainerRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        const { zoom: prevZoom, pan: prevPan } = transformRef.current;
        const newZoom = Math.max(0.1, Math.min(4, prevZoom - e.deltaY * 0.005));
        if (newZoom === prevZoom) return;
        
        const rect = el.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        const canvasX = (mouseX - prevPan.x) / prevZoom;
        const canvasY = (mouseY - prevPan.y) / prevZoom;
        
        const newPan = {
          x: mouseX - canvasX * newZoom,
          y: mouseY - canvasY * newZoom
        };
        
        transformRef.current = { zoom: newZoom, pan: newPan };
        applyDOMTransform(newZoom, newPan);
        if (updateTransformThrottled.current) clearTimeout(updateTransformThrottled.current);
        updateTransformThrottled.current = setTimeout(() => {
          setZoom(newZoom);
          setPan(newPan);
        }, 50);
      } else {
        const newPan = {
          x: transformRef.current.pan.x - e.deltaX,
          y: transformRef.current.pan.y - e.deltaY
        };
        transformRef.current.pan = newPan;
        applyDOMTransform(transformRef.current.zoom, newPan);
        if (updateTransformThrottled.current) clearTimeout(updateTransformThrottled.current);
        updateTransformThrottled.current = setTimeout(() => {
          setPan(newPan);
        }, 50);
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  const canvasRectRef = useRef<DOMRect | null>(null);

  const getCanvasCoords = (e: any, useCache = true) => {
    if (!canvasContainerRef.current) return { x: 0, y: 0 };
    let rect = canvasRectRef.current;
    if (!useCache || !rect) {
      rect = canvasContainerRef.current.getBoundingClientRect();
      canvasRectRef.current = rect;
    }
    const x = (e.clientX - rect.left - pan.x) / zoom;
    const y = (e.clientY - rect.top - pan.y) / zoom;
    return { x, y };
  };

  const mouseMoveRef = useRef<any>(null);
  const mouseUpRef = useRef<any>(null);

  useEffect(() => {
    mouseMoveRef.current = handleCanvasMouseMove;
    mouseUpRef.current = handleCanvasMouseUp;
  });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (mouseMoveRef.current) mouseMoveRef.current(e);
    };
    const onMouseUp = (e: MouseEvent) => {
      if (mouseUpRef.current) mouseUpRef.current(e);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, []);

  const throttledCursorBroadcast = useRef<any>(null);

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    // Refresh rect cache on mouse down
    if (canvasContainerRef.current) {
      canvasRectRef.current = canvasContainerRef.current.getBoundingClientRect();
    }
    
    if (activeTool === 'hand' || (activeTool === 'select' && e.button === 1)) {
      setIsPanning(true);
      return;
    }
    
    if (activeTool !== 'select') {
      const coords = getCanvasCoords(e);
      if (activeTool === 'pen') {
        if (currentPenPoints.length > 0) {
          const firstPoint = currentPenPoints[0];
          const dist = Math.hypot(coords.x - firstPoint.x, coords.y - firstPoint.y);
          if (dist < 15) {
            // Close the path
            const minX = Math.min(...currentPenPoints.map(p => p.x));
            const minY = Math.min(...currentPenPoints.map(p => p.y));
            const maxX = Math.max(...currentPenPoints.map(p => p.x));
            const maxY = Math.max(...currentPenPoints.map(p => p.y));
            const width = Math.max(maxX - minX, 10);
            const height = Math.max(maxY - minY, 10);
            
            handleSetCustomElements(prev => [...prev, {
              id: crypto.randomUUID(),
              type: 'pen',
              x: minX,
              y: minY,
              width,
              height,
              points: currentPenPoints.map(p => ({ x: p.x - minX, y: p.y - minY })),
              fill: '#ffffff',
              stroke: '#ffffff',
              strokeWidth: 2,
              isClosed: true
            }]);
            setCurrentPenPoints([]);
            setActiveTool('select');
          } else {
            setCurrentPenPoints(prev => [...prev, coords]);
          }
        } else {
          setCurrentPenPoints([coords]);
        }
      } else {
        setDrawStartPoint(coords);
        setCurrentDrawPoint(coords);
        setIsDrawing(true);
      }
    } else {
      // activeTool === 'select'
      // Clicking on empty canvas (since element clicks stop propagation)
      if (e.button === 0) { // left click
        setSelectedElementId(null);
        setSelectedLayer("background");
        setSelectedArtboard(null);
        setActiveTab(null as any);
      }
    }
  };
  
  const handleCanvasMouseMove = (e: any) => {
    const isOverCanvas = canvasContainerRef.current && e.target && canvasContainerRef.current.contains(e.target as Node);
    const isInteracting = draggingRef.current || isPanning || isDrawing || draggingGuide;
    
    if (isOverCanvas || isInteracting) {
      // Broadcast cursor to peers
      const coords = getCanvasCoords(e, false);
      if (!throttledCursorBroadcast.current) {
        throttledCursorBroadcast.current = setTimeout(() => {
          broadcastCursor(coords);
          throttledCursorBroadcast.current = null;
        }, 50); // 20 updates per second
      }
    }

    const coords = getCanvasCoords(e);

    if (draggingGuide) {
      let finalPos = draggingGuide.type === 'horizontal' ? coords.y : coords.x;
      const threshold = 10 / zoom;
      
      const snapPoints: number[] = [];
      
      // Native Artboards
      FORMATS.forEach(f => {
        const pos = ARTBOARD_POSITIONS[f.id as keyof typeof ARTBOARD_POSITIONS];
        if (pos) {
          if (draggingGuide.type === 'horizontal') {
            snapPoints.push(pos.y, pos.y + pos.h, pos.y + pos.h / 2);
          } else {
            snapPoints.push(pos.x, pos.x + pos.w, pos.x + pos.w / 2);
          }
        }
      });
      
      // Custom Artboards
      customArtboards.forEach(a => {
        if (draggingGuide.type === 'horizontal') {
          snapPoints.push(a.y, a.y + a.height, a.y + a.height / 2);
        } else {
          snapPoints.push(a.x, a.x + a.width, a.x + a.width / 2);
        }
      });
      
      // Custom Elements
      customElements.forEach(el => {
        let snapY1 = el.y;
        let snapY2 = el.y + el.height;
        let snapX1 = el.x;
        let snapX2 = el.x + el.width;
        
        if (el.type === 'text') {
          const span = document.getElementById(`text_span_${el.id}`);
          const container = canvasContainerRef.current;
          if (span && container) {
            const spanRect = span.getBoundingClientRect();
            const containerRect = canvasRectRef.current || container.getBoundingClientRect();
            snapX1 = (spanRect.left - containerRect.left - pan.x) / zoom;
            snapX2 = (spanRect.right - containerRect.left - pan.x) / zoom;
            snapY1 = (spanRect.top - containerRect.top - pan.y) / zoom;
            snapY2 = (spanRect.bottom - containerRect.top - pan.y) / zoom;
          }
        }
        
        if (draggingGuide.type === 'horizontal') {
          snapPoints.push(snapY1, snapY2, (snapY1 + snapY2) / 2);
        } else {
          snapPoints.push(snapX1, snapX2, (snapX1 + snapX2) / 2);
        }
      });
      
      // Find closest snap point
      let minDiff = Infinity;
      let closestSnap = finalPos;
      
      for (const p of snapPoints) {
        const diff = Math.abs(p - finalPos);
        if (diff < threshold && diff < minDiff) {
          minDiff = diff;
          closestSnap = p;
        }
      }
      
      if (draggingGuide.type === 'horizontal') {
        setHorizontalGuides(prev => prev.map((g, i) => i === draggingGuide.index ? closestSnap : g));
      } else {
        setVerticalGuides(prev => prev.map((g, i) => i === draggingGuide.index ? closestSnap : g));
      }
      return; // Stop other interactions
    }

    if (isPanning) {
      const newPan = { x: transformRef.current.pan.x + e.movementX, y: transformRef.current.pan.y + e.movementY };
      transformRef.current.pan = newPan;
      applyDOMTransform(transformRef.current.zoom, newPan);
      if (updateTransformThrottled.current) clearTimeout(updateTransformThrottled.current);
      updateTransformThrottled.current = setTimeout(() => {
        setPan(newPan);
      }, 50);
    } else if (isDrawing) {
      let coords = getCanvasCoords(e);
      if (e.shiftKey && (activeTool === 'shape' || activeTool === 'artboard')) {
         const dx = coords.x - drawStartPoint.x;
         const dy = coords.y - drawStartPoint.y;
         const max = Math.max(Math.abs(dx), Math.abs(dy));
         coords = {
           x: drawStartPoint.x + (Math.sign(dx) || 1) * max,
           y: drawStartPoint.y + (Math.sign(dy) || 1) * max
         };
      }
      setCurrentDrawPoint(coords);
    } else if (activeTool === 'pen' && currentPenPoints.length > 0) {
      setCurrentDrawPoint(getCanvasCoords(e));
    } else if (draggingRef.current) {
      const coords = getCanvasCoords(e);
      const dx = coords.x - draggingRef.current.startX;
      const dy = coords.y - draggingRef.current.startY;
      draggingRef.current.dx = dx;
      draggingRef.current.dy = dy;
      
      const { id, isArtboard, resizeHandle } = draggingRef.current;
      const el = isArtboard ? customArtboards.find(a => a.id === id) : customElements.find(c => c.id === id);
      
      if (draggingRef.current.node) {
        if (!resizeHandle) {
          let snapDx = dx;
          let snapDy = dy;
          
          if (el && showRulers && !e.shiftKey) {
            const threshold = 5 / zoom;
            
            let snapX1 = el.x;
            let snapX2 = el.x + el.width;
            let snapY1 = el.y;
            let snapY2 = el.y + el.height;
            
            if (!isArtboard && 'type' in el && el.type === 'text') {
              const span = document.getElementById(`text_span_${el.id}`);
              const container = canvasContainerRef.current;
              if (span && container) {
                const spanRect = span.getBoundingClientRect();
                const containerRect = canvasRectRef.current || container.getBoundingClientRect();
                snapX1 = (spanRect.left - containerRect.left - pan.x) / zoom;
                snapX2 = (spanRect.right - containerRect.left - pan.x) / zoom;
                snapY1 = (spanRect.top - containerRect.top - pan.y) / zoom;
                snapY2 = (spanRect.bottom - containerRect.top - pan.y) / zoom;
              }
            }
            
            // X Snapping
            let minDistX = Infinity;
            for (const g of verticalGuides) {
               const distL = Math.abs((snapX1 + dx) - g);
               if (distL < threshold && distL < minDistX) { minDistX = distL; snapDx = g - snapX1; }
               const distR = Math.abs((snapX2 + dx) - g);
               if (distR < threshold && distR < minDistX) { minDistX = distR; snapDx = g - snapX2; }
               const distC = Math.abs(((snapX1 + snapX2)/2 + dx) - g);
               if (distC < threshold && distC < minDistX) { minDistX = distC; snapDx = g - (snapX1 + snapX2)/2; }
            }
            
            // Y Snapping
            let minDistY = Infinity;
            for (const g of horizontalGuides) {
               const distT = Math.abs((snapY1 + dy) - g);
               if (distT < threshold && distT < minDistY) { minDistY = distT; snapDy = g - snapY1; }
               const distB = Math.abs((snapY2 + dy) - g);
               if (distB < threshold && distB < minDistY) { minDistY = distB; snapDy = g - snapY2; }
               const distC = Math.abs(((snapY1 + snapY2)/2 + dy) - g);
               if (distC < threshold && distC < minDistY) { minDistY = distC; snapDy = g - (snapY1 + snapY2)/2; }
            }
          }
          
          draggingRef.current.snapDx = snapDx;
          draggingRef.current.snapDy = snapDy;

          if (draggingRef.current.isNative) {
            const ix = draggingRef.current.initialX || 0;
            const iy = draggingRef.current.initialY || 0;
            draggingRef.current.node.style.transform = `translate(${ix + snapDx}px, ${iy + snapDy}px)`;
          } else {
            draggingRef.current.node.style.transform = `translate(${snapDx}px, ${snapDy}px)`;
          }
          if (el) {
             setDragPreviewBounds({ id: el.id, x: el.x + snapDx, y: el.y + snapDy, width: el.width, height: el.height });
          }
        } else if (el || draggingRef.current.isNative) {
          // Live resize preview
          const origRect = {
            x: el ? el.x : draggingRef.current.initialX || 0,
            y: el ? el.y : draggingRef.current.initialY || 0,
            width: el ? el.width : draggingRef.current.initialWidth || 0,
            height: el ? el.height : draggingRef.current.initialHeight || 0
          };
          
          const isText = isNativeTextLayer(id);
          const isCorner = isCornerHandle(resizeHandle);
          const constrain = !!(e.shiftKey || scaleMode || (draggingRef.current.isNative && (!isText || isCorner)));
          
          const { x: newX, y: newY, width: newWidth, height: newHeight } = calculateResizeRect(
            resizeHandle,
            origRect,
            dx,
            dy,
            constrain
          );

          if (draggingRef.current.isNative) {
             // Lock the outer wrapper to its original footprint size to prevent layout shifts
             draggingRef.current.node.style.width = `${draggingRef.current.originalWidth}px`;
             draggingRef.current.node.style.height = `${draggingRef.current.originalHeight}px`;
             draggingRef.current.node.style.transform = `translate(${newX}px, ${newY}px)`;
             
             // Apply the resizing directly to the inner absolute wrapper
             const innerNode = activeTab
               ? (document.getElementById(`inner-${activeTab}-${id}`) || document.getElementById(`inner-${id}`))
               : document.getElementById(`inner-${id}`);
             if (innerNode) {
               innerNode.style.position = 'absolute';
               innerNode.style.left = '0';
               innerNode.style.top = '0';
               innerNode.style.width = `${newWidth}px`;
               innerNode.style.height = `${newHeight}px`;
               
               if (isText && constrain) {
                 const textInput = innerNode.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null;
                 if (textInput) {
                   const baseFontSize = draggingRef.current.initialFontSize || getDefaultFontSize(id);
                   const scaleRatio = newWidth / (draggingRef.current.initialWidth || 1);
                   const newFS = Math.round(baseFontSize * scaleRatio);
                   textInput.style.fontSize = `${newFS}%`;
                 }
               }
             }
             
             const img = draggingRef.current.node.querySelector('img');
             if (img) {
               img.style.width = '100%';
               img.style.height = '100%';
               img.style.objectFit = 'contain';
             }
          } else {
             draggingRef.current.node.style.width = `${newWidth}px`;
             draggingRef.current.node.style.height = `${newHeight}px`;
             draggingRef.current.node.style.left = `${newX}px`;
             draggingRef.current.node.style.top = `${newY}px`;
          }

          // Instantly update text span width so word-wrap reflows during drag (not on mouse-up)
          const textSpan = draggingRef.current.node.querySelector('span.absolute') as HTMLElement | null;
          if (textSpan && el) {
            textSpan.style.width = `${newWidth}px`;
            if (resizeHandle.includes('top') && 'type' in el && el.type === 'text') {
              // The box's Y moved by `newY - el.y`, so we must shift the text's top by the opposite to keep its canvas position fixed
              textSpan.style.top = `${(el.textOffsetY || 0) - (newY - el.y)}px`;
            }
          }
          
          if (el) {
             setDragPreviewBounds({ id: el.id, x: newX, y: newY, width: newWidth, height: newHeight });
          }
        }
      }
    }
  };
  
  const handleCanvasMouseUp = (e: any) => {
    setIsPanning(false);
    
    if (draggingGuide) {
      if (canvasContainerRef.current) {
        const rect = canvasContainerRef.current.getBoundingClientRect();
        // Delete if dropped near the ruler edges or outside canvas
        if (e.clientX < rect.left + 20 || e.clientX > rect.right || e.clientY < rect.top + 20 || e.clientY > rect.bottom) {
          if (draggingGuide.type === 'horizontal') {
            setHorizontalGuides(prev => prev.filter((_, i) => i !== draggingGuide.index));
          } else {
            setVerticalGuides(prev => prev.filter((_, i) => i !== draggingGuide.index));
          }
        }
      }
      setDraggingGuide(null);
      return;
    }

    if (draggingRef.current) {
      const { id, dx, dy, node, isArtboard, resizeHandle, snapDx, snapDy } = draggingRef.current as any;
      
      const finalDx = snapDx ?? dx;
      const finalDy = snapDy ?? dy;
      
      if (finalDx !== 0 || finalDy !== 0) {
        const list = isArtboard ? customArtboards : customElements;
        const el = list.find(e => e.id === id);
        
        if (el) {
          if (!resizeHandle) {
            if (isArtboard) {
              handleSetCustomArtboards(prev => prev.map(el => el.id === id ? { ...el, x: el.x + finalDx, y: el.y + finalDy } : el));
            } else {
              handleSetCustomElements(prev => prev.map(el => el.id === id ? { ...el, x: el.x + finalDx, y: el.y + finalDy } : el));
            }
          } else {
            const origRect = { x: el.x, y: el.y, width: el.width, height: el.height };
            const constrain = !!(e.shiftKey || scaleMode);
            const { x: newX, y: newY, width: newWidth, height: newHeight } = calculateResizeRect(
              resizeHandle,
              origRect,
              dx,
              dy,
              constrain
            );
            
            const scaleRatio = newWidth / el.width;

            if (isArtboard) {
              handleSetCustomArtboards(prev => prev.map(el => el.id === id ? { ...el, x: newX, y: newY, width: newWidth, height: newHeight } : el));
            } else {
              handleSetCustomElements(prev => prev.map(el => {
                if (el.id === id) {
                  return { 
                    ...el, 
                    x: newX, y: newY, width: newWidth, height: newHeight,
                    fontSize: el.type === 'text' && (scaleMode || e.shiftKey) ? (el.fontSize || 24) * scaleRatio : el.fontSize,
                    textOffsetY: el.type === 'text' && resizeHandle.includes('top') ? (el.textOffsetY || 0) - (newY - el.y) : el.textOffsetY
                  };
                }
                return el;
              }));
            }
          }
        } else if (draggingRef.current.isNative) {
          // Native Layer Override
          isLocalUpdateRef.current = true;
          
          const initialWidth = draggingRef.current.initialWidth || 0;
          const initialHeight = draggingRef.current.initialHeight || 0;
          const initialX = draggingRef.current.initialX || 0;
          const initialY = draggingRef.current.initialY || 0;
          
          const overrideKey = `${activeTab}_${id}`;
          
          if (!resizeHandle) {
            // DRAG (MOVE)
            if (finalDx !== 0 || finalDy !== 0) {
              const newX = initialX + finalDx;
              const newY = initialY + finalDy;
              
              // Apply to DOM immediately to avoid flicker
              if (node) {
                node.style.transform = `translate(${Math.round(newX)}px, ${Math.round(newY)}px)`;
              }
              
              setLayerOverrides(prev => {
                const current = prev[overrideKey] || { id, x: 0, y: 0 };
                return {
                  ...prev,
                  [overrideKey]: {
                    ...current,
                    x: newX,
                    y: newY
                  }
                };
              });
            } else {
              // No movement - restore to initial state overrides
              const override = layerOverrides[overrideKey] || layerOverrides[id];
              if (node) {
                if (override) {
                  if (typeof override.dx === 'number' && typeof override.dy === 'number') {
                    node.style.transform = `translate(${Math.round(override.dx)}px, ${Math.round(override.dy)}px)`;
                  } else if (typeof override.x === 'number' && typeof override.y === 'number') {
                    node.style.transform = `translate(${Math.round(override.x)}px, ${Math.round(override.y)}px)`;
                  } else {
                    node.style.transform = '';
                  }
                } else {
                  node.style.transform = '';
                }
              }
            }
          } else {
            // RESIZE
            const origRect = { x: initialX, y: initialY, width: initialWidth, height: initialHeight };
            const isText = isNativeTextLayer(id);
            const isCorner = isCornerHandle(resizeHandle);
            const constrain = !!(e.shiftKey || scaleMode || (draggingRef.current.isNative && (!isText || isCorner)));

            const { x: newX, y: newY, width: newWidth, height: newHeight } = calculateResizeRect(
              resizeHandle,
              origRect,
              dx,
              dy,
              constrain
            );
            
            const didChange = newWidth !== initialWidth || newHeight !== initialHeight || newX !== initialX || newY !== initialY;
            
            if (didChange) {
              // Apply new styles to DOM immediately to avoid flicker
              if (node) {
                const origW = draggingRef.current.originalWidth || initialWidth;
                const origH = draggingRef.current.originalHeight || initialHeight;
                node.style.width = `${origW}px`;
                node.style.height = `${origH}px`;
                node.style.transform = `translate(${Math.round(newX)}px, ${Math.round(newY)}px)`;
              }
              const innerNode = activeTab
                ? (document.getElementById(`inner-${activeTab}-${id}`) || document.getElementById(`inner-${id}`))
                : document.getElementById(`inner-${id}`);
              if (innerNode) {
                innerNode.style.position = 'absolute';
                innerNode.style.left = '0';
                innerNode.style.top = '0';
                innerNode.style.width = `${newWidth}px`;
                innerNode.style.height = `${newHeight}px`;
              }
              
              const scaleRatio = newWidth / initialWidth;
              const initialFontSize = draggingRef.current.initialFontSize || getDefaultFontSize(id);
              const newFontSize = Math.round(initialFontSize * scaleRatio);

              setLayerOverrides(prev => {
                const current = prev[overrideKey] || { id, x: 0, y: 0 };
                return {
                  ...prev,
                  [overrideKey]: {
                    ...current,
                    x: newX,
                    y: newY,
                    width: newWidth,
                    height: newHeight,
                    originalWidth: current.originalWidth !== undefined ? current.originalWidth : initialWidth,
                    originalHeight: current.originalHeight !== undefined ? current.originalHeight : initialHeight,
                    ...(isText && constrain ? { fontSize: newFontSize } : {})
                  }
                };
              });
            } else {
              // Revert to initial styles if no change occurred
              const override = layerOverrides[overrideKey] || layerOverrides[id];
              if (node) {
                if (override) {
                  if (typeof override.dx === 'number' && typeof override.dy === 'number') {
                    node.style.transform = `translate(${Math.round(override.dx)}px, ${Math.round(override.dy)}px)`;
                  } else if (typeof override.x === 'number' && typeof override.y === 'number') {
                    node.style.transform = `translate(${Math.round(override.x)}px, ${Math.round(override.y)}px)`;
                  } else {
                    node.style.transform = '';
                  }
                  node.style.width = override.originalWidth ? `${override.originalWidth}px` : '';
                  node.style.height = override.originalHeight ? `${override.originalHeight}px` : '';
                } else {
                  node.style.transform = '';
                  node.style.width = '';
                  node.style.height = '';
                }
              }
              const innerNode = activeTab
                ? (document.getElementById(`inner-${activeTab}-${id}`) || document.getElementById(`inner-${id}`))
                : document.getElementById(`inner-${id}`);
              if (innerNode) {
                if (override && (override.width !== undefined || override.height !== undefined)) {
                  innerNode.style.position = 'absolute';
                  innerNode.style.left = '0';
                  innerNode.style.top = '0';
                  innerNode.style.width = `${override.width}px`;
                  innerNode.style.height = `${override.height}px`;
                } else {
                  innerNode.style.position = '';
                  innerNode.style.left = '';
                  innerNode.style.top = '';
                  innerNode.style.width = '';
                  innerNode.style.height = '';
                }
                const textInput = innerNode.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement | null;
                if (textInput) {
                  if (override && override.fontSize !== undefined) {
                    textInput.style.fontSize = `${override.fontSize}%`;
                  } else {
                    textInput.style.fontSize = '';
                  }
                }
              }
            }
          }
        }
        
        // Handle parenting to Custom Artboard or Native Artboard if dropping a Custom Element
        if (!isArtboard && el) {
           const dropX = el.x + finalDx;
           const dropY = el.y + finalDy;
           const targetArtboard = customArtboards.find(a => 
             dropX >= a.x && dropX <= a.x + a.width &&
             dropY >= a.y && dropY <= a.y + a.height
           );
           
           if (targetArtboard) {
             handleSetCustomElements(prev => prev.map(e => e.id === id ? { ...e, parentArtboardId: targetArtboard.id } : e));
           } else {
             // Check native artboards
             const nativeId = Object.entries(ARTBOARD_POSITIONS).find(([_, pos]) => 
               dropX >= pos.x && dropX <= pos.x + pos.w &&
               dropY >= pos.y && dropY <= pos.y + pos.h
             )?.[0];
             
             if (nativeId) {
               handleSetCustomElements(prev => prev.map(e => e.id === id ? { ...e, parentArtboardId: nativeId } : e));
             } else {
               // Remove parenting if dragged outside
               handleSetCustomElements(prev => prev.map(e => e.id === id ? { ...e, parentArtboardId: undefined } : e));
             }
           }
        }
      }
      
      if (node && !draggingRef.current?.isNative) {
        node.style.transform = '';
      }
      
      setDragPreviewBounds(null);
      
      draggingRef.current = null;
    }
    
    if (isDrawing) {
      setIsDrawing(false);
      let endCoords = currentDrawPoint;
      if (e.shiftKey && (activeTool === 'shape' || activeTool === 'artboard')) {
         const dx = endCoords.x - drawStartPoint.x;
         const dy = endCoords.y - drawStartPoint.y;
         const max = Math.max(Math.abs(dx), Math.abs(dy));
         endCoords = {
           x: drawStartPoint.x + (Math.sign(dx) || 1) * max,
           y: drawStartPoint.y + (Math.sign(dy) || 1) * max
         };
      }
      
      let width = Math.abs(endCoords.x - drawStartPoint.x);
      let height = Math.abs(endCoords.y - drawStartPoint.y);
      let x = Math.min(drawStartPoint.x, endCoords.x);
      let y = Math.min(drawStartPoint.y, endCoords.y);
      
      // Ignore tiny clicks for artboards and shapes, but allow them for text
      if (width < 5 && height < 5) {
        if (activeTool !== 'text') return;
        // Default text size on simple click
        width = 150;
        height = 40;
      }
      
      const newId = crypto.randomUUID();
      
      if (activeTool === 'artboard') {
        handleSetCustomArtboards(prev => [...prev, {
          id: newId,
          label: `Artboard ${prev.length + 1}`,
          x, y, width, height,
          fill: '#ffffff'
        }]);
        setActiveTool('select');
      } else if (activeTool === 'shape' || activeTool === 'text') {
        handleSetCustomElements(prev => [...prev, {
          id: newId,
          type: activeTool,
          subType: activeTool === 'shape' ? activeShape : undefined,
          x, y, width, height,
          fill: activeTool === 'text' ? 'transparent' : '#ffffff',
          stroke: undefined,
          strokeWidth: undefined,
          edges: activeShape === 'polygon' ? 3 : undefined,
          text: activeTool === 'text' ? 'New Text' : undefined,
          fontFamily: 'Inter',
          fontSize: 24
        }]);
        setActiveTool('select');
      }
    }
  };

  // Track whether we need to broadcast state
  const isLocalUpdateRef = useRef(false);

  // Text Edit State
  const [titleFont, setTitleFont] = useState("Inter");
  const [titleBold, setTitleBold] = useState(true);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editIntro, setEditIntro] = useState("PRESENTS");
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");
  const [editVenue, setEditVenue] = useState("");
  const [editFee, setEditFee] = useState("");
  const [editTeamSize, setEditTeamSize] = useState("");
  const [editPrizePool, setEditPrizePool] = useState("");
  const [editPoc1, setEditPoc1] = useState("");
  const [editPoc2, setEditPoc2] = useState("");
  const [editScanText, setEditScanText] = useState("Scan the QR code to register");

  const handleSetEditTitle = (val: string) => {
    isLocalUpdateRef.current = true;
    setEditTitle(val);
  };
  const handleSetEditSubtitle = (val: string) => {
    isLocalUpdateRef.current = true;
    setEditSubtitle(val);
  };
  const handleSetEditIntro = (val: string) => {
    isLocalUpdateRef.current = true;
    setEditIntro(val);
  };
  const handleSetEditDate = (val: string) => {
    isLocalUpdateRef.current = true;
    setEditDate(val);
  };
  const handleSetEditScanText = (val: string) => {
    isLocalUpdateRef.current = true;
    setEditScanText(val);
  };
  const handleSetEditTime = (val: string) => {
    isLocalUpdateRef.current = true;
    setEditTime(val);
  };
  const handleSetEditVenue = (val: string) => {
    isLocalUpdateRef.current = true;
    setEditVenue(val);
  };
  const handleSetEditFee = (val: string) => {
    isLocalUpdateRef.current = true;
    setEditFee(val);
  };
  const handleSetEditTeamSize = (val: string) => {
    isLocalUpdateRef.current = true;
    setEditTeamSize(val);
  };
  const handleSetEditPrizePool = (val: string) => {
    isLocalUpdateRef.current = true;
    setEditPrizePool(val);
  };
  const handleSetEditPoc1 = (val: string) => {
    isLocalUpdateRef.current = true;
    setEditPoc1(val);
  };
  const handleSetEditPoc2 = (val: string) => {
    isLocalUpdateRef.current = true;
    setEditPoc2(val);
  };

  // App State
  const [activeTool, setActiveTool] = useState<ActiveTool>('select');
  const [activeShape, setActiveShape] = useState<ShapeType>('rectangle');
  const [customArtboards, setCustomArtboards] = useState<CustomArtboard[]>([]);
  const [customElements, setCustomElements] = useState<CustomElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStartPoint, setDrawStartPoint] = useState({ x: 0, y: 0 });
  const [currentDrawPoint, setCurrentDrawPoint] = useState({ x: 0, y: 0 });
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>("background");
  const [activeTab, setActiveTab] = useState<DesignTab | string | null>("a3-poster");
  const [selectedArtboard, setSelectedArtboard] = useState<string | null>("a3-poster");
  const [currentPenPoints, setCurrentPenPoints] = useState<{x: number, y: number}[]>([]);
  
  const [scaleMode, setScaleMode] = useState(false);
  const [layerOverrides, setLayerOverrides] = useState<Record<string, any>>((config.designWorkspace as any)?.layerOverrides || {});
  const [dragPreviewBounds, setDragPreviewBounds] = useState<{ id: string, x: number, y: number, width: number, height: number } | null>(null);

  // Rulers & Guides State
  const [showRulers, setShowRulers] = useState(false);
  const [horizontalGuides, setHorizontalGuides] = useState<number[]>([]);
  const [verticalGuides, setVerticalGuides] = useState<number[]>([]);
  const [draggingGuide, setDraggingGuide] = useState<{ type: 'horizontal' | 'vertical', index: number } | null>(null);

  const handleAddHorizontalGuide = (y: number) => {
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const canvasY = (y - rect.top - pan.y) / zoom;
    setHorizontalGuides(prev => {
      const next = [...prev, canvasY];
      setDraggingGuide({ type: 'horizontal', index: next.length - 1 });
      return next;
    });
  };

  const handleAddVerticalGuide = (x: number) => {
    if (!canvasContainerRef.current) return;
    const rect = canvasContainerRef.current.getBoundingClientRect();
    const canvasX = (x - rect.left - pan.x) / zoom;
    setVerticalGuides(prev => {
      const next = [...prev, canvasX];
      setDraggingGuide({ type: 'vertical', index: next.length - 1 });
      return next;
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        // Only allow Cmd+Z inside inputs if we want native undo, but wait!
        // If we want our global undo to work while focusing inputs, we shouldn't return here.
        // But native input undo is usually better inside inputs. Let's let native input handle its own undo.
        // However, we still need to prevent default if it's Cmd+Z so it doesn't trigger our global undo.
        return;
      }
      
      if (e.key.toLowerCase() === 'z' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (e.shiftKey) {
          // Redo
          if (historyIndex < history.length - 1) {
            isUndoingRef.current = true;
            const nextSnap = history[historyIndex + 1];
            applySnapshot(nextSnap);
            setHistoryIndex(historyIndex + 1);
          }
        } else {
          // Undo
          if (historyIndex > 0) {
            isUndoingRef.current = true;
            const prevSnap = history[historyIndex - 1];
            applySnapshot(prevSnap);
            setHistoryIndex(historyIndex - 1);
          }
        }
        return;
      }
      
      if (e.key.toLowerCase() === 'y' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        // Redo
        if (historyIndex < history.length - 1) {
          isUndoingRef.current = true;
          const nextSnap = history[historyIndex + 1];
          applySnapshot(nextSnap);
          setHistoryIndex(historyIndex + 1);
        }
        return;
      }
      
      if (e.key.toLowerCase() === 'k' && !(e.metaKey || e.ctrlKey)) {
        setScaleMode(prev => !prev);
      }
      if (e.shiftKey && e.key.toLowerCase() === 'r' && !(e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setShowRulers(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [history, historyIndex]);
  
  const [backgroundFill, setBackgroundFillRaw] = useState<FillSettings>((config.designWorkspace as any)?.backgroundFill || {
    type: 'radial',
    stops: [
      { id: '1', color: '#000000', opacity: 100, position: 0 },
      { id: '2', color: '#ffffff', opacity: 100, position: 100 }
    ],
    angle: 0,
    centerX: 50,
    centerY: 50,
    isReversed: false,
    globalOpacity: 0
  });

  // Track whether we need to broadcast state
  const clipboardRef = useRef<{ type: 'element' | 'artboard', data: any } | null>(null);

  // Undo/Redo apply logic
  const applySnapshot = (snap: any) => {
    setCustomElements(snap.customElements);
    setCustomArtboards(snap.customArtboards);
    setLayerOverrides(snap.layerOverrides);
    setBackgroundFillRaw(snap.backgroundFill);
    setExposure(snap.exposure);
    setContrast(snap.contrast);
    setSaturation(snap.saturation);
    setTemperature(snap.temperature);
    setTint(snap.tint);
    setLayerBlur(snap.layerBlur);
    setGrainOpacity(snap.grainOpacity);
    setTextFill(snap.textFill);
    setTextStrokeWidth(snap.textStrokeWidth);
    setTextStrokeColor(snap.textStrokeColor);
    if ((snap as any).textStrokeFill) setTextStrokeFill((snap as any).textStrokeFill);
    setTextStrokeOpacity(snap.textStrokeOpacity || 1);
    setTextShadowOpacity(snap.textShadowOpacity);
    setTextBackdropBlur(snap.textBackdropBlur);
    setTitleFont(snap.titleFont);
    setTitleBold(snap.titleBold);
    setLabelsBold(snap.labelsBold);
    setLabelsUppercase(snap.labelsUppercase);
    setEditTitle(snap.editTitle);
    setEditSubtitle(snap.editSubtitle);
    setEditIntro(snap.editIntro);
    setEditDate(snap.editDate);
    setEditTime(snap.editTime);
    setEditVenue(snap.editVenue);
    setEditFee(snap.editFee);
    setEditTeamSize(snap.editTeamSize);
    setEditPrizePool(snap.editPrizePool);
    setEditPoc1(snap.editPoc1);
    setEditPoc2(snap.editPoc2);
    setEditScanText(snap.editScanText || "Scan the QR code to register");
    
    // Broadcast state after applying snapshot
    isLocalUpdateRef.current = true;
  };

  const setBackgroundFill = (val: React.SetStateAction<FillSettings>) => {
    isLocalUpdateRef.current = true;
    setBackgroundFillRaw(val);
  };
  
  // -- MULTIPLAYER INTEGRATION --
  const { peers, broadcastCursor, broadcastState, updatePresence, setOnReceiveState } = useMultiplayer(
    activeEvent?.id,
    user
  );

  useEffect(() => {
    setOnReceiveState((newState) => {
      if (newState.customElements) setCustomElements(newState.customElements);
      if (newState.customArtboards) setCustomArtboards(newState.customArtboards);
      if (newState.backgroundFill) setBackgroundFillRaw(newState.backgroundFill);
      if (newState.layerOverrides) setLayerOverrides(newState.layerOverrides);
    });
  }, [setOnReceiveState]);

  // Track whether we need to broadcast state

  useEffect(() => {
    if (isLocalUpdateRef.current) {
      broadcastState({ customElements, customArtboards, backgroundFill, layerOverrides });
      isLocalUpdateRef.current = false;
      
      // Debounced Firebase save
      const timer = setTimeout(() => {
        const safeData = JSON.parse(JSON.stringify({
          customElements,
          customArtboards,
          backgroundFill,
          layerOverrides,
          editTitle,
          editSubtitle,
          editIntro,
          editDate,
          editTime,
          editVenue,
          editFee,
          editTeamSize,
          editPrizePool,
          editPoc1,
          editPoc2,
          editScanText
        }));
        updateConfig({ designWorkspace: safeData });
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [
    customElements, customArtboards, backgroundFill, layerOverrides, broadcastState, updateConfig,
    editTitle, editSubtitle, editIntro, editDate, editTime, editVenue, editFee, editTeamSize,
    editPrizePool, editPoc1, editPoc2, editScanText
  ]);

  const handleSetCustomElements = (val: React.SetStateAction<CustomElement[]>) => {
    isLocalUpdateRef.current = true;
    setCustomElements(val);
  };
  const handleSetCustomArtboards = (val: React.SetStateAction<CustomArtboard[]>) => {
    isLocalUpdateRef.current = true;
    setCustomArtboards(val);
  };

  useEffect(() => {
    updatePresence(selectedElementId);
  }, [selectedElementId, updatePresence]);
  


  const draggingRef = useRef<{ id: string; startX: number; startY: number; dx: number; dy: number; node: HTMLElement | null; isArtboard: boolean; isNative?: boolean; initialWidth?: number; initialHeight?: number; initialX?: number; initialY?: number; originalWidth?: number; originalHeight?: number; initialFontSize?: number; resizeHandle?: string; snapDx?: number; snapDy?: number } | null>(null);

  const handleElementMouseDown = (e: React.MouseEvent, id: string, startX: number, startY: number, layer: Layer) => {
    const element = customElements.find(el => el.id === id);
    if (activeTool === 'text' && element?.type === 'text') {
      e.stopPropagation();
      setSelectedElementId(id);
      setSelectedLayer(layer);
      setSelectedArtboard(null);
      if (layer === 'custom_element' && element && !element.parentArtboardId) {
        setActiveTab(null as any);
      } else if (layer === 'custom_element' && element && element.parentArtboardId) {
        setActiveTab(element.parentArtboardId as any);
      }
      return;
    }
    
    if (activeTool !== 'select') return;
    e.stopPropagation();
    
    if (canvasContainerRef.current) {
      canvasRectRef.current = canvasContainerRef.current.getBoundingClientRect();
    }
    const coords = getCanvasCoords(e, true);
    
    const isNative = NATIVE_LAYER_IDS.includes(id);
    const node = activeTab
      ? (document.getElementById(`${activeTab}-${id}`) || document.getElementById(`${layer}-${id}`) || (isNative ? document.getElementById(`${id}-${id}`) : null))
      : (document.getElementById(`${layer}-${id}`) || (isNative ? document.getElementById(`${id}-${id}`) : null));
    
    let initialX = 0;
    let initialY = 0;
    
    if (isNative && node) {
      const overrideKey = `${activeTab}_${id}`;
      const fallbackKey = id;
      initialX = layerOverrides[overrideKey]?.x || layerOverrides[fallbackKey]?.x || 0;
      initialY = layerOverrides[overrideKey]?.y || layerOverrides[fallbackKey]?.y || 0;
    }

    setSelectedElementId(id);
    setSelectedLayer(layer);
    setSelectedArtboard(null);
    
    if (layer === 'custom_element' && element && !element.parentArtboardId) {
      setActiveTab(null as any);
    } else if (layer === 'custom_element' && element && element.parentArtboardId) {
      setActiveTab(element.parentArtboardId as any);
    }

    const isParentLayer = ['header', 'details', 'tags', 'footer'].includes(id);
    if (isParentLayer) {
      return;
    }

    draggingRef.current = {
      id,
      startX: coords.x,
      startY: coords.y,
      node,
      dx: 0,
      dy: 0,
      isArtboard: layer === 'custom_artboard',
      isNative,
      initialX,
      initialY
    };
  };

  const handleResizeMouseDown = (e: React.MouseEvent, id: string, handle: string, layer: Layer) => {
    if (activeTool !== 'select') return;
    e.stopPropagation();
    
    if (canvasContainerRef.current) {
      canvasRectRef.current = canvasContainerRef.current.getBoundingClientRect();
    }
    const coords = getCanvasCoords(e, true);
    
    const isNative = NATIVE_LAYER_IDS.includes(id);
    const node = activeTab
      ? (document.getElementById(`${activeTab}-${id}`) || document.getElementById(`${layer}-${id}`) || (isNative ? document.getElementById(`${id}-${id}`) : null))
      : (document.getElementById(`${layer}-${id}`) || (isNative ? document.getElementById(`${id}-${id}`) : null));
    
    let initialWidth = 0;
    let initialHeight = 0;
    let initialX = 0;
    let initialY = 0;
    
    if (isNative && node) {
      const overrideKey = activeTab ? `${activeTab}_${id}` : id;
      const fallbackKey = id;
      const override = layerOverrides[overrideKey] || layerOverrides[fallbackKey];
      
      const img = node.querySelector('img');
      const measureNode = img || node;
      
      initialWidth = override?.width !== undefined ? override.width : measureNode.offsetWidth;
      initialHeight = override?.height !== undefined ? override.height : measureNode.offsetHeight;
      
      initialX = override?.x || 0;
      initialY = override?.y || 0;
    }

    draggingRef.current = {
      id,
      startX: coords.x,
      startY: coords.y,
      node,
      dx: 0,
      dy: 0,
      isArtboard: layer === 'custom_artboard',
      isNative,
      initialWidth,
      initialHeight,
      initialX,
      initialY,
      originalWidth: isNative && node ? (layerOverrides[activeTab ? `${activeTab}_${id}` : id]?.originalWidth || (node.querySelector('img') || node).offsetWidth) : undefined,
      originalHeight: isNative && node ? (layerOverrides[activeTab ? `${activeTab}_${id}` : id]?.originalHeight || (node.querySelector('img') || node).offsetHeight) : undefined,
      initialFontSize: isNative ? (layerOverrides[activeTab ? `${activeTab}_${id}` : id]?.fontSize || getDefaultFontSize(id)) : undefined,
      resizeHandle: handle
    };
    
    setSelectedElementId(id);
    setSelectedLayer(layer);
  };
  const [posterDim, setPosterDim] = useState(POSTER_DIMS[0]);
  const [vibeData, setVibeData] = useState<VibeData | null>(null);
  const [vibeOverride, setVibeOverride] = useState("");
  const [useOverride, setUseOverride] = useState(false);
  const [vibeAccepted, setVibeAccepted] = useState(false);
  const [aiTitleImage, setAiTitleImage] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Initialize properties from DB on mount
  useEffect(() => {
    if (config.designWorkspace) {
      const dw = config.designWorkspace as any;
      if (dw.customElements) {
        // Do NOT trigger broadcast on initial DB load!
        isLocalUpdateRef.current = false;
        setCustomElements(dw.customElements);
      }
      if (dw.customArtboards) {
        setCustomArtboards(dw.customArtboards);
      }
      if (dw.backgroundFill) {
        isLocalUpdateRef.current = false;
        setBackgroundFillRaw(dw.backgroundFill);
      }
      if (dw.editTitle !== undefined) setEditTitle(dw.editTitle);
      if (dw.editSubtitle !== undefined) setEditSubtitle(dw.editSubtitle);
      if (dw.editIntro !== undefined) setEditIntro(dw.editIntro);
      if (dw.editDate !== undefined) setEditDate(dw.editDate);
      if (dw.editTime !== undefined) setEditTime(dw.editTime);
      if (dw.editVenue !== undefined) setEditVenue(dw.editVenue);
      if (dw.editFee !== undefined) setEditFee(dw.editFee);
      if (dw.editTeamSize !== undefined) setEditTeamSize(dw.editTeamSize);
      if (dw.editPrizePool !== undefined) setEditPrizePool(dw.editPrizePool);
      if (dw.editPoc1 !== undefined) setEditPoc1(dw.editPoc1);
      if (dw.editPoc2 !== undefined) setEditPoc2(dw.editPoc2);
      if (dw.editScanText !== undefined) setEditScanText(dw.editScanText);
    }
  }, []);

  // Image Edit State
  const [exposure, setExposure] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [temperature, setTemperature] = useState(0);
  const [tint, setTint] = useState(0);
  const [layerBlur, setLayerBlur] = useState(0);
  const [grainOpacity, setGrainOpacity] = useState(0);

  const [textFill, setTextFill] = useState<FillSettings>({
    type: 'linear',
    stops: [
      { id: '1', color: '#ffffff', opacity: 100, position: 0 },
      { id: '2', color: '#ffffff', opacity: 100, position: 100 }
    ],
    angle: 180,
    isReversed: false,
    globalOpacity: 100
  });

  const [textStrokeColor, setTextStrokeColor] = useState("#000000");
  const [textStrokeFill, setTextStrokeFill] = useState<FillSettings>({
    type: 'solid',
    stops: [{ id: '1', color: '#000000', opacity: 100, position: 0 }],
    angle: 0,
    isReversed: false,
    globalOpacity: 100
  });
  const [textStrokeOpacity, setTextStrokeOpacity] = useState(1);
  const [textStrokeWidth, setTextStrokeWidth] = useState(0);
  const [strokePosition, setStrokePosition] = useState("Outside");
  const [textShadowX, setTextShadowX] = useState(0);
  const [textShadowY, setTextShadowY] = useState(0);
  const [textShadowBlur, setTextShadowBlur] = useState(0);
  const [textShadowColor, setTextShadowColor] = useState("#000000");
  const [textShadowOpacity, setTextShadowOpacity] = useState(100);
  const [textLineHeight, setTextLineHeight] = useState("1.2");
  const [textLetterSpacing, setTextLetterSpacing] = useState(0);
  const [textAlign, setTextAlign] = useState("center");
  const [textBackdropBlur, setTextBackdropBlur] = useState(0);

  const [labelsBold, setLabelsBold] = useState(true);
  const [labelsUppercase, setLabelsUppercase] = useState(true);

  // Automated History Tracking
  const currentSnapshot = React.useMemo(() => ({
    customElements, customArtboards, layerOverrides, backgroundFill,
    exposure, contrast, saturation, temperature, tint, layerBlur, grainOpacity,
    textFill, textStrokeWidth, textStrokeColor, textStrokeFill, textShadowOpacity, textBackdropBlur,
    titleFont, titleBold, labelsBold, labelsUppercase,
    editTitle, editSubtitle, editIntro, editDate, editTime, editVenue,
    editFee, editTeamSize, editPrizePool, editPoc1, editPoc2, editScanText
  }), [
    customElements, customArtboards, layerOverrides, backgroundFill,
    exposure, contrast, saturation, temperature, tint, layerBlur, grainOpacity,
    textFill, textStrokeWidth, textStrokeColor, textStrokeFill, textShadowOpacity, textBackdropBlur,
    titleFont, titleBold, labelsBold, labelsUppercase,
    editTitle, editSubtitle, editIntro, editDate, editTime, editVenue,
    editFee, editTeamSize, editPrizePool, editPoc1, editPoc2, editScanText
  ]);

  useEffect(() => {
    if (isUndoingRef.current) {
      isUndoingRef.current = false;
      return;
    }
    
    const timer = setTimeout(() => {
      setHistory(prev => {
        const newHistory = prev.slice(0, historyIndex + 1);
        const lastSnap = newHistory[newHistory.length - 1];
        if (lastSnap && JSON.stringify(lastSnap) === JSON.stringify(currentSnapshot)) {
          return prev;
        }
        const updatedHistory = [...newHistory, currentSnapshot];
        setHistoryIndex(updatedHistory.length - 1);
        return updatedHistory;
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [currentSnapshot, historyIndex]);

  useEffect(() => {
    if (activeEvent) {
      const dw = activeEvent.config?.designWorkspace as any;
      console.log("DESIGN_WORKSPACE_RECONCILE_DEBUG", {
        poc1Phone: activeEvent.config?.poc1Phone,
        poc1Name: activeEvent.config?.poc1Name,
        editPoc1: dw?.editPoc1,
        poc2Phone: activeEvent.config?.poc2Phone,
        poc2Name: activeEvent.config?.poc2Name,
        editPoc2: dw?.editPoc2
      });
      
      // If there are saved text states in designWorkspace, restore them
      if (dw?.editTitle !== undefined) {
        setEditTitle(dw.editTitle);
      } else {
        setEditTitle(activeEvent.name || "EVENT TITLE");
      }

      if (dw?.editSubtitle !== undefined) {
        setEditSubtitle(dw.editSubtitle);
      } else {
        const desc = activeEvent.config?.description || "";
        const isErrorString = desc.includes("##Error") || desc.toLowerCase().startsWith("error");
        setEditSubtitle(!isErrorString && desc ? desc.substring(0, 50) : "Tagline");
      }

      if (dw?.editIntro !== undefined) {
        setEditIntro(dw.editIntro);
      } else {
        // Dynamic tagline sentence format
        const clubName = activeClub?.name || "CLUB NAME";
        const collaborators = activeEvent.config?.collaborators?.trim();
        const occasion = activeEvent.config?.occasion?.trim();
        const isCollege = activeEvent.config?.isCollegeEvent;

        let intro = clubName;
        if (collaborators) {
          if (isCollege) {
            intro += ` in collaboration with ${collaborators}`;
          } else {
            intro += ` in association with ${collaborators}`;
          }
        }
        if (occasion) {
          intro += ` on account of ${occasion}`;
        }
        intro += ` presents`;
        setEditIntro(balanceIntroText(intro));
      }

      if (dw?.editDate !== undefined) {
        setEditDate(dw.editDate);
      } else {
        if (activeEvent.config?.date) {
          setEditDate(new Date(activeEvent.config.date).toLocaleDateString());
        } else {
          setEditDate("");
        }
      }

      if (dw?.editTime !== undefined) {
        setEditTime(dw.editTime);
      } else {
        setEditTime(activeEvent.config?.time || "");
      }

      if (dw?.editVenue !== undefined) {
        setEditVenue(dw.editVenue);
      } else {
        setEditVenue(activeEvent.config?.venue || "");
      }

      if (dw?.editFee !== undefined) {
        setEditFee(dw.editFee);
      } else {
        let feeStr = "";
        if (activeEvent.config?.feeClub || activeEvent.config?.feeNonClub) {
          if (activeEvent.config.feeClub) {
            feeStr += `Club: ${activeEvent.config.feeClub}`;
          }
          if (activeEvent.config.feeNonClub) {
            if (feeStr) feeStr += "\n";
            feeStr += `Non-Club: ${activeEvent.config.feeNonClub}`;
          }
        }
        setEditFee(feeStr);
      }

      let initialTeamSize = dw?.editTeamSize;
      const ts = activeEvent.config?.teamSize?.trim() || "";
      if (!initialTeamSize) {
        if (!ts) {
          initialTeamSize = "";
        } else if (ts.toLowerCase().includes("participate") || ts.toLowerCase().includes("teams of")) {
          initialTeamSize = ts;
        } else if (ts.toLowerCase() === "individual" || ts.toLowerCase() === "1") {
          initialTeamSize = "Participate as Individual";
        } else {
          const cleanTs = ts.toLowerCase().replace("teams of", "").trim();
          initialTeamSize = `Participate in teams of ${cleanTs}`;
        }
      } else {
        if (!initialTeamSize.toLowerCase().includes("participate") && !initialTeamSize.toLowerCase().includes("teams")) {
          if (initialTeamSize.toLowerCase() === "individual" || initialTeamSize === "1") {
            initialTeamSize = "Participate as Individual";
          } else {
            initialTeamSize = `Participate in teams of ${initialTeamSize}`;
          }
        }
        
        // If config has teamSize and the saved team size does not contain it (config changed)
        if (ts && !initialTeamSize.includes(ts)) {
          if (ts.toLowerCase() === "individual" || ts.toLowerCase() === "1") {
            initialTeamSize = "Participate as Individual";
          } else {
            const cleanTs = ts.toLowerCase().replace("teams of", "").trim();
            initialTeamSize = `Participate in teams of ${cleanTs}`;
          }
        }
      }
      setEditTeamSize(initialTeamSize);

      if (dw?.editPrizePool !== undefined) {
        setEditPrizePool(dw.editPrizePool);
      } else {
        if (activeEvent.config?.prizePool) {
          const pp = activeEvent.config.prizePool;
          if (pp.toUpperCase().includes("PRIZE POOL")) {
            setEditPrizePool(pp);
          } else {
            setEditPrizePool(`PRIZE POOL\n${pp}`);
          }
        } else {
          setEditPrizePool("");
        }
      }

      let initialPoc1 = dw?.editPoc1;
      const hasConfigPhone1 = activeEvent.config?.poc1Phone?.trim();
      const configPoc1Name = activeEvent.config?.poc1Name?.trim();
      if (!initialPoc1 || initialPoc1 === "Name: Phone" || initialPoc1.trim() === "") {
        let poc1Str = "";
        if (configPoc1Name) {
          poc1Str = configPoc1Name;
          if (hasConfigPhone1) {
            poc1Str += `: ${hasConfigPhone1}`;
          }
        } else if (hasConfigPhone1) {
          poc1Str = `POC 1: ${hasConfigPhone1}`;
        }
        initialPoc1 = poc1Str;
      } else {
        const currentParts = initialPoc1.split(':').map((p: string) => p.trim());
        let currentName = currentParts[0] || "";
        let currentPhone = currentParts[1] || "";
        
        if (currentName === "Name" && configPoc1Name) {
          currentName = configPoc1Name;
        }
        if (hasConfigPhone1 && (!currentPhone || currentPhone === "Phone" || currentPhone !== hasConfigPhone1)) {
          currentPhone = hasConfigPhone1;
        }
        
        if (currentName || currentPhone) {
          initialPoc1 = currentPhone ? `${currentName}: ${currentPhone}` : currentName;
        }
      }
      setEditPoc1(initialPoc1);

      let initialPoc2 = dw?.editPoc2;
      const hasConfigPhone2 = activeEvent.config?.poc2Phone?.trim();
      const configPoc2Name = activeEvent.config?.poc2Name?.trim();
      if (!initialPoc2 || initialPoc2 === "Name: Phone" || initialPoc2.trim() === "") {
        let poc2Str = "";
        if (configPoc2Name) {
          poc2Str = configPoc2Name;
          if (hasConfigPhone2) {
            poc2Str += `: ${hasConfigPhone2}`;
          }
        } else if (hasConfigPhone2) {
          poc2Str = `POC 2: ${hasConfigPhone2}`;
        }
        initialPoc2 = poc2Str;
      } else {
        const currentParts = initialPoc2.split(':').map((p: string) => p.trim());
        let currentName = currentParts[0] || "";
        let currentPhone = currentParts[1] || "";
        
        if (currentName === "Name" && configPoc2Name) {
          currentName = configPoc2Name;
        }
        if (hasConfigPhone2 && (!currentPhone || currentPhone === "Phone" || currentPhone !== hasConfigPhone2)) {
          currentPhone = hasConfigPhone2;
        }
        
        if (currentName || currentPhone) {
          initialPoc2 = currentPhone ? `${currentName}: ${currentPhone}` : currentName;
        }
      }
      setEditPoc2(initialPoc2);

      if (dw?.editScanText !== undefined) {
        setEditScanText(dw.editScanText);
      } else {
        setEditScanText("Scan the QR code to register");
      }
    }
  }, [activeEvent, activeClub]);

  useEffect(() => {
    const getNativeLayerAsCustomElement = (layerId: string): CustomElement | null => {
      const isNative = NATIVE_LAYER_IDS.includes(layerId);
      if (!isNative) return null;

      const outerNode = activeTab
        ? (document.getElementById(`${activeTab}-${layerId}`) || document.getElementById(`${layerId}-${layerId}`))
        : document.getElementById(`${layerId}-${layerId}`);
      if (!outerNode || !canvasContainerRef.current) return null;

      const rect = outerNode.getBoundingClientRect();
      const canvasContainerRect = canvasContainerRef.current.getBoundingClientRect();

      const x = (rect.left - canvasContainerRect.left - pan.x) / zoom;
      const y = (rect.top - canvasContainerRect.top - pan.y) / zoom;
      const width = rect.width / zoom;
      const height = rect.height / zoom;

      const isLogo = layerId.startsWith('header-') && layerId !== 'header-intro';

      let text = "";
      if (!isLogo) {
        if (layerId === 'header-intro') text = editIntro;
        else if (layerId === 'title-text') text = editTitle || "EVENT TITLE";
        else if (layerId === 'tagline-text') text = editSubtitle || "Add Event Tagline";
        else if (layerId === 'details-date') text = editDate;
        else if (layerId === 'details-time') text = editTime;
        else if (layerId === 'details-venue') text = editVenue;
        else if (layerId === 'details-fee') text = editFee;
        else if (layerId === 'tags-teamsize') text = editTeamSize;
        else if (layerId === 'tags-prizepool') text = editPrizePool;
        else if (layerId === 'footer-poc1') text = editPoc1;
        else if (layerId === 'footer-poc2') text = editPoc2;
        else if (layerId === 'footer-qrscan') text = editScanText;
        else if (layerId === 'footer-qrbox') text = "QR CODE";
      }

      let imageUrl = "";
      if (isLogo) {
        if (layerId === 'header-logo') imageUrl = config.logoMainBase64 as string;
        else if (layerId === 'header-club') imageUrl = config.logoClubBase64 as string;
        else if (layerId === 'header-collab') imageUrl = config.logoCollabBase64 as string;
        else if (layerId === 'header-extra') imageUrl = config.logoExtraBase64 as string;
        else if (layerId === 'header-extra2') imageUrl = config.logoExtra2Base64 as string;
        else if (layerId === 'header-extra3') imageUrl = config.logoExtra3Base64 as string;
      }

      if (isLogo && !imageUrl) return null;

      let computedFontSize = 24;
      let computedFontFamily = vibeData?.bodyFont || titleFont || 'Inter';
      let computedFontWeight = 'normal';
      let computedFontStyle = 'normal';
      let computedTextAlign = 'center';

      const textEl = outerNode.querySelector('span, input, textarea');
      if (textEl) {
        const computed = window.getComputedStyle(textEl);
        computedFontSize = parseFloat(computed.fontSize) / zoom;
        computedFontFamily = computed.fontFamily;
        computedFontWeight = computed.fontWeight;
        computedFontStyle = computed.fontStyle;
        computedTextAlign = computed.textAlign;
      }

      return {
        id: crypto.randomUUID(),
        parentArtboardId: activeTab || undefined,
        type: isLogo ? 'image' : 'text',
        x: Math.round(x),
        y: Math.round(y),
        width: Math.round(width),
        height: Math.round(height),
        imageUrl: isLogo ? imageUrl : undefined,
        text: isLogo ? undefined : text,
        fontFamily: isLogo ? undefined : (layerId === 'title-text' ? titleFont : computedFontFamily),
        fontSize: isLogo ? undefined : Math.round(computedFontSize),
        fontWeight: isLogo ? undefined : computedFontWeight,
        fontStyle: isLogo ? undefined : computedFontStyle,
        textAlign: isLogo ? undefined : computedTextAlign,
        fill: isLogo ? undefined : '#ffffff'
      };
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      
      if ((e.key === 'Backspace' || e.key === 'Delete') && selectedElementId) {
        handleSetCustomElements(prev => prev.filter(el => el.id !== selectedElementId));
        handleSetCustomArtboards(prev => prev.filter(el => el.id !== selectedElementId));
        setSelectedElementId(null);
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedElementId) {
        e.preventDefault();
        const shift = e.shiftKey ? 10 : 1;
        let dx = 0, dy = 0;
        if (e.key === 'ArrowUp') dy = -shift;
        if (e.key === 'ArrowDown') dy = shift;
        if (e.key === 'ArrowLeft') dx = -shift;
        if (e.key === 'ArrowRight') dx = shift;

        if (selectedLayer === 'custom_artboard') {
          handleSetCustomArtboards(prev => prev.map(el => el.id === selectedElementId ? { ...el, x: el.x + dx, y: el.y + dy } : el));
        } else if (selectedLayer === 'custom_element') {
          handleSetCustomElements(prev => prev.map(el => el.id === selectedElementId ? { ...el, x: el.x + dx, y: el.y + dy } : el));
        } else {
          // Native layer override nudging
          isLocalUpdateRef.current = true;
          setLayerOverrides(prev => {
            const overrideKey = activeTab ? `${activeTab}_${selectedElementId}` : selectedElementId;
            const current = prev[overrideKey] || { id: selectedElementId, x: 0, y: 0 };
            return {
              ...prev,
              [overrideKey]: {
                ...current,
                x: (current.x || 0) + dx,
                y: (current.y || 0) + dy
              }
            };
          });
        }
      } else if (e.key.toLowerCase() === 'c' && (e.metaKey || e.ctrlKey) && selectedElementId) {
        e.preventDefault();
        let el = selectedLayer === 'custom_artboard' 
          ? customArtboards.find(a => a.id === selectedElementId) 
          : customElements.find(c => c.id === selectedElementId);
        
        if (el) {
          clipboardRef.current = { type: selectedLayer === 'custom_artboard' ? 'artboard' : 'element', data: el };
        } else {
          const synthesized = getNativeLayerAsCustomElement(selectedElementId);
          if (synthesized) {
            clipboardRef.current = { type: 'element', data: synthesized };
          }
        }
      } else if (e.key.toLowerCase() === 'v' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (clipboardRef.current) {
          const { type, data } = clipboardRef.current;
          const newId = crypto.randomUUID();
          if (type === 'artboard') {
            handleSetCustomArtboards(prev => [...prev, { ...data, id: newId, x: data.x + 20, y: data.y + 20 }]);
            setSelectedLayer('custom_artboard');
          } else {
            handleSetCustomElements(prev => [...prev, { ...data, id: newId, x: data.x + 20, y: data.y + 20 }]);
            setSelectedLayer('custom_element');
          }
          setSelectedElementId(newId);
        }
      } else if (e.key.toLowerCase() === 'd' && (e.metaKey || e.ctrlKey) && selectedElementId) {
        e.preventDefault();
        let el = selectedLayer === 'custom_artboard' 
          ? customArtboards.find(a => a.id === selectedElementId) 
          : customElements.find(c => c.id === selectedElementId);
        
        if (el) {
          const newId = crypto.randomUUID();
          if (selectedLayer === 'custom_artboard') {
            handleSetCustomArtboards(prev => [...prev, { ...el, id: newId, x: el.x + 20, y: el.y + 20 } as CustomArtboard]);
            setSelectedLayer('custom_artboard');
          } else {
            handleSetCustomElements(prev => [...prev, { ...el, id: newId, x: el.x + 20, y: el.y + 20 } as CustomElement]);
            setSelectedLayer('custom_element');
          }
          setSelectedElementId(newId);
        } else {
          const synthesized = getNativeLayerAsCustomElement(selectedElementId);
          if (synthesized) {
            const newId = crypto.randomUUID();
            handleSetCustomElements(prev => [...prev, { ...synthesized, id: newId, x: synthesized.x + 20, y: synthesized.y + 20 }]);
            setSelectedLayer('custom_element');
            setSelectedElementId(newId);
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    selectedElementId, selectedLayer, customElements, customArtboards,
    zoom, pan, activeTab, editIntro, editTitle, editSubtitle, editDate,
    editTime, editVenue, editFee, editTeamSize, editPrizePool, editPoc1,
    editPoc2, config, vibeData, titleFont
  ]);

  const imageGen = useGenerator("Generating Background Image");

  const handleGenerateImage = async () => {
    const prompt = vibeData?.unsplashQuery || vibeOverride || vibeData?.vibe || activeEvent?.name || "Event background";
    imageGen.startGeneration();
    onLogActivity('Design', 'Generated Poster Base via Unsplash');
    try {
      const res = await fetch('/api/unsplash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: prompt, orientation: 'portrait' })
      });
      if (!res.ok) throw new Error("Failed to fetch background from Unsplash");
      const data = await res.json();
      imageGen.setSuccess(data.imageUrl);
      
      // Update text colors based on AI palette
      if (vibeData?.colors && vibeData.colors.length > 0) {
        const primaryHex = vibeData.colors[0];
        const secondaryHex = vibeData.colors[1] || primaryHex;
        
        setTextFill({
          type: 'solid',
          stops: [
            { id: '1', color: primaryHex, opacity: 100, position: 0 },
            { id: '2', color: secondaryHex, opacity: 100, position: 100 }
          ],
          angle: 90,
          isReversed: false,
          globalOpacity: 100
        });
      }
    } catch (e) {
      imageGen.setError("Failed to generate background");
    }
  };

  const generateVibe = async () => {
    onLogActivity('Design', 'AI Vibe Director proposed a new direction');
    try {
      const res = await fetch('/api/suggest-vibe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventName: activeEvent?.name,
          description: activeEvent?.config?.description,
          type: activeEvent?.config?.type,
          subType: activeEvent?.config?.subType,
          creativityLevel: 5
        })
      });
      if (res.ok) {
        const data = await res.json();
        setVibeData({
          vibe: data.vibe,
          colors: data.colors || ["#111111", "#F59E0B"],
          unsplashQuery: data.unsplashKeyword,
          effectStyle: data.effectStyle,
          bodyFont: data.fontFamily,
          titleFont: "Inter"
        });
      } else {
        throw new Error();
      }
    } catch (e) {
      const promptIdea = `A stunning ${activeEvent?.config?.theme || 'golden'} background for the event ${activeEvent?.name || 'Browser Battle'}, featuring neon accents and dark space.`;
      setVibeData({
        vibe: promptIdea,
        colors: ["#111111", "#F59E0B"],
        unsplashQuery: "abstract background",
        effectStyle: "Cyberpunk / Golden Space",
        bodyFont: "Inter",
        titleFont: "Inter"
      });
    }
    setVibeAccepted(false);
  };

  const handleExport = async () => {
    if (!posterRef.current) return;
    setIsExporting(true);
    const currentFmt = FORMATS.find(f => f.id === activeTab) || FORMATS[0];
    const exportW = activeTab === "a3-poster" ? posterDim.w : currentFmt.width;
    const exportH = activeTab === "a3-poster" ? posterDim.h : currentFmt.height;

    try {
      const dataUrl = await htmlToImage.toPng(posterRef.current, {
        quality: 1.0,
        pixelRatio: 1,
        width: exportW,
        height: exportH,
        style: { transform: 'scale(1)', borderRadius: '0' },
        filter: (node: HTMLElement) => {
          if (node.tagName === "LINK" && (node as HTMLLinkElement).href?.includes("fonts.googleapis.com")) return false;
          return true;
        }
      });
      const link = document.createElement('a');
      link.download = `${activeEvent?.name || "design"}-${activeTab}.png`;
      link.href = dataUrl;
      link.click();
    } catch (fallbackErr) {
      console.error("Export failed", fallbackErr);
    }
    setIsExporting(false);
  };

  if (!activeEvent) return null;

  return (
    <div 
      className="fixed inset-0 z-[200] bg-[#0a0a0a] flex flex-col select-none" 
      style={{ fontFamily: 'var(--font-destrubia), system-ui, sans-serif' }}
    >
      <TopToolbar
        peers={peers}
        activeEvent={activeEvent}
        onClose={onClose}
        zoom={zoom}
        handleZoomIn={() => {
          if (!canvasContainerRef.current) return;
          const rect = canvasContainerRef.current.getBoundingClientRect();
          const mouseX = rect.width / 2;
          const mouseY = rect.height / 2;
          setZoom(prevZoom => {
            const newZoom = Math.min(2, prevZoom + 0.1);
            if (newZoom === prevZoom) return prevZoom;
            setPan(prevPan => {
              const canvasX = (mouseX - prevPan.x) / prevZoom;
              const canvasY = (mouseY - prevPan.y) / prevZoom;
              return { x: mouseX - canvasX * newZoom, y: mouseY - canvasY * newZoom };
            });
            return newZoom;
          });
        }}
        handleZoomOut={() => {
          if (!canvasContainerRef.current) return;
          const rect = canvasContainerRef.current.getBoundingClientRect();
          const mouseX = rect.width / 2;
          const mouseY = rect.height / 2;
          setZoom(prevZoom => {
            const newZoom = Math.max(0.1, prevZoom - 0.1);
            if (newZoom === prevZoom) return prevZoom;
            setPan(prevPan => {
              const canvasX = (mouseX - prevPan.x) / prevZoom;
              const canvasY = (mouseY - prevPan.y) / prevZoom;
              return { x: mouseX - canvasX * newZoom, y: mouseY - canvasY * newZoom };
            });
            return newZoom;
          });
        }}
        handleFitToView={handleFitToView}
        handleExport={handleExport}
        handleResetLogos={handleResetLogos}
        isExporting={isExporting}
      />

      <div className="flex flex-col lg:flex-row flex-1 overflow-y-auto lg:overflow-hidden">
        <LeftSidebar
          selectedArtboard={selectedArtboard}
          setSelectedArtboard={setSelectedArtboard}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          selectedLayer={selectedLayer}
          setSelectedLayer={setSelectedLayer}
          eventSubType={config.subType}
          customArtboards={customArtboards}
          customElements={customElements}
          setCustomElements={handleSetCustomElements}
          selectedElementId={selectedElementId}
          setSelectedElementId={setSelectedElementId}
        />

        {/* Main Canvas Area */}
        <div 
          ref={canvasContainerRef}
          className="flex-1 min-h-[500px] lg:min-h-0 relative overflow-hidden bg-[#050505] cursor-default flex"
        >
          {showRulers && (
            <Rulers 
              pan={pan} 
              zoom={zoom} 
              onAddHorizontalGuide={handleAddHorizontalGuide}
              onAddVerticalGuide={handleAddVerticalGuide}
            />
          )}

          {showRulers && horizontalGuides.map((y, i) => (
             <div 
               key={`h-${i}`} 
               className="absolute left-0 right-0 h-1.5 cursor-ns-resize group z-[60]"
               style={{ top: y * zoom + pan.y - 3 }}
               onMouseDown={(e) => {
                 setDraggingGuide({ type: 'horizontal', index: i });
                 e.stopPropagation();
               }}
             >
               <div className="w-full h-[1px] bg-red-500 opacity-50 group-hover:opacity-100 mt-[2px]" />
               {draggingGuide?.type === 'horizontal' && draggingGuide.index === i && (
                 <div className="absolute top-2 left-6 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap">
                   {Math.round(y)}
                 </div>
               )}
             </div>
          ))}

          {showRulers && verticalGuides.map((x, i) => (
             <div 
               key={`v-${i}`} 
               className="absolute top-0 bottom-0 w-1.5 cursor-ew-resize group z-[60]"
               style={{ left: x * zoom + pan.x - 3 }}
               onMouseDown={(e) => {
                 setDraggingGuide({ type: 'vertical', index: i });
                 e.stopPropagation();
               }}
             >
               <div className="h-full w-[1px] bg-red-500 opacity-50 group-hover:opacity-100 ml-[2px]" />
               {draggingGuide?.type === 'vertical' && draggingGuide.index === i && (
                 <div className="absolute top-6 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-md pointer-events-none whitespace-nowrap">
                   {Math.round(x)}
                 </div>
               )}
             </div>
          ))}

          <div className="absolute inset-0 pointer-events-none grid-bg opacity-30" />
          
          <CanvasArea 
            peers={peers}
            canvasContainerRef={canvasContainerRef}
            posterRef={posterRef}
            canvasRef={canvasRef}
            isPanning={isPanning}
            pan={pan}
            zoom={zoom}
            handleCanvasMouseDown={handleCanvasMouseDown}
            isDrawing={isDrawing}
            drawStartPoint={drawStartPoint}
            currentDrawPoint={currentDrawPoint}
            activeTool={activeTool}
            activeShape={activeShape}
            currentPenPoints={currentPenPoints}
            customElements={customElements}
            setCustomElements={setCustomElements}
            selectedElementId={selectedElementId}
            setSelectedElementId={setSelectedElementId}
            handleElementMouseDown={handleElementMouseDown}
            handleResizeMouseDown={handleResizeMouseDown}
            selectedArtboard={selectedArtboard}
            setSelectedArtboard={setSelectedArtboard}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            setActiveTool={setActiveTool}
            selectedLayer={selectedLayer}
            setSelectedLayer={setSelectedLayer}
            layerOverrides={layerOverrides}
            imageGen={imageGen}
            layerBlur={layerBlur}
            exposure={exposure}
            contrast={contrast}
            saturation={saturation}
            temperature={temperature}
            tint={tint}
            backgroundFill={backgroundFill}
            grainOpacity={grainOpacity}
            editIntro={editIntro}
            setEditIntro={handleSetEditIntro}
            aiTitleImage={aiTitleImage}
            setAiTitleImage={setAiTitleImage}
            editTitle={editTitle}
            setEditTitle={handleSetEditTitle}
            titleFont={titleFont}
            textBackdropBlur={textBackdropBlur}
            titleBold={titleBold}
            textFill={textFill}
            textStrokeWidth={textStrokeWidth}
            textStrokeColor={textStrokeColor}
            textStrokeFill={textStrokeFill}
            textStrokeOpacity={textStrokeOpacity}
            strokePosition={strokePosition}
            textShadowOpacity={textShadowOpacity}
            editSubtitle={editSubtitle}
            setEditSubtitle={handleSetEditSubtitle}
            bodyFont={vibeData?.bodyFont || titleFont}
            editDate={editDate}
            setEditDate={handleSetEditDate}
            editTime={editTime}
            setEditTime={handleSetEditTime}
            editVenue={editVenue}
            setEditVenue={handleSetEditVenue}
            editFee={editFee}
            setEditFee={handleSetEditFee}
            labelsBold={labelsBold}
            labelsUppercase={labelsUppercase}
            editTeamSize={editTeamSize}
            setEditTeamSize={handleSetEditTeamSize}
            editPrizePool={editPrizePool}
            setEditPrizePool={handleSetEditPrizePool}
            editPoc1={editPoc1}
            setEditPoc1={handleSetEditPoc1}
            editPoc2={editPoc2}
            setEditPoc2={handleSetEditPoc2}
            editScanText={editScanText}
            setEditScanText={handleSetEditScanText}
            eventSubType={config.subType}
            customArtboards={customArtboards}
            setCustomArtboards={setCustomArtboards}
            logos={{
              club: config.logoClubBase64 as string | undefined,
              main: config.logoMainBase64 as string | undefined,
              collab: config.logoCollabBase64 as string | undefined,
              extra: config.logoExtraBase64 as string | undefined,
              extra2: config.logoExtra2Base64 as string | undefined,
              extra3: config.logoExtra3Base64 as string | undefined
            }}
          />
          
          <BottomToolbar 
            activeTool={activeTool}
            setActiveTool={setActiveTool}
            activeShape={activeShape}
            setActiveShape={setActiveShape}
          />
        </div>

        {/* Right Sidebar */}
        {imageGen.status === "generating" && (
          <div className="absolute top-14 left-[210px] w-48 z-[200]">
            <div className="w-full bg-white/10 rounded-full h-1 overflow-hidden">
              <motion.div className="h-full bg-gold-500 rounded-full" initial={{ width: "0%" }} animate={{ width: `${imageGen.progress}%` }} transition={{ duration: 0.5 }} />
            </div>
            <p className="text-[9px] text-zinc-500 mt-1 text-left">Rendering background...</p>
          </div>
        )}

        <RightSidebar
          selectedLayer={selectedLayer}
          useOverride={useOverride}
          setUseOverride={setUseOverride}
          vibeOverride={vibeOverride}
          setVibeOverride={setVibeOverride}
          vibeData={vibeData}
          vibeAccepted={vibeAccepted}
          setVibeAccepted={setVibeAccepted}
          generateVibe={generateVibe}
          handleGenerateImage={handleGenerateImage}
          imageGen={imageGen}
          customElements={customElements}
          setCustomElements={setCustomElements}
          selectedElementId={selectedElementId}
          dragPreviewBounds={dragPreviewBounds}
          titleFont={titleFont}
          setTitleFont={setTitleFont}
          titleBold={titleBold}
          setTitleBold={setTitleBold}
          textLineHeight={textLineHeight}
          setTextLineHeight={setTextLineHeight}
          textLetterSpacing={textLetterSpacing}
          setTextLetterSpacing={setTextLetterSpacing}
          textAlign={textAlign}
          setTextAlign={setTextAlign}
          backgroundFill={backgroundFill}
          setBackgroundFill={setBackgroundFill}
          textFill={textFill}
          setTextFill={setTextFill}
          textStrokeColor={textStrokeColor}
          setTextStrokeColor={setTextStrokeColor}
          textStrokeFill={textStrokeFill}
          setTextStrokeFill={setTextStrokeFill}
          textStrokeOpacity={textStrokeOpacity}
          setTextStrokeOpacity={setTextStrokeOpacity}
          textStrokeWidth={textStrokeWidth}
          setTextStrokeWidth={setTextStrokeWidth}
          strokePosition={strokePosition}
          setStrokePosition={setStrokePosition}
          layerBlur={layerBlur}
          setLayerBlur={setLayerBlur}
          textShadowX={textShadowX}
          setTextShadowX={setTextShadowX}
          textShadowY={textShadowY}
          setTextShadowY={setTextShadowY}
          textShadowBlur={textShadowBlur}
          setTextShadowBlur={setTextShadowBlur}
          textShadowColor={textShadowColor}
          setTextShadowColor={setTextShadowColor}
          textShadowOpacity={textShadowOpacity}
          setTextShadowOpacity={setTextShadowOpacity}
          exposure={exposure}
          setExposure={setExposure}
          contrast={contrast}
          setContrast={setContrast}
          saturation={saturation}
          setSaturation={setSaturation}
          temperature={temperature}
          setTemperature={setTemperature}
          labelsBold={labelsBold}
          setLabelsBold={setLabelsBold}
          labelsUppercase={labelsUppercase}
          setLabelsUppercase={setLabelsUppercase}
          layerOverrides={layerOverrides}
          setLayerOverrides={setLayerOverrides}
          activeTab={activeTab}
        />
      </div>
    </div>
  );
}
