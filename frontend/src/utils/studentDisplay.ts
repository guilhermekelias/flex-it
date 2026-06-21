export function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

  return initials || 'AL';
}

export function formatAge(age: number) {
  return Number.isFinite(age) && age > 0 ? `${age} anos` : 'Idade não informada';
}
