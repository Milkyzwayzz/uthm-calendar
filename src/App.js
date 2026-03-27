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

  const isJohorWeekend = (day) => day === 5 || day === 6;

  const handleWhatsAppShare = () => {
    const message = "Check out UTHM Academic Calendar 📅✨";
    const url = window.location.href;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message + " " + url)}`;
    const win = window.open(whatsappURL, '_blank');
    if (!win) alert("Popup blocked! Allow popups to share.");
  };

  const handleFeedbackSubmit = () => {
    if (feedbackInput.trim() === '') return;
    setFeedbacks([...feedbacks, feedbackInput]);
    setFeedbackInput('');
    setFeedbackModal(false);
  };

  const renderMonth = (month, year) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    let tiles = [];
    for (let i = 0; i < offset; i++) tiles.push(<div key={`e-${i}`} className="tile empty" />);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = dateObj.toISOString().split('T')[0];
      const events = uthmEvents.filter(e => dateStr >= e.start && dateStr <= (e.end || e.start));

      tiles.push(
        <div key={d} className={`tile ${isJohorWeekend(dateObj.getDay()) ? 'weekend' : ''}`}>
          <span className="day-num">{d}</span>
          <div className="dots">
            {events.map((ev, i) => (
              <span
                key={i}
                className={`dot ${ev.extendedProps.category}`}
                title={ev.title}
              />
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
    <div className={`app-${theme}`}>
      {/* Animated Background */}
      <div className="animated-bg"></div>

      {/* Top Bar */}
      <div className="top-bar">
        <button className="theme-toggle" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
          {theme === 'dark' ? '☀ Light Mode' : '🌙 Dark Mode'}
        </button>

        <div className="view-toggle">
          <button
            className={viewMode === 'calendar' ? 'active' : ''}
            onClick={() => setViewMode('calendar')}
          >
            Calendar View
          </button>
          <button
            className={viewMode === 'list' ? 'active' : ''}
            onClick={() => setViewMode('list')}
          >
            List View
          </button>
        </div>
      </div>

      {/* Hero */}
      <header className="hero">
        <div className="year-pill">2025 / 2026</div>
        <h1>Bila <span>UTHM</span> Cuti?</h1>

        <div className="toggle-group">
          <button className={activeSem === 1 ? 'active' : ''} onClick={() => setActiveSem(1)}>Sem I</button>
          <button className={activeSem === 2 ? 'active' : ''} onClick={() => setActiveSem(2)}>Sem II</button>
        </div>

        <div className="legend">
          <div className="item"><span className="dot lecture" /> Lecture</div>
          <div className="item"><span className="dot exam" /> Examination</div>
          <div className="item"><span className="dot break" /> Break</div>
          <div className="item"><span className="dot registration" /> Registration</div>
        </div>
      </header>

      {/* Main Content */}
      {viewMode === 'calendar' ? (
        <div className="calendar-gallery">
          {activeSem === 1
            ? [8, 9, 10, 11, 0, 1].map(m => renderMonth(m, m >= 8 ? 2025 : 2026))
            : [2, 3, 4, 5, 6].map(m => renderMonth(m, 2026))
          }
        </div>
      ) : (
        <div className="list-view">

          {/* Group events by month */}
          {Object.entries(
            uthmEvents.reduce((acc, ev) => {
              const date = new Date(ev.start);
              const monthKey = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });

              if (!acc[monthKey]) acc[monthKey] = [];
              acc[monthKey].push(ev);

              return acc;
            }, {})
          ).map(([month, events]) => (
            
            <div key={month}>
              <div className="list-month">{month}</div>

              {events.map((ev, i) => {
                const date = new Date(ev.start);

                const day = date.toLocaleString('en-US', { weekday: 'short' });
                const dateText = date.toLocaleString('en-US', { day: 'numeric', month: 'short' });

                const endDate = ev.end
                  ? new Date(ev.end).toLocaleString('en-US', { day: 'numeric', month: 'short' })
                  : null;

                return (
                  <div key={i} className="list-item">

                    {/* LEFT DATE */}
                    <div className="list-date">
                      <div className="day">{day}</div>
                      <div className="date">{dateText}</div>
                    </div>

                    {/* RIGHT CONTENT */}
                    <div className="list-row">

                      {/* COLOR DOT */}
                      <div className={`list-dot ${ev.extendedProps.category}`}></div>

                      <div className="list-content">
                        <div className="list-badge">All Students</div>

                        <div className="list-title">
                          {ev.title}
                        </div>

                        <div className="list-range">
                          {endDate
                            ? `${dateText} - ${endDate}`
                            : dateText}
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
      {/* Floating Buttons */}
      <div className="fab-container">
        <button className="fab whatsapp" title="Share to WhatsApp" onClick={handleWhatsAppShare}><FaWhatsapp /></button>
        <button className="fab" title="Calendar Poster" onClick={() => setPosterModal(true)}><FaDownload /></button>
        <button className="fab feedback" title="Give Feedback" onClick={() => setFeedbackModal(true)}><FaComment /></button>
      </div>

      {/* Poster Modal */}
      {posterModal && (
        <div className="modal-overlay" onClick={() => setPosterModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <img src="https://amo.uthm.edu.my/images/USPG/Kalendar_Akaademik_2025/Kalendar_Akademik_BM-01.pdf" alt="UTHM Calendar Poster" className="poster-image" />
            <a href="https://amo.uthm.edu.my/images/USPG/Kalendar_Akaademik_2025/Kalendar_Akademik_BM-01.pdf" download className="download-btn">Download Original Calendar</a>
            <button className="cancel-btn" onClick={() => setPosterModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackModal && (
        <div className="modal-overlay" onClick={() => setFeedbackModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Feedback</h3>
            <textarea
              value={feedbackInput}
              onChange={e => setFeedbackInput(e.target.value)}
              rows={4}
              placeholder="Write your feedback..."
            />
            <button className="download-btn" onClick={handleFeedbackSubmit}>Submit</button>
            <button className="cancel-btn" onClick={() => setFeedbackModal(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Private Feedback (Only for owner) */}
      {feedbacks.length > 0 && (
        <div className="private-feedback">
          <h4>Feedback Received:</h4>
          {feedbacks.map((f, i) => <p key={i}>{f}</p>)}
        </div>
      )}
    </div>
  );
};

export default App;