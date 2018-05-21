export function canBeNumber(str: string): boolean {
  if (!str) {
    return false;
  }
  return !isNaN(+str);
}

export function canBeAddress(str: string): boolean { 
  if (!canBeNumber)
    return false;
  
  return str.length == 42;
}

export function canBeDays(str: string): boolean {
  if (!canBeNumber)
    return false;

  if(+str < 0 || !Number.isInteger(+str)) 
    return false;

  return true;
}

