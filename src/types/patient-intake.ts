export type IntakeFormType = "new_patient" | "follow_up";

/** Pain point placed on the intake body diagram (back / front / side). */
export type BodyPainMarker = {
  id: string;
  view: "back" | "front" | "side";
  /** 0–100 within that figure column. */
  xPct: number;
  /** 0–100 within the diagram height. */
  yPct: number;
  /** "1" … "10", or "" until the user picks a level after placing the point. */
  painLevel: string;
};

export type WomenIntakeFields = {
  pregnant: "" | "yes" | "no";
  ageOfMenarche: string;
  lastPeriodDate: string;
  durationFlow: string;
  cycleDays: string;
  periodDetails: Record<string, boolean>;
  periodColor: string;
};

/** “PATIENT INTAKE” page from the Word pack (follow-up visit). */
export type FollowUpIntakePayload = {
  intakeDate: string;
  patientName: string;
  age: string;
  sex: "M" | "F" | "";
  chiefComplaints: string;
  tonguePulse: string;
  presentIllnessHistory: string;
  tenQuestionSong: Record<string, string>;
  painLevel: string;
  women: WomenIntakeFields;
  tcmDiagnosis: string;
  treatmentPrinciple: string;
  treatmentMethods: string;
  notes: string;
};

export type NewPatientIntakePayload = {
  intakeDate: string;
  /** “Diabetes – Type:” line on family history. */
  familyDiabetesType: string;
  personal: {
    name: string;
    age: string;
    dateOfBirth: string;
    address: string;
    sex: "male" | "female" | "";
    maritalStatus: string;
    contactNo: string;
    occupation: string;
    emergencyContactName: string;
    emergencyContactNo: string;
  };
  familyHistory: Record<string, boolean>;
  pastMedical: Record<string, boolean>;
  pastMedicalNotes: Record<string, string>;
  safetyFlags: Record<string, boolean>;
  organSystems: Record<string, boolean>;
  consent: {
    acknowledged: boolean;
    specialConditions: Record<string, boolean>;
    /** Printed name in the consent statement (“I … the patient”). */
    patientPrintedName: string;
    signerName: string;
    signerRole: string;
    signedDate: string;
  };
  clinical: {
    chiefComplaints: string;
    tonguePulse: string;
    presentIllnessHistory: string;
    tenQuestionSong: Record<string, string>;
    painLevel: string;
    women: WomenIntakeFields;
    tcmDiagnosis: string;
    treatmentMethods: string;
    treatmentPrinciples: string;
    notes: string;
    /** Skin section location lines (Word form). */
    skinAcneLocation: string;
    skinEczemaLocation: string;
    skinRashesNotes: string;
    /** “On a special diet:” (spleen system). */
    onSpecialDietNotes: string;
    /** Interactive body-diagram pain points (saved with intake). */
    bodyPainMarkers: BodyPainMarker[];
  };
};
