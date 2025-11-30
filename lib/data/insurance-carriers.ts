/**
 * Insurance carriers data for the carrier dropdown
 *
 * Contains a list of major US insurance carriers with ID format hints
 * to help users enter their member IDs correctly.
 */

/**
 * Insurance carrier type definition
 */
export interface InsuranceCarrier {
  id: string;
  name: string;
  idFormat: string;
}

/**
 * List of supported insurance carriers
 *
 * Includes top 20+ US insurance carriers ordered alphabetically
 * with ID format hints for user guidance.
 */
export const INSURANCE_CARRIERS: InsuranceCarrier[] = [
  { id: "aetna", name: "Aetna", idFormat: "W followed by 9 digits" },
  { id: "amerihealth", name: "AmeriHealth", idFormat: "9-12 alphanumeric" },
  { id: "anthem", name: "Anthem Blue Cross", idFormat: "3 letters + 9 digits" },
  { id: "bcbs", name: "Blue Cross Blue Shield", idFormat: "3 letters + 9-12 digits" },
  { id: "carefirst", name: "CareFirst", idFormat: "9-12 alphanumeric" },
  { id: "centene", name: "Centene", idFormat: "10-12 alphanumeric" },
  { id: "cigna", name: "Cigna", idFormat: "U followed by 8 digits" },
  { id: "coventry", name: "Coventry Health Care", idFormat: "9-12 alphanumeric" },
  { id: "emblem", name: "EmblemHealth", idFormat: "9-11 alphanumeric" },
  { id: "geisinger", name: "Geisinger Health Plan", idFormat: "9-12 digits" },
  { id: "hap", name: "Health Alliance Plan (HAP)", idFormat: "9-10 digits" },
  { id: "healthnet", name: "Health Net", idFormat: "9-12 alphanumeric" },
  { id: "highmark", name: "Highmark", idFormat: "3 letters + 9 digits" },
  { id: "humana", name: "Humana", idFormat: "H followed by 8 digits" },
  { id: "independence", name: "Independence Blue Cross", idFormat: "3 letters + 9 digits" },
  { id: "kaiser", name: "Kaiser Permanente", idFormat: "8-10 digits" },
  { id: "medicaid", name: "Medicaid", idFormat: "Varies by state" },
  { id: "medicare", name: "Medicare", idFormat: "11 alphanumeric (MBI format)" },
  { id: "molina", name: "Molina Healthcare", idFormat: "9-12 alphanumeric" },
  { id: "oscar", name: "Oscar Health", idFormat: "9-12 alphanumeric" },
  { id: "premera", name: "Premera Blue Cross", idFormat: "3 letters + 9 digits" },
  { id: "regence", name: "Regence", idFormat: "3 letters + 9 digits" },
  { id: "tricare", name: "TRICARE", idFormat: "DoD Benefits Number (11 digits)" },
  { id: "united", name: "UnitedHealthcare", idFormat: "9-11 alphanumeric" },
  { id: "wellcare", name: "WellCare", idFormat: "9-12 alphanumeric" },
  { id: "other", name: "Other", idFormat: "Check your insurance card" },
];

/**
 * Filter carriers by search query
 *
 * @param query - Search string to filter carriers
 * @returns Filtered list of carriers matching the query
 */
export function filterCarriers(query: string): InsuranceCarrier[] {
  if (!query.trim()) {
    return INSURANCE_CARRIERS;
  }

  const lowerQuery = query.toLowerCase();
  return INSURANCE_CARRIERS.filter(
    (carrier) =>
      carrier.name.toLowerCase().includes(lowerQuery) ||
      carrier.id.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Get carrier by ID
 *
 * @param id - Carrier ID to look up
 * @returns Carrier object or undefined if not found
 */
export function getCarrierById(id: string): InsuranceCarrier | undefined {
  return INSURANCE_CARRIERS.find((carrier) => carrier.id === id);
}
