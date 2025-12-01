/**
 * CameraCapture component for capturing insurance card images via webcam
 *
 * Uses the getUserMedia API to access the device's webcam and capture
 * high-quality images suitable for OCR processing. Includes a card
 * positioning guide overlay and permission handling.
 *
 * Industry-standard patterns implemented:
 * - Live video preview with mirroring (natural for users)
 * - Card positioning guide overlay
 * - Permission state handling with helpful messaging
 * - Retake/confirm flow before submission
 * - High-resolution capture for OCR quality
 * - Responsive design for various screen sizes
 */
"use client";

import * as React from "react";
import { Camera, RefreshCw, Check, X, AlertCircle, Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

/**
 * Camera permission states
 */
type PermissionState = "prompt" | "granted" | "denied" | "checking";

/**
 * Props for CameraCapture component
 */
export interface CameraCaptureProps {
  /** Whether the camera modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Callback when image is captured and confirmed */
  onCapture: (file: File) => void;
  /** Label for what's being captured (e.g., "front of card") */
  captureLabel?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Design tokens from Daybreak palette
 */
const COLORS = {
  teal: "#4A9B9B",
  tealLight: "#E8F4F4",
  error: "#E85D5D",
};

/**
 * Checks if the browser supports getUserMedia
 */
function hasGetUserMedia(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * Converts canvas to File object for upload
 */
async function canvasToFile(canvas: HTMLCanvasElement, filename: string): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          const file = new File([blob], filename, { type: "image/jpeg" });
          resolve(file);
        } else {
          reject(new Error("Failed to create image blob"));
        }
      },
      "image/jpeg",
      0.92 // High quality for OCR
    );
  });
}

/**
 * Renders a webcam capture interface in a modal dialog
 *
 * Visual specs:
 * - Full-width video preview with card positioning guide
 * - Capture button below video
 * - Preview state with retake/confirm options
 * - Permission handling with helpful messaging
 *
 * Flow:
 * 1. User opens modal → camera permission requested
 * 2. Live video preview displayed with card guide
 * 3. User clicks capture → frame frozen for review
 * 4. User confirms → image returned as File
 * 5. User can retake if needed
 *
 * Accessibility:
 * - Keyboard navigable controls
 * - Screen reader announcements for state changes
 * - Focus management in modal
 *
 * @example
 * <CameraCapture
 *   open={showCamera}
 *   onClose={() => setShowCamera(false)}
 *   onCapture={(file) => setFrontImage(file)}
 *   captureLabel="front of card"
 * />
 */
