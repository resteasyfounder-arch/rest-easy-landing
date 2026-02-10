import { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import TourStep from "./TourStep";
import { TOUR_STEPS, useFeatureTour } from "@/hooks/useFeatureTour";

interface SpotlightRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface FeatureTourProps {
  tourHook: ReturnType<typeof useFeatureTour>;
}

const PADDING = 6;

const FeatureTour = ({ tourHook }: FeatureTourProps) => {
  const { isOpen, currentStep, totalSteps, step, next, back, skip } = tourHook;
  const [rect, setRect] = useState<SpotlightRect | null>(null);

  const measureTarget = useCallback(() => {
    if (!isOpen) return;
    const el = document.querySelector(`[data-tour="${step.id}"]`);
    if (el) {
      const r = el.getBoundingClientRect();
      setRect({
        top: r.top - PADDING,
        left: r.left - PADDING,
        width: r.width + PADDING * 2,
        height: r.height + PADDING * 2,
      });
    }
  }, [isOpen, step.id]);

  useEffect(() => {
    measureTarget();
    window.addEventListener("resize", measureTarget);
    window.addEventListener("scroll", measureTarget, true);
    return () => {
      window.removeEventListener("resize", measureTarget);
      window.removeEventListener("scroll", measureTarget, true);
    };
  }, [measureTarget]);

  if (!isOpen || !rect) return null;

  // Position the card next to the spotlight
  const cardStyle = computeCardPosition(rect);

  // Build overlay with spotlight cutout using box-shadow
  const overlayStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 10000,
    pointerEvents: "none",
  };

  const spotlightOverlayStyle: React.CSSProperties = {
    position: "fixed",
    top: rect.top,
    left: rect.left,
    width: rect.width,
    height: rect.height,
    borderRadius: 8,
    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.55)",
    zIndex: 10000,
    pointerEvents: "none",
  };

  // Clickable backdrop to close
  const backdropStyle: React.CSSProperties = {
    position: "fixed",
    inset: 0,
    zIndex: 9999,
  };

  return createPortal(
    <>
      {/* Invisible click-catcher */}
      <div style={backdropStyle} onClick={skip} />
      {/* Spotlight cutout */}
      <div style={spotlightOverlayStyle} />
      {/* Step card */}
      <TourStep
        step={step}
        currentStep={currentStep}
        totalSteps={totalSteps}
        onNext={next}
        onBack={back}
        onSkip={skip}
        style={cardStyle}
      />
    </>,
    document.body
  );
};

function computeCardPosition(rect: SpotlightRect): React.CSSProperties {
  const cardWidth = 320;
  const gap = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Try right of target
  if (rect.left + rect.width + gap + cardWidth < vw) {
    return {
      top: Math.min(rect.top, vh - 260),
      left: rect.left + rect.width + gap,
    };
  }
  // Try left of target
  if (rect.left - gap - cardWidth > 0) {
    return {
      top: Math.min(rect.top, vh - 260),
      left: rect.left - gap - cardWidth,
    };
  }
  // Fallback: below
  return {
    top: rect.top + rect.height + gap,
    left: Math.max(8, Math.min(rect.left, vw - cardWidth - 8)),
  };
}

export default FeatureTour;
