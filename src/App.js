import React, { useState, useEffect } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { uthmEvents } from './calendarData';
import { FaSun, FaMoon, FaCalendarAlt, FaListUl, FaWhatsapp, FaSearch, FaFilePdf } from 'react-icons/fa';
import './App.css';

const App = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [view, setView] = useState('calendar');
  const [searchTerm, setSearchTerm] = useState('');
  const [displayEvents, setDisplayEvents] = useState(uthmEvents);

  // Filter logic for search
  useEffect(() => {
    const results = uthmEvents.filter(event =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setDisplayEvents(results);
  }, [searchTerm]);

  const shareToWhatsapp = (event) => {
    const dateStr = new Date(event.start).toLocaleDateString('en-MY', { day: 'numeric', month: 'long' });
    const text = `📌 UTHM Academic Date:\n✨ ${event.title}\n📅 ${dateStr}\n\nCheck it out here!`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const addToGoogleCalendar = (event) => {
    const formatDate = (date) => new Date(date).toISOString().replace(/-|:|\.\d+/g, '');
    const start = formatDate(event.start);
    const end = event.end ? formatDate(event.end) : start;
    
    const gCalUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent('Academic Date for UTHM Sesi 2025/2026')}&sf=true&output=xml`;
    
    window.open(gCalUrl, '_blank');
  };

  const downloadPDF = () => {
    // This looks for the file in your 'public' folder
    const link = document.createElement('a');
    link.href = '/Kalendar_Akademik_BM-01.pdf'; 
    link.download = 'UTHM_Academic_Calendar_25_26.pdf';
    link.click();
  };

  return (
    <div className={`app-container ${darkMode ? 'dark' : ''}`}>
      <header className="glass-header">
        <div className="logo-section">
          <FaCalendarAlt className="icon-main" />
          <h1>UTHM <span>Cuti</span></h1>
        </div>
        <div className="header-actions">
          <button className="download-btn" onClick={downloadPDF} title="Download Official PDF">
            <FaFilePdf /> PDF
          </button>
          <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
        <button className="theme-toggle" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <FaSun /> : <FaMoon />}
        </button>
      </header>

      <div className="search-bar-container">
        <div className="search-input-wrapper">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search events (e.g., 'Exam', 'Raya', 'Break')..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="control-panel">
        <div className="view-switcher">
          <button className={view === 'calendar' ? 'active' : ''} onClick={() => setView('calendar')}>
            <FaCalendarAlt /> Calendar
          </button>
          <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}>
            <FaListUl /> List View
          </button>
        </div>
      </div>

      <main className="content-area">
        {view === 'calendar' ? (
          /* CALENDAR VIEW */
          <div className="calendar-card">
            <FullCalendar
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              events={displayEvents}
              height="auto"
              eventClick={(info) => shareToWhatsapp(info.event)}
              eventClassNames={(arg) => [`event-${arg.event.extendedProps.category}`]}
            />
          </div>
        ) : (
          /* LIST VIEW */
          <div className="list-view">
            {displayEvents.length > 0 ? (
              displayEvents.map(event => (
                <div key={event.id} className={`list-card border-${event.extendedProps.category}`}>
                  <div className="list-info">
                    <h3>{event.title}</h3>
                    <p>{new Date(event.start).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                  </div>
                  <div className="list-actions">
                    <button className="gcal-btn" onClick={() => addToGoogleCalendar(event)}>
                      + Google Cal
                    </button>
                    <button className="share-btn" onClick={() => shareToWhatsapp(event)}>
                      <FaWhatsapp /> Share
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">No events found for "{searchTerm}"</div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;