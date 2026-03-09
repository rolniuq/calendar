import { useClock } from '../hooks/useClock';
import { formatDate } from '../utils/dateUtils';

const GREETINGS = [
  [5, 'Good morning'],
  [12, 'Good afternoon'],
  [17, 'Good evening'],
  [21, 'Good night'],
];

function getGreeting(hour) {
  for (let i = GREETINGS.length - 1; i >= 0; i--) {
    if (hour >= GREETINGS[i][0]) return GREETINGS[i][1];
  }
  return 'Hello';
}

export default function Header() {
  const now = useClock();
  const greeting = getGreeting(now.getHours());

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-greeting">{greeting} 👋</span>
        <span className="header-date">{formatDate(now)}</span>
      </div>
      <div className="header-clock">{timeStr}</div>
    </header>
  );
}
