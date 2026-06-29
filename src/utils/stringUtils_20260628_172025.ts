export const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const truncateString = (str: string, num: number) => {
  if (str.length <= num) return str;
  return str.slice(0, num) + '...';
};
