import React, { useState } from 'react';
import { uthmEvents } from './calendarData';
import { FaDownload, FaWhatsapp, FaList, FaThLarge, FaRegMoon, FaSun, FaCommentDots } from 'react-icons/fa';
import './App.css';

const App = () => {
  const [activeSem, setActiveSem] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [darkMode, setDarkMode] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);

  const isJohorWeekend = (day) => day === 5 || day === 6;

  const handleWhatsAppShare = () => {
    const message = "Check out UTHM Academic Calendar 📅✨";
    const url = window.location.href;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message + " " + url)}`;
    const win = window.open(whatsappURL, '_blank');
    if (!win) alert("Popup blocked! Please allow popups to share.");
  };

  const handleDownload = () => {
    window.open(
      'https://amo.uthm.edu.my/images/USPG/Kalendar_Akaademik_2025/Kalendar_Akademik_BM-01.pdf',
      '_blank'
    );
  };

  const handleSubmitFeedback = () => {
    if (feedbackText.trim()) {
      setFeedbackList([...feedbackList, feedbackText]);
      setFeedbackText('');
      setShowFeedback(false);
      alert("Feedback submitted! Only you can see it here.");
    }
  };

  const renderMonth = (month, year) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = new Date(year, month).toLocaleString('ms-MY', { month: 'long' });
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    let tiles = [];
    for (let i = 0; i < offset; i++) tiles.push(<div key={`e-${i}`} className="tile empty" />);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = dateObj.toISOString().split('T')[0];
      const events = uthmEvents.filter(
        e => dateStr >= e.start && dateStr <= (e.end || e.start) &&
             e.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      tiles.push(
        <div key={d} className={`tile ${isJohorWeekend(dateObj.getDay()) ? 'weekend' : ''}`}>
          <span className="day-num">{d}</span>
          <div className="dots">
            {events.map((ev, i) => (
              <span key={i} className={`dot ${ev.extendedProps.category}`} title={ev.title}></span>
            ))}
          </div>
          {events.length > 0 && (
            <div className="tile-hover">
              {events.map((ev, i) => (
                <div key={i} className={`tile-hover-item ${ev.extendedProps.category}`}>
                  <span className="dot" /> {ev.title}
                </div>
              ))}
            </div>
          )}
          {events.some(e => e.extendedProps.category === 'registration') && (
            <span className="registration-badge">Pendaftaran</span>
          )}
        </div>
      );
    }

    return (
      <div className="month-card" key={`${month}-${year}`}>
        <h3>{monthName} {year}</h3>
        <div className="days-header">
          {['Is', 'Se', 'Ra', 'Kh', 'Ju', 'Sa', 'Ah'].map(d => <div key={d}>{d}</div>)}
        </div>
        <div className="days-grid">{tiles}</div>
      </div>
    );
  };

  const renderListView = () => {
    const filteredEvents = uthmEvents.filter(ev =>
      ev.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      ((activeSem === 1 && new Date(ev.start).getMonth() >= 8) ||
       (activeSem === 2 && new Date(ev.start).getMonth() < 8))
    );
    return (
      <div className="list-view">
        {filteredEvents.map((ev, idx) => (
          <div key={idx} className="list-item">
            <div className="list-date">{new Date(ev.start).toLocaleDateString()}</div>
            <div className="list-title">{ev.title}</div>
            {ev.extendedProps.category === 'registration' && (
              <span className="registration-badge">Pendaftaran</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={darkMode ? "app-dark" : "app-light"}>
      <header className="hero">
        <div className="year-pill">2025 / 2026</div>
        <h1>Bila <span>UTHM</span> Cuti?</h1>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search events..."
            className="search"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="toggle-group">
          <button className={activeSem === 1 ? 'active' : ''} onClick={() => setActiveSem(1)}>Sem I</button>
          <button className={activeSem === 2 ? 'active' : ''} onClick={() => setActiveSem(2)}>Sem II</button>
        </div>

        <div className="toggle-group">
          <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}><FaThLarge /> Grid</button>
          <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}><FaList /> List</button>
          <button onClick={() => setDarkMode(!darkMode)} className="mode-toggle">
            {darkMode ? <FaSun /> : <FaRegMoon />}
          </button>
        </div>

        <div className="legend">
          <div className="item"><span className="dot lecture" /> Lecture</div>
          <div className="item"><span className="dot examination" /> Examination</div>
          <div className="item"><span className="dot break" /> Break</div>
          <div className="item"><span className="dot registration" /> Registration</div>
        </div>
      </header>

      <div className="calendar-gallery">
        {viewMode === 'grid'
          ? (activeSem === 1
              ? [8,9,10,11,0,1].map(m => renderMonth(m, m >= 8 ? 2025 : 2026))
              : [2,3,4,5,6].map(m => renderMonth(m, 2026)))
          : renderListView()
        }
      </div>

      {/* Floating buttons */}
      <div className="fab-container">
        <button className="fab whatsapp" title="Share to WhatsApp" onClick={handleWhatsAppShare}><FaWhatsapp /></button>
        <button className="fab" title="Download Calendar" onClick={handleDownload}><FaDownload /></button>
        <button className="fab" title="Feedback" onClick={() => setShowFeedback(true)}><FaCommentDots /></button>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Feedback</h3>
            <textarea
              placeholder="Type your feedback here..."
              value={feedbackText}
              onChange={e => setFeedbackText(e.target.value)}
            />
            <div style={{display:'flex', gap:'10px', justifyContent:'flex-end'}}>
              <button onClick={handleSubmitFeedback}>Submit</button>
              <button onClick={() => setShowFeedback(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;