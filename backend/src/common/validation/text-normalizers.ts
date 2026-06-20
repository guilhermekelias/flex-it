import { BadRequestException } from '@nestjs/common';

export function normalizeRequiredText(value: unknown, errorMessage: string): string {
  if (typeof value !== 'string') {
    throw new BadRequestException(errorMessage);
  }

  const normalizedValue = value.trim();

  if (!normalizedValue) {
    throw new BadRequestException(errorMessage);
  }

  return normalizedValue;
}

export function normalizeOptionalShortText(
  value: unknown,
  errorMessage: string,
  maxLength: number,
): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  if (typeof value !== 'string' && typeof value !== 'number') {
    throw new BadRequestException(errorMessage);
  }

  const normalizedValue = String(value).trim();

  if (!normalizedValue) {
    return null;
  }

  if (normalizedValue.length > maxLength) {
    throw new BadRequestException(errorMessage);
  }

  return normalizedValue;
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function normalizeEmailField(
  value: unknown,
  requiredMessage: string,
  invalidMessage: string,
): string {
  const normalizedEmail = normalizeRequiredText(value, requiredMessage).toLowerCase();

  if (!isValidEmailAddress(normalizedEmail)) {
    throw new BadRequestException(invalidMessage);
  }

  return normalizedEmail;
}

export function isValidEmailAddress(email: string): boolean {
  const atIndex = email.indexOf('@');

  if (
    email.length > 254 ||
    containsWhitespace(email) ||
    atIndex <= 0 ||
    atIndex !== email.lastIndexOf('@') ||
    atIndex === email.length - 1
  ) {
    return false;
  }

  const localPart = email.slice(0, atIndex);
  const domain = email.slice(atIndex + 1);

  if (
    !localPart ||
    !domain ||
    domain.startsWith('.') ||
    domain.endsWith('.') ||
    !domain.includes('.')
  ) {
    return false;
  }

  return domain.split('.').every((part) => part.length > 0);
}

function containsWhitespace(value: string): boolean {
  for (const character of value) {
    if (character.trim() === '') {
      return true;
    }
  }

  return false;
}
