"use client";

import React, { useEffect, useRef } from "react";

const vertexShaderSrc = `
  attribute vec2 position;
  void main() {
      gl_Position = vec4(position, 0.0, 1.0);
  }
`;

const fragmentShaderSrc = `
  #extension GL_OES_standard_derivatives : enable
  precision highp float;
  uniform vec2 uResolution;
  uniform float uTime;
  uniform float uPixelSize;
  uniform vec3 uColor;
  uniform float uPatternScale;
  uniform float uPatternDensity;
  uniform float uPixelSizeJitter;
  uniform float uNoiseAmount;
  uniform int uShapeType;
  uniform bool uEnableRipples;
  uniform float uRippleIntensity;
  uniform float uRippleThickness;
  uniform float uRippleSpeed;
  const int MAX_CLICKS = 10;
  uniform vec2 uClickPos[MAX_CLICKS];
  uniform float uClickTimes[MAX_CLICKS];
  uniform bool uEnableGradient;
  uniform vec3 uGradientColor1;
  uniform vec3 uGradientColor2;
  uniform float uGradientSpeed;
  uniform bool uColorPulse;
  uniform float uPulseSpeed;
  uniform float uPulseIntensity;
  uniform vec2 uRotSC;
  uniform float uEdgeFade;
  uniform float uAspect;
  uniform float uMaxRippleTime;

  const int SHAPE_SQUARE   = 0;
  const int SHAPE_CIRCLE   = 1;
  const int SHAPE_TRIANGLE = 2;
  const int SHAPE_DIAMOND  = 3;

  float hash21(vec2 p){ return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453); }
  float Bayer2(vec2 a){
      a=floor(a);
      return fract(a.x/2. + a.y * a.y * .75);
  }
  #define Bayer4(a) (Bayer2(.5*(a))*0.25 + Bayer2(a))
  #define Bayer8(a) (Bayer4(.5*(a))*0.25 + Bayer2(a))
  float noise(vec2 p){
      vec2 i=floor(p);
      vec2 f=fract(p);
      float a=hash21(i);
      float b=hash21(i + vec2(1.0,0.0));
      float c=hash21(i + vec2(0.0,1.0));
      float d=hash21(i + vec2(1.0,1.0));
      vec2 u = f*f*(3.0-2.0*f);
      return mix(a,b,u.x) + (c-a)*u.y*(1.0-u.x) + (d-b)*u.x*u.y;
  }
  float maskCircle(vec2 p, float cov){
      float r = sqrt(cov) * 0.25;
      float d = length(p - 0.5) - r;
      float aa = 0.5 * fwidth(d);
      return cov * (1.0 - smoothstep(-aa, aa, d * 2.0));
  }
  float maskTriangle(vec2 p, vec2 id, float cov){
      bool flip = mod(id.x + id.y, 2.0) > 0.5;
      if (flip) p.x = 1.0 - p.x;
      float r = sqrt(cov);
      float d  = p.y - r*(1.0 - p.x);
      float aa = fwidth(d);
      return cov * clamp(0.5 - d/aa, 0.0, 1.0);
  }
  float maskDiamond(vec2 p, float cov){
      float r = sqrt(cov) * 0.564;
      return step(abs(p.x - 0.49) + abs(p.y - 0.49), r);
  }

  void main(){
      vec2 uv = gl_FragCoord.xy / uResolution.xy;
      vec2 centered = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
      if(uRotSC.x != 0.0 || uRotSC.y != 1.0){
          mat2 rot = mat2(uRotSC.y, -uRotSC.x, uRotSC.x, uRotSC.y);
          centered = rot * centered;
      }
      float px = max(1.0, uPixelSize);
      if(uPixelSizeJitter > 0.0){
          float jitter = hash21(floor(gl_FragCoord.xy / (px*10.0))) * uPixelSizeJitter;
          px += jitter;
      }
      vec2 pcell = floor(gl_FragCoord.xy / px) * px;
      vec2 pUv = (pcell - 0.5 * uResolution.xy) / uResolution.y;
      if(uRotSC.x != 0.0 || uRotSC.y != 1.0){
          mat2 rot = mat2(uRotSC.y, -uRotSC.x, uRotSC.x, uRotSC.y);
          pUv = rot * pUv;
      }
      vec2 pixelId = floor(gl_FragCoord.xy / px);
      vec2 pixelUV = fract(gl_FragCoord.xy / px);
      float cellPixelSize = 8.0 * uPixelSize;
      vec2 cellId = floor(gl_FragCoord.xy / cellPixelSize);
      vec2 cellCoord = cellId * cellPixelSize;
      vec2 cellUv = cellCoord / uResolution.xy;
      vec2 aspectUv = cellUv * vec2(uAspect, 1.0);
      
      float base = noise(aspectUv * uPatternScale * 8.0 + uTime * 0.05);
      base = base * 0.5 - 0.65;
      float feed = base + (uPatternDensity - 0.5) * 0.3;
      
      if(uEnableRipples){
          float speed = uRippleSpeed;
          float thickness = uRippleThickness;
          const float dampT = 2.5;
          const float dampR = 10.0;
          for(int i = 0; i < MAX_CLICKS; ++i){
              vec2 pos = uClickPos[i];
              if(pos.x < 0.0) continue;
              float t = max(uTime - uClickTimes[i], 0.0);
              if(t > uMaxRippleTime) continue;
              vec2 cuv = (pos / uResolution) * vec2(uAspect, 1.0);
              float r = distance(aspectUv, cuv);
              float waveR = speed * t;
              float ring = exp(-pow((r - waveR) / thickness, 2.0));
              float atten = exp(-dampT * t) * exp(-dampR * r);
              feed = max(feed, ring * atten * uRippleIntensity);
          }
      }
      if(uColorPulse){
          feed += sin(uTime * uPulseSpeed) * uPulseIntensity * 0.1;
      }
      float bayer = Bayer8(gl_FragCoord.xy / px) - 0.5;
      float bw = step(0.5, feed + bayer);
      float h = hash21(floor(gl_FragCoord.xy / px));
      float jitterScale = 1.0 + (h - 0.5) * uPixelSizeJitter * 0.1;
      float coverage = bw * jitterScale;
      float M;
      if      (uShapeType == SHAPE_CIRCLE)   M = maskCircle(pixelUV, coverage);
      else if (uShapeType == SHAPE_TRIANGLE) M = maskTriangle(pixelUV, pixelId, coverage);
      else if (uShapeType == SHAPE_DIAMOND)  M = maskDiamond(pixelUV, coverage);
      else                                   M = coverage;
      
      vec3 baseColor = uColor;
      if(uEnableGradient){
          float g = uv.y;
          baseColor = mix(uGradientColor1, uGradientColor2, g);
      }
      vec3 col = baseColor * M;
      float alpha = M;
      if(uEdgeFade > 0.0){
          float d = length(uv - 0.5);
          float fade = smoothstep(0.8 - uEdgeFade, 0.8, d);
          col *= (1.0 - fade);
          alpha *= (1.0 - fade);
      }
      
      alpha *= uNoiseAmount;
      gl_FragColor = vec4(col, alpha);
  }
`;

