/**
 * InsuranceCardUpload component for uploading insurance card images
 *
 * Renders a drag-and-drop upload area for front (required) and back (optional)
 * insurance card images. Supports camera capture on mobile devices and OCR
 * auto-extraction to pre-fill form fields.
 */
"use client";

import * as React from "react";
import { Upload, Camera, X, Check, AlertCircle, Loader2, ImagePlus } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  useInsuranceCardUpload,
  type OcrExtractedData,
  type OcrConfidenceData,
} from "./useInsuranceCardUpload";
import { CameraCapture } from "./CameraCapture";

// Re-export types for external consumers
export type { OcrExtractedData, OcrConfidenceData } from "./useInsuranceCardUpload";

/**
 * Props for InsuranceCardUpload component
 */
export interface InsuranceCardUploadProps {
  /** Session ID for upload */
  sessionId: string;
  /** Callback when OCR data is ready for form population */
  onOcrComplete?: (data: OcrExtractedData, confidence: OcrConfidenceData) => void;
  /** Callback when user skips upload and wants manual entry */
  onSkip?: () => void;
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
  success: "#10B981",
  border: "#E5E7EB",
  borderHover: "#4A9B9B",
};

/**
 * Renders insurance card upload interface with OCR support
 *
 * Visual specs:
 * - Two-column layout on desktop (front + back cards)
 * - Stacked on mobile
 * - Drag-and-drop zones with dashed borders
 * - Image previews with remove button
 * - Progress indicators for upload and OCR processing
 * - Success/error state feedback
 *
 * Flow:
 * 1. User drops/selects front card image (required)
 * 2. Optionally adds back card image
 * 3. Clicks "Scan Card" to upload and process
 * 4. OCR extracts data → auto-fills form fields
 * 5. User can review/edit extracted data
 *
 * Accessibility:
 * - Keyboard navigable (Tab + Enter/Space)
 * - Screen reader announcements for status changes
 * - Focus indicators on interactive elements
 *
 * @example
 * <InsuranceCardUpload
 *   sessionId={sessionId}
 *   onOcrComplete={(data) => {
 *     setValue('memberId', data.member_id);
 *     setValue('carrier', data.payer_name);
 *   }}
 * />
 */
