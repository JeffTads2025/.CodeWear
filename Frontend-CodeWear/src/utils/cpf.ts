export const sanitizeCPF = (value: string): string => value.replace(/\D/g, '');

export const maskCPF = (value: string): string => {
  return sanitizeCPF(value)
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})/, '$1-$2')
    .replace(/(-\d{2})\d+?$/, '$1');
};

export const validateCPF = (value: string): boolean => {
  const cleanCPF = sanitizeCPF(value);

  if (cleanCPF.length !== 11 || /^(\d)\1{10}$/.test(cleanCPF)) {
    return false;
  }

  let sum = 0;

  for (let index = 0; index < 9; index += 1) {
    sum += Number(cleanCPF.charAt(index)) * (10 - index);
  }

  let checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) {
    checkDigit = 0;
  }

  if (checkDigit !== Number(cleanCPF.charAt(9))) {
    return false;
  }

  sum = 0;

  for (let index = 0; index < 10; index += 1) {
    sum += Number(cleanCPF.charAt(index)) * (11 - index);
  }

  checkDigit = 11 - (sum % 11);
  if (checkDigit >= 10) {
    checkDigit = 0;
  }

  return checkDigit === Number(cleanCPF.charAt(10));
};