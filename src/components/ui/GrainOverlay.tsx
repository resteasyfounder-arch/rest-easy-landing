import { useEffect, useState } from "react";

export const GrainOverlay = () => {
    return (
        <div className="pointer-events-none fixed inset-0 z-[9999] opacity-[0.03] mix-blend-multiply select-none">
            <svg className="h-full w-full">
                <filter id="noise">
                    <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.80"
                        numOctaves="4"
                        stitchTiles="stitch"
                    />
                </filter>
                <rect width="100%" height="100%" filter="url(#noise)" />
            </svg>
        </div>
    );
};
