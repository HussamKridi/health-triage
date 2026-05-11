import type {
  LocalAssessment,
  PatientProfile,
  TriageSafetyResponses,
  TriageSessionVitals,
  VitalBand,
} from "@/types";

function round(value: number, digits = 3) {
  return Number(value.toFixed(digits));
}

function getBmi(weight: number | null, height: number | null) {
  if (!weight || !height) {
    return null;
  }

  const heightMeters = height / 100;

  if (heightMeters <= 0) {
    return null;
  }

  return round(weight / (heightMeters * heightMeters), 2);
}

function getSpo2Band(spo2: number): VitalBand {
  if (spo2 <= 92) {
    return "critical";
  }

  if (spo2 <= 94) {
    return "elevated";
  }

  return "stable";
}

function getTemperatureBand(temperature: number): VitalBand {
  if (temperature >= 39 || temperature < 35.5) {
    return "critical";
  }

  if (temperature >= 37.8) {
    return "elevated";
  }

  return "stable";
}

function getHeartRateBand(heartRate: number): VitalBand {
  if (heartRate >= 120 || heartRate <= 45) {
    return "critical";
  }

  if (heartRate >= 100 || heartRate <= 55) {
    return "elevated";
  }

  return "stable";
}

export function buildLocalAssessment(
  profile: PatientProfile,
  vitals: TriageSessionVitals,
  safetyResponses: TriageSafetyResponses | null = null
): LocalAssessment {
  const bmi = getBmi(profile.weight, profile.height);
  const spo2Band = getSpo2Band(vitals.spo2);
  const temperatureBand = getTemperatureBand(vitals.temperature);
  const heartRateBand = getHeartRateBand(vitals.heartRate);
  const safetyAnswers = safetyResponses?.answers ?? [];
  const safetyYesCount = safetyAnswers.filter(
    (answer) => answer.answerValue === "yes"
  ).length;
  const chestPain = safetyAnswers.some(
    (answer) => answer.questionId === "chest-pain" && answer.answerValue === "yes"
  );
  const breathingDifficulty = safetyAnswers.some(
    (answer) =>
      answer.questionId === "breathing-difficulty" &&
      answer.answerValue === "yes"
  );

  const lowSpo2 = vitals.spo2 <= 94;
  const fever = vitals.temperature >= 37.8;
  const tachycardia = vitals.heartRate >= 100;
  const senior = (profile.age ?? 0) >= 65;
  const underweight = bmi !== null && bmi < 18.5;
  const obesity = bmi !== null && bmi >= 30;

  const usedSafetyOverride =
    vitals.spo2 <= 92 ||
    vitals.temperature >= 39 ||
    vitals.heartRate >= 130 ||
    vitals.heartRate <= 45;

  let probability = 0.06;

  if (lowSpo2) probability += 0.16;
  if (fever) probability += 0.08;
  if (tachycardia) probability += 0.08;
  if (senior) probability += 0.06;
  if (underweight) probability += 0.03;
  if (obesity) probability += 0.04;
  if (chestPain) probability += 0.22;
  if (breathingDifficulty) probability += 0.22;
  if (safetyYesCount >= 1) probability += safetyYesCount * 0.05;
  if (safetyYesCount >= 3) probability += 0.32;

  if (spo2Band === "critical") probability += 0.2;
  if (temperatureBand === "critical") probability += 0.16;
  if (heartRateBand === "critical") probability += 0.16;

  const highRiskProbability = usedSafetyOverride
    ? 0.95
    : Math.min(round(probability), 0.89);
  const riskLabel =
    highRiskProbability >= 0.325 || safetyYesCount >= 3 ? "High" : "Low";
  const isCrucial =
    usedSafetyOverride ||
    highRiskProbability >= 0.6 ||
    safetyYesCount >= 3 ||
    (chestPain && breathingDifficulty);

  const summaryParts = [
    `Baseline risk probability ${round(highRiskProbability * 100, 1)}%.`,
    `SpO2 is ${spo2Band}.`,
    `Temperature is ${temperatureBand}.`,
    `Heart rate is ${heartRateBand}.`,
  ];

  if (bmi !== null) {
    summaryParts.push(`BMI is ${bmi}.`);
  }

  if (safetyResponses) {
    summaryParts.push(
      `${safetyYesCount} of 5 safety questions were answered yes.`
    );
  }

  if (chestPain) {
    summaryParts.push("Chest pain or pressure was reported.");
  }

  if (breathingDifficulty) {
    summaryParts.push("Breathing difficulty was reported.");
  }

  if (safetyYesCount >= 3) {
    summaryParts.push("Three or more safety symptoms strongly increased risk.");
  }

  if (usedSafetyOverride) {
    summaryParts.push("A conservative safety override forced high-risk handling.");
  }

  return {
    riskLabel,
    highRiskProbability,
    usedSafetyOverride,
    isCrucial,
    summary: summaryParts.join(" "),
    signals: {
      bmi,
      lowSpo2,
      fever,
      tachycardia,
      senior,
      underweight,
      obesity,
      chestPain,
      breathingDifficulty,
      safetyYesCount,
      spo2Band,
      temperatureBand,
      heartRateBand,
    },
  };
}

