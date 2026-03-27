import React, { useState } from 'react';
import DigitalBadge from './DigitalBadge';
import { uthmEvents } from './calendarData';
import { FaDownload, FaWhatsapp, FaList, FaThLarge, FaSun, FaMoon, FaRegCommentDots } from 'react-icons/fa';
import './App.css';

const App = () => {
  const [activeSem, setActiveSem] = useState(1);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [hoverEvent, setHoverEvent] = useState(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackList, setFeedbackList] = useState([]);

  // Group A (Johor): 5 = Jumaat, 6 = Sabtu
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
    if(feedbackText.trim()){
      setFeedbackList([...feedbackList, feedbackText.trim()]);
      setFeedbackText('');
      setFeedbackOpen(false);
      alert("Thank you for your feedback!");
    }
  }

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

      tiles.push(
        <div
          key={d}
          className={`tile ${isJohorWeekend(dateObj.getDay()) ? 'weekend' : ''}`}
          onMouseEnter={() => setHoverEvent({date: dateStr, events})}
          onMouseLeave={() => setHoverEvent(null)}
        >
          <span className="day-num">{d}</span>
          <div className="dots">
            {events.map((ev, i) => (
              <span key={i} className={`dot ${ev.extendedProps.category}`} title={ev.title}></span>
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
        {viewMode === 'grid' ? (
          <div className="days-grid">{tiles}</div>
        ) : (
          <div className="list-view">
            {tiles.filter(tile => tile.props?.className?.includes('tile')).map((tile, idx) => {
              const dayEvents = uthmEvents.filter(e => {
                const dateStr = new Date(year, month, idx+1).toISOString().split('T')[0];
                return dateStr >= e.start && dateStr <= (e.end || e.start);
              });
              return (
                <div className="list-tile" key={idx}>
                  <strong>{idx+1}/{month+1}/{year}</strong> - {dayEvents.map(e=>e.title).join(', ')}
                </div>
              )
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`app-${theme}`}>
      <header className="hero">
        <h1>Bila <span>UTHM</span> Cuti?</h1>

        <div className="controls">
          <div className="toggle-group">
            <button className={activeSem===1?'active':''} onClick={()=>setActiveSem(1)}>Sem I</button>
            <button className={activeSem===2?'active':''} onClick={()=>setActiveSem(2)}>Sem II</button>
          </div>

          <div className="view-toggle">
            <button onClick={()=>setViewMode('grid')} title="Grid View"><FaThLarge /></button>
            <button onClick={()=>setViewMode('list')} title="List View"><FaList /></button>
          </div>

          <div className="theme-toggle">
            <button onClick={()=>setTheme(theme==='dark'?'light':'dark')}>
              {theme==='dark'?<FaSun/>:<FaMoon/>}
            </button>
          </div>
        </div>

        <div className="legend">
          <div className="item"><span className="dot lecture"></span> Lecture</div>
          <div className="item"><span className="dot exam"></span> Examination</div>
          <div className="item"><span className="dot break"></span> Break</div>
          <div className="item"><span className="dot registration"></span> Registration</div>
        </div>
      </header>

      <div className="calendar-gallery">
        {activeSem===1
          ? [8,9,10,11,0,1].map(m => renderMonth(m, m>=8?2025:2026))
          : [2,3,4,5,6].map(m => renderMonth(m,2026))
        }
      </div>

      {hoverEvent && hoverEvent.events.length > 0 && (
        <div className="hover-tooltip">
          {hoverEvent.events.map((ev,i)=>(
            <div key={i} className="tooltip-item">
              <span className={`dot ${ev.extendedProps.category}`}></span>
              {ev.title}
            </div>
          ))}
        </div>
      )}

      {/* FAB Buttons */}
      <div className="fab-container">
        <button className="fab whatsapp" title="Share to WhatsApp" onClick={handleWhatsAppShare}><FaWhatsapp /></button>
        <button className="fab download" title="Download Calendar" onClick={handleDownload}><FaDownload /></button>
        <button className="fab feedback" title="Give Feedback" onClick={()=>setFeedbackOpen(true)}><FaRegCommentDots/></button>
      </div>

      {/* Feedback Modal */}
      {feedbackOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Feedback</h3>
            <textarea
              rows="4"
              value={feedbackText}
              onChange={e=>setFeedbackText(e.target.value)}
              placeholder="Your feedback..."
              style={{width:'100%', padding:'10px', borderRadius:'8px', border:'none'}}
            />
            <div style={{display:'flex', justifyContent:'space-between', marginTop:'10px'}}>
              <button onClick={handleSubmitFeedback} style={{background:'#8b5cf6', color:'#fff', padding:'8px 12px', borderRadius:'8px'}}>Submit</button>
              <button onClick={()=>setFeedbackOpen(false)} style={{background:'#ef4444', color:'#fff', padding:'8px 12px', borderRadius:'8px'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      <DigitalBadge />

    </div>
  )
}

export default App;