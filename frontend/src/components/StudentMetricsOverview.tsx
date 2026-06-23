import type { Metric } from '../services/api';
import { formatObservationDate } from '../utils/formatObservationDate';
import {
  calculateBmi,
  calculateBmiNumber,
  formatMetricValue,
  getScaledMetricChartPoints,
} from '../utils/metricDisplay';

type StudentMetricsOverviewProps = {
  error: string;
  isLoading: boolean;
  metrics: Metric[];
};

type MetricChartOption = {
  title: string;
  unit: string;
  getValue: (metric: Metric) => number | null;
};

const MAX_CHART_ITEMS = 6;
const MAX_HISTORY_ITEMS = 6;

function isValidMetricNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function getMetricTimestamp(metric: Metric) {
  const timestamp = Date.parse(metric.recordedAt || metric.updatedAt || metric.createdAt);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getOrderedMetrics(metrics: Metric[]) {
  return [...metrics].sort((metricA, metricB) => {
    const timestampDifference = getMetricTimestamp(metricB) - getMetricTimestamp(metricA);
    return timestampDifference !== 0 ? timestampDifference : metricB.id - metricA.id;
  });
}

function formatShortDate(value: string) {
  return formatObservationDate(value).split(',')[0];
}

function formatChartValue(value: number, unit: string) {
  if (unit) {
    return formatMetricValue(value, unit);
  }

  return value.toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  });
}

function getWeightVariation(metrics: Metric[]) {
  const [latestMetric, previousMetric] = metrics.filter((metric) =>
    isValidMetricNumber(metric.weightKg),
  );

  if (!latestMetric || !previousMetric || latestMetric.weightKg === null || previousMetric.weightKg === null) {
    return {
      detail: 'aguardando histórico',
      value: '--',
    };
  }

  const difference = latestMetric.weightKg - previousMetric.weightKg;

  if (difference === 0) {
    return {
      detail: 'peso estável',
      value: '0 kg',
    };
  }

  const formattedDifference = Math.abs(difference).toLocaleString('pt-BR', {
    maximumFractionDigits: 1,
    minimumFractionDigits: 0,
  });

  return {
    detail: 'desde a avaliação anterior',
    value: `${difference > 0 ? '+' : '-'}${formattedDifference} kg`,
  };
}

function getMetricChart(metrics: Metric[]) {
  const chartOptions: MetricChartOption[] = [
    {
      title: 'Evolução do peso',
      unit: 'kg',
      getValue: (metric) => metric.weightKg,
    },
    {
      title: 'Evolução da gordura corporal',
      unit: '%',
      getValue: (metric) => metric.bodyFatPercentage,
    },
    {
      title: 'Evolução da massa muscular',
      unit: 'kg',
      getValue: (metric) => metric.muscleMassKg,
    },
    {
      title: 'Evolução do IMC',
      unit: '',
      getValue: (metric) => calculateBmiNumber(metric.weightKg, metric.heightCm),
    },
  ];

  for (const option of chartOptions) {
    const chartSource = metrics
      .reduce<Array<{ metric: Metric; value: number }>>((items, metric) => {
        const value = option.getValue(metric);

        if (isValidMetricNumber(value)) {
          items.push({ metric, value });
        }

        return items;
      }, [])
      .slice(0, MAX_CHART_ITEMS)
      .reverse();

    if (chartSource.length > 0) {
      const heights = getScaledMetricChartPoints(chartSource.map((item) => item.value));

      return {
        points: chartSource.map((item, index) => ({
          date: formatShortDate(item.metric.recordedAt),
          height: heights[index],
          id: item.metric.id,
          value: formatChartValue(item.value, option.unit),
        })),
        title: option.title,
      };
    }
  }

  return null;
}

function getMetricHistoryItems(metric: Metric) {
  return [
    {
      label: 'Peso',
      value: formatMetricValue(metric.weightKg, 'kg'),
    },
    {
      label: 'IMC',
      value: calculateBmi(metric.weightKg, metric.heightCm),
    },
    {
      label: 'Gordura',
      value: formatMetricValue(metric.bodyFatPercentage, '%'),
    },
    {
      label: 'Massa',
      value: formatMetricValue(metric.muscleMassKg, 'kg'),
    },
  ];
}

