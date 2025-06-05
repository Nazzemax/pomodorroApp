export const getExpiryTimestamp = (seconds: number): Date => {
  const date = new Date();
  date.setSeconds(date.getSeconds() + seconds);
  return date;
};