export function InsuranceCardUpload({
  sessionId,
  onOcrComplete,
  onSkip,
  className,
}: InsuranceCardUploadProps) {
  const frontInputRef = React.useRef<HTMLInputElement>(null);
  const frontCameraRef = React.useRef<HTMLInputElement>(null);
  const backInputRef = React.useRef<HTMLInputElement>(null);
  const backCameraRef = React.useRef<HTMLInputElement>(null);
  const [frontDragActive, setFrontDragActive] = React.useState(false);
  const [backDragActive, setBackDragActive] = React.useState(false);
  const [cameraModalTarget, setCameraModalTarget] = React.useState<"front" | "back" | null>(null);
  const [hasWebcam, setHasWebcam] = React.useState(false);

  /**
   * Detects if the device is mobile (for native camera capture)
   */
  const isMobile = React.useMemo(() => {
    if (typeof navigator === "undefined") return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }, []);

  /**
   * Checks for webcam availability on mount (for desktop camera capture)
   */
  React.useEffect(() => {
    async function checkWebcam() {
      if (typeof navigator === "undefined" || !navigator.mediaDevices) {
        setHasWebcam(false);
        return;
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((device) => device.kind === "videoinput");
        setHasWebcam(videoDevices.length > 0);
      } catch {
        setHasWebcam(false);
      }
    }

    checkWebcam();
  }, []);

  /**
   * Whether camera capture is available (mobile native or desktop webcam)
   */
  const hasCamera = isMobile || hasWebcam;

  const {
    status,
    uploadProgress,
    processingMessage,
    frontImage,
    backImage,
    frontPreviewUrl,
    backPreviewUrl,
    ocrData,
    error,
    setFrontImage,
    setBackImage,
    uploadImages,
    reset,
    clearError,
  } = useInsuranceCardUpload({
    sessionId,
    onOcrComplete,
  });

  /**
   * Handles drag events for drop zones
   */
  const handleDrag = React.useCallback(
    (
      e: React.DragEvent,
      setActive: React.Dispatch<React.SetStateAction<boolean>>,
      active: boolean
    ) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setActive(true);
      } else if (e.type === "dragleave") {
        setActive(false);
      }
    },
    []
  );

  /**
   * Handles file drop
   */
  const handleDrop = React.useCallback(
    (
      e: React.DragEvent,
      setImage: (file: File | null) => void,
      setActive: React.Dispatch<React.SetStateAction<boolean>>
    ) => {
      e.preventDefault();
      e.stopPropagation();
      setActive(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        setImage(files[0]);
      }
    },
    []
  );

  /**
   * Handles file input change
   */
  const handleFileChange = React.useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, setImage: (file: File | null) => void) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        setImage(files[0]);
      }
    },
    []
  );

  /**
   * Triggers file input click
   */
  const openFileDialog = React.useCallback((inputRef: React.RefObject<HTMLInputElement | null>) => {
    inputRef.current?.click();
  }, []);

  const isUploading = status === "uploading";
  const isProcessing = status === "processing";
  const isComplete = status === "complete" || status === "needs_review";
  const hasError = status === "error";
  const canUpload = frontImage && !isUploading && !isProcessing;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with icon */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center w-10 h-10 rounded-full"
          style={{ backgroundColor: COLORS.tealLight }}
        >
          <Camera className="w-5 h-5" style={{ color: COLORS.teal }} />
        </div>
        <div>
          <h3 className="font-medium text-foreground">
            Upload Your Insurance Card
          </h3>
          <p className="text-sm text-muted-foreground">
            We&apos;ll extract your information automatically
          </p>
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-sm"
          style={{ backgroundColor: "#FEE2E2", color: COLORS.error }}
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
          <button
            type="button"
            onClick={clearError}
            className="ml-auto hover:opacity-70"
            aria-label="Dismiss error"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {isComplete && ocrData && (
        <div
          className="flex items-center gap-2 p-3 rounded-lg text-sm"
          style={{ backgroundColor: "#D1FAE5", color: "#065F46" }}
          role="status"
        >
          <Check className="w-4 h-4 flex-shrink-0" />
          <span>
            Card scanned successfully! We&apos;ve filled in your information below.
          </span>
        </div>
      )}

      {/* Upload areas - two column on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Front card upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Front of Card <span className="text-destructive">*</span>
          </label>
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload front of insurance card"
            className={cn(
              "relative rounded-lg border-2 border-dashed transition-colors cursor-pointer",
              "flex flex-col items-center justify-center min-h-[160px] p-4",
              frontDragActive && "border-daybreak-teal bg-daybreak-teal/5",
              frontPreviewUrl && "border-solid",
              !frontDragActive && !frontPreviewUrl && "border-gray-300 hover:border-daybreak-teal"
            )}
            onDragEnter={(e) => handleDrag(e, setFrontDragActive, true)}
            onDragLeave={(e) => handleDrag(e, setFrontDragActive, false)}
            onDragOver={(e) => handleDrag(e, setFrontDragActive, true)}
            onDrop={(e) => handleDrop(e, setFrontImage, setFrontDragActive)}
            onClick={() => !frontPreviewUrl && openFileDialog(frontInputRef)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!frontPreviewUrl) openFileDialog(frontInputRef);
              }
            }}
          >
            {/* Hidden file inputs */}
            <input
              ref={frontInputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,image/heif"
              className="sr-only"
              onChange={(e) => handleFileChange(e, setFrontImage)}
              aria-hidden="true"
            />
            {/* Camera input for mobile */}
            <input
              ref={frontCameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => handleFileChange(e, setFrontImage)}
              aria-hidden="true"
            />

            {frontPreviewUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={frontPreviewUrl}
                  alt="Front of insurance card preview"
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFrontImage(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-white shadow-md hover:bg-gray-100"
                  aria-label="Remove front image"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3">
                  {hasCamera && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isMobile) {
                          // Use native camera on mobile
                          frontCameraRef.current?.click();
                        } else {
                          // Open webcam modal on desktop
                          setCameraModalTarget("front");
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white transition-colors"
                      style={{ backgroundColor: COLORS.teal }}
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      frontInputRef.current?.click();
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      hasCamera
                        ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        : "text-white"
                    )}
                    style={!hasCamera ? { backgroundColor: COLORS.teal } : undefined}
                  >
                    <ImagePlus className="w-4 h-4" />
                    {hasCamera ? "Choose File" : "Upload Image"}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG, PNG, or HEIC (max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Back card upload (optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">
            Back of Card{" "}
            <span className="text-muted-foreground text-xs">(optional)</span>
          </label>
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload back of insurance card"
            className={cn(
              "relative rounded-lg border-2 border-dashed transition-colors cursor-pointer",
              "flex flex-col items-center justify-center min-h-[160px] p-4",
              backDragActive && "border-daybreak-teal bg-daybreak-teal/5",
              backPreviewUrl && "border-solid",
              !backDragActive && !backPreviewUrl && "border-gray-300 hover:border-daybreak-teal"
            )}
            onDragEnter={(e) => handleDrag(e, setBackDragActive, true)}
            onDragLeave={(e) => handleDrag(e, setBackDragActive, false)}
            onDragOver={(e) => handleDrag(e, setBackDragActive, true)}
            onDrop={(e) => handleDrop(e, setBackImage, setBackDragActive)}
            onClick={() => !backPreviewUrl && openFileDialog(backInputRef)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (!backPreviewUrl) openFileDialog(backInputRef);
              }
            }}
          >
            {/* Hidden file inputs */}
            <input
              ref={backInputRef}
              type="file"
              accept="image/jpeg,image/png,image/heic,image/heif"
              className="sr-only"
              onChange={(e) => handleFileChange(e, setBackImage)}
              aria-hidden="true"
            />
            {/* Camera input for mobile */}
            <input
              ref={backCameraRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => handleFileChange(e, setBackImage)}
              aria-hidden="true"
            />

            {backPreviewUrl ? (
              <div className="relative w-full h-full">
                <img
                  src={backPreviewUrl}
                  alt="Back of insurance card preview"
                  className="w-full h-32 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setBackImage(null);
                  }}
                  className="absolute -top-2 -right-2 p-1 rounded-full bg-white shadow-md hover:bg-gray-100"
                  aria-label="Remove back image"
                >
                  <X className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            ) : (
              <div className="text-center">
                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 mb-3">
                  {hasCamera && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (isMobile) {
                          // Use native camera on mobile
                          backCameraRef.current?.click();
                        } else {
                          // Open webcam modal on desktop
                          setCameraModalTarget("back");
                        }
                      }}
                      className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium text-white transition-colors"
                      style={{ backgroundColor: COLORS.teal }}
                    >
                      <Camera className="w-4 h-4" />
                      Take Photo
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      backInputRef.current?.click();
                    }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                      hasCamera
                        ? "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        : "text-white"
                    )}
                    style={!hasCamera ? { backgroundColor: COLORS.teal } : undefined}
                  >
                    <ImagePlus className="w-4 h-4" />
                    {hasCamera ? "Choose File" : "Upload Image"}
                  </button>
                </div>
                <p className="text-sm text-muted-foreground">
                  or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPEG, PNG, or HEIC (max 10MB)
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Progress indicators */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Uploading...</span>
            <span className="font-medium">{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} className="h-2" />
        </div>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" style={{ color: COLORS.teal }} />
          <span>{processingMessage || "Processing..."}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="button"
          onClick={uploadImages}
          disabled={!canUpload}
          className={cn(
            "flex-1",
            "bg-daybreak-teal hover:bg-daybreak-teal/90 text-white"
          )}
        >
          {isUploading || isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {isUploading ? "Uploading..." : "Scanning..."}
            </>
          ) : isComplete ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Scanned Successfully
            </>
          ) : (
            <>
              <Camera className="w-4 h-4 mr-2" />
              Scan Card
            </>
          )}
        </Button>

        {isComplete && (
          <Button type="button" variant="outline" onClick={reset}>
            Upload Different Card
          </Button>
        )}
      </div>

      {/* Skip option */}
      {!isComplete && (
        <div className="text-center">
          <button
            type="button"
            onClick={onSkip}
            className="text-sm text-muted-foreground hover:text-foreground underline underline-offset-2"
          >
            I&apos;ll enter my information manually
          </button>
        </div>
      )}

      {/* Camera capture modal for desktop webcam */}
      <CameraCapture
        open={cameraModalTarget !== null}
        onClose={() => setCameraModalTarget(null)}
        onCapture={(file) => {
          if (cameraModalTarget === "front") {
            setFrontImage(file);
          } else if (cameraModalTarget === "back") {
            setBackImage(file);
          }
          setCameraModalTarget(null);
        }}
        captureLabel={cameraModalTarget === "front" ? "front of card" : "back of card"}
      />
    </div>
  );
}

InsuranceCardUpload.displayName = "InsuranceCardUpload";
