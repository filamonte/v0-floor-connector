"use client";

import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState
} from "react";

export type SignaturePadHandle = {
  clear: () => void;
  getSignature: () => string | null;
};

type SignaturePadProps = {
  label?: string;
  instructions?: string;
  onSignatureChange?: (hasSignature: boolean) => void;
};

export const SignaturePad = forwardRef<SignaturePadHandle, SignaturePadProps>(
  function SignaturePad(
    {
      label = "Signature",
      instructions = "Use your finger, stylus, or mouse to sign in the box below.",
      onSignatureChange
    },
    ref
  ) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const isDrawingRef = useRef(false);
    const lastPointRef = useRef<{ x: number; y: number } | null>(null);
    const [hasSignature, setHasSignature] = useState(false);

    function updateHasSignature(nextValue: boolean) {
      setHasSignature(nextValue);
      onSignatureChange?.(nextValue);
    }

    function getCanvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
      const canvas = canvasRef.current;

      if (!canvas) {
        return { x: 0, y: 0 };
      }

      const rect = canvas.getBoundingClientRect();

      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    }

    function getContext() {
      const canvas = canvasRef.current;

      if (!canvas) {
        return null;
      }

      const context = canvas.getContext("2d");

      if (!context) {
        return null;
      }

      context.lineCap = "round";
      context.lineJoin = "round";
      context.lineWidth = 2.5;
      context.strokeStyle = "#17120f";

      return context;
    }

    function clearCanvas() {
      const canvas = canvasRef.current;
      const context = getContext();

      if (!canvas || !context) {
        return;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      isDrawingRef.current = false;
      lastPointRef.current = null;
      updateHasSignature(false);
    }

    useImperativeHandle(
      ref,
      () => ({
        clear: clearCanvas,
        getSignature: () => {
          const canvas = canvasRef.current;

          if (!canvas || !hasSignature) {
            return null;
          }

          return canvas.toDataURL("image/png");
        }
      }),
      [hasSignature]
    );

    useEffect(() => {
      const canvas = canvasRef.current;

      if (!canvas) {
        return;
      }

      function resizeCanvas() {
        if (!canvas) {
          return;
        }

        const rect = canvas.getBoundingClientRect();
        const ratio = window.devicePixelRatio || 1;
        canvas.width = Math.max(1, Math.floor(rect.width * ratio));
        canvas.height = Math.max(1, Math.floor(rect.height * ratio));

        const context = canvas.getContext("2d");
        context?.scale(ratio, ratio);
        clearCanvas();
      }

      resizeCanvas();
      window.addEventListener("resize", resizeCanvas);

      return () => window.removeEventListener("resize", resizeCanvas);
    }, []);

    function handlePointerDown(event: React.PointerEvent<HTMLCanvasElement>) {
      event.currentTarget.setPointerCapture(event.pointerId);
      isDrawingRef.current = true;
      lastPointRef.current = getCanvasPoint(event);
    }

    function handlePointerMove(event: React.PointerEvent<HTMLCanvasElement>) {
      if (!isDrawingRef.current || !lastPointRef.current) {
        return;
      }

      const context = getContext();

      if (!context) {
        return;
      }

      const nextPoint = getCanvasPoint(event);
      context.beginPath();
      context.moveTo(lastPointRef.current.x, lastPointRef.current.y);
      context.lineTo(nextPoint.x, nextPoint.y);
      context.stroke();
      lastPointRef.current = nextPoint;

      if (!hasSignature) {
        updateHasSignature(true);
      }
    }

    function stopDrawing(event: React.PointerEvent<HTMLCanvasElement>) {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      isDrawingRef.current = false;
      lastPointRef.current = null;
    }

    return (
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-[#17120f]">{label}</p>
          <p className="mt-1 text-sm leading-6 text-[#6f6256]">{instructions}</p>
        </div>
        <canvas
          ref={canvasRef}
          aria-label={label}
          role="img"
          className="h-[260px] w-full touch-none rounded-[6px] border border-[#d9cdc2] bg-white shadow-inner"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={stopDrawing}
          onPointerCancel={stopDrawing}
          onPointerLeave={(event) => {
            if (isDrawingRef.current) {
              stopDrawing(event);
            }
          }}
        />
        <p className="text-xs leading-5 text-[#6f6256]" aria-live="polite">
          {hasSignature ? "Signature captured." : "No signature captured yet."}
        </p>
      </div>
    );
  }
);
