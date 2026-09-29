/**
 * Converts a numeric amount to Indian currency words format.
 * Example: 250500 -> "Rupees Two Lakh Fifty Thousand Five Hundred Only"
 */

const ones = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const tens = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function twoDigitsToWords(n: number): string {
  if (n === 0) return "";
  if (n < 20) return ones[n];
  const t = Math.floor(n / 10);
  const o = n % 10;
  return `${tens[t]}${o ? " " + ones[o] : ""}`;
}

function threeDigitsToWords(n: number): string {
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const hStr = h ? `${ones[h]} Hundred` : "";
  const remStr = twoDigitsToWords(rem);
  if (hStr && remStr) return `${hStr} and ${remStr}`;
  return hStr || remStr;
}

export function numberToWordsIndian(amount: number): string {
  const num = Math.round(Math.abs(amount));
  if (num === 0) return "Rupees Zero Only";

  let result = "";

  const crore = Math.floor(num / 10000000);
  const remCrore = num % 10000000;

  const lakh = Math.floor(remCrore / 100000);
  const remLakh = remCrore % 100000;

  const thousand = Math.floor(remLakh / 1000);
  const remThousand = remLakh % 1000;

  const remainder = remThousand;

  if (crore > 0) {
    result += `${numberToWordsIndian(crore).replace("Rupees ", "").replace(" Only", "")} Crore `;
  }

  if (lakh > 0) {
    result += `${twoDigitsToWords(lakh)} Lakh `;
  }

  if (thousand > 0) {
    result += `${twoDigitsToWords(thousand)} Thousand `;
  }

  if (remainder > 0) {
    result += `${threeDigitsToWords(remainder)} `;
  }

  return `Rupees ${result.trim()} Only`;
}
