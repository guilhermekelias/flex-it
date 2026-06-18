const API_DATE_TIME_WITHOUT_TIMEZONE_PATTERN =
  /^(\d{4}-\d{2}-\d{2})[T ](\d{2}:\d{2}:\d{2}(?:\.\d+)?)$/;
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat('pt-BR', {
  timeZone: 'America/Sao_Paulo',
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function parseApiDate(value: string): Date {
  const normalizedValue = value.trim();
  const dateTimeWithoutTimezoneMatch = normalizedValue.match(
    API_DATE_TIME_WITHOUT_TIMEZONE_PATTERN,
  );

  if (dateTimeWithoutTimezoneMatch) {
    const [, datePart, timePart] = dateTimeWithoutTimezoneMatch;
    return new Date(`${datePart}T${timePart}Z`);
  }

  return new Date(normalizedValue);
}

export function formatObservationDate(value: string): string {
  const date = parseApiDate(value);

  if (Number.isNaN(date.getTime())) {
    return 'Data nao informada';
  }

  return DATE_TIME_FORMATTER.format(date);
}
