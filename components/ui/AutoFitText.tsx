import React, { useRef, useEffect, useState, useId } from 'react';

interface AutoFitTextProps {
  text: string;
  maxFontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  className?: string;
  style?: React.CSSProperties;
  textFill?: import('../domains/design/types').FillSettings;
  strokeWidth?: number;
  strokeColor?: string;
  strokeFill?: import('../domains/design/types').FillSettings;
  strokeOpacity?: number;
  shadowOpacity?: number;
  shadowX?: number;
  shadowY?: number;
  shadowBlur?: number;
  shadowColor?: string;
  letterSpacing?: number;
  strokePosition?: string;
}

export default function AutoFitText({
  text,
  fontFamily,
  fontWeight,
  className = '',
  textFill = { type: 'solid', stops: [{ id: '1', color: '#ffffff', opacity: 100, position: 0 }], angle: 0, isReversed: false, globalOpacity: 100 },
  strokeWidth = 0,
  strokeColor = "#000000",
  strokeFill,
  strokeOpacity = 1,
  shadowOpacity = 0,
  shadowX = 0,
  shadowY = 8,
  shadowBlur = 8,
  shadowColor = "black",
  letterSpacing = 0,
  strokePosition = "Outside",
  style
}: AutoFitTextProps) {
  const [textWidth, setTextWidth] = useState(1000);
  const measureRef = useRef<HTMLSpanElement>(null);
  const uniqueId = useId();

  useEffect(() => {
    if (measureRef.current) {
      setTextWidth(measureRef.current.offsetWidth * 1.05 || 1000);
    }
  }, [text, fontFamily, fontWeight, className]);

  const isSolidColor = textFill.type === 'solid';
  const fillUrl = isSolidColor ? textFill.stops[0]?.color || '#ffffff' : `url(#grad-${uniqueId})`;

  const isStrokeSolid = !strokeFill || strokeFill.type === 'solid';
  const strokeUrl = isStrokeSolid ? (strokeFill ? strokeFill.stops[0]?.color || strokeColor : strokeColor) : `url(#stroke-grad-${uniqueId})`;

  const angleRad = (textFill.angle * Math.PI) / 180;
  const x1 = Math.round(50 - Math.cos(angleRad) * 50) + '%';
  const y1 = Math.round(50 - Math.sin(angleRad) * 50) + '%';
  const x2 = Math.round(50 + Math.cos(angleRad) * 50) + '%';
  const y2 = Math.round(50 + Math.sin(angleRad) * 50) + '%';
  
  const strokeAngleRad = ((strokeFill?.angle || 0) * Math.PI) / 180;
  const sx1 = Math.round(50 - Math.cos(strokeAngleRad) * 50) + '%';
  const sy1 = Math.round(50 - Math.sin(strokeAngleRad) * 50) + '%';
  const sx2 = Math.round(50 + Math.cos(strokeAngleRad) * 50) + '%';
  const sy2 = Math.round(50 + Math.sin(strokeAngleRad) * 50) + '%';
  
  const sortedStops = [...textFill.stops].sort((a, b) => a.position - b.position);
  const sortedStrokeStops = strokeFill ? [...strokeFill.stops].sort((a, b) => a.position - b.position) : [];

  return (
    <div className={`w-full h-full flex items-center justify-center ${className}`} style={style}>
      <span 
        ref={measureRef} 
        style={{ 
          fontFamily, 
          fontWeight, 
          fontSize: '100px', 
          letterSpacing: `${letterSpacing}%`,
          whiteSpace: 'nowrap', 
          position: 'absolute', 
          visibility: 'hidden', 
          pointerEvents: 'none' 
        }}
      >
        {text}
      </span>
      
      <svg 
        width="100%" 
        height="100%" 
        viewBox={`0 0 ${textWidth} 130`} 
        preserveAspectRatio="xMidYMid meet"
        className="overflow-visible"
      >
        <defs>
          {!isSolidColor && textFill.type === 'linear' && (
            <linearGradient id={`grad-${uniqueId}`} x1={x1} y1={y1} x2={x2} y2={y2}>
              {sortedStops.map((stop, index) => (
                <stop key={index} offset={`${stop.position}%`} stopColor={stop.color} stopOpacity={stop.opacity / 100} />
              ))}
            </linearGradient>
          )}
          {!isSolidColor && textFill.type === 'radial' && (
            <radialGradient id={`grad-${uniqueId}`} cx="50%" cy="50%" r="50%">
              {sortedStops.map((stop, index) => (
                <stop key={index} offset={`${stop.position}%`} stopColor={stop.color} stopOpacity={stop.opacity / 100} />
              ))}
            </radialGradient>
          )}
          {!isStrokeSolid && strokeFill && strokeFill.type === 'linear' && (
            <linearGradient id={`stroke-grad-${uniqueId}`} x1={sx1} y1={sy1} x2={sx2} y2={sy2}>
              {sortedStrokeStops.map((stop, index) => (
                <stop key={index} offset={`${stop.position}%`} stopColor={stop.color} stopOpacity={stop.opacity / 100} />
              ))}
            </linearGradient>
          )}
          {!isStrokeSolid && strokeFill && strokeFill.type === 'radial' && (
            <radialGradient id={`stroke-grad-${uniqueId}`} cx="50%" cy="50%" r="50%">
              {sortedStrokeStops.map((stop, index) => (
                <stop key={index} offset={`${stop.position}%`} stopColor={stop.color} stopOpacity={stop.opacity / 100} />
              ))}
            </radialGradient>
          )}
          {shadowOpacity > 0 && (
            <filter id={`shadow-${uniqueId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx={shadowX} dy={shadowY} stdDeviation={shadowBlur} floodColor={shadowColor} floodOpacity={shadowOpacity / 100} />
            </filter>
          )}
        </defs>
        <text 
          x="50%" 
          y="55%" 
          dominantBaseline="middle" 
          textAnchor="middle" 
          fontSize="100" 
          fontFamily={fontFamily}
          fontWeight={fontWeight}
          fill={fillUrl}
          stroke={strokeWidth > 0 ? strokeUrl : "none"}
          strokeOpacity={strokeOpacity}
          strokeWidth={strokeWidth > 0 ? (strokePosition === "Outside" ? strokeWidth * 2 : strokeWidth) : 0}
          strokeLinejoin="round"
          filter={shadowOpacity > 0 ? `url(#shadow-${uniqueId})` : "none"}
          style={{ letterSpacing: `${letterSpacing}%`, paintOrder: strokePosition === "Outside" ? "stroke fill" : strokePosition === "Inside" ? "fill stroke" : "normal" }}
        >
          {text}
        </text>
      </svg>
    </div>
  );
}
