import React, { useState, useEffect } from 'react';
import { uthmEvents } from './calendarData';
import { FaDownload, FaWhatsapp, FaComment } from 'react-icons/fa';
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";

// Firebase imports
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc, getDocs } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

import './App.css';

const firebaseConfig = {
    apiKey: "AIzaSyDSLnr0s3S3uK-FnzZd0UJGXMW20Gpp6bE",
    authDomain: "uthmcalendar.firebaseapp.com",
    projectId: "uthmcalendar",
    storageBucket: "uthmcalendar.firebasestorage.app",
    messagingSenderId: "96104020555",
    appId: "1:96104020555:web:602971eedff40ce782abce",
    measurementId: "G-WGNRTQBEV1"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const db = getFirestore(app);

const App = () => {
  const [activeSem, setActiveSem] = useState('khas');
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

  const [feedbackList, setFeedbackList] = useState([]);

  useEffect(() => {
    const fetchFeedback = async () => {
      const data = await getDocs(collection(db, "feedback"));
      setFeedbackList(data.docs.map(doc => doc.data()));
    };
    fetchFeedback();
  }, []);

  const downloadImage = () => {
  const calendar = document.getElementById("calendar-container");

  html2canvas(calendar).then(canvas => {
    const link = document.createElement("a");
    link.download = "calendar.png";
    link.href = canvas.toDataURL();
    link.click();
  });
};

  const isJohorWeekend = (day) => day === 5 || day === 6;

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleWhatsAppShare = () => {
    const message = "Check out UTHM Academic Calendar 📅✨";
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(message + " " + url)}`, '_blank');
  };

  const downloadICS = () => {
    let icsContent = `BEGIN:VCALENDAR
    VERSION:2.0
    CALSCALE:GREGORIAN
    `;

      uthmEvents.forEach(event => {
        const start = event.start.replace(/-/g, "");
        const end = event.end
          ? event.end.replace(/-/g, "")
          : start;

        icsContent += `
    BEGIN:VEVENT
    SUMMARY:${event.title}
    DTSTART:${start}
    DTEND:${end}
    END:VEVENT
    `;
      });

      icsContent += "END:VCALENDAR";

      const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
      saveAs(blob, "UTHM_Calendar.ics");
    };

    const submitFeedback = async (text) => {
    try {
      await addDoc(collection(db, "feedback"), {
        message: text,
        createdAt: new Date()
      });
      alert("Feedback sent!");
    } catch (e) {
      console.error(e);
    }
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackInput.trim()) return;
    await submitFeedback(feedbackInput);
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
    (activeFilter === 'all' || ev.extendedProps.category === activeFilter) &&
    ev.extendedProps.semester === activeSem
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

        {/* SEMESTER TOGGLE CENTERED */}
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
                  className={`${f} ${activeFilter === f ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f.toUpperCase()}
                </button>
              ))}
            </div>
        {/* CALENDAR VIEW */}
        {viewMode === 'calendar' ? (
          <div className="calendar-gallery">
            {activeSem === 'khas' && (
              [6, 7, 8].map(m => renderMonth(m, 2025)) // Jul–Sep 2025
            )}

            {activeSem === 'sem1' && (
              [9, 10, 11, 0, 1].map(m => renderMonth(m, m >= 9 ? 2025 : 2026))
            )}

            {activeSem === 'sem2' && (
              [2, 3, 4, 5, 6].map(m => renderMonth(m, 2026))
            )}

            {activeSem === 'sem3' && (
              [6, 7, 8].map(m => renderMonth(m, 2026)) // Jul–Sep 2026
            )}
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
          <div className="download-menu">
            <button onClick={downloadICS}>Download Calendar File</button>
            <button onClick={downloadImage}>Download as Image</button>
          </div>

          <button
            className="floating-btn feedback"
            onClick={() => setFeedbackModal(true)}
            data-label="Feedback"
          >
            <FaComment />
          </button>
          <div className="feedback-section">
            <h3>User Feedback</h3>

            {feedbackList.map((fb, index) => (
              <div key={index} className="feedback-card">
                {fb.message}
              </div>
            ))}
          </div>
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