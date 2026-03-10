import { useState, useRef } from 'react';
import { useClock } from '../hooks/useClock';
import { formatDate } from '../utils/dateUtils';
import { exportData, importData } from '../utils/storage';

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

export default function Header({ reloadEvents }) {
  const now = useClock();
  const greeting = getGreeting(now.getHours());
  const fileInputRef = useRef(null);
  const [importMessage, setImportMessage] = useState('');

  const timeStr = now.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const handleExport = () => {
    exportData();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importData(file);
      setImportMessage('Import successful!');
      reloadEvents();
      setTimeout(() => setImportMessage(''), 2000);
    } catch (err) {
      setImportMessage('Import failed: ' + err.message);
      setTimeout(() => setImportMessage(''), 3000);
    }
    e.target.value = '';
  };

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-greeting">{greeting} 👋</span>
        <span className="header-date">{formatDate(now)}</span>
      </div>
      <div className="header-right">
        {importMessage && <span className="import-message">{importMessage}</span>}
        <button className="sync-btn" onClick={handleExport} title="Export backup">
          ⬆️ Export
        </button>
        <button className="sync-btn" onClick={handleImportClick} title="Import backup">
          ⬇️ Import
        </button>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImport}
          accept=".json"
          style={{ display: 'none' }}
        />
        <div className="header-clock">{timeStr}</div>
      </div>
    </header>
  );
}
