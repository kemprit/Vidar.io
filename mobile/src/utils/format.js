// All dates are shown in Mauritius time so they match payroll records,
// regardless of the timezone the device happens to be set to.
const TZ = 'Indian/Mauritius';

export const fmtDate = (d, opts = {day: 'numeric', month: 'short'}) =>
  d ? new Date(d).toLocaleDateString('en-MU', {timeZone: TZ, ...opts}) : '—';

export const greeting = () => {
  const h = Number(new Date().toLocaleString('en-GB', {timeZone: TZ, hour: '2-digit', hour12: false}));
  if (h < 12) {return 'Good morning,';}
  if (h < 18) {return 'Good afternoon,';}
  return 'Good evening,';
};

export const trustLabel = s => (s >= 750 ? 'Excellent' : s >= 650 ? 'Good' : 'Fair');
