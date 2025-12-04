/**
 * useInsuranceCardUpload hook for insurance card OCR upload and status
 *
 * Handles file upload via GraphQL mutation, subscription to OCR status changes,
 * and state management for the upload flow. Integrates with Apollo Upload Client.
 *
 * Includes polling fallback for production environments where WebSocket
 * subscriptions may not work reliably (ActionCable origin restrictions, etc.)
 */
"use client";

import * as React from "react";
import { gql } from "@apollo/client";
import { useMutation, useSubscription, useLazyQuery } from "@apollo/client/react";

/**
 * GraphQL mutation for uploading insurance card images
 */
const UPLOAD_INSURANCE_CARD = gql`
  mutation UploadInsuranceCard(
    $sessionId: ID!
    $frontImage: Upload!
    $backImage: Upload
  ) {
    uploadInsuranceCard(
      sessionId: $sessionId
      frontImage: $frontImage
      backImage: $backImage
    ) {
      insurance {
        id
        payerName
        subscriberName
        memberId
        groupNumber
        verificationStatus
        cardImageFrontUrl
        cardImageBackUrl
        ocrProcessed
        ocrExtracted
        ocrConfidence
        ocrLowConfidenceFields
        needsReview
        ocrError
      }
      errors
    }
  }
`;

/**
 * GraphQL subscription for insurance status changes (OCR updates)
 */
const INSURANCE_STATUS_CHANGED = gql`
  subscription InsuranceStatusChanged($sessionId: ID!) {
    insuranceStatusChanged(sessionId: $sessionId) {
      insurance {
        id
        payerName
        subscriberName
        memberId
        groupNumber
        verificationStatus
        ocrProcessed
        ocrExtracted
        ocrConfidence
        ocrLowConfidenceFields
        needsReview
        ocrError
        ocrDataAvailable
      }
      progress {
        percentage
        message
      }
    }
  }
`;

/**
 * GraphQL query for polling insurance OCR status
 * Used as fallback when WebSocket subscription doesn't work (e.g., production ActionCable issues)
 */
const GET_INSURANCE_STATUS = gql`
  query GetInsuranceStatus($sessionId: ID!) {
    session(id: $sessionId) {
      insurance {
        id
        payerName
        subscriberName
        memberId
        groupNumber
        verificationStatus
        ocrProcessed
        ocrExtracted
        ocrConfidence
        ocrLowConfidenceFields
        needsReview
        ocrError
        ocrDataAvailable
      }
    }
  }
`;

/** Polling interval for OCR status fallback (2 seconds) */
const POLL_INTERVAL_MS = 2000;
/** Maximum polling duration before timeout (30 seconds) */
const MAX_POLL_DURATION_MS = 30000;

/**
 * OCR extracted fields from insurance card
 */
export interface OcrExtractedData {
  payer_name?: string;
  member_id?: string;
  group_number?: string;
  subscriber_name?: string;
}

/**
 * Insurance data from GraphQL response
 */
interface InsuranceData {
  id: string;
  payerName: string | null;
  subscriberName: string | null;
  memberId: string | null;
  groupNumber: string | null;
  verificationStatus: string;
  ocrProcessed: boolean;
  ocrExtracted: OcrExtractedData | null;
  ocrConfidence: OcrConfidenceData | null;
  ocrLowConfidenceFields: string[] | null;
  needsReview: boolean;
  ocrError: string | null;
}

/**
 * Upload mutation response
 */
interface UploadInsuranceCardResponse {
  uploadInsuranceCard: {
    insurance: InsuranceData | null;
    errors: string[];
  };
}

/**
 * Insurance status subscription payload
 */
interface InsuranceStatusPayload {
  insurance: InsuranceData;
  progress: { percentage: number; message: string } | null;
}

/**
 * OCR confidence scores for each field (0-100)
 */
export interface OcrConfidenceData {
  payer_name?: number;
  member_id?: number;
  group_number?: number;
  subscriber_name?: number;
}

/**
 * Upload status states
 */
export type UploadStatus =
  | "idle"
  | "uploading"
  | "processing"
  | "complete"
  | "needs_review"
  | "error";

/**
 * Return type for useInsuranceCardUpload hook
 */
export interface UseInsuranceCardUploadReturn {
  /** Current upload status */
  status: UploadStatus;
  /** Upload progress percentage (0-100) */
  uploadProgress: number;
  /** OCR processing progress message */
  processingMessage: string | null;
  /** Front image file */
  frontImage: File | null;
  /** Back image file */
  backImage: File | null;
  /** Preview URL for front image */
  frontPreviewUrl: string | null;
  /** Preview URL for back image */
  backPreviewUrl: string | null;
  /** OCR extracted data */
  ocrData: OcrExtractedData | null;
  /** OCR confidence scores */
  ocrConfidence: OcrConfidenceData | null;
  /** Fields with low confidence needing review */
  lowConfidenceFields: string[];
  /** Error message if upload failed */
  error: string | null;
  /** Set front image file */
  setFrontImage: (file: File | null) => void;
  /** Set back image file */
  setBackImage: (file: File | null) => void;
  /** Upload images and start OCR processing */
  uploadImages: () => Promise<void>;
  /** Reset upload state */
  reset: () => void;
  /** Clear error state */
  clearError: () => void;
}

/**
 * Options for useInsuranceCardUpload hook
 */
export interface UseInsuranceCardUploadOptions {
  /** Session ID for upload */
  sessionId: string;
  /** Callback when OCR data is ready for form population */
  onOcrComplete?: (data: OcrExtractedData, confidence: OcrConfidenceData) => void;
  /** Callback when upload or OCR fails */
  onError?: (error: string) => void;
}

/**
 * Allowed MIME types for insurance card images
 */
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "image/heif",
];

/**
 * Maximum file size in bytes (10MB)
 */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Hook for managing insurance card image upload and OCR processing
 *
 * Features:
 * - File validation (type, size)
 * - Image preview generation
 * - GraphQL mutation for upload
 * - Subscription to OCR status changes
 * - Progress tracking
 * - Error handling
 *
 * @param options - Configuration options
 * @returns Upload state and control functions
 *
 * @example
 * const {
 *   frontImage,
 *   setFrontImage,
 *   uploadImages,
 *   status,
 *   ocrData,
 * } = useInsuranceCardUpload({
 *   sessionId,
 *   onOcrComplete: (data) => {
 *     setValue('memberId', data.member_id);
 *   },
 * });
 */