export const PremiumBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: true, premultipliedAlpha: false });
    if (!gl) {
      console.warn("WebGL not supported");
      return;
    }

    gl.getExtension('OES_standard_derivatives');

    const compileShader = (source: string, type: number) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader Compile Error: ", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vs = compileShader(vertexShaderSrc, gl.VERTEX_SHADER);
    const fs = compileShader(fragmentShaderSrc, gl.FRAGMENT_SHADER);
    if (!vs || !fs) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program Link Error: ", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1, -1,
       1, -1,
      -1,  1,
      -1,  1,
       1, -1,
       1,  1,
    ]), gl.STATIC_DRAW);

    const posLocation = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posLocation);
    gl.vertexAttribPointer(posLocation, 2, gl.FLOAT, false, 0, 0);

    const locs = {
      uResolution: gl.getUniformLocation(program, "uResolution"),
      uTime: gl.getUniformLocation(program, "uTime"),
      uPixelSize: gl.getUniformLocation(program, "uPixelSize"),
      uColor: gl.getUniformLocation(program, "uColor"),
      uPatternScale: gl.getUniformLocation(program, "uPatternScale"),
      uPatternDensity: gl.getUniformLocation(program, "uPatternDensity"),
      uPixelSizeJitter: gl.getUniformLocation(program, "uPixelSizeJitter"),
      uNoiseAmount: gl.getUniformLocation(program, "uNoiseAmount"),
      uShapeType: gl.getUniformLocation(program, "uShapeType"),
      uEnableRipples: gl.getUniformLocation(program, "uEnableRipples"),
      uRippleIntensity: gl.getUniformLocation(program, "uRippleIntensity"),
      uRippleThickness: gl.getUniformLocation(program, "uRippleThickness"),
      uRippleSpeed: gl.getUniformLocation(program, "uRippleSpeed"),
      uEnableGradient: gl.getUniformLocation(program, "uEnableGradient"),
      uGradientColor1: gl.getUniformLocation(program, "uGradientColor1"),
      uGradientColor2: gl.getUniformLocation(program, "uGradientColor2"),
      uRotSC: gl.getUniformLocation(program, "uRotSC"),
      uEdgeFade: gl.getUniformLocation(program, "uEdgeFade"),
      uAspect: gl.getUniformLocation(program, "uAspect"),
      uMaxRippleTime: gl.getUniformLocation(program, "uMaxRippleTime"),
      uClickPos: gl.getUniformLocation(program, "uClickPos"),
      uClickTimes: gl.getUniformLocation(program, "uClickTimes"),
    };

    // Configuration
    gl.uniform1f(locs.uPixelSize, 4.0);
    gl.uniform3f(locs.uColor, 1.0, 0.84, 0.0); // Base gold fallback
    gl.uniform1f(locs.uPatternScale, 1.0);
    gl.uniform1f(locs.uPatternDensity, 2.0);
    gl.uniform1f(locs.uPixelSizeJitter, 0.0);
    gl.uniform1f(locs.uNoiseAmount, 0.7);
    gl.uniform1i(locs.uShapeType, 1); // CIRCLE
    gl.uniform1i(locs.uEnableRipples, 1);
    gl.uniform1f(locs.uRippleIntensity, 1.0);
    gl.uniform1f(locs.uRippleThickness, 0.12);
    gl.uniform1f(locs.uRippleSpeed, 0.4);
    gl.uniform1i(locs.uEnableGradient, 1);
    // Darker gold/amber at bottom, bright yellow/gold at top
    gl.uniform3f(locs.uGradientColor1, 0.85, 0.65, 0.13); 
    gl.uniform3f(locs.uGradientColor2, 1.0, 0.9, 0.2); 
    gl.uniform2f(locs.uRotSC, 0.0, 1.0);
    gl.uniform1f(locs.uEdgeFade, 0.3);
    gl.uniform1f(locs.uMaxRippleTime, 3.0);

    const clickPos = new Float32Array(20).fill(-1);
    const clickTimes = new Float32Array(10).fill(0);
    gl.uniform2fv(locs.uClickPos, clickPos);
    gl.uniform1fv(locs.uClickTimes, clickTimes);

    // Background interaction disabled as per user request


    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(locs.uResolution, canvas.width, canvas.height);
      gl.uniform1f(locs.uAspect, canvas.width / canvas.height);
    };

    window.addEventListener("resize", resize);
    resize();

    let animationFrameId: number;
    const render = (time: number) => {
      const t = time / 1000.0 * 0.1; // Speed factor
      gl.uniform1f(locs.uTime, t);
      gl.uniform2fv(locs.uClickPos, clickPos);
      gl.uniform1fv(locs.uClickTimes, clickTimes);

      gl.clearColor(0.0, 0.0, 0.0, 1.0); // Solid black background
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointerdown", handlePointerDown);
      cancelAnimationFrame(animationFrameId);
      gl.deleteProgram(program);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.deleteBuffer(positionBuffer);
    };
  }, []);

  return (
    <div className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden bg-[#050505]" style={{ zIndex: -1 }}>
      <canvas 
        ref={canvasRef} 
        className="w-full h-full" 
        style={{
          maskImage: 'radial-gradient(ellipse at 55% 50%, transparent 20%, black 70%)',
          WebkitMaskImage: 'radial-gradient(ellipse at 55% 50%, transparent 20%, black 70%)'
        }}
      />
    </div>
  );
};


