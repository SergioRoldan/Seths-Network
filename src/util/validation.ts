//Check if str can be a number
export function canBeNumber(str: string): boolean {
  if (!str) {
    return false;
  }
  return !isNaN(+str);
}

//Check if str can be a number and can be an Ethereum address (has a length of 42 and is hexa)
export function canBeAddress(str: string): boolean { 
  if (!canBeNumber)
    return false;
  
  return (str.length == 42 && str.substr(0,2) == '0x');
}

//Check if str can be a number and can be a Ethereum signature (has a length of 132 and is hexa)
export function canBeSignature(str: string): boolean{
  if(!canBeNumber)
    return false;

  return (str.length == 132 && str.substr(0,2) == '0x');
}

//Check if str can be a number and can be in days format (is bigger than 0 and is an integer)
export function canBeDays(str: string): boolean {
  if (!canBeNumber)
    return false;

  if(+str < 0 || !Number.isInteger(+str)) 
    return false;

  return true;
}