export function useInsuranceCardUpload({
  sessionId,
  onOcrComplete,
  onError,
}: UseInsuranceCardUploadOptions): UseInsuranceCardUploadReturn {
  const [status, setStatus] = React.useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = React.useState(0);
  const [processingMessage, setProcessingMessage] = React.useState<string | null>(null);
  const [frontImage, setFrontImageState] = React.useState<File | null>(null);
  const [backImage, setBackImageState] = React.useState<File | null>(null);
  const [frontPreviewUrl, setFrontPreviewUrl] = React.useState<string | null>(null);
  const [backPreviewUrl, setBackPreviewUrl] = React.useState<string | null>(null);
  const [ocrData, setOcrData] = React.useState<OcrExtractedData | null>(null);
  const [ocrConfidence, setOcrConfidence] = React.useState<OcrConfidenceData | null>(null);
  const [lowConfidenceFields, setLowConfidenceFields] = React.useState<string[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [insuranceId, setInsuranceId] = React.useState<string | null>(null);

  // GraphQL mutation for uploading insurance card
  const [uploadMutation] = useMutation<UploadInsuranceCardResponse>(UPLOAD_INSURANCE_CARD, {
    context: {
      // Enable multipart form upload
      hasUpload: true,
    },
  });

  // Track if subscription has received data (for polling fallback)
  const subscriptionReceivedData = React.useRef(false);
  const pollStartTime = React.useRef<number | null>(null);
  const pollIntervalId = React.useRef<NodeJS.Timeout | null>(null);

  // GraphQL lazy query for polling fallback
  interface GetInsuranceStatusResponse {
    session: {
      insurance: InsuranceData | null;
    } | null;
  }
  const [fetchInsuranceStatus] = useLazyQuery<GetInsuranceStatusResponse>(GET_INSURANCE_STATUS, {
    fetchPolicy: "network-only",
  });

  /**
   * Saves OCR data to localStorage for persistence
   */
  const saveToLocalStorage = React.useCallback(
    (extractedData: OcrExtractedData, confidence: OcrConfidenceData | null) => {
      try {
        const existing = localStorage.getItem(`onboarding_session_${sessionId}`);
        const parsed = existing ? JSON.parse(existing) : { data: {} };
        parsed.data.insuranceOcr = {
          extractedData,
          confidence,
          processedAt: new Date().toISOString(),
        };
        localStorage.setItem(
          `onboarding_session_${sessionId}`,
          JSON.stringify(parsed)
        );
      } catch (storageError) {
        console.warn("Failed to save OCR data to localStorage:", storageError);
      }
    },
    [sessionId]
  );

  /**
   * Polls for OCR status as a fallback when WebSocket subscription doesn't work
   * This handles production environments with ActionCable origin restrictions
   */
  const pollForOcrStatus = React.useCallback(async () => {
    try {
      const result = await fetchInsuranceStatus({ variables: { sessionId } });
      const insurance = result.data?.session?.insurance;

      if (insurance?.ocrProcessed) {
        // Stop polling - OCR is complete
        if (pollIntervalId.current) {
          clearInterval(pollIntervalId.current);
          pollIntervalId.current = null;
        }

        // Process the result same as subscription
        if (insurance.ocrError) {
          setError(insurance.ocrError);
          setStatus("error");
          onError?.(insurance.ocrError);
        } else if (insurance.ocrExtracted) {
          setOcrData(insurance.ocrExtracted);
          setOcrConfidence(insurance.ocrConfidence);
          setLowConfidenceFields(insurance.ocrLowConfidenceFields || []);
          setStatus(insurance.needsReview ? "needs_review" : "complete");
          setProcessingMessage(null);

          onOcrComplete?.(
            insurance.ocrExtracted,
            insurance.ocrConfidence || {}
          );
          saveToLocalStorage(insurance.ocrExtracted, insurance.ocrConfidence);
        }
      }
    } catch (err) {
      console.warn("Error polling OCR status:", err);
    }
  }, [sessionId, fetchInsuranceStatus, onOcrComplete, onError, saveToLocalStorage]);

  // GraphQL subscription for OCR status updates
  useSubscription<{ insuranceStatusChanged: InsuranceStatusPayload }>(INSURANCE_STATUS_CHANGED, {
    variables: { sessionId },
    skip: !insuranceId || status !== "processing",
    onData: (options) => {
      const payload = options.data?.data?.insuranceStatusChanged;
      if (payload) {
        subscriptionReceivedData.current = true;
        handleSubscriptionUpdate(payload);
      }
    },
  });

  /**
   * Starts polling fallback after a delay if subscription hasn't received data
   * This ensures we have a working path even if WebSockets fail
   */
  React.useEffect(() => {
    if (status !== "processing" || !insuranceId) {
      // Clean up polling if status changes
      if (pollIntervalId.current) {
        clearInterval(pollIntervalId.current);
        pollIntervalId.current = null;
      }
      return;
    }

    // Wait 3 seconds for subscription to work, then start polling as fallback
    const fallbackTimeout = setTimeout(() => {
      if (!subscriptionReceivedData.current && status === "processing") {
        console.log("Starting OCR status polling fallback (subscription not responding)");
        pollStartTime.current = Date.now();

        // Start polling
        pollIntervalId.current = setInterval(() => {
          // Check timeout
          if (pollStartTime.current && Date.now() - pollStartTime.current > MAX_POLL_DURATION_MS) {
            if (pollIntervalId.current) {
              clearInterval(pollIntervalId.current);
              pollIntervalId.current = null;
            }
            setError("OCR processing timed out. Please try uploading again.");
            setStatus("error");
            onError?.("OCR processing timed out");
            return;
          }

          pollForOcrStatus();
        }, POLL_INTERVAL_MS);

        // Also do an immediate poll
        pollForOcrStatus();
      }
    }, 3000);

    return () => {
      clearTimeout(fallbackTimeout);
      if (pollIntervalId.current) {
        clearInterval(pollIntervalId.current);
        pollIntervalId.current = null;
      }
    };
  }, [status, insuranceId, pollForOcrStatus, onError]);

  /**
   * Handles subscription updates for OCR processing status
   */
  const handleSubscriptionUpdate = React.useCallback(
    (payload: InsuranceStatusPayload) => {
      const { insurance, progress } = payload;

      // Update progress message
      if (progress) {
        setProcessingMessage(progress.message);
      }

      // Check if OCR is complete
      if (insurance.ocrProcessed) {
        if (insurance.ocrError) {
          setError(insurance.ocrError);
          setStatus("error");
          onError?.(insurance.ocrError);
        } else if (insurance.ocrExtracted) {
          setOcrData(insurance.ocrExtracted);
          setOcrConfidence(insurance.ocrConfidence);
          setLowConfidenceFields(insurance.ocrLowConfidenceFields || []);
          setStatus(insurance.needsReview ? "needs_review" : "complete");
          setProcessingMessage(null);

          // Notify parent component
          onOcrComplete?.(
            insurance.ocrExtracted,
            insurance.ocrConfidence || {}
          );

          // Store in localStorage as backup
          saveToLocalStorage(insurance.ocrExtracted, insurance.ocrConfidence);
        }
      }
    },
    [onOcrComplete, onError, sessionId, saveToLocalStorage]
  );

  /**
   * Validates a file for upload
   * @param file - File to validate
   * @returns Error message or null if valid
   */
  const validateFile = React.useCallback((file: File): string | null => {
    if (!ALLOWED_MIME_TYPES.includes(file.type)) {
      return "Please upload a JPEG, PNG, or HEIC image";
    }
    if (file.size > MAX_FILE_SIZE) {
      return "File size must be less than 10MB";
    }
    return null;
  }, []);

  /**
   * Creates a preview URL for an image file
   * @param file - Image file
   * @returns Object URL for preview
   */
  const createPreviewUrl = React.useCallback((file: File): string => {
    return URL.createObjectURL(file);
  }, []);

  /**
   * Sets front image with validation and preview
   */
  const setFrontImage = React.useCallback(
    (file: File | null) => {
      // Revoke previous preview URL
      if (frontPreviewUrl) {
        URL.revokeObjectURL(frontPreviewUrl);
        setFrontPreviewUrl(null);
      }

      if (file) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        setFrontImageState(file);
        setFrontPreviewUrl(createPreviewUrl(file));
        setError(null);
      } else {
        setFrontImageState(null);
      }
    },
    [frontPreviewUrl, validateFile, createPreviewUrl]
  );

  /**
   * Sets back image with validation and preview
   */
  const setBackImage = React.useCallback(
    (file: File | null) => {
      // Revoke previous preview URL
      if (backPreviewUrl) {
        URL.revokeObjectURL(backPreviewUrl);
        setBackPreviewUrl(null);
      }

      if (file) {
        const validationError = validateFile(file);
        if (validationError) {
          setError(validationError);
          return;
        }
        setBackImageState(file);
        setBackPreviewUrl(createPreviewUrl(file));
        setError(null);
      } else {
        setBackImageState(null);
      }
    },
    [backPreviewUrl, validateFile, createPreviewUrl]
  );

  /**
   * Uploads images and initiates OCR processing
   */
  const uploadImages = React.useCallback(async (): Promise<void> => {
    if (!frontImage) {
      setError("Front image is required");
      return;
    }

    setStatus("uploading");
    setError(null);
    setUploadProgress(0);
    // Reset subscription tracking for new upload
    subscriptionReceivedData.current = false;
    pollStartTime.current = null;

    try {
      // Simulate upload progress (actual progress from XHR not easily available with Apollo)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 200);

      // Call GraphQL mutation
      const result = await uploadMutation({
        variables: {
          sessionId,
          frontImage,
          backImage,
        },
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      // Check for errors in response
      const uploadResult = result.data?.uploadInsuranceCard;
      const errors = uploadResult?.errors;
      if (errors && errors.length > 0) {
        const errorMessage = errors.join(", ");
        setError(errorMessage);
        setStatus("error");
        onError?.(errorMessage);
        return;
      }

      const insurance = uploadResult?.insurance;
      if (!insurance) {
        throw new Error("No insurance data returned");
      }

      // Store insurance ID for subscription
      setInsuranceId(insurance.id);

      // Check if OCR is already complete (fast processing)
      if (insurance.ocrProcessed) {
        if (insurance.ocrExtracted) {
          setOcrData(insurance.ocrExtracted);
          setOcrConfidence(insurance.ocrConfidence);
          setLowConfidenceFields(insurance.ocrLowConfidenceFields || []);
          setStatus(insurance.needsReview ? "needs_review" : "complete");

          // Notify parent component
          onOcrComplete?.(
            insurance.ocrExtracted,
            insurance.ocrConfidence || {}
          );

          saveToLocalStorage(insurance.ocrExtracted, insurance.ocrConfidence);
        }
      } else {
        // OCR processing in progress, wait for subscription
        setStatus("processing");
        setProcessingMessage("Analyzing insurance card...");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to upload images";
      setError(errorMessage);
      setStatus("error");
      onError?.(errorMessage);
    }
  }, [
    frontImage,
    backImage,
    sessionId,
    uploadMutation,
    onOcrComplete,
    onError,
    saveToLocalStorage,
  ]);

  /**
   * Resets all upload state
   */
  const reset = React.useCallback(() => {
    if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl);
    if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl);

    // Clear polling state
    if (pollIntervalId.current) {
      clearInterval(pollIntervalId.current);
      pollIntervalId.current = null;
    }
    subscriptionReceivedData.current = false;
    pollStartTime.current = null;

    setStatus("idle");
    setUploadProgress(0);
    setProcessingMessage(null);
    setFrontImageState(null);
    setBackImageState(null);
    setFrontPreviewUrl(null);
    setBackPreviewUrl(null);
    setOcrData(null);
    setOcrConfidence(null);
    setLowConfidenceFields([]);
    setError(null);
    setInsuranceId(null);
  }, [frontPreviewUrl, backPreviewUrl]);

  /**
   * Clears error state
   */
  const clearError = React.useCallback(() => {
    setError(null);
  }, []);

  /**
   * Cleanup preview URLs on unmount
   */
  React.useEffect(() => {
    return () => {
      if (frontPreviewUrl) URL.revokeObjectURL(frontPreviewUrl);
      if (backPreviewUrl) URL.revokeObjectURL(backPreviewUrl);
    };
  }, [frontPreviewUrl, backPreviewUrl]);

  return {
    status,
    uploadProgress,
    processingMessage,
    frontImage,
    backImage,
    frontPreviewUrl,
    backPreviewUrl,
    ocrData,
    ocrConfidence,
    lowConfidenceFields,
    error,
    setFrontImage,
    setBackImage,
    uploadImages,
    reset,
    clearError,
  };
}