export function StudentMetricsOverview({
  error,
  isLoading,
  metrics,
}: StudentMetricsOverviewProps) {
  if (error) {
    return <p className="student-portal-card-note">{error}</p>;
  }

  if (isLoading) {
    return <p className="student-portal-card-note">Carregando métricas...</p>;
  }

  const orderedMetrics = getOrderedMetrics(metrics);
  const latestMetric = orderedMetrics[0] ?? null;
  const latestWeightMetric =
    orderedMetrics.find((metric) => isValidMetricNumber(metric.weightKg)) ?? null;

  if (!latestMetric) {
    return (
      <div className="student-metrics-empty">
        <strong>Aguardando primeira avaliação</strong>
        <p>
          Suas métricas ainda não foram registradas. Quando seu profissional adicionar uma
          avaliação, sua evolução aparecerá aqui.
        </p>
      </div>
    );
  }

  const weightVariation = getWeightVariation(orderedMetrics);
  const chart = getMetricChart(orderedMetrics);
  const recentMetrics = orderedMetrics.slice(0, MAX_HISTORY_ITEMS);
  const summaryCards = [
    {
      detail: latestWeightMetric
        ? `registrado em ${formatShortDate(latestWeightMetric.recordedAt)}`
        : 'sem peso registrado',
      label: 'Peso',
      value: latestWeightMetric ? formatMetricValue(latestWeightMetric.weightKg, 'kg') : '--',
    },
    {
      detail: 'última avaliação',
      label: 'Última avaliação',
      value: formatShortDate(latestMetric.recordedAt),
    },
    {
      detail: weightVariation.detail,
      label: 'Variação',
      value: weightVariation.value,
    },
    {
      detail: orderedMetrics.length === 1 ? 'avaliação cadastrada' : 'avaliações cadastradas',
      label: 'Registros',
      value: String(orderedMetrics.length),
    },
  ];

  return (
    <div className="student-metrics-overview">
      <section className="student-metrics-summary-grid" aria-label="Resumo das métricas">
        {summaryCards.map((card) => (
          <div className="student-metrics-summary-card" key={card.label}>
            <span>{card.label}</span>
            <strong>{card.value}</strong>
            <small>{card.detail}</small>
          </div>
        ))}
      </section>

      <section className="student-metrics-chart-card" aria-label="Gráfico de evolução">
        <div className="student-metrics-section-heading">
          <div>
            <span className="student-portal-kicker">Histórico visual</span>
            <h3>{chart?.title ?? 'Evolução das métricas'}</h3>
          </div>
          <span className="student-metrics-chart-pill">
            {chart
              ? `${chart.points.length} ${chart.points.length === 1 ? 'registro' : 'registros'}`
              : 'sem valores'}
          </span>
        </div>

        {chart ? (
          <>
            <div
              aria-label={`${chart.title}: ${chart.points
                .map((point) => `${point.date} ${point.value}`)
                .join('; ')}`}
              className="student-metrics-chart-bars"
            >
              {chart.points.map((point) => (
                <span
                  aria-hidden="true"
                  className="student-metrics-chart-bar"
                  key={point.id}
                  style={{ height: `${point.height}%` }}
                  title={`${point.date}: ${point.value}`}
                />
              ))}
            </div>
            <div className="student-metrics-chart-labels" aria-hidden="true">
              {chart.points.map((point) => (
                <span key={`${point.id}-${point.date}`}>{point.date}</span>
              ))}
            </div>
          </>
        ) : (
          <p className="student-metrics-chart-empty">
            Ainda não há valores numéricos suficientes para montar o gráfico.
          </p>
        )}
      </section>

      <section className="student-metrics-history" aria-label="Histórico recente de métricas">
        <div className="student-metrics-section-heading">
          <div>
            <span className="student-portal-kicker">Histórico recente</span>
            <h3>Últimas avaliações</h3>
          </div>
        </div>

        <div className="student-metrics-history-list">
          {recentMetrics.map((metric) => (
            <article className="student-metrics-history-item" key={metric.id}>
              <div className="student-metrics-history-heading">
                <strong>Avaliação de {formatShortDate(metric.recordedAt)}</strong>
                <span>IMC {calculateBmi(metric.weightKg, metric.heightCm)}</span>
              </div>

              <div className="student-metrics-history-meta">
                {getMetricHistoryItems(metric).map((item) => (
                  <span key={item.label}>
                    {item.label} {item.value}
                  </span>
                ))}
              </div>

              {metric.notes && <p>{metric.notes}</p>}
              <small>Atualizado em {formatObservationDate(metric.updatedAt)}</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
