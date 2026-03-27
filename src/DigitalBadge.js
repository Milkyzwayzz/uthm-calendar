import React, { useState } from 'react';
import './DigitalBadge.css';

const DigitalBadge = () => {
  const [pos, setPos] = useState({x:0, y:0});
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({x:0, y:0});

  const handleMouseDown = (e) => {
    setDragging(true);
    setOffset({x: e.clientX - pos.x, y: e.clientY - pos.y});
  };

  const handleMouseMove = (e) => {
    if(dragging){
      setPos({x: e.clientX - offset.x, y: e.clientY - offset.y});
    }
  };

  const handleMouseUp = () => setDragging(false);

  return (
    <div 
      className="badge-container"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        className="badge-lanyard"
        style={{transform: `translate(${pos.x}px, ${pos.y}px)`}}
        onMouseDown={handleMouseDown}
      >
        <div className="lanyard"></div>
        <div className="badge-card">
          <h4>UTHM Student</h4>
          <p>Matrix ID: 123456</p>
          <p>Nama: Mohd Najmi</p>
        </div>
      </div>
    </div>
  )
}

export default DigitalBadge;