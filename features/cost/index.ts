/**
 * Cost feature module exports
 *
 * Central export point for cost estimation components, hooks, and utilities.
 */

// Main components
export { CostEstimationCard } from "./CostEstimationCard";
export type { CostEstimationCardProps } from "./CostEstimationCard";

export { SelfPayRateCard } from "./SelfPayRateCard";
export type { SelfPayRateCardProps } from "./SelfPayRateCard";

export { CostComparisonView } from "./CostComparisonView";
export type { CostComparisonViewProps } from "./CostComparisonView";

export { PaymentPlanModal } from "./PaymentPlanModal";
export type { PaymentPlanModalProps } from "./PaymentPlanModal";

// Enhanced cost comparison components
export { EnhancedCostComparisonView } from "./EnhancedCostComparisonView";
export type { EnhancedCostComparisonViewProps } from "./EnhancedCostComparisonView";

export { ComparisonDetailCard } from "./ComparisonDetailCard";
export type { ComparisonDetailCardProps } from "./ComparisonDetailCard";

export { RecommendationBanner } from "./RecommendationBanner";
export type { RecommendationBannerProps } from "./RecommendationBanner";

export { InsuranceCardThumbnail } from "./InsuranceCardThumbnail";
export type { InsuranceCardThumbnailProps } from "./InsuranceCardThumbnail";

export { InsuranceCardModal } from "./InsuranceCardModal";
export type { InsuranceCardModalProps } from "./InsuranceCardModal";

export { DeductibleTracker } from "./DeductibleTracker";
export type { DeductibleTrackerProps } from "./DeductibleTracker";

export { OutOfPocketTracker } from "./OutOfPocketTracker";
export type { OutOfPocketTrackerProps } from "./OutOfPocketTracker";

// Hooks
export { useCostEstimate } from "./useCostEstimate";
export type { UseCostEstimateResult } from "./useCostEstimate";

export { useSelfPayRates } from "./useSelfPayRates";
export type { UseSelfPayRatesResult } from "./useSelfPayRates";

export { usePaymentPlans } from "./hooks/usePaymentPlans";
export type { UsePaymentPlansResult } from "./hooks/usePaymentPlans";

export { useCostComparison } from "./hooks/useCostComparison";
export type {
  UseCostComparisonResult,
  InsuranceEstimateData,
  SelfPayEstimateData,
  DeductibleStatusData,
  InsuranceDetailsData,
  PackageOptionData,
  ComparisonRowData,
} from "./hooks/useCostComparison";
