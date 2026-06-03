/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { MarriageCheckInput, RuleResult, EvaluationResult, EligibilityStatus } from "../types";

/**
 * Standard Rule Engine to compute Meitei Yek Salai marriage eligibility.
 * Implements strict customary definitions includingSame Yek, Maternal match,
 * Same Surname / Different Yek, and Traditional Elder questionnaire answers.
 * 
 * @param input Normalized family and clan details of the couple
 * @returns Resulting status along with individual check reports
 */
export const evaluateMarriageEligibility = (input: MarriageCheckInput): EvaluationResult => {
  const results: RuleResult[] = [];

  // Normalize inputs to prevent whitespace/casing disparities
  const bYek = input.boy.yek.trim();
  const gYek = input.girl.yek.trim();
  const bMotherYek = input.boy.motherYek.trim();
  const gMotherYek = input.girl.motherYek.trim();

  const bSurname = input.boy.surname.trim().toLocaleLowerCase();
  const gSurname = input.girl.surname.trim().toLocaleLowerCase();

  // 1. HARD REJECT CHECK: Same Yek
  if (bYek === gYek) {
    results.push({
      id: "same_yek_reject",
      title: "Same Yek Salai Check",
      severity: "reject",
      message: `❌ Same Yek Salai detected (${input.boy.yek}). Traditional Meitei custom strictly prohibits marriages within the same Yek (clan) as they are considered siblings (Sinnaba).`
    });
    
    // Stop further evaluation since same Yek is an absolute barrier
    return {
      status: "NOT ELIGIBLE",
      results
    };
  } else {
    results.push({
      id: "same_yek_pass",
      title: "Yek Exogamy Rule",
      severity: "info",
      message: `✓ Different Yek Salai: Boy belongs to "${input.boy.yek}" and Girl belongs to "${input.girl.yek}". Marriage eligibility criteria under primary clan exogamy is satisfied.`
    });
  }

  // 2. WARNING RULES: Maternal Clan Matches
  // Warning 1: Boy's mother's clan equals girl's clan
  if (bMotherYek && bMotherYek === gYek) {
    results.push({
      id: "warn_boy_mother_girl_yek",
      title: "Maternal Clan Warning (Boy's Mother & Girl)",
      severity: "warning",
      message: `⚠️ Boy's maternal clan (${input.boy.motherYek}) matches the Girl's clan. Further family elders' verification is highly advised.`
    });
  }

  // Warning 2: Girl's mother's clan equals boy's clan
  if (gMotherYek && gMotherYek === bYek) {
    results.push({
      id: "warn_girl_mother_boy_yek",
      title: "Maternal Clan Warning (Girl's Mother & Boy)",
      severity: "warning",
      message: `⚠️ Girl's maternal clan (${input.girl.motherYek}) matches the Boy's clan. Further family elders' verification is highly advised.`
    });
  }

  // Warning 3: Boy's mother's clan equals girl's mother's clan
  if (bMotherYek && gMotherYek && bMotherYek === gMotherYek) {
    results.push({
      id: "warn_shared_maternal_clan",
      title: "Shared Maternal Clan Match",
      severity: "warning",
      message: `⚠️ Both maternal clans are the same (${input.boy.motherYek}). Possible close maternal relationship or lineage overlapping. Further family verification is advised.`
    });
  }

  // 3. SHAIRUK TINABA CUSTOMARY PROSCRIPTIONS
  
  // Group 1: The Mangang Salai Exceptions
  // Intermarriage is permanently prohibited among: Mungyamcham, Lairencham/Lairenjam, Kanghujam
  const mangangExceptions = ["mungyamcham", "lairencham", "lairenjam", "kanghujam"];
  if (mangangExceptions.includes(bSurname) && mangangExceptions.includes(gSurname)) {
    results.push({
      id: "shairuk_g1_mangang_exceptions",
      title: "Shairuk Tinaba: Mangang Salai Exception Proscription",
      severity: "warning",
      message: `⚠️ Shairuk Tinaba: Intermarriage is permanently prohibited among the specific surnames Mungyamcham, Lairencham/Lairenjam, and Kanghujam, even though they belong to the same primary clan.`
    });
  }

  // Group 2: The Moirang-Angom Proscription
  // Moirang Anouba: Thokchom, Moirangmayum, Lairenmayum, Lombam
  // Cannot marry anyone from Angom Salai (all surnames of Angom clan)
  const moirangAnouba = ["thokchom", "moirangmayum", "lairenmayum", "lombam"];
  const boyIsAnouba = moirangAnouba.includes(bSurname);
  const girlIsAnouba = moirangAnouba.includes(gSurname);
  const boyIsAngom = bYek === "Angom";
  const girlIsAngom = gYek === "Angom";

  if ((boyIsAnouba && girlIsAngom) || (girlIsAnouba && boyIsAngom)) {
    results.push({
      id: "shairuk_g2_moirang_angom",
      title: "Shairuk Tinaba: Moirang Anouba & Angom Proscription",
      severity: "warning",
      message: `⚠️ Shairuk Tinaba: Members with Moirang Anouba lineage (including Thokchom, Moirangmayum, Lairenmayum, Lombam) are traditionally prohibited from marrying members of the Angom clan (Yek).`
    });
  }

  // Group 3: The Inter-Clan Origin Bloc
  // Anyone from these 4 groups cannot marry each other:
  // a) Sarang Leishangthem (Chenglei) Clan
  // b) Khaba Nganba Clan
  // c) Haorok Konthou Lineage (surnames: Haorokcham/Haorokjam, Konthoucham/Konthoujam, Amakcham)
  // d) Moirang Ariba Lineage (User-reported tracing under Moirang clan check)
  const getG3Category = (person: { surname: string; yek: string }, isAriba: boolean): string | null => {
    const pSurname = person.surname.trim().toLocaleLowerCase();
    const pYek = person.yek.trim();

    if (pYek === "Chenglei") return "Sarang Leishangthem (Chenglei) Clan";
    if (pYek === "Kha-Nganba") return "Khaba Nganba Clan";
    if (["haorokcham", "haorokjam", "konthoucham", "konthoujam", "amakcham"].includes(pSurname)) return "Haorok Konthou Lineage";
    if (pYek === "Moirang" && isAriba) return "Moirang Ariba Lineage";
    return null;
  };

  const boyG3 = getG3Category(input.boy, input.answers.boyMoirangAriba === "yes");
  const girlG3 = getG3Category(input.girl, input.answers.girlMoirangAriba === "yes");

  if (boyG3 && girlG3) {
    results.push({
      id: "shairuk_g3_inter_clan_origin",
      title: "Shairuk Tinaba: Inter-Clan Origin Bloc",
      severity: "warning",
      message: `⚠️ Shairuk Tinaba: Marriage is permanently restricted across the Inter-Clan Origin Bloc. Boy belongs to "${boyG3}" and Girl belongs to "${girlG3}".`
    });
  }

  // Group 4: The Khaba-Angom Exceptions
  // Achom, Yumlembam, Hidam, and Langmaithem cannot marry each other
  const khabaAngomExceptions = ["achom", "yumlembam", "hidam", "langmaithem"];
  if (khabaAngomExceptions.includes(bSurname) && khabaAngomExceptions.includes(gSurname)) {
    results.push({
      id: "shairuk_g4_khaba_angom_exceptions",
      title: "Shairuk Tinaba: Khaba-Angom Surname Exceptions",
      severity: "warning",
      message: `⚠️ Shairuk Tinaba: Marriage is traditionally forbidden between individuals holding any of these specific surnames: Achom, Yumlembam, Hidam, and Langmaithem.`
    });
  }

  // 4. INFORMATIONAL RULES
  // Same Surname Different Yek
  if (bSurname === gSurname) {
    results.push({
      id: "info_same_surname_diff_yek",
      title: "Same Surname, Different Yek",
      severity: "info",
      message: `ℹ️ Same surname ("${input.boy.surname}") detected but selected clans are different (${input.boy.yek} & ${input.girl.yek}). This is not automatically prohibited based on Yek, but additional family elder verification is recommended.`
    });
  }

  // 4. TRADITIONAL FAMILY QUESTIONNAIRE RULES
  // Question 1: Pendinnaba
  if (input.answers.pendinnaba === "yes") {
    results.push({
      id: "warn_pendinnaba",
      title: "Traditional Elder Knowledge (Pendinnaba)",
      severity: "warning",
      message: "⚠️ Traditional restriction: Family elders have identified this alliance as Pendinnaba (customarily prohibited maternal relationship recognized through family genealogy)."
    });
  }

  // Question 2: Shared Grandmother
  if (input.answers.sharedGrandmother === "yes") {
    results.push({
      id: "warn_shared_grandmother",
      title: "Immediate Maternal Lineage",
      severity: "warning",
      message: "⚠️ High Risk: The couple shares a maternal grandmother, meaning their mothers are sisters. This represents a close maternal cousin coupling, traditionally prohibited."
    });
  }

  // 5. DECISION LOGIC TO PRODUCE THE FINAL OUTCOME
  const anyWarning = results.some(r => r.severity === "warning");
  const questionnaireYes = input.answers.pendinnaba === "yes" || input.answers.sharedGrandmother === "yes";

  let status: EligibilityStatus;

  if (anyWarning || questionnaireYes) {
    status = "MANUAL VERIFICATION REQUIRED";
  } else {
    status = "ELIGIBLE BASED ON AVAILABLE DATA";
  }

  return {
    status,
    results
  };
};
