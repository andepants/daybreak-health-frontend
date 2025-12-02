/**
 * Insurance feature exports
 *
 * Provides components and hooks for insurance information collection,
 * card upload with OCR, and confirmation display.
 */

export { InsuranceForm } from "./InsuranceForm";
export type { InsuranceFormProps } from "./InsuranceForm";

export { InsuranceCardUpload } from "./InsuranceCardUpload";
export type { InsuranceCardUploadProps } from "./InsuranceCardUpload";

export { CameraCapture } from "./CameraCapture";
export type { CameraCaptureProps } from "./CameraCapture";

export { InsuranceConfirmation } from "./InsuranceConfirmation";
export type { InsuranceConfirmationProps } from "./InsuranceConfirmation";

export { SelfPayModal } from "./SelfPayModal";
export type { SelfPayModalProps } from "./SelfPayModal";

export { useInsurance } from "./useInsurance";
export type {
  UseInsuranceReturn,
  UseInsuranceOptions,
  InsuranceInformation,
} from "./useInsurance";

export { useInsuranceCardUpload } from "./useInsuranceCardUpload";
export type {
  UseInsuranceCardUploadReturn,
  UseInsuranceCardUploadOptions,
  OcrExtractedData,
  OcrConfidenceData,
  UploadStatus,
} from "./useInsuranceCardUpload";

export { maskMemberId, formatVerificationStatus } from "./utils";

// Development-only components
export { DevTestCardButton } from "./DevTestCardButton";
export type { DevTestCardButtonProps } from "./DevTestCardButton";
