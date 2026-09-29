export interface CalculateLoanParams {
  principal: number;
  annualRate: number;
  tenureMonths: number;
  interestType: "reducing_emi" | "flat_simple" | "zero_interest";
}

export function computeLoanMetrics({
  principal,
  annualRate,
  tenureMonths,
  interestType,
}: CalculateLoanParams) {
  const P = Math.max(0, Number(principal) || 0);
  const R = Math.max(0, Number(annualRate) || 0);
  const n = Math.max(1, Math.round(Number(tenureMonths) || 12));

  if (P === 0) {
    return { monthlyEmi: 0, totalInterest: 0, totalPayable: 0 };
  }

  if (interestType === "zero_interest" || R === 0) {
    const monthlyEmi = Math.round((P / n) * 100) / 100;
    return {
      monthlyEmi,
      totalInterest: 0,
      totalPayable: P,
    };
  }

  if (interestType === "flat_simple") {
    const years = n / 12;
    const totalInterest = Math.round(((P * R * years) / 100) * 100) / 100;
    const totalPayable = Math.round((P + totalInterest) * 100) / 100;
    const monthlyEmi = Math.round((totalPayable / n) * 100) / 100;
    return {
      monthlyEmi,
      totalInterest,
      totalPayable,
    };
  }

  // Standard Reducing Balance (Bank EMI)
  const monthlyRate = R / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, n);
  const monthlyEmi = Math.round(((P * monthlyRate * factor) / (factor - 1)) * 100) / 100;
  const totalPayable = Math.round((monthlyEmi * n) * 100) / 100;
  const totalInterest = Math.max(0, Math.round((totalPayable - P) * 100) / 100);

  return {
    monthlyEmi,
    totalInterest,
    totalPayable,
  };
}
