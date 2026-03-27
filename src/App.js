import React, { useState } from 'react';
import { uthmEvents } from './calendarData';
import { FaDownload, FaWhatsapp, FaMoon, FaSun, FaComment, FaTh, FaBars } from 'react-icons/fa';
import './App.css';

const calendarPoster = "https://amo.uthm.edu.my/images/USPG/Kalendar_Akaademik_2025/Kalendar_Akademik_BM-01.pdf";

const App = () => {
  const [activeSem, setActiveSem] = useState(1);
  const [isLight, setIsLight] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [viewType, setViewType] = useState('grid'); // grid or list
  const [searchQuery, setSearchQuery] = useState('');

  const handleWhatsAppShare = () => {
    const message = "Check out UTHM Academic Calendar 📅✨";
    const url = window.location.href;
    const whatsappURL = `https://wa.me/?text=${encodeURIComponent(message + " " + url)}`;
    const win = window.open(whatsappURL, '_blank');
    if (!win) alert("Popup blocked! Please allow popups to share.");
  };

  const handleDownload = () => {
    window.open(calendarPoster, '_blank');
  };

  const submitFeedback = () => {
    if(feedbackText.trim() === '') return;
    console.log("User Feedback:", feedbackText); // Replace with backend
    setFeedbackText('');
    setShowFeedback(false);
    alert("Thank you for your feedback!");
  };

  const isJohorWeekend = (day) => day === 5 || day === 6;

  const filterEvents = (events) => {
    if (!searchQuery) return events;
    return events.filter(ev => ev.title.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const renderMonthGrid = (month, year) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    const monthName = new Date(year, month).toLocaleString('ms-MY', { month: 'long' });
    const offset = firstDay === 0 ? 6 : firstDay - 1;

    let tiles = [];
    for (let i = 0; i < offset; i++) tiles.push(<div key={`e-${i}`} className="tile empty" />);

    for (let d = 1; d <= daysInMonth; d++) {
      const dateObj = new Date(year, month, d);
      const dateStr = dateObj.toISOString().split('T')[0];
      const events = filterEvents(uthmEvents.filter(e => dateStr >= e.start && dateStr <= (e.end || e.start)));
      const registration = events.some(e => e.title.toLowerCase().includes('pendaftaran'));

      tiles.push(
        <div key={d} className={`tile ${isJohorWeekend(dateObj.getDay()) ? 'weekend' : ''}`}>
          <span className="day-num">{d}</span>
          <div className="dots">
            {events.map((ev, i) => <span key={i} className={`dot ${ev.extendedProps.category}`} title={ev.title} />)}
            {registration && <span className="registration-badge">Registration</span>}
          </div>
          {events.length > 0 && (
            <div className="tile-hover">
              {events.map((ev, i) => <div key={i} className="hover-event">{ev.title}</div>)}
            </div>
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
    const events = filterEvents(uthmEvents).sort((a,b)=> new Date(a.start)-new Date(b.start));
    return (
      <div className="list-view">
        {events.map((ev, i) => (
          <div key={i} className="list-item">
            <div className="list-date">{ev.start}</div>
            <div className="list-title">{ev.title}</div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className={isLight ? 'app-light' : 'app-dark'}>
      <header className="hero">
        <div className="year-pill">2025 / 2026</div>
        <h1>Bila <span>UTHM</span> Cuti?</h1>

        <div className="search-container">
          <input 
            type="text" 
            placeholder="Search events..." 
            className="search" 
            value={searchQuery} 
            onChange={e=>setSearchQuery(e.target.value)} 
          />
        </div>

        <div className="toggle-group">
          <button className={activeSem === 1 ? 'active' : ''} onClick={() => setActiveSem(1)}>Sem I</button>
          <button className={activeSem === 2 ? 'active' : ''} onClick={() => setActiveSem(2)}>Sem II</button>
          <button className={viewType==='grid' ? 'active' : ''} onClick={()=>setViewType('grid')} title="Grid View"><FaTh /></button>
          <button className={viewType==='list' ? 'active' : ''} onClick={()=>setViewType('list')} title="List View"><FaBars /></button>
          <button onClick={() => setIsLight(!isLight)} title="Toggle Light/Dark Mode">{isLight ? <FaMoon /> : <FaSun />}</button>
        </div>

        <div className="legend">
          <div className="item"><span className="dot lecture" /> Lecture</div>
          <div className="item"><span className="dot examination" /> Examination</div>
          <div className="item"><span className="dot break" /> Break</div>
          <div className="item"><span className="dot registration" /> Registration</div>
        </div>
      </header>

      <div className="calendar-gallery">
        {viewType==='grid'
          ? activeSem === 1
            ? [8, 9, 10, 11, 0, 1].map(m => renderMonthGrid(m, m >= 8 ? 2025 : 2026))
            : [2, 3, 4, 5, 6].map(m => renderMonthGrid(m, 2026))
          : renderListView()
        }
      </div>

      <div className="fab-container">
        <button className="fab whatsapp" title="Share to WhatsApp" onClick={handleWhatsAppShare}><FaWhatsapp /></button>
        <button className="fab" title="Download Calendar Poster" onClick={handleDownload}><FaDownload /></button>
        <button className="fab" title="Give Feedback" onClick={() => setShowFeedback(true)}><FaComment /></button>
      </div>

      {showFeedback && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Feedback</h3>
            <textarea
              placeholder="Write your feedback..."
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
            />
            <div style={{display:'flex', justifyContent:'space-between', marginTop:'10px'}}>
              <button onClick={submitFeedback}>Submit</button>
              <button onClick={() => setShowFeedback(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;