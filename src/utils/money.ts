const formatter = Intl.NumberFormat('fr-CA', {
  style: 'currency',
  currency: 'CAD',
  currencyDisplay: 'narrowSymbol',
  maximumFractionDigits: 0,
});

export function toDollars(units: number): string {
  return formatter.format(units / 100);
}
