export function getMatchStatus(startTime, endTime) {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (now < start) {
    return 'scheduled';
  } else if (now >= start && now <= end) {
    return 'live';
  } else {
    return 'finished';
  }
}
