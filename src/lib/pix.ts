export type PixKeyType = "cpf" | "email" | "phone" | "random";

function normalizeText(value: string) {
  return value.trim();
}

function stripAccents(value: string) {
  return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "");
}

function validateCpf(cpf: string) {
  const digits = cpf.replace(/\D/g, "");
  if (digits.length !== 11) return false;
  if (/^(\d)\1+$/.test(digits)) return false;

  const checkDigit = (base: string, weights: number[]) => {
    const total = base
      .split("")
      .reduce((sum, digit, index) => sum + Number(digit) * weights[index], 0);
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = checkDigit(digits.slice(0, 9), [
    10, 9, 8, 7, 6, 5, 4, 3, 2,
  ]);
  const secondDigit = checkDigit(digits.slice(0, 10), [
    11, 10, 9, 8, 7, 6, 5, 4, 3, 2,
  ]);
  return digits.endsWith(`${firstDigit}${secondDigit}`);
}

export function normalizePixKeyValue(pixKeyType: PixKeyType, pixKey: string) {
  const rawValue = normalizeText(pixKey);

  if (pixKeyType === "cpf") {
    return rawValue.replace(/\D/g, "");
  }

  if (pixKeyType === "email") {
    return rawValue.toLowerCase();
  }

  if (pixKeyType === "phone") {
    const digits = rawValue.replace(/\D/g, "");
    if (
      digits.startsWith("55") &&
      (digits.length === 12 || digits.length === 13)
    ) {
      return `+${digits}`;
    }
    if (digits.length === 10 || digits.length === 11) {
      return `+55${digits}`;
    }
    return rawValue;
  }

  return rawValue;
}

function normalizePixText(value: string, maxLength: number) {
  return stripAccents(normalizeText(value))
    .replace(/\s+/g, " ")
    .slice(0, maxLength)
    .toUpperCase();
}

function emv(tag: string, value: string) {
  return `${tag}${value.length.toString().padStart(2, "0")}${value}`;
}

function crc16(payload: string) {
  const polynomial = 0x1021;
  let crc = 0xffff;

  for (let index = 0; index < payload.length; index += 1) {
    crc ^= payload.charCodeAt(index) << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      if (crc & 0x8000) {
        crc = ((crc << 1) ^ polynomial) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }

  return crc.toString(16).toUpperCase().padStart(4, "0");
}

export function buildPixPayload(
  pixKeyType: PixKeyType,
  pixKey: string,
  recipientName: string,
  amount: number,
) {
  const normalizedKey = normalizePixKeyValue(pixKeyType, pixKey);
  const name = normalizePixText(recipientName, 25);
  const txid = "***";
  const amountStr = amount.toFixed(2);

  const merchantAccountInfo = [
    emv("00", "BR.GOV.BCB.PIX"),
    emv("01", normalizedKey),
  ].join("");

  const payloadWithoutCrc = [
    emv("00", "01"),
    emv("01", "12"),
    emv("26", merchantAccountInfo),
    emv("52", "0000"),
    emv("53", "986"),
    emv("54", amountStr),
    emv("58", "BR"),
    emv("59", name),
    emv("60", "BRASILIA"),
    emv("62", emv("05", txid)),
    "6304",
  ].join("");

  return `${payloadWithoutCrc}${crc16(payloadWithoutCrc)}`;
}

export function getPixKeyFormatted(pixKeyType: PixKeyType, pixKey: string): string {
  if (pixKeyType === "phone") {
    const digits = pixKey.replace(/\D/g, "");
    const cleanDigits = digits.startsWith("55") ? digits : `${digits}`;
    const ddd = cleanDigits.slice(0, 2);
    const part1 = cleanDigits.slice(2, 7);
    const part2 = cleanDigits.slice(7);
    return `(${ddd}) ${part1}-${part2}`;
  }

  if (pixKeyType === "cpf") {
    const digits = pixKey.replace(/\D/g, "");
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  return pixKey;
}
