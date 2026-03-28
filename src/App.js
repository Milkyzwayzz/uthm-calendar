import React, { useState } from 'react';
import { uthmEvents } from './calendarData';
import { FaDownload, FaWhatsapp, FaComment } from 'react-icons/fa';
import './App.css';

const App = () => {
  const [activeSem, setActiveSem] = useState(1);
  const [viewMode, setViewMode] = useState('calendar');
  const [theme, setTheme] = useState('dark');
  const [posterModal, setPosterModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [cursor, setCursor] = useState({
    x: 0,
    y: 0,
    type: 'default'
  });

  const isJohorWeekend = (day) => day === 5 || day === 6;

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleWhatsAppShare = () => {
    const message = "Check out UTHM Academic Calendar 📅✨";
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(message + " " + url)}`, '_blank');
  };

  const handleFeedbackSubmit = () => {
    if (!feedbackInput.trim()) return;
    setFeedbacks([...feedbacks, feedbackInput]);
    setFeedbackInput('');
    setFeedbackModal(false);
  };

  const handleDownload = () => {
    const url = "https://amo.uthm.edu.my/images/USPG/Kalendar_Akaademik_2025/Kalendar_Akademik_BM-01.pdf";
    const link = document.createElement('a');
    link.href = url;
    link.download = "UTHM_Academic_Calendar_2025-2026.pdf";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter events by category
  const filteredEvents = uthmEvents.filter(ev =>
    activeFilter === 'all' || ev.extendedProps.category === activeFilter
  );

  const renderMonth = (month, year) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    let tiles = [];

    for (let i = 0; i < offset; i++) {
      tiles.push(<div key={`empty-${i}`} className="tile empty" />);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = dateObj.toISOString().split('T')[0];

      const events = filteredEvents.filter(e =>
        dateStr >= e.start && dateStr <= (e.end || e.start)
      );

      tiles.push(
        <div
          key={d}
          className={`tile ${isJohorWeekend(dateObj.getDay()) ? 'weekend' : ''}`}
          onMouseMove={(e) => {
            if (events.length > 0) {
              setCursor(prev => ({
                ...prev,
                x: e.clientX,
                y: e.clientY,
                type: events[0].extendedProps.category
              }));
            } else {
              setCursor(prev => ({
                ...prev,
                x: e.clientX,
                y: e.clientY,
                type: 'default'
              }));
            }
          }}
        >
          <span className="day-num">{d}</span>
          <div className="dots">
            {events.map((ev, i) => (
              <span key={i} className={`dot ${ev.extendedProps.category}`} />
            ))}
          </div>
          {events.length > 0 && (
            <div className="tooltip">
              {events.map((ev, i) => (
                <div key={i} className={`tooltip-item ${ev.extendedProps.category}`}>
                  {ev.title}
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="month-card" key={`${month}-${year}`}>
        <h3>{new Date(year, month).toLocaleString('ms-MY', { month: 'long' })} {year}</h3>
        <div className="days-grid">{tiles}</div>
      </div>
    );
  };

  return (
    <div className={`app-${theme}`}
      onMouseMove={(e) => {
        setCursor(prev => ({
          ...prev,
          x: e.clientX,
          y: e.clientY
        }));
      }}>
      <div className="animated-bg"></div>

      {/* THEME TOGGLE TOP LEFT */}
      <div className="top-left-toggle">
        <button className="theme-toggle" onClick={toggleTheme}>
          {theme === 'dark' ? '☀ Light' : '🌙 Dark'}
        </button>
      </div>

      {/* CALENDAR / LIST TOGGLE TOP RIGHT */}
      <div className="top-right-toggle">
        <div className="segmented-control advanced">
          <div className={`slider ${viewMode}`}></div>

          <button
            className={viewMode === 'calendar' ? 'active' : ''}
            onClick={() => setViewMode('calendar')}
          >
            <span>📅</span> Calendar
          </button>

          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            <span>📋</span> List
          </button>
        </div>
      </div>

      {/* HERO */}
      <header className="hero">
        <div className="year-pill">2025 / 2026</div>
        <h1>Bila <span>UTHM</span> Cuti?</h1>

        {/* SEMESTER TOGGLE CENTERED */}
        <div className="toggle-group sem-toggle">
          <button className={activeSem === 1 ? 'active' : ''} onClick={() => setActiveSem(1)}>Sem I</button>
          <button className={activeSem === 2 ? 'active' : ''} onClick={() => setActiveSem(2)}>Sem II</button>
        </div>

        {/* LEGEND ABOVE CALENDAR */}
        <div className="legend legend-top">
          <div><span className="dot lecture" /> Lecture</div>
          <div><span className="dot exam" /> Examination</div>
          <div><span className="dot break" /> Break</div>
          <div><span className="dot registration" /> Registration</div>
          <div><span className="dot holiday" /> Holiday</div>
        </div>
      </header>

      <div className="calendar-wrapper" key={activeSem}>
        {/* FILTER */}
            <div className="filter-bar">
              {['all', 'lecture', 'exam', 'break', 'registration', 'holiday'].map(f => (
                <button
                  key={f}
                  className={activeFilter === f ? 'active' : ''}
                  onClick={() => setActiveFilter(f)}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
        {/* CALENDAR VIEW */}
        {viewMode === 'calendar' ? (
          <div className="calendar-gallery">
            {activeSem === 1
              ? [8, 9, 10, 11, 0, 1].map(m => renderMonth(m, m >= 8 ? 2025 : 2026))
              : [2, 3, 4, 5, 6].map(m => renderMonth(m, 2026))
            }
          </div>
        ) : (
          /* LIST VIEW */
          <div className="list-view">
            {/* GROUP BY MONTH */}
            {Object.entries(
              filteredEvents.reduce((acc, ev) => {
                const date = new Date(ev.start);
                const key = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                if (!acc[key]) acc[key] = [];
                acc[key].push(ev);
                return acc;
              }, {})
            ).map(([month, events]) => (
              <div key={month}>
                <div className="list-month sticky">{month}</div>
                {events.map((ev, i) => {
                  const date = new Date(ev.start);
                  const day = date.toLocaleString('en-US', { weekday: 'short' });
                  const dateText = date.toLocaleString('en-US', { day: 'numeric', month: 'short' });
                  const endDate = ev.end
                    ? new Date(ev.end).toLocaleString('en-US', { day: 'numeric', month: 'short' })
                    : null;
                  return (
                    <div key={i} className="list-item">
                      <div className="list-date">
                        <div>{day}</div>
                        <div>{dateText}</div>
                      </div>
                      <div className="list-row">
                        <div className={`list-dot ${ev.extendedProps.category}`} />
                        <div className="list-content">
                          <div className="list-badge">All Students</div>
                          <div className="list-title">{ev.title}</div>
                          <div className="list-range">{endDate ? `${dateText} - ${endDate}` : dateText}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        )}

        {/* FLOAT BUTTONS LEFT BOTTOM */}
        <div className="floating-buttons">
          <button
            className="floating-btn whatsapp"
            onClick={handleWhatsAppShare}
            data-label="Share"
          >
            <FaWhatsapp />
          </button>

          <button
            className="floating-btn download"
            onClick={handleDownload}
            data-label="Download"
          >
            <FaDownload />
          </button>

          <button
            className="floating-btn feedback"
            onClick={() => setFeedbackModal(true)}
            data-label="Feedback"
          >
            <FaComment />
          </button>
        </div>

        {/* POSTER MODAL */}
        {posterModal && (
          <div className="modal-overlay" onClick={() => setPosterModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              <iframe
                src="https://amo.uthm.edu.my/images/USPG/Kalendar_Akaademik_2025/Kalendar_Akademik_BM-01.pdf"
                className="poster-frame"
                title="UTHM Academic Calendar 2025/2026"
              />
              <button onClick={() => setPosterModal(false)}>Close</button>
            </div>
          </div>
        )}

        {/* FEEDBACK MODAL */}
        {feedbackModal && (
          <div className="modal-overlay" onClick={() => setFeedbackModal(false)}>
            <div className="modal" onClick={e => e.stopPropagation()}>
              {feedbacks.length === 0 ? (
                <>
                  <textarea
                    value={feedbackInput}
                    onChange={e => setFeedbackInput(e.target.value)}
                    placeholder="Write your feedback..."
                  />
                  <button onClick={handleFeedbackSubmit}>Submit</button>
                  <button onClick={() => setFeedbackModal(false)}>Cancel</button>
                </>
              ) : (
                <>
                  <div className="feedback-received">✅ Feedback received!</div>
                  <div className="my-feedback">{feedbacks.map((fb, i) => (
                    <div key={i} className="feedback-item">{fb}</div>
                  ))}</div>
                  <button onClick={() => setFeedbackModal(false)}>Close</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
      <div
        className={`cursor-glow ${cursor.type}`}
        style={{
          left: cursor.x,
          top: cursor.y
        }}
      />
    </div>
  );
};

export default App;