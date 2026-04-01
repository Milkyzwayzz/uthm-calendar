import React, { useState, useEffect } from 'react';
import { uthmEvents } from './calendarData';
import { FaDownload, FaWhatsapp, FaComment } from 'react-icons/fa';
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

// Firebase imports
import { collection, addDoc, getDocs } from "firebase/firestore";
import { db } from "./firebase";

import './App.css';

const App = () => {
  const [activeSem, setActiveSem] = useState('all');
  const [viewMode, setViewMode] = useState('calendar');
  const [theme, setTheme] = useState('dark');
  const [posterModal, setPosterModal] = useState(false);
  const [feedbackModal, setFeedbackModal] = useState(false);
  const [feedbackInput, setFeedbackInput] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [lastSubmitTime, setLastSubmitTime] = useState(0);
  const [cursor, setCursor] = useState({
    x: 0,
    y: 0,
    type: 'default'
  });

  const [feedbackList, setFeedbackList] = useState([]);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const [isDevMode, setIsDevMode] = useState(false); // Dev mode toggle

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        console.log('Fetching feedback...');
        const data = await getDocs(collection(db, "feedback"));
        const sorted = data.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
        setFeedbackList(sorted);
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };
    fetchFeedback();
  }, []);

  const downloadImage = async () => {
    const calendar = document.getElementById("calendar-container");
    if (!calendar) {
      alert("Calendar not found. Please wait for calendar to load.");
      return;
    }

    try {
      const canvas = await html2canvas(calendar, {
        backgroundColor: theme === 'dark' ? '#1a1a1a' : '#ffffff',
        scale: 2,
        useCORS: true,
        allowTaint: true
      });
      
      canvas.toBlob((blob) => {
        const link = document.createElement("a");
        link.download = `UTHM-Calendar-${activeSem || 'Full'}-${new Date().toISOString().split('T')[0]}.png`;
        link.href = URL.createObjectURL(blob);
        link.click();
        URL.revokeObjectURL(link.href);
      }, 'image/png');
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  const isJohorWeekend = (day) => day === 5 || day === 6;

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleWhatsAppShare = () => {
    const message = "Check out UTHM Academic Calendar 📅✨";
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(message + " " + url)}`, '_blank');
  };

  const toggleDevMode = () => {
    setIsDevMode(!isDevMode);
  };

  const handleFeedbackSubmit = async () => {
    const now = Date.now();

    if (now - lastSubmitTime < 5000) {
      alert("Please wait before submitting again.");
      return;
    }

    if (!feedbackInput.trim() || feedbackInput.length > 300) {
      alert("Feedback must be 1–300 characters");
      return;
    }

    try {
      const docRef = await addDoc(collection(db, "feedback"), {
        message: feedbackInput.trim(),
        createdAt: new Date(),
      });

      const newFeedback = {
        id: docRef.id,
        message: feedbackInput.trim(),
        createdAt: new Date()
      };
      
      setFeedbackList(prev => [newFeedback, ...prev]);
      setFeedbackInput('');
      setLastSubmitTime(now);
      setFeedbackModal(false);
      alert("✅ Feedback received!");
    } catch (err) {
      console.error("Error submitting feedback:", err);
      alert(`❌ Failed to submit feedback: ${err.message}`);
    }
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

  const filteredEvents = uthmEvents.filter(ev =>
    (activeFilter === 'all' || ev.extendedProps.category === activeFilter) &&
    (activeSem === 'all' || ev.extendedProps.semester === activeSem)
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
      const dateStr = new Date(
        dateObj.getTime() - dateObj.getTimezoneOffset() * 60000
      ).toISOString().split('T')[0];

      const events = filteredEvents.filter(e =>
        dateStr >= e.start && dateStr <= (e.end || e.start)
      );

      tiles.push(
        <div
          key={d}
          className={`tile ${isJohorWeekend(dateObj.getDay()) ? 'weekend' : ''} ${events.length > 0 ? 'has-events' : ''}`}
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
        <h3 className="month-title">
          {new Date(year, month).toLocaleString('ms-MY', { month: 'long' })} {year}
        </h3>
        <div className="weekday-row">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d}>{d}</div>
          ))}
        </div>
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
        {isDevMode && (
          <button className="dev-toggle" onClick={toggleDevMode}>
            🔧 Dev
          </button>
        )}
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
        <h1 className="hero-title">
          <span className="pill-text">Bila</span>{' '}
          <span>UTHM</span>{' '}
          <span className="pill-text">Cuti?</span>
        </h1>

        <div className="toggle-group sem-toggle advanced">
          <button className={activeSem === 'khas' ? 'active' : ''} onClick={() => setActiveSem('khas')}>
            Sem Khas
          </button>
          <button className={activeSem === 'sem1' ? 'active' : ''} onClick={() => setActiveSem('sem1')}>
            Sem I
          </button>
          <button className={activeSem === 'sem2' ? 'active' : ''} onClick={() => setActiveSem('sem2')}>
            Sem II
          </button>
          <button className={activeSem === 'sem3' ? 'active' : ''} onClick={() => setActiveSem('sem3')}>
            Sem III
          </button>
        </div>

        <div className="legend legend-top">
          <div><span className="dot lecture" /> Lecture</div>
          <div><span className="dot exam" /> Examination</div>
          <div><span className="dot break" /> Break</div>
          <div><span className="dot registration" /> Registration</div>
          <div><span className="dot holiday" /> Holiday</div>
        </div>
      </header>

      {/* ADD ID FOR DOWNLOAD */}
      <div className="calendar-wrapper" id="calendar-container" key={activeSem}>
        <div className="filter-bar">
          {['all', 'lecture', 'exam', 'break', 'registration', 'holiday'].map(f => (
            <button
              key={f}
              className={`${f} ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        {viewMode === 'calendar' ? (
          <div className="calendar-gallery">
            {activeSem === 'khas' && [6, 7, 8].map(m => renderMonth(m, 2025))}
            {activeSem === 'sem1' && [9, 10, 11, 0, 1].map(m => renderMonth(m, m >= 9 ? 2025 : 2026))}
            {activeSem === 'sem2' && [2, 3, 4, 5, 6].map(m => renderMonth(m, 2026))}
            {activeSem === 'sem3' && [6, 7, 8].map(m => renderMonth(m, 2026))}
          </div>
        ) : (
          <div className="list-view enhanced">
            {Object.entries(
              filteredEvents.reduce((acc, ev) => {
                const date = new Date(ev.start);
                const key = date.toLocaleString('en-US', { month: 'long', year: 'numeric' });
                if (!acc[key]) acc[key] = [];
                acc[key].push(ev);
                return acc;
              }, {})
            ).map(([month, events]) => (
              <div key={month} className="month-section">
                <div className="list-month-header">
                  <h2>{month}</h2>
                  <span className="event-count">{events.length} events</span>
                </div>
                <div className="events-grid">
                  {events.map((ev, i) => {
                    const date = new Date(ev.start);
                    const day = date.toLocaleString('en-US', { weekday: 'short' });
                    const dateText = date.toLocaleString('en-US', { day: 'numeric', month: 'short' });
                    const endDate = ev.end
                      ? new Date(ev.end).toLocaleString('en-US', { day: 'numeric', month: 'short' })
                      : null;
                    return (
                      <div key={i} className="list-item enhanced">
                        <div className="list-date-circle">
                          <div className="date-day">{day}</div>
                          <div className="date-num">{date.getDate()}</div>
                        </div>
                        <div className="list-content enhanced">
                          <div className={`list-dot ${ev.extendedProps.category}`} />
                          <div className="list-details">
                            <div className="list-title">{ev.title}</div>
                            <div className="list-range">
                              {endDate ? `${dateText} - ${endDate}` : dateText}
                            </div>
                            <div className={`list-category ${ev.extendedProps.category}`}>
                              {ev.extendedProps.category.toUpperCase()}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ENHANCED FLOATING BUTTONS */}
      <div className="floating-action-buttons">
        <button
          className="fab whatsapp ripple"
          onClick={handleWhatsAppShare}
          title="Share on WhatsApp"
        >
          <FaWhatsapp />
          <span className="fab-label">Share</span>
        </button>

        <div className="fab download-container">
          <button
            className="fab download ripple"
            onClick={() => setShowDownloadMenu(prev => !prev)}
            title="Download"
          >
            <FaDownload />
            <span className="fab-label">Download</span>
          </button>
          {showDownloadMenu && (
            <div className="download-menu enhanced">
              <button className="menu-item ripple" onClick={downloadImage}>
                📸 Screenshot Calendar
              </button>
              <button className="menu-item ripple" onClick={handleDownload}>
                📄 Official PDF
              </button>
              <div className="menu-divider"></div>
              <button className="menu-close ripple" onClick={() => setShowDownloadMenu(false)}>
                ✕ Close
              </button>
            </div>
          )}
        </div>

        <button
          className="fab feedback ripple"
          onClick={() => setFeedbackModal(true)}
          title="Feedback"
        >
          <FaComment />
          <span className="fab-label">Feedback</span>
        </button>
      </div>

      {/* DEV ONLY FEEDBACK SECTION */}
      {isDevMode && (
        <div className="dev-panel">
          <div className="dev-panel-header">
            <h3>👨‍💻 Dev Panel</h3>
            <button onClick={toggleDevMode}>Close</button>
          </div>
          <div className="feedback-section">
            <h4>Recent Feedback ({feedbackList.length})</h4>
            {feedbackList.slice(0, 5).map((fb, index) => (
              <div key={fb.id || index} className="feedback-card">
                <div className="feedback-message">{fb.message}</div>
                <div className="feedback-time">
                  {fb.createdAt ? new Date(fb.createdAt.seconds * 1000).toLocaleString() : 'Just now'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* POSTER MODAL */}
      {posterModal && (
        <div className="modal-overlay" onClick={() => setPosterModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <iframe
              src="https://amo.uthm.edu.my/images/USPG/Kalendar_Akaademik_2025/Kalendar_Akademik_BM-01.pdf"
              className="poster-frame"
              title="UTHM Academic Calendar 2025/2026"
            />
            <button className="modal-close" onClick={() => setPosterModal(false)}>Close</button>
          </div>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      {feedbackModal && (
        <div className="modal-overlay" onClick={() => setFeedbackModal(false)}>
          <div className="modal feedback-modal" onClick={e => e.stopPropagation()}>
            <h3>💬 Send Feedback</h3>
            <textarea
              value={feedbackInput}
              onChange={e => setFeedbackInput(e.target.value)}
              placeholder="What do you think about this calendar? Any suggestions?"
              maxLength={300}
              rows={4}
            />
            <div className="char-count">{feedbackInput.length}/300</div>
            <div className="modal-buttons">
              <button className="btn-primary" onClick={handleFeedbackSubmit}>Send Feedback</button>
              <button className="btn-secondary" onClick={() => setFeedbackModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

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