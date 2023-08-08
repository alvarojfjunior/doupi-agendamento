
export const stringToFloat = (str: string): Number => {
  if (!str) return 0
  const numericValue = str.replace(/[^\d,]/g, '');
  const floatValue = parseFloat(numericValue.replace(',', '.'));
  return str.includes('-') ? floatValue *-1 : floatValue;
}

export function floatToString (numb: number): string {
  if (!numb || typeof numb !== 'number') {
    return '00,00'
  }
  const stringValue = numb.toFixed(2);
  const realValue = stringValue.replace('.', ',');
  return realValue;
}
