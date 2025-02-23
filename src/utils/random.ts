/**
 * Generates a random number with the specified number of digits.
 *
 * @param digits The number of digits in the generated number
 * @returns A random number as a string with the specified number of digits
 */
export function generateRandomNumber(digits: number): string {
  if (digits <= 0) {
    throw new Error("Number of digits must be a positive integer");
  }

  let result = "";
  for (let i = 0; i < digits; i++) {
    // For the first digit, we use 1-9 to avoid leading zeros
    const randomDigit =
      i === 0
        ? Math.floor(Math.random() * 9) + 1
        : Math.floor(Math.random() * 10);
    result += randomDigit;
  }

  return result;
}