export function CameraCapture({
  open,
  onClose,
  onCapture,
  captureLabel = "card",
  className,
}: CameraCaptureProps) {
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const streamRef = React.useRef<MediaStream | null>(null);

  const [permission, setPermission] = React.useState<PermissionState>("checking");
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [capturedImage, setCapturedImage] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  /**
   * Starts the camera stream
   */
  const startCamera = React.useCallback(async () => {
    if (!hasGetUserMedia()) {
      setError("Your browser doesn't support camera access");
      setPermission("denied");
      return;
    }

    setPermission("checking");
    setError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 },
          facingMode: "environment", // Prefer rear camera on mobile
        },
        audio: false,
      });

      streamRef.current = stream;
      setPermission("granted");

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
    } catch (err) {
      console.error("Camera access error:", err);

      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setPermission("denied");
          setError("Camera access was denied. Please allow camera access in your browser settings.");
        } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
          setPermission("denied");
          setError("No camera found on this device.");
        } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
          setPermission("denied");
          setError("Camera is being used by another application.");
        } else {
          setPermission("denied");
          setError("Could not access camera. Please try again.");
        }
      } else {
        setPermission("denied");
        setError("Could not access camera. Please try again.");
      }
    }
  }, []);

  /**
   * Stops the camera stream
   */
  const stopCamera = React.useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, []);

  /**
   * Captures the current video frame
   */
  const captureFrame = React.useCallback(async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) {
      setError("Could not capture image");
      setIsCapturing(false);
      return;
    }

    // Set canvas size to video dimensions for full quality
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw the video frame (not mirrored for document capture)
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Convert to data URL for preview
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    setCapturedImage(dataUrl);
    setIsCapturing(false);

    // Stop the camera after capture
    stopCamera();
  }, [stopCamera]);

  /**
   * Confirms the captured image and returns it
   */
  const confirmCapture = React.useCallback(async () => {
    if (!canvasRef.current) return;

    try {
      const file = await canvasToFile(
        canvasRef.current,
        `insurance-${captureLabel.replace(/\s+/g, "-")}-${Date.now()}.jpg`
      );
      onCapture(file);
      handleClose();
    } catch {
      setError("Failed to process image. Please try again.");
    }
  }, [captureLabel, onCapture]);

  /**
   * Retakes the photo
   */
  const retakePhoto = React.useCallback(() => {
    setCapturedImage(null);
    startCamera();
  }, [startCamera]);

  /**
   * Handles modal close with cleanup
   */
  const handleClose = React.useCallback(() => {
    stopCamera();
    setCapturedImage(null);
    setError(null);
    setPermission("checking");
    onClose();
  }, [stopCamera, onClose]);

  // Start camera when modal opens
  React.useEffect(() => {
    if (open) {
      startCamera();
    } else {
      stopCamera();
      setCapturedImage(null);
    }

    return () => {
      stopCamera();
    };
  }, [open, startCamera, stopCamera]);

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent
        showCloseButton={false}
        className={cn(
          "sm:max-w-[480px] p-0 overflow-visible gap-0 border-0 shadow-2xl rounded-3xl",
          className
        )}
      >
        <div className="relative p-8 bg-white rounded-3xl">
          <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
            <X className="h-5 w-5 text-gray-400" />
            <span className="sr-only">Close</span>
          </DialogClose>

          <DialogHeader className="flex flex-col items-center mb-6 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-teal-50 ring-8 ring-teal-50/50">
              <Camera className="w-8 h-8 text-teal-600" strokeWidth={3} />
            </div>
            <div className="space-y-2 text-center">
              <DialogTitle className="text-2xl font-bold text-gray-900 tracking-tight whitespace-nowrap">
                Capture {captureLabel}
              </DialogTitle>
              <DialogDescription className="text-gray-500 text-base max-w-[320px] mx-auto leading-relaxed">
                Position your insurance card within the guide and take a photo
              </DialogDescription>
            </div>
          </DialogHeader>

          {/* Hidden canvas for image processing */}
          <canvas ref={canvasRef} className="hidden" />

          <div className="space-y-6">
            {/* Error message */}
            {error && (
              <div
                className="flex items-center gap-2 p-3 rounded-lg text-sm"
                style={{ backgroundColor: "#FEE2E2", color: COLORS.error }}
                role="alert"
              >
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Camera view or captured image */}
            <div className="relative w-full aspect-[4/3] bg-gray-900 rounded-xl overflow-hidden shadow-inner">
              {permission === "checking" && !capturedImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2
                    className="w-8 h-8 animate-spin"
                    style={{ color: COLORS.teal }}
                  />
                </div>
              )}

              {permission === "denied" && !capturedImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
                  <AlertCircle className="w-12 h-12 mb-3 opacity-70" />
                  <p className="font-medium mb-2">Camera Access Required</p>
                  <p className="text-sm opacity-70 mb-4">
                    Please enable camera access in your browser settings to take a photo
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startCamera}
                    className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                  >
                    Try Again
                  </Button>
                </div>
              )}

              {capturedImage ? (
                /* Captured image preview */
                <img
                  src={capturedImage}
                  alt={`Captured ${captureLabel}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                /* Live video preview */
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={cn(
                      "w-full h-full object-cover",
                      permission !== "granted" && "opacity-0"
                    )}
                  />

                  {/* Card positioning guide overlay */}
                  {permission === "granted" && (
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Semi-transparent overlay with card cutout */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="relative w-[85%] aspect-[1.586/1] max-w-md">
                          {/* Card outline */}
                          <div
                            className="absolute inset-0 rounded-xl border-2 border-dashed"
                            style={{ borderColor: COLORS.teal }}
                          />
                          {/* Corner markers */}
                          <div
                            className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 rounded-tl-xl"
                            style={{ borderColor: COLORS.teal }}
                          />
                          <div
                            className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 rounded-tr-xl"
                            style={{ borderColor: COLORS.teal }}
                          />
                          <div
                            className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 rounded-bl-xl"
                            style={{ borderColor: COLORS.teal }}
                          />
                          <div
                            className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 rounded-br-xl"
                            style={{ borderColor: COLORS.teal }}
                          />
                        </div>
                      </div>
                      {/* Guide text */}
                      <div className="absolute bottom-4 left-0 right-0 text-center">
                        <p className="text-white text-sm font-medium drop-shadow-lg bg-black/30 inline-block px-3 py-1 rounded-full">
                          Align card within the frame
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 pt-2">
              {capturedImage ? (
                /* Captured state - retake or confirm */
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 border-gray-200 text-gray-700 hover:bg-gray-50"
                    onClick={retakePhoto}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Retake
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 h-11 bg-daybreak-teal hover:bg-daybreak-teal/90 text-white shadow-lg shadow-teal-900/10"
                    onClick={confirmCapture}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Use This Photo
                  </Button>
                </>
              ) : (
                /* Live camera state - capture */
                <>
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1 h-11 border-gray-200 text-gray-700 hover:bg-gray-50"
                    onClick={handleClose}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="flex-1 h-11 bg-daybreak-teal hover:bg-daybreak-teal/90 text-white shadow-lg shadow-teal-900/10"
                    onClick={captureFrame}
                    disabled={permission !== "granted" || isCapturing}
                  >
                    {isCapturing ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 mr-2" />
                    )}
                    {isCapturing ? "Capturing..." : "Take Photo"}
                  </Button>
                </>
              )}
            </div>

            {/* Help text */}
            <p className="text-xs text-center text-muted-foreground">
              For best results, ensure good lighting and hold the card steady
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

CameraCapture.displayName = "CameraCapture";
