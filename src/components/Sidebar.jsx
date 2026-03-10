import { useMemo } from 'react';
import { getDailyQuote } from '../quotes';
import { getNextEvent, getMinutesUntil, formatTime, getDayEvents, toDateString, timeToMinutes } from '../utils/dateUtils';
import { useClock } from '../hooks/useClock';

const CATEGORY_COLORS = {
  work: '#3b82f6',
  study: '#8b5cf6',
  personal: '#10b981',
  health: '#f59e0b',
};

const CATEGORY_LABELS = {
  work: 'Work',
  study: 'Study',
  personal: 'Personal',
  health: 'Health',
};

function getUrgencyLevel(minutesUntil, isToday) {
  if (!isToday) return 'later';
  if (minutesUntil <= 0) return 'now';
  if (minutesUntil <= 15) return 'urgent';
  if (minutesUntil <= 30) return 'soon';
  return 'upcoming';
}

function UrgentWidget({ events, onEventClick }) {
  const now = useClock();
  const todayStr = toDateString(now);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  
  const urgentEvents = useMemo(() => {
    return events.filter(e => {
      if (e.date !== todayStr) return false;
      const startMin = timeToMinutes(e.startTime);
      const endMin = timeToMinutes(e.endTime) || startMin + 60;
      const minutesUntil = startMin - currentMinutes;
      const urgency = getUrgencyLevel(minutesUntil, true);
      return urgency === 'now' || urgency === 'urgent' || urgency === 'soon';
    }).sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  }, [events, todayStr, currentMinutes]);

  if (urgentEvents.length === 0) return null;

  return (
    <div className="widget urgent-widget">
      <div className="widget-label">⚡ URGENT</div>
      <ul className="urgent-list">
        {urgentEvents.map((e) => {
          const startMin = timeToMinutes(e.startTime);
          const minutesUntil = startMin - currentMinutes;
          const urgency = getUrgencyLevel(minutesUntil, true);
          const color = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.personal;
          
          let timeLabel;
          if (minutesUntil <= 0) timeLabel = 'NOW';
          else if (minutesUntil <= 15) timeLabel = `${minutesUntil}m left`;
          else timeLabel = `in ${minutesUntil}m`;

          return (
            <li
              key={e.id}
              className={`urgent-item urgency-${urgency}`}
              onClick={() => onEventClick(e)}
            >
              <div className="urgent-time" style={{ color }}>{timeLabel}</div>
              <div className="urgent-title">{e.title || 'Untitled'}</div>
              <div className="urgent-meta">
                <span>{formatTime(e.startTime)}</span>
                <span className="urgent-category" style={{ color: color + '99' }}>
                  {CATEGORY_LABELS[e.category]}
                </span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function NextUpWidget({ events, onEventClick }) {
  const now = useClock();
  const next = useMemo(() => getNextEvent(events), [events, now]);

  if (!next) {
    return (
      <div className="widget next-up-widget empty">
        <div className="widget-label">NEXT UP</div>
        <div className="next-up-empty">
          <span>✓</span>
          <p>All clear! No upcoming events.</p>
        </div>
      </div>
    );
  }

  const minutesUntil = getMinutesUntil(next.date, next.startTime);
  const isToday = next.date === toDateString(now);
  const urgency = getUrgencyLevel(minutesUntil, isToday);
  let timeLabel;

  if (minutesUntil <= 0) {
    timeLabel = 'NOW';
  } else if (minutesUntil < 60) {
    timeLabel = `in ${minutesUntil}m`;
  } else if (minutesUntil < 1440) {
    const h = Math.floor(minutesUntil / 60);
    const m = minutesUntil % 60;
    timeLabel = m > 0 ? `in ${h}h ${m}m` : `in ${h}h`;
  } else {
    const days = Math.floor(minutesUntil / 1440);
    timeLabel = `in ${days}d`;
  }

  const color = CATEGORY_COLORS[next.category] || CATEGORY_COLORS.personal;
  const isUrgent = urgency === 'now' || urgency === 'urgent';

  return (
    <div 
      className={`widget next-up-widget ${isUrgent ? 'urgent' : ''}`} 
      onClick={() => onEventClick(next)} 
      style={{ cursor: 'pointer' }}
    >
      <div className="widget-label">
        {isUrgent ? '⚡ COMING UP' : 'NEXT UP'}
      </div>
      <div className="next-up-content">
        <div className="next-up-time-badge" style={{ color }}>
          {timeLabel}
        </div>
        <div className="next-up-title">{next.title || 'Untitled'}</div>
        <div className="next-up-meta">
          <span className="next-up-clock">
            {formatTime(next.startTime)}
            {next.endTime && ` — ${formatTime(next.endTime)}`}
          </span>
          <span
            className="next-up-category"
            style={{ backgroundColor: color + '22', color }}
          >
            {CATEGORY_LABELS[next.category] || next.category}
          </span>
        </div>
        {!isToday && (
          <div className="next-up-date-label">{next.date}</div>
        )}
      </div>
    </div>
  );
}

function TodayList({ events, onEventClick }) {
  const now = new Date();
  const todayStr = toDateString(now);
  const todayEvents = useMemo(() => getDayEvents(events, todayStr), [events, todayStr]);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (todayEvents.length === 0) {
    return (
      <div className="widget today-list-widget">
        <div className="widget-label">TODAY</div>
        <p className="today-empty">No events scheduled.</p>
      </div>
    );
  }

  return (
    <div className="widget today-list-widget">
      <div className="widget-label">TODAY — {todayEvents.length} event{todayEvents.length > 1 ? 's' : ''}</div>
      <ul className="today-list">
        {todayEvents.map((e) => {
          const startMin = e.startTime ? parseInt(e.startTime.split(':')[0]) * 60 + parseInt(e.startTime.split(':')[1]) : 0;
          const isPast = startMin < currentMinutes;
          const color = CATEGORY_COLORS[e.category] || CATEGORY_COLORS.personal;
          return (
            <li
              key={e.id}
              className={`today-item ${isPast ? 'past' : ''}`}
              onClick={() => onEventClick(e)}
            >
              <span className="today-item-dot" style={{ background: color }} />
              <div className="today-item-body">
                <span className="today-item-title">{e.title || 'Untitled'}</span>
                <span className="today-item-time">{formatTime(e.startTime)}</span>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function QuoteWidget() {
  const quote = useMemo(() => getDailyQuote(), []);
  return (
    <div className="widget quote-widget">
      <div className="widget-label">DAILY QUOTE</div>
      <blockquote className="quote-text">"{quote.text}"</blockquote>
      <cite className="quote-author">— {quote.author}</cite>
    </div>
  );
}

export default function Sidebar({ events, onEventClick }) {
  return (
    <aside className="sidebar">
      <UrgentWidget events={events} onEventClick={onEventClick} />
      <NextUpWidget events={events} onEventClick={onEventClick} />
      <TodayList events={events} onEventClick={onEventClick} />
      <QuoteWidget />
    </aside>
  );
}
