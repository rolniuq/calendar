import { useMemo } from 'react';
import {
  getDaysInMonth,
  getFirstDayOfMonth,
  isSameDay,
  isToday,
  toDateString,
  MONTH_NAMES,
  DAY_ABBR,
} from '../utils/dateUtils';

const CATEGORY_COLORS = {
  work: '#3b82f6',
  study: '#8b5cf6',
  personal: '#10b981',
  health: '#f59e0b',
};

export default function MonthView({ year, month, events, selectedDate, onDayClick, onMonthChange }) {
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((e) => {
      if (!map[e.date]) map[e.date] = [];
      map[e.date].push(e);
    });
    return map;
  }, [events]);

  const cells = [];
  // Empty cells before first day
  for (let i = 0; i < firstDay; i++) {
    cells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(d);
  }

  const today = new Date();

  return (
    <div className="month-view">
      <div className="month-nav">
        <button className="nav-btn" onClick={() => onMonthChange(-1)}>‹</button>
        <h2 className="month-title">{MONTH_NAMES()[month]} {year}</h2>
        <button className="nav-btn" onClick={() => onMonthChange(1)}>›</button>
      </div>

      <div className="day-headers">
        {DAY_ABBR().map((d) => (
          <div key={d} className="day-header">{d}</div>
        ))}
      </div>

      <div className="month-grid">
        {cells.map((day, idx) => {
          if (!day) return <div key={`empty-${idx}`} className="day-cell empty" />;

          const dateObj = new Date(year, month, day);
          const dateStr = toDateString(dateObj);
          const dayEvents = eventsByDate[dateStr] || [];
          const todayFlag = isToday(dateObj);
          const selected = selectedDate && isSameDay(dateObj, selectedDate);
          const isPast = dateObj < new Date(today.getFullYear(), today.getMonth(), today.getDate());

          return (
            <div
              key={dateStr}
              className={`day-cell ${todayFlag ? 'today' : ''} ${selected ? 'selected' : ''} ${isPast ? 'past' : ''}`}
              onClick={() => onDayClick(dateObj)}
            >
              <span className="day-number">{day}</span>
              {dayEvents.length > 0 && (
                <div className="event-dots">
                  {dayEvents.slice(0, 3).map((e) => (
                    <span
                      key={e.id}
                      className="event-dot"
                      style={{ background: CATEGORY_COLORS[e.category] || CATEGORY_COLORS.personal }}
                    />
                  ))}
                  {dayEvents.length > 3 && (
                    <span className="event-dot-more">+{dayEvents.length - 3}</span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
