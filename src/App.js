import React, { useState } from 'react';
import { uthmEvents } from './calendarData';
import { FaDownload, FaWhatsapp, FaList, FaTh, FaMoon, FaSun, FaCommentDots } from 'react-icons/fa';
import './App.css';

const CALENDAR_PDF = "https://amo.uthm.edu.my/images/USPG/Kalendar_Akaademik_2025/Kalendar_Akademik_BM-01.pdf";

const App = () => {
  const [activeSem, setActiveSem] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  const handleWhatsAppShare = () => {
    const message = "Check out UTHM Academic Calendar 📅✨";
    const url = window.location.href;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message + " " + url)}`;
    const win = window.open(whatsappURL, '_blank');
    if (!win) alert("Popup blocked! Please allow popups to share.");
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = CALENDAR_PDF;
    link.download = 'UTHM_Calendar_2025_2026.pdf';
    link.target = '_blank';
    link.click();
  };

  const handleSubmitFeedback = (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.name.value;
    const message = form.message.value;
    if (name && message) {
      setFeedbacks([...feedbacks, { name, message }]);
      form.reset();
      setFeedbackOpen(false);
      alert("Thank you for your feedback!");
    }
  };

  const isJohorWeekend = (day) => day === 5 || day === 6;

  const filteredEvents = (events) =>
    events.filter(e => e.title.toLowerCase().includes(searchQuery.toLowerCase()));

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
      const events = uthmEvents.filter(e => dateStr >= e.start && dateStr <= (e.end || e.start));
      const filtered = filteredEvents(events);

      tiles.push(
        <div key={d} className={`tile ${isJohorWeekend(dateObj.getDay()) ? 'weekend' : ''}`}>
          <span className="day-num">{d}</span>
          <div className="dots">
            {filtered.map((ev, i) => (
              <span key={i} className={`dot ${ev.extendedProps.category}`} title={ev.title} />
            ))}
          </div>
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
    let listItems = [];
    uthmEvents.forEach((event) => {
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return;
      const date = event.start;
      listItems.push(
        <div key={date + event.title} className="list-item">
          <div className="list-date">{date}</div>
          <div className={`list-event ${event.extendedProps.category}`}>{event.title}</div>
        </div>
      );
    });
    return <div className="list-view">{listItems}</div>;
  };

  return (
    <div className={theme === 'dark' ? 'app-dark' : 'app-light'}>
      <div className="background-glass" />

      <header className="hero">
        <div className="year-pill">2025 / 2026</div>
        <h1>Bila <span>UTHM</span> Cuti?</h1>

        <div className="controls">
          <div className="toggle-group">
            <button className={activeSem === 1 ? 'active' : ''} onClick={() => setActiveSem(1)}>Sem I</button>
            <button className={activeSem === 2 ? 'active' : ''} onClick={() => setActiveSem(2)}>Sem II</button>
          </div>

          <input
            className="search"
            placeholder="Search event..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />

          <div className="view-mode">
            <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><FaTh /></button>
            <button className={viewMode === 'list' ? 'active' : ''} onClick={() => setViewMode('list')}><FaList /></button>
          </div>

          <div className="theme-toggle">
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <FaSun /> : <FaMoon />}
            </button>
          </div>
        </div>

        <div className="legend">
          <div className="item"><span className="dot lecture" /> Lecture</div>
          <div className="item"><span className="dot exam" /> Examination</div>
          <div className="item"><span className="dot break" /> Break</div>
        </div>

        {/* Calendar Poster Preview */}
        <div style={{ marginTop: '30px' }}>
          <img
            src={CALENDAR_PDF.replace('.pdf', '.jpg')} // assumes PDF has JPG preview or convert PDF to image
            alt="UTHM Calendar Poster"
            style={{ width: '90%', maxWidth: '700px', borderRadius: '16px', boxShadow: '0 15px 30px rgba(0,0,0,0.5)' }}
          />
        </div>
      </header>

      {viewMode === 'grid' ? (
        <div className="calendar-gallery">
          {activeSem === 1
            ? [8, 9, 10, 11, 0, 1].map(m => renderMonth(m, m >= 8 ? 2025 : 2026))
            : [2, 3, 4, 5, 6].map(m => renderMonth(m, 2026))}
        </div>
      ) : (
        renderListView()
      )}

      <div className="fab-container">
        <button className="fab whatsapp" title="Share to WhatsApp" onClick={handleWhatsAppShare}><FaWhatsapp /></button>
        <button className="fab download" title="Download Calendar" onClick={handleDownload}><FaDownload /></button>
        <button className="fab feedback" title="Give Feedback" onClick={() => setFeedbackOpen(true)}><FaCommentDots /></button>
      </div>

      {feedbackOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Feedback Form</h3>
            <form onSubmit={handleSubmitFeedback}>
              <input name="name" placeholder="Your Name" required />
              <textarea name="message" placeholder="Your Feedback" rows="4" required />
              <button type="submit">Submit</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;