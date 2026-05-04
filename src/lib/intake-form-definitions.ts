export type CheckboxDef = { id: string; label: string };

/** Matches “NEW PATIENT INTAKE FORM 2024” wording. */
export const FAMILY_HISTORY: CheckboxDef[] = [
  { id: "asthma", label: "Asthma" },
  { id: "alcoholism", label: "Alcoholism" },
  { id: "arteriosclerosis", label: "Arteriosclerosis" },
  { id: "depression", label: "Depression" },
  { id: "heart_disease", label: "Heart Disease" },
  { id: "stroke", label: "Stroke" },
  { id: "hypertension", label: "High Blood Pressure" },
  { id: "diabetes", label: "Diabetes – Type:" },
  { id: "seizures", label: "Seizures" },
  { id: "cancer", label: "Cancer:" },
  { id: "allergies", label: "Allergies:" },
  { id: "others", label: "Others:" },
];

export const PAST_MEDICAL: CheckboxDef[] = [
  { id: "aids_hiv", label: "AIDS/HIV" },
  { id: "alcoholism", label: "Alcoholism" },
  { id: "allergies", label: "Allergies" },
  { id: "appendicitis", label: "Appendicitis" },
  { id: "arteriosclerosis", label: "Arteriosclerosis" },
  { id: "asthma", label: "Asthma" },
  { id: "chicken_pox", label: "Chicken Pox" },
  { id: "emphysema", label: "Emphysema" },
  { id: "epilepsy", label: "Epilepsy" },
  { id: "goiter", label: "Goiter" },
  { id: "gout", label: "Gout" },
  { id: "heart_disease", label: "Heart Disease" },
  { id: "hypertension", label: "Hypertension" },
  { id: "measles", label: "Measles" },
  { id: "pleurisy", label: "Pleurisy" },
  { id: "pneumonia", label: "Pneumonia" },
  { id: "polio", label: "Polio" },
  { id: "seizures", label: "Seizures" },
  { id: "stroke", label: "Stroke" },
  { id: "tuberculosis", label: "Tuberculosis" },
  { id: "cancer", label: "Cancer:" },
  { id: "diabetes", label: "Diabetes Type –" },
  { id: "hepatitis", label: "Hepatitis Type –" },
  { id: "herpes", label: "Herpes Type –" },
  { id: "major_trauma", label: "Major Trauma:" },
  { id: "pacemaker", label: "Pace Maker – Date:" },
  { id: "rheumatic_fever", label: "Rheumatic Fever" },
  { id: "surgery", label: "Surgery:" },
  { id: "thyroid", label: "Thyroid Disorders" },
  { id: "ulcers", label: "Ulcers" },
  { id: "others", label: "Others:" },
];

export const PAST_MEDICAL_NOTE_KEYS = [
  { id: "cancer", label: "Cancer" },
  { id: "diabetes", label: "Diabetes type" },
  { id: "hepatitis", label: "Hepatitis type" },
  { id: "herpes", label: "Herpes type" },
  { id: "major_trauma", label: "Major trauma" },
  { id: "pacemaker", label: "Pacemaker date" },
  { id: "surgery", label: "Surgery" },
  { id: "others", label: "Others" },
] as const;

export const SAFETY_FLAGS: CheckboxDef[] = [
  { id: "haemophiliac", label: "Haemophiliac" },
  { id: "anticoagulant", label: "Taking anticoagulant medications" },
  { id: "pacemaker", label: "Wear a pacemaker" },
  { id: "heart_lung", label: "Serious heart or lung condition" },
  { id: "contagious", label: "Contagious illness" },
  { id: "cancer", label: "Cancer" },
];

export const ORGAN_SECTIONS: { title: string; items: CheckboxDef[] }[] = [
  {
    title: "LUNG SYSTEM",
    items: [
      { id: "lung_shortness", label: "Shortness of breath" },
      { id: "lung_env_allergy", label: "Environmental allergies" },
      { id: "lung_sleep_apnea", label: "Sleep apnea" },
      { id: "lung_asthma", label: "Breathing difficulties, asthma" },
      { id: "lung_cough", label: "Cough" },
      { id: "lung_cough_dry", label: "Dry" },
      { id: "lung_cough_phlegmy", label: "Phlegmy" },
      { id: "lung_sinus", label: "Sinus issues, post nasal drip" },
    ],
  },
  {
    title: "KIDNEYS/ BLADDER",
    items: [
      { id: "kid_dark_urine", label: "Dark scanty urination" },
      { id: "kid_gray_hair", label: "Premature gray hair" },
      { id: "kid_night_urine", label: "Getting up at night to urinate" },
      { id: "kid_strong_smell", label: "Strong smelling urine" },
      { id: "kid_hair_loss", label: "Hair loss" },
      { id: "kid_edema", label: "Edema of the lower legs" },
      { id: "kid_pain_urine", label: "Painful urination (burning pain)" },
      { id: "kid_frequent", label: "Frequent urgent urination" },
      { id: "kid_incontinence", label: "Bladder incontinence" },
    ],
  },
  {
    title: "SPLEEN SYSTEM",
    items: [
      { id: "spl_mental_fatigue", label: "Mental Fatigue" },
      { id: "spl_poor_appetite", label: "Poor appetite" },
      { id: "spl_cravings", label: "Cravings: sweet – salty – greasy foods" },
      { id: "spl_bloating", label: "Bloating after meals" },
      { id: "spl_food_sens", label: "Food Sensitivities" },
      { id: "spl_special_diet", label: "On a special diet:" },
    ],
  },
  {
    title: "STOMACH SYSTEM",
    items: [
      { id: "stm_canker", label: "Canker sores: mouth – tongue" },
      { id: "stm_dry_mouth", label: "Dry mouth" },
      { id: "stm_reflux", label: "Acid Reflux – heartburn" },
      { id: "stm_breath_gums", label: "Foul smelling breath – bleeding gums" },
      { id: "stm_hunger", label: "Constant hunger" },
      { id: "stm_nausea", label: "Nausea – vomiting" },
    ],
  },
  {
    title: "LARGE INTESTINE",
    items: [
      { id: "li_constipation", label: "Constipation" },
      { id: "li_sticky", label: "Sticky stools" },
      { id: "li_undigested", label: "Undigested food in the stool" },
      { id: "li_diarrhea", label: "Diarrhea" },
      { id: "li_loose", label: "Loose stools" },
      { id: "li_urgent_pain", label: "Urgent painful diarrhea" },
      { id: "li_unfinished", label: "Unfinished feeling after bowel" },
      { id: "li_pebble", label: "Hard, small, dry pebble – like stools" },
      { id: "li_blood", label: "Smelly diarrhea – blood in stool" },
    ],
  },
  {
    title: "VISION AND HEARING",
    items: [
      { id: "vh_tinnitus", label: "Tinnitus:" },
      { id: "vh_tinnitus_high", label: "High pitch" },
      { id: "vh_tinnitus_low", label: "Low pitch" },
      { id: "vh_night_vision", label: "Poor vision at night" },
      { id: "vh_eye_twitch", label: "Eye twitch" },
      { id: "vh_ear", label: "Ear pain/ Ear feeling stuffy" },
      { id: "vh_dry_eyes", label: "Dry eyes" },
      { id: "vh_dizziness", label: "Dizziness" },
      { id: "vh_floaters", label: "Floaters - spots" },
      { id: "vh_blur", label: "Blurred vision" },
      { id: "vh_deafness", label: "Deafness" },
    ],
  },
  {
    title: "SKIN HEALTH",
    items: [
      { id: "skin_history", label: "History of skin issues" },
      { id: "skin_greasy", label: "Greasy skin" },
      { id: "skin_dry", label: "Dry skin" },
      { id: "skin_psoriasis", label: "Psoriasis" },
      { id: "skin_acne", label: "Acne: Location" },
      { id: "skin_eczema", label: "Eczema: Location" },
      { id: "skin_rashes", label: "Rashes" },
    ],
  },
];

/** Order matches the Word “10 QUESTION SONG” block (pulse positions first). */
export const TEN_QUESTION_KEYS: { id: string; label: string }[] = [
  { id: "cun_l", label: "Cun" },
  { id: "guan_l", label: "Guan" },
  { id: "chi_l", label: "Chi" },
  { id: "cun_r", label: "Cun" },
  { id: "guan_r", label: "Guan" },
  { id: "chi_r", label: "Chi" },
  { id: "hot_cold", label: "Hot/cold/chills/fever" },
  { id: "sweat", label: "Sweat" },
  { id: "head_body", label: "Head and body" },
  { id: "stool_urine", label: "Stool and Urine" },
  { id: "food_drink", label: "Food and drink" },
  { id: "chest", label: "Chest" },
  { id: "hearing", label: "Hearing" },
  { id: "thirst", label: "Thirst" },
  { id: "sleep", label: "Sleep" },
  { id: "old_diseases", label: "Old diseases" },
  { id: "cause", label: "Cause" },
  {
    id: "medications",
    label: "Recently taking any medication or vitamins/ supplement? If yes, indicate what medication and why?",
  },
];

export const CONSENT_SPECIAL: CheckboxDef[] = [
  { id: "pregnant", label: "Pregnant" },
  { id: "cancer", label: "Cancer" },
  { id: "hepatitis_b", label: "Hepatitis B" },
  { id: "aids_hiv", label: "AIDS/HIV" },
  { id: "seizures", label: "Seizures" },
  { id: "faints", label: "Faints/ funny turns" },
  { id: "bleeding", label: "Bleeding disorder" },
  { id: "pacemaker", label: "Pacemaker" },
  { id: "local_infection", label: "Local infection" },
  { id: "implants", label: "artificial implants" },
  { id: "metal_plates", label: "Metal plates" },
  { id: "metal_allergy", label: "Allergic to metal" },
  { id: "anticoagulants", label: "Taking anticoagulants" },
];

export function mapFromDefs(defs: CheckboxDef[]): Record<string, boolean> {
  return defs.reduce<Record<string, boolean>>((acc, d) => {
    acc[d.id] = false;
    return acc;
  }, {});
}

export function mapFromSections(sections: { items: CheckboxDef[] }[]): Record<string, boolean> {
  return sections.reduce<Record<string, boolean>>((acc, sec) => {
    sec.items.forEach((i) => {
      acc[i.id] = false;
    });
    return acc;
  }, {});
}
