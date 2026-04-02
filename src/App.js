import React, { useState, useEffect } from 'react';
import { uthmEvents } from './calendarData';
import { FaDownload, FaWhatsapp, FaComment } from 'react-icons/fa';
import { saveAs } from "file-saver";
import html2canvas from "html2canvas";
import { serverTimestamp } from "firebase/firestore";

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

  useEffect(() => {
    const handleClick = () => setShowDownloadMenu(false);
    window.addEventListener("click", handleClick);

    return () => window.removeEventListener("click", handleClick);
  }, []);

  const [feedbackList, setFeedbackList] = useState([]);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);
  const SHOW_FEEDBACK = false;

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        console.log('Fetching feedback...'); // Debug log
        const data = await getDocs(collection(db, "feedback"));
        const sorted = data.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const getTime = (val) => {
              if (!val) return 0;
              if (val.seconds) return val.seconds; // Firestore Timestamp
              if (val instanceof Date) return val.getTime(); // JS Date
              return 0;
            };

            return getTime(b.createdAt?.seconds - a.createdAt?.seconds);
          });
        setFeedbackList(sorted);
        console.log('Feedback fetched:', sorted); // Debug log
      } catch (error) {
        console.error('Error fetching feedback:', error);
      }
    };
    fetchFeedback();
  }, []);

  const downloadICS = () => {
      let icsContent = `BEGIN:VCALENDAR
    VERSION:2.0
    CALSCALE:GREGORIAN
    METHOD:PUBLISH
    `;

      uthmEvents.forEach((event, index) => {
        const start = event.start.replace(/-/g, "") + "T000000";
        const end = (event.end ? event.end : event.start).replace(/-/g, "") + "T235959";

        const uid = `${Date.now()}-${index}@uthm-calendar`;
        const now = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

        icsContent += `BEGIN:VEVENT
    UID:${uid}
    DTSTAMP:${now}
    DTSTART;TZID=Asia/Kuala_Lumpur:${start}
    DTEND;TZID=Asia/Kuala_Lumpur:${end}
    DTEND:${end}
    SUMMARY:${event.title}
    DESCRIPTION:UTHM Academic Calendar Event
    STATUS:CONFIRMED
    END:VEVENT
    `;
      });

      icsContent += `END:VCALENDAR`;

      const blob = new Blob([icsContent], {
        type: "text/calendar;charset=utf-8"
      });

      saveAs(blob, "UTHM_Calendar.ics");
    };

  const downloadImage = async () => {
    if (typeof window === "undefined") return;

    const calendar = document.getElementById("calendar-container");
    if (!calendar) return;

    const canvas = await html2canvas(calendar, {
      scale: 2,
      useCORS: true
    });

    const link = document.createElement("a");
    link.download = "UTHM_Calendar.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const isWeekend = (day) => day === 0 || day === 6;

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  const handleWhatsAppShare = () => {
    const message = "Check out UTHM Academic Calendar 📅✨";
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(message + " " + url)}`, '_blank');
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
      console.log('Submitting feedback...'); // Debug log
      
      // Submit to Firestore
      const docRef = await addDoc(collection(db, "feedback"), {
        message: feedbackInput.trim(),
        createdAt: serverTimestamp(),
      });
      
      console.log('Feedback submitted with ID:', docRef.id); // Debug log

      // Optimistically update UI
      const newFeedback = {
        id: docRef.id,
        message: feedbackInput.trim(),
        createdAt: serverTimestamp()
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

  // Filter events by category
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
          className={`tile ${isWeekend(dateObj.getDay()) ? 'weekend' : ''}`}
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

      <div id="calendar-container" className="calendar-wrapper" key={activeSem}>
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
                    <div key={i} className="list-item modern">
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
        <div className="floating-buttons modern">
          <button
            className="floating-btn whatsapp"
            onClick={handleWhatsAppShare}
            data-label="Share"
          >
            <FaWhatsapp />
          </button>

          <button
            className="floating-btn download"
            onClick={() => setShowDownloadMenu(prev => !prev)}
            data-label="Download"
          >
            <FaDownload />
          </button>
          {showDownloadMenu && (
            <div className="download-menu">
            <button onClick={downloadImage}>Download as Image</button>
            <button onClick={handleDownload}>Download PDF</button>
            <button className="ics-btn" onClick={downloadICS}>
              📅 Add to Calendar
            </button>
          </div>
          )}

          <button
            className="floating-btn feedback"
            onClick={() => setFeedbackModal(true)}
            data-label="Feedback"
          >
            <FaComment />
          </button>
          {SHOW_FEEDBACK && (
            <div className="feedback-section">
              <h3>User Feedback</h3>
              {feedbackList.map((fb, index) => (
                <div key={index} className="feedback-card">
                  {fb.message}
                </div>
              ))}
            </div>
          )}
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
            <h3>Write Your Feedback</h3>
            <textarea
              value={feedbackInput}
              onChange={e => setFeedbackInput(e.target.value)}
              placeholder="Write your feedback..."
              maxLength={300}
            />
            <div className="char-count">{feedbackInput.length}/300</div>
            <div className="modal-buttons">
              <button onClick={handleFeedbackSubmit}>Submit</button>
              <button onClick={() => setFeedbackModal(false)}>Cancel</button>
            </div>

            <h3>User Feedback</h3>
            {feedbackList.length === 0 ? (
              <p>No feedback yet.</p>
            ) : (
              feedbackList.map((fb, i) => (
                <div key={i} className="feedback-card">
                  {fb.message}
                </div>
              ))
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