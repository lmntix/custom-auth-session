export type TimeSpanUnit = "ms" | "s" | "m" | "h" | "d" | "w";

export class TimeSpan {
  private _value: number;
  private _unit: TimeSpanUnit;

  constructor(value: number, unit: TimeSpanUnit) {
    this._value = value;
    this._unit = unit;
  }

  get value(): number {
    return this._value;
  }

  get unit(): TimeSpanUnit {
    return this._unit;
  }

  private convertTo(targetUnit: TimeSpanUnit): number {
    const conversionFactors: { [key in TimeSpanUnit]: number } = {
      ms: 1,
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
      w: 7 * 24 * 60 * 60 * 1000,
    };

    const milliseconds = this._value * conversionFactors[this._unit];
    return milliseconds / conversionFactors[targetUnit];
  }

  milliseconds(): number {
    return this.convertTo("ms");
  }

  seconds(): number {
    return this.convertTo("s");
  }

  minutes(): number {
    return this.convertTo("m");
  }

  hours(): number {
    return this.convertTo("h");
  }

  days(): number {
    return this.convertTo("d");
  }

  weeks(): number {
    return this.convertTo("w");
  }
}

/**
 * Creates a new Date by adding the provided time-span to the current time.
 * Mostly for defining expiration times. Supports negative time span.
 *
 * @param timeSpan The TimeSpan to add to the current time
 * @returns A new Date object
 */
export function createDate(timeSpan: TimeSpan): Date {
  const now = new Date();
  const millisToAdd = timeSpan.milliseconds();
  return new Date(now.getTime() + millisToAdd);
}

/**
 * Checks if the current time is before the provided expiration Date.
 * @param expirationDate The date to check against
 * @returns boolean True if the current time is before the expiration date, false otherwise
 */
export function isWithinExpirationDate(expirationDate: Date): boolean {
  const currentDate = new Date();
  return currentDate < expirationDate;
}
