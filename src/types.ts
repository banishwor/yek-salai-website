/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type YekSalai = 
  | "Mangang" 
  | "Luwang" 
  | "Khuman" 
  | "Angom" 
  | "Moirang" 
  | "Kha-Nganba" 
  | "Chenglei";

export interface PersonClanData {
  surname: string;
  yek: string;
  motherSurname?: string;
  motherYek?: string;
}

export interface MarriageCheckInput {
  boy: {
    surname: string;
    yek: string;
    motherSurname: string;
    motherYek: string;
  };
  girl: {
    surname: string;
    yek: string;
    motherSurname: string;
    motherYek: string;
  };
  answers: {
    pendinnaba: "yes" | "no" | "dont_know";
    sharedGrandmother: "yes" | "no" | "dont_know";
    boyMoirangAriba: "yes" | "no" | "dont_know";
    girlMoirangAriba: "yes" | "no" | "dont_know";
  };
}

export type SeverityType = "reject" | "warning" | "info";

export interface RuleResult {
  id: string;
  title: string;
  severity: SeverityType;
  message: string;
}

export interface Rule {
  id: string;
  name: string;
  evaluate: (input: MarriageCheckInput) => RuleResult | null;
}

export type EligibilityStatus = 
  | "NOT ELIGIBLE" 
  | "MANUAL VERIFICATION REQUIRED" 
  | "ELIGIBLE BASED ON AVAILABLE DATA";

export interface EvaluationResult {
  status: EligibilityStatus;
  results: RuleResult[];
}

/**
 * Interface for the Data Repository to decouple the database storage 
 * implementation (JSON, Supabase, Postgres, REST etc.) from the application.
 */
export interface YumnakRepository {
  getAllSurnames(): string[];
  getYeksForSurname(surname: string): YekSalai[];
  isValidSurname(surname: string): boolean;
}
