/**
 * InsuranceCardModal component for viewing insurance card images
 *
 * Full-size modal dialog for viewing uploaded insurance card images
 * with front/back toggle. Displays the card at larger size for
 * verification and review purposes.
 *
 * Features:
 * - Full-size card display with proper aspect ratio
 * - Front/back toggle buttons when both images available
 * - Loading state for image fetching
 * - Error handling with helpful message
 * - Keyboard accessible (Escape to close)
 * - Focus trap within modal
 *
 * Visual Design:
 * - Daybreak teal accent for active tab
 * - Credit card aspect ratio maintained
 * - Clean dialog with minimal chrome
 * - Responsive sizing for mobile/desktop
 */
"use client";

import * as React from "react";
import { useState } from "react";
import { CreditCard, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

/**
 * Props for InsuranceCardModal component
 * @param open - Whether modal is open
 * @param onClose - Callback to close the modal
 * @param frontImageUrl - Presigned S3 URL for front of card
 * @param backImageUrl - Presigned S3 URL for back of card (optional)
 * @param payerName - Insurance carrier name for display
 */
export interface InsuranceCardModalProps {
  open: boolean;
  onClose: () => void;
  frontImageUrl: string | null | undefined;
  backImageUrl?: string | null | undefined;
  payerName?: string | null;
}

type CardSide = "front" | "back";

/**
 * Image display component with loading and error states
 */
function CardImage({
  src,
  alt,
  onError,
}: {
  src: string;
  alt: string;
  onError: () => void;
}) {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative aspect-[1.586/1] w-full bg-muted rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2
            className="h-8 w-8 animate-spin text-muted-foreground"
            aria-label="Loading image"
          />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-contain transition-opacity duration-200",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          setIsLoading(false);
          onError();
        }}
      />
    </div>
  );
}

/**
 * Placeholder when no image is available
 */
function NoImagePlaceholder({ message }: { message: string }) {
  return (
    <div className="aspect-[1.586/1] w-full bg-muted rounded-lg flex flex-col items-center justify-center gap-3">
      <div className="rounded-full bg-muted-foreground/10 p-4">
        <AlertCircle className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm text-muted-foreground text-center px-4">{message}</p>
    </div>
  );
}

/**
 * Renders a full-size modal for viewing insurance card images
 *
 * Displays insurance card images with front/back toggle when both
 * sides are available. Maintains credit card aspect ratio and
 * provides accessible modal experience.
 *
 * @example
 * <InsuranceCardModal
 *   open={isModalOpen}
 *   onClose={() => setIsModalOpen(false)}
 *   frontImageUrl={cardImageFrontUrl}
 *   backImageUrl={cardImageBackUrl}
 *   payerName="Blue Cross Blue Shield"
 * />
 */
export function InsuranceCardModal({
  open,
  onClose,
  frontImageUrl,
  backImageUrl,
  payerName,
}: InsuranceCardModalProps) {
  const [activeSide, setActiveSide] = useState<CardSide>("front");
  const [hasError, setHasError] = useState(false);

  // Reset state when modal opens
  React.useEffect(() => {
    if (open) {
      setActiveSide("front");
      setHasError(false);
    }
  }, [open]);

  const hasBackImage = Boolean(backImageUrl);
  const currentImage = activeSide === "front" ? frontImageUrl : backImageUrl;

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="rounded-full bg-daybreak-teal/10 p-2">
              <CreditCard className="h-5 w-5 text-daybreak-teal" aria-hidden="true" />
            </div>
            {payerName || "Insurance Card"}
          </DialogTitle>
        </DialogHeader>

        {/* Front/Back toggle buttons */}
        {hasBackImage && (
          <div className="flex gap-2 mb-4">
            <Button
              variant={activeSide === "front" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveSide("front");
                setHasError(false);
              }}
              className={cn(
                "flex-1",
                activeSide === "front" && "bg-daybreak-teal hover:bg-daybreak-teal/90"
              )}
            >
              Front
            </Button>
            <Button
              variant={activeSide === "back" ? "default" : "outline"}
              size="sm"
              onClick={() => {
                setActiveSide("back");
                setHasError(false);
              }}
              className={cn(
                "flex-1",
                activeSide === "back" && "bg-daybreak-teal hover:bg-daybreak-teal/90"
              )}
            >
              Back
            </Button>
          </div>
        )}

        {/* Card image display */}
        {hasError ? (
          <NoImagePlaceholder message="Unable to load image. The link may have expired." />
        ) : currentImage ? (
          <CardImage
            src={currentImage}
            alt={`Insurance card ${activeSide}`}
            onError={() => setHasError(true)}
          />
        ) : (
          <NoImagePlaceholder message="No image available for this side of the card." />
        )}

        {/* Footer with close button */}
        <div className="flex justify-end pt-4">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

InsuranceCardModal.displayName = "InsuranceCardModal";
