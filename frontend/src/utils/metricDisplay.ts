export function formatMetricValue(value: number | null, unit: string) {
  if (value === null || !Number.isFinite(value)) {
    return '--';
  }

  return `${value.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  })} ${unit}`;
}

export function calculateBmiNumber(weightKg: number | null, heightCm: number | null): number | null {
  if (
    weightKg === null ||
    heightCm === null ||
    !Number.isFinite(weightKg) ||
    !Number.isFinite(heightCm) ||
    weightKg <= 0 ||
    heightCm <= 0
  ) {
    return null;
  }

  const heightMeters = heightCm / 100;
  return weightKg / heightMeters ** 2;
}

export function calculateBmi(weightKg: number | null, heightCm: number | null) {
  const bmi = calculateBmiNumber(weightKg, heightCm);

  if (bmi === null) {
    return '--';
  }

  return bmi.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
}

type MetricWeightSource = {
  weightKg: number | null;
};

export function getWeightTrend(metrics: MetricWeightSource[]) {
  const [latestMetric, previousMetric] = metrics.filter((metric) => metric.weightKg !== null);

  if (
    !latestMetric ||
    !previousMetric ||
    latestMetric.weightKg === null ||
    previousMetric.weightKg === null
  ) {
    return 'histórico em acompanhamento';
  }

  const difference = latestMetric.weightKg - previousMetric.weightKg;

  if (difference === 0) {
    return 'peso estável desde a última avaliação';
  }

  const formattedDifference = Math.abs(difference).toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });

  return `${difference > 0 ? '+' : '-'}${formattedDifference} kg desde a última avaliação`;
}

export function getScaledMetricChartPoints(values: number[]) {
  if (values.length === 0) {
    return [];
  }

  if (values.length === 1) {
    return [50];
  }

  const minimumValue = Math.min(...values);
  const maximumValue = Math.max(...values);

  if (minimumValue === maximumValue) {
    return values.map(() => 55);
  }

  return values.map((value) =>
    Math.round(30 + ((value - minimumValue) / (maximumValue - minimumValue)) * 55),
  );
}

export function getMetricChartPoints(metrics: MetricWeightSource[]) {
  const weightValues = metrics
    .slice(0, 6)
    .reverse()
    .map((metric) => metric.weightKg)
    .filter((weightKg): weightKg is number => weightKg !== null && Number.isFinite(weightKg));

  if (weightValues.length === 0) {
    return [28, 42, 56, 70];
  }

  return getScaledMetricChartPoints(weightValues);
}
