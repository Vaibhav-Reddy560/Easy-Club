"use client";

import React from "react";

/**
 * PremiumBackground - Isometric Cube Grid from Uiverse.io by mobinkakei.
 * Modified: --c1 changed from white to gold, hue-rotate animation removed.
 */
export const PremiumBackground: React.FC = () => {
  return (
    <div
      id="premium-bg-container"
      className="fixed inset-0 w-full h-full pointer-events-none overflow-hidden"
      style={{
        zIndex: -1,
        backgroundColor: "#050505",
      }}
    >
      <style>{`
        #premium-bg-pattern {
          position: absolute;
          width: 100%;
          height: 100%;
          --sz: 4px;
          --sp: 5s;
          --b1: #211e1e;
          --b2: #1c1b18;
          --b3: #0c0b0a;
          --b4: #0c0b0ae0;
          --c1: #D4AF37;
          --ts: 50% / calc(var(--sz) * 17.5) calc(var(--sz) * 29.5);
          background:
            /* black shadows */ radial-gradient(
                circle at 50% 50%,
                var(--b4) calc(var(--sz) * 1),
                #fff0 calc(var(--sz) * 8)
              )
              var(--ts),
            radial-gradient(
                circle at 0% 0%,
                var(--b4) calc(var(--sz) * 1),
                #fff0 calc(var(--sz) * 8)
              )
              var(--ts),
            radial-gradient(
                circle at 0% 100%,
                var(--b4) calc(var(--sz) * 1),
                #fff0 calc(var(--sz) * 8)
              )
              var(--ts),
            radial-gradient(
                circle at 100% 0%,
                var(--b4) calc(var(--sz) * 1),
                #fff0 calc(var(--sz) * 8)
              )
              var(--ts),
            radial-gradient(
                circle at 100% 100%,
                var(--b4) calc(var(--sz) * 1),
                #fff0 calc(var(--sz) * 8)
              )
              var(--ts),
            /* border bottom */
              conic-gradient(
                from 90deg at 97.5% 67%,
                var(--c1) 0 87.5deg,
                #fff0 88deg 100%
              )
              var(--ts),
            /*repeated*/
              conic-gradient(
                from 90deg at 97.5% 67%,
                var(--c1) 0 87.5deg,
                #fff0 88deg 100%
              )
              var(--ts),
            conic-gradient(
                from 182.5deg at 2.5% 67%,
                #fff0 0 0deg,
                var(--c1) 0.5deg 90deg,
                #fff0 0 100%
              )
              var(--ts),
            /*repeated*/
              conic-gradient(
                from 182.5deg at 2.5% 67%,
                #fff0 0 0deg,
                var(--c1) 0.5deg 90deg,
                #fff0 0 100%
              )
              var(--ts),
            /* border top */
              conic-gradient(
                from 270deg at 2.5% 33%,
                var(--c1) 0 87.5deg,
                #fff0 88deg 100%
              )
              var(--ts),
            /*repeated*/
              conic-gradient(
                from 270deg at 2.5% 33%,
                var(--c1) 0 87.5deg,
                #fff0 88deg 100%
              )
              var(--ts),
            conic-gradient(
                from 2.5deg at 97.5% 33%,
                #fff0 0 0deg,
                var(--c1) 0.5deg 90deg,
                #fff0 0 100%
              )
              var(--ts),
            /*repeated*/
              conic-gradient(
                from 2.5deg at 97.5% 33%,
                #fff0 0 0deg,
                var(--c1) 0.5deg 90deg,
                #fff0 0 100%
              )
              var(--ts),
            /* bottom */
              conic-gradient(
                from 116.5deg at 50% 85.5%,
                var(--b1) 0 127deg,
                #fff0 0 100%
              )
              var(--ts),
            /*repeated*/
              conic-gradient(
                from 116.5deg at 50% 85.5%,
                var(--b1) 0 127deg,
                #fff0 0 100%
              )
              var(--ts),
            /*repeated*/
              conic-gradient(
                from 116.5deg at 50% 85.5%,
                var(--b1) 0 127deg,
                #fff0 0 100%
              )
              var(--ts),
            conic-gradient(from 120deg at 50% 83%, var(--c1) 0 120deg, #fff0 0 100%)
              var(--ts),
            /* top */
              conic-gradient(
                from -63.5deg at 50% 14.5%,
                var(--b1) 0 127deg,
                #fff0 0 100%
              )
              var(--ts),
            /*repeated*/
              conic-gradient(
                from -63.5deg at 50% 14.5%,
                var(--b1) 0 127deg,
                #fff0 0 100%
              )
              var(--ts),
            /*repeated*/
              conic-gradient(
                from -63.5deg at 50% 14.5%,
                var(--b1) 0 127deg,
                #fff0 0 100%
              )
              var(--ts),
            conic-gradient(from -60deg at 50% 17%, var(--c1) 0 120deg, #fff0 0 100%)
              var(--ts),
            /* central gradient */
              conic-gradient(
                from 0deg at 50% 50%,
                #fff0 0 2deg,
                var(--b2) 2.5deg 57.5deg,
                #fff0 58deg 62.5deg,
                var(--b1) 63deg 117.5deg,
                #fff0 118deg 122.5deg,
                var(--b3) 123deg 177.5deg,
                #fff0 178deg 182deg,
                var(--b2) 182.5deg 237.5deg,
                #fff0 0 242.5deg,
                var(--b1) 243deg 297.5deg,
                #fff0 298deg 302.5deg,
                var(--b3) 303deg 357.5deg,
                #fff0 358deg 360deg
              )
              var(--ts),
            /* bg */ var(--c1);
        }

        .vignette-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.78) 10%, rgba(0,0,0,0.8) 20%, rgba(0,0,0,0.8) 35%, rgba(0,0,0,0.8) 65%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.78) 90%, rgba(0,0,0,0.65) 100%);
          pointer-events: none;
        }
      `}</style>

      <div id="premium-bg-pattern" />
      <div className="vignette-overlay" />
    </div>
  );
};
