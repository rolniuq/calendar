import { useState } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import MonthView from './components/MonthView';
import DayView from './components/DayView';
import EventModal from './components/EventModal';
import { useEvents } from './hooks/useEvents';
import { DAY_ABBR, MONTH_NAMES } from './utils/dateUtils';

export default function App() {
  const { events, addEvent, updateEvent, deleteEvent } = useEvents();
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  const [modal, setModal] = useState(null);

  function openCreate(opts = {}) {
    setModal({ mode: 'create', ...opts });
  }

  function openEdit(event) {
    setModal({ mode: 'edit', event });
  }

  function closeModal() {
    setModal(null);
  }

  function handleSave(formData) {
    if (modal?.mode === 'edit' && modal.event?.id) {
      updateEvent(modal.event.id, formData);
    } else {
      addEvent(formData);
    }
    closeModal();
  }

  function handleDelete(id) {
    deleteEvent(id);
    closeModal();
  }

  function handleDayClick(date) {
    setSelectedDate(date);
    setView('day');
  }

  function handleMonthChange(delta) {
    let m = viewMonth + delta;
    let y = viewYear;
    if (m < 0) { m = 11; y--; }
    if (m > 11) { m = 0; y++; }
    setViewMonth(m);
    setViewYear(y);
  }

  function goToday() {
    const today = new Date();
    setSelectedDate(today);
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setView('day');
  }

  const dayLabel = `${DAY_ABBR()[selectedDate.getDay()]}, ${MONTH_NAMES()[selectedDate.getMonth()]} ${selectedDate.getDate()}`;

  return (
    <div className="app">
      <Header />

      <div className="app-body">
        <Sidebar events={events} onEventClick={openEdit} />

        <main className="main">
          <div className="main-toolbar">
            <div className="view-tabs">
              <button
                className={`view-tab ${view === 'month' ? 'active' : ''}`}
                onClick={() => setView('month')}
              >
                Month
              </button>
              <button
                className={`view-tab ${view === 'day' ? 'active' : ''}`}
                onClick={() => setView('day')}
              >
                Day
              </button>
            </div>

            {view === 'day' && (
              <div className="day-nav">
                <button className="nav-btn" onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d);
                }}>‹</button>
                <span className="day-nav-label">{dayLabel}</span>
                <button className="nav-btn" onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d);
                }}>›</button>
              </div>
            )}

            <div className="toolbar-right">
              <button className="btn btn-ghost btn-sm" onClick={goToday}>Today</button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => openCreate({ defaultDate: view === 'day' ? selectedDate : new Date() })}
              >
                + Add
              </button>
            </div>
          </div>

          <div className="main-content">
            {view === 'month' ? (
              <MonthView
                year={viewYear}
                month={viewMonth}
                events={events}
                selectedDate={selectedDate}
                onDayClick={handleDayClick}
                onMonthChange={handleMonthChange}
              />
            ) : (
              <DayView
                date={selectedDate}
                events={events}
                onSlotClick={(slot) => openCreate({ defaultDate: selectedDate, ...slot })}
                onEventClick={openEdit}
              />
            )}
          </div>
        </main>
      </div>

      {modal && (
        <EventModal
          event={modal.mode === 'edit' ? modal.event : null}
          defaultDate={modal.defaultDate || selectedDate}
          defaultSlot={modal}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
