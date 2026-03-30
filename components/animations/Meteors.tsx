import React, { useEffect, useState } from "react";

export const Meteors = ({
  number,
  className,
  color = "#64748b",
}: {
  number?: number;
  className?: string;
  color?: string;
}) => {
  const [meteors, setMeteors] = useState<number[]>([]);

  useEffect(() => {
    setMeteors(new Array(number || 20).fill(true));
  }, [number]);

  return (
    <div className={`pointer-events-none absolute inset-0 overflow-hidden ${className || ""}`}>
      {meteors.map((el, idx) => (
        <span
          key={"meteor" + idx}
          className="animate-meteor-effect absolute top-1/2 left-1/2 h-0.5 w-0.5 rounded-[9999px] bg-slate-500 shadow-[0_0_0_1px_#ffffff10] rotate-[215deg] before:content-[''] before:absolute before:top-1/2 before:transform before:-translate-y-[50%] before:w-[50px] before:h-[1px] before:bg-gradient-to-r before:from-[var(--meteor-color,#64748b)] before:to-transparent"
          style={{
            top: 0,
            left: Math.floor(Math.random() * (400 - -400) + -400) + "px",
            animationDelay: Math.random() * (0.8 - 0.2) + 0.2 + "s",
            animationDuration: Math.floor(Math.random() * (10 - 2) + 2) + "s",
            background: color === "#64748b" ? undefined : color,
            "--meteor-color": color
          } as React.CSSProperties}
        ></span>
      ))}
    </div>
  );
};
