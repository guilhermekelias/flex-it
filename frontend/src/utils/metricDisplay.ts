export function formatMetricValue(value: number | null, unit: string) {
  if (value === null || !Number.isFinite(value)) {
    return '--';
  }

  return `${value.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })} ${unit}`;
}

export function calculateBmi(weightKg: number | null, heightCm: number | null) {
  if (
    weightKg === null ||
    heightCm === null ||
    !Number.isFinite(weightKg) ||
    !Number.isFinite(heightCm) ||
    weightKg <= 0 ||
    heightCm <= 0
  ) {
    return '--';
  }

  const heightMeters = heightCm / 100;
  return (weightKg / heightMeters ** 2).toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
}
