export const validateWalletAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

export const validateBTCWalletAddress = (_address: string): boolean => {
  return true;
  // return /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$/.test(address);
};