export function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}

export function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isToday(date) {
  return isSameDay(date, new Date());
}

export function formatTime(timeStr) {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${period}`;
}

export function formatDate(date) {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function toDateString(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function getNextEvent(events) {
  const now = new Date();
  const todayStr = toDateString(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const upcoming = events
    .filter((e) => {
      if (e.date > todayStr) return true;
      if (e.date === todayStr && timeToMinutes(e.startTime) > currentMinutes) return true;
      return false;
    })
    .sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
    });

  return upcoming[0] || null;
}

export function getMinutesUntil(dateStr, timeStr) {
  const now = new Date();
  const [y, m, d] = dateStr.split('-').map(Number);
  const [h, min] = (timeStr || '00:00').split(':').map(Number);
  const target = new Date(y, m - 1, d, h, min);
  return Math.round((target - now) / 60000);
}

export function getDayEvents(events, dateStr) {
  return events
    .filter((e) => e.date === dateStr)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
}

export function MONTH_NAMES() {
  return ['January','February','March','April','May','June',
          'July','August','September','October','November','December'];
}

export function DAY_ABBR() {
  return ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
}
