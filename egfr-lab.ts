export const getEGFR = (age, scr, isFemale) => {
  const k = isFemale ? 0.7 : 0.9;
  const a = isFemale ? -0.241 : -0.302;
  const a2 = -1.200;
  const p1 = Math.min(scr / k, 1);
  const p2 = Math.max(scr / k, 1);
  
  const egfr = 142 * Math.pow(p1, a) * Math.pow(p2, a2) * Math.pow(0.9938, age) * (isFemale ? 1.012 : 1);
  return egfr;
}
