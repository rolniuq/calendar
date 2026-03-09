import { useState, useEffect } from 'react';
import { toDateString, formatTime } from '../utils/dateUtils';

const CATEGORIES = [
  { value: 'work', label: 'Work', color: '#3b82f6' },
  { value: 'study', label: 'Study', color: '#8b5cf6' },
  { value: 'personal', label: 'Personal', color: '#10b981' },
  { value: 'health', label: 'Health', color: '#f59e0b' },
];

export default function EventModal({ event, defaultDate, onSave, onDelete, onClose }) {
  const [form, setForm] = useState({
    title: '',
    date: defaultDate ? toDateString(defaultDate) : toDateString(new Date()),
    startTime: '09:00',
    endTime: '10:00',
    category: 'personal',
    note: '',
  });

  useEffect(() => {
    if (event) {
      setForm({
        title: event.title || '',
        date: event.date || toDateString(new Date()),
        startTime: event.startTime || '09:00',
        endTime: event.endTime || '10:00',
        category: event.category || 'personal',
        note: event.note || '',
      });
    }
  }, [event]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    onSave({ ...event, ...form });
  }

  function handleBackdrop(e) {
    if (e.target === e.currentTarget) onClose();
  }

  const isEdit = Boolean(event?.id);
  const activeCategory = CATEGORIES.find((c) => c.value === form.category);

  return (
    <div className="modal-backdrop" onClick={handleBackdrop}>
      <div className="modal">
        <div className="modal-header">
          <h3>{isEdit ? 'Edit Event' : 'New Event'}</h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <input
              className="form-input form-title"
              type="text"
              placeholder="What are you doing?"
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
              autoFocus
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                className="form-input"
                type="date"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Start</label>
              <input
                className="form-input"
                type="time"
                value={form.startTime}
                onChange={(e) => set('startTime', e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">End</label>
              <input
                className="form-input"
                type="time"
                value={form.endTime}
                onChange={(e) => set('endTime', e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Category</label>
            <div className="category-pills">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  className={`category-pill ${form.category === c.value ? 'active' : ''}`}
                  style={form.category === c.value ? { backgroundColor: c.color + '28', color: c.color, borderColor: c.color } : {}}
                  onClick={() => set('category', c.value)}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Note (optional)</label>
            <textarea
              className="form-input form-textarea"
              placeholder="Add a note..."
              value={form.note}
              onChange={(e) => set('note', e.target.value)}
              rows={3}
            />
          </div>

          <div className="modal-actions">
            {isEdit && (
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => onDelete(event.id)}
              >
                Delete
              </button>
            )}
            <div className="modal-actions-right">
              <button type="button" className="btn btn-ghost" onClick={onClose}>
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                style={{ backgroundColor: activeCategory?.color }}
              >
                {isEdit ? 'Save' : 'Add Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
