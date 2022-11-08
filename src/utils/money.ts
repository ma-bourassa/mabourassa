const formatter = Intl.NumberFormat('fr-CA', { style: 'currency', currency: 'CAD' });

export function toDollars(units: number): string {
  return formatter.format(units / 100);
}
