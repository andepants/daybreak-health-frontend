/**
 * Demographics feature module exports
 *
 * Re-exports all components and types for parent, child, and clinical intake
 * information collection.
 */

export { ParentInfoForm, type ParentInfoFormProps } from "./ParentInfoForm";
export { ChildInfoForm, type ChildInfoFormProps } from "./ChildInfoForm";
export {
  ClinicalIntakeForm,
  type ClinicalIntakeFormProps,
} from "./ClinicalIntakeForm";
export {
  useDemographicsSave,
  type UseDemographicsSaveReturn,
  type UseDemographicsSaveOptions,
  type ParentInfoData,
  type ChildInfoData,
} from "./useDemographicsSave";
