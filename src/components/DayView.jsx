import { useMemo, useRef, useEffect } from 'react';
import { getDayEvents, toDateString, timeToMinutes, formatTime } from '../utils/dateUtils';
import { useClock } from '../hooks/useClock';

const CATEGORY_COLORS = {
  work: '#3b82f6',
  study: '#8b5cf6',
  personal: '#10b981',
  health: '#f59e0b',
};

const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am to 11pm

function formatHour(h) {
  if (h === 0) return '12 AM';
  if (h < 12) return `${h} AM`;
  if (h === 12) return '12 PM';
  return `${h - 12} PM`;
}

export default function DayView({ date, events, onSlotClick, onEventClick }) {
  const now = useClock();
  const dateStr = toDateString(date);
  const isToday = dateStr === toDateString(now);
  const dayEvents = useMemo(() => getDayEvents(events, dateStr), [events, dateStr]);
  const nowLineRef = useRef(null);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const dayStart = 6 * 60; // 6am
  const dayEnd = 24 * 60;   // midnight

  useEffect(() => {
    if (isToday && nowLineRef.current) {
      nowLineRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isToday]);

  function minutesToPct(min) {
    return ((min - dayStart) / (dayEnd - dayStart)) * 100;
  }

  function handleSlotClick(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickY = e.clientY - rect.top;
    const pct = clickY / rect.height;
    const minutes = Math.round((dayStart + pct * (dayEnd - dayStart)) / 15) * 15;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    const startTime = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    const endMinutes = Math.min(minutes + 60, dayEnd);
    const eh = Math.floor(endMinutes / 60);
    const em = endMinutes % 60;
    const endTime = `${String(eh).padStart(2, '0')}:${String(em).padStart(2, '0')}`;
    onSlotClick({ date: dateStr, startTime, endTime });
  }

  return (
    <div className="day-view">
      <div className="day-view-timeline" onClick={handleSlotClick}>
        {HOURS.map((h) => (
          <div key={h} className="hour-row" style={{ top: `${minutesToPct(h * 60)}%` }}>
            <span className="hour-label">{formatHour(h)}</span>
            <div className="hour-line" />
          </div>
        ))}

        {/* Now indicator */}
        {isToday && currentMinutes >= dayStart && currentMinutes <= dayEnd && (
          <div
            ref={nowLineRef}
            className="now-indicator"
            style={{ top: `${minutesToPct(currentMinutes)}%` }}
          >
            <span className="now-dot" />
            <div className="now-line" />
          </div>
        )}

        {/* Events */}
        {dayEvents.map((e) => {
          const startMin = timeToMinutes(e.startTime);
          const endMin = timeToMinutes(e.endTime || e.startTime) || startMin + 60;
          const top = minutesToPct(Math.max(startMin, dayStart));
          const height = minutesToPct(Math.min(endMin, dayEnd)) - top;
          const color = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.personal;
          const isPast = isToday && endMin < currentMinutes;

          return (
            <div
              key={e.id}
              className={`day-event ${isPast ? 'past' : ''}`}
              style={{
                top: `${top}%`,
                height: `${Math.max(height, 2)}%`,
                borderLeft: `3px solid ${color}`,
                backgroundColor: color + '18',
              }}
              onClick={(ev) => { ev.stopPropagation(); onEventClick(e); }}
            >
              <span className="day-event-title">{e.title || 'Untitled'}</span>
              {height > 3 && (
                <span className="day-event-time">
                  {formatTime(e.startTime)}
                  {e.endTime && ` – ${formatTime(e.endTime)}`}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
