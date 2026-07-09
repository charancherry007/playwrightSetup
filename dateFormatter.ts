/**
 * Returns the current system date/time converted to US Eastern Time.
 * Automatically handles EST/EDT based on the current date.
 *
 * @param format - Optional output format.
 * @returns Formatted EST/EDT date & time.
 */
export function getCurrentESTDateTime(
  format: "datetime" | "date" | "time" | "iso" = "datetime"
): string {
  const now = new Date();

  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };

  const formatter = new Intl.DateTimeFormat("en-US", options);

  switch (format) {
    case "date":
      return formatter.format(now).split(",")[0];

    case "time":
      return formatter.format(now).split(",")[1].trim();

    case "iso": {
      const parts = formatter.formatToParts(now);
      const get = (type: string) =>
        parts.find((p) => p.type === type)?.value ?? "";

      return `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get(
        "minute"
      )}:${get("second")}`;
    }

    default:
      return formatter.format(now);
  }
}

const estDateTime = getCurrentESTDateTime();
console.log(`Current EST Time: ${estDateTime}`);

const estDate = getCurrentESTDateTime("date");
console.log(`EST Date: ${estDate}`);

const estTime = getCurrentESTDateTime("time");
console.log(`EST Time: ${estTime}`);

const estISO = getCurrentESTDateTime("iso");
console.log(`EST ISO: ${estISO}`);