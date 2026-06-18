import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

const reports = {
  backend: {
    prefix: 'backend',
    reportPath: 'backend/coverage/lcov.info',
  },
  frontend: {
    prefix: 'frontend',
    reportPath: 'frontend/coverage/lcov.info',
  },
};

const selectedReports = process.argv.slice(2);
const reportKeys = selectedReports.length > 0 ? selectedReports : Object.keys(reports);

for (const reportKey of reportKeys) {
  const report = reports[reportKey];

  if (!report) {
    throw new Error(`Unknown LCOV report "${reportKey}". Use backend or frontend.`);
  }

  normalizeReport(reportKey, report);
}

function normalizeReport(reportKey, report) {
  const absoluteReportPath = resolve(repoRoot, report.reportPath);

  if (!existsSync(absoluteReportPath)) {
    throw new Error(`LCOV report not found: ${report.reportPath}`);
  }

  const originalContent = readFileSync(absoluteReportPath, 'utf8');
  const normalizedContent = originalContent.replace(/^SF:(.+)$/gm, (_line, sourcePath) => {
    const normalizedSourcePath = normalizeSourcePath(sourcePath, report.prefix);
    return `SF:${normalizedSourcePath}`;
  });

  if (normalizedContent !== originalContent) {
    writeFileSync(absoluteReportPath, normalizedContent);
  }

  const sourceFiles = normalizedContent
    .split(/\r?\n/)
    .filter((line) => line.startsWith('SF:'));

  console.log(
    `Normalized ${sourceFiles.length} ${reportKey} LCOV source paths in ${report.reportPath}`,
  );
  sourceFiles.slice(0, 3).forEach((line) => console.log(line));
}

function normalizeSourcePath(sourcePath, prefix) {
  const normalizedPath = sourcePath.trim().replace(/\\/g, '/').replace(/^\.\//, '');
  const prefixedSourceRoot = `${prefix}/src/`;

  if (normalizedPath.startsWith(prefixedSourceRoot)) {
    return normalizedPath;
  }

  const prefixedSourceRootIndex = normalizedPath.indexOf(`/${prefixedSourceRoot}`);

  if (prefixedSourceRootIndex >= 0) {
    return normalizedPath.slice(prefixedSourceRootIndex + 1);
  }

  if (normalizedPath.startsWith('src/')) {
    return `${prefix}/${normalizedPath}`;
  }

  return normalizedPath;
}
