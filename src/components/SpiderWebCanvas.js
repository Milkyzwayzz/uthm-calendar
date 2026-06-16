import React, { useRef, useEffect, useState } from 'react';

const SpiderWebCanvas = ({ todos, onCompleteTodo }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [spiderPos, setSpiderPos] = useState({ x: 150, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const [, setFlies] = useState([]);
  const [, setParticles] = useState([]);

  // Load flies from active todos
  useEffect(() => {
    // Generate fly positions on the web for uncompleted todos
    const activeTodos = todos.filter(t => !t.completed);
    setFlies(prevFlies => {
      // Keep existing flies if their todos still exist
      const updated = prevFlies.filter(f => activeTodos.some(t => t.id === f.todoId));
      
      // Add new flies for new todos
      activeTodos.forEach(todo => {
        if (!updated.some(f => f.todoId === todo.id)) {
          // Put fly on a random position on the web
          const angle = Math.random() * Math.PI * 2;
          const radius = 60 + Math.random() * 120;
          updated.push({
            todoId: todo.id,
            text: todo.text,
            x: 200 + Math.cos(angle) * radius,
            y: 200 + Math.sin(angle) * radius,
            scale: 0,
            targetScale: 1
          });
        }
      });
      return updated;
    });
  }, [todos]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    // Dimensions
    const size = 400;
    canvas.width = size;
    canvas.height = size;

    // Web configuration
    const centerX = size / 2;
    const centerY = size / 2;
    const webRadii = [40, 80, 120, 160, 190];
    const radialCount = 8;

    // Spider state
    let bodyX = spiderPos.x;
    let bodyY = spiderPos.y;
    let targetBodyX = spiderPos.x;
    let targetBodyY = spiderPos.y;
    let bodyAngle = 0;

    // Legs initialization
    const legCount = 8;
    const femurLength = 22;
    const tibiaLength = 22;
    
    // Each leg has a current foot position and a target foot position
    const legs = Array.from({ length: legCount }, (_, i) => {
      const isLeft = i < 4;
      // Index mapping: Left: 0, 1, 2, 3 (front to back) | Right: 4, 5, 6, 7 (front to back)
      const legAngleOffset = isLeft 
        ? Math.PI - 0.6 + (i * 0.4) 
        : -0.6 + ((i - 4) * 0.4);

      const defaultDist = 45;
      const startX = centerX + Math.cos(legAngleOffset) * defaultDist;
      const startY = centerY + Math.sin(legAngleOffset) * defaultDist;

      return {
        index: i,
        isLeft,
        legAngleOffset,
        currentX: startX,
        currentY: startY,
        targetX: startX,
        targetY: startY,
        stepProgress: 1, // 0 to 1
        startX: startX,
        startY: startY,
      };
    });

    // Particle emitter helper
    const spawnParticles = (x, y, color) => {
      const newParticles = Array.from({ length: 12 }, () => ({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: (Math.random() - 0.5) * 4,
        radius: Math.random() * 3 + 1,
        alpha: 1,
        color
      }));
      setParticles(prev => [...prev, ...newParticles].slice(-50));
    };

    // Main animation loop
    const render = () => {
      ctx.clearRect(0, 0, size, size);

      // 1. Draw Beautiful Web
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.15)';
      ctx.lineWidth = 1;
      
      // Radial threads
      for (let i = 0; i < radialCount; i++) {
        const angle = (i * Math.PI * 2) / radialCount;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * 200, centerY + Math.sin(angle) * 200);
        ctx.stroke();
      }

      // Concentric circles (spiral loops)
      webRadii.forEach(r => {
        ctx.beginPath();
        for (let i = 0; i <= radialCount; i++) {
          const angle = (i * Math.PI * 2) / radialCount;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.stroke();
      });

      // 2. Animate Particles
      setParticles(prev => {
        const remaining = [];
        prev.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.alpha -= 0.03;
          if (p.alpha > 0) {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color || '#22d3ee';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            remaining.push(p);
          }
        });
        return remaining;
      });

      // 3. Draw Flies (tasks)
      setFlies(prevFlies => {
        prevFlies.forEach(fly => {
          // Scale in effect
          if (fly.scale < fly.targetScale) fly.scale += 0.05;
          
          ctx.save();
          ctx.translate(fly.x, fly.y);
          ctx.scale(fly.scale, fly.scale);
          
          // Fly body
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.arc(0, 0, 5, 0, Math.PI * 2);
          ctx.fill();

          // Wings
          ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
          ctx.beginPath();
          ctx.ellipse(-4, -4, 3, 5, -Math.PI / 4, 0, Math.PI * 2);
          ctx.ellipse(4, -4, 3, 5, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();

          ctx.restore();

          // Eat detection
          const distToSpider = Math.hypot(bodyX - fly.x, bodyY - fly.y);
          if (distToSpider < 20) {
            spawnParticles(fly.x, fly.y, '#10b981');
            onCompleteTodo(fly.todoId);
          }
        });
        return prevFlies;
      });

      // 4. Update Spider body physics
      if (!isDragging) {
        bodyX += (targetBodyX - bodyX) * 0.1;
        bodyY += (targetBodyY - bodyY) * 0.1;
      } else {
        bodyX = targetBodyX;
        bodyY = targetBodyY;
      }

      // Check walking direction to rotate body
      const dx = targetBodyX - bodyX;
      const dy = targetBodyY - bodyY;
      const speed = Math.hypot(dx, dy);
      if (speed > 1) {
        const targetAngle = Math.atan2(dy, dx) + Math.PI / 2;
        // Smooth rotation interpolation
        let angleDiff = targetAngle - bodyAngle;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        bodyAngle += angleDiff * 0.15;
      }

      // 5. Procedural Leg Stepping Logic
      legs.forEach((leg, idx) => {
        // Ideal foot resting position relative to body direction/angle
        // Front/middle/back spacing
        const spreadAngle = bodyAngle + leg.legAngleOffset;
        const idealDist = 48 + (idx % 2 === 0 ? 6 : 0); // Slight offset for leg variety
        const idealX = bodyX + Math.cos(spreadAngle) * idealDist;
        const idealY = bodyY + Math.sin(spreadAngle) * idealDist;

        // Snapping target to nearest web thread for realism
        let snapX = idealX;
        let snapY = idealY;
        
        // Find nearest radial line
        let bestDist = Infinity;
        for (let i = 0; i < radialCount; i++) {
          const rAngle = (i * Math.PI * 2) / radialCount;
          // Project ideal point onto radial line
          const vx = Math.cos(rAngle);
          const vy = Math.sin(rAngle);
          // Dot product from center to ideal point
          const px = idealX - centerX;
          const py = idealY - centerY;
          const dot = px * vx + py * vy;
          const projX = centerX + vx * dot;
          const projY = centerY + vy * dot;
          const dist = Math.hypot(idealX - projX, idealY - projY);
          
          if (dist < bestDist) {
            bestDist = dist;
            snapX = projX;
            snapY = projY;
          }
        }

        // Distance from current foot to snapped ideal target
        const distToIdeal = Math.hypot(leg.currentX - snapX, leg.currentY - snapY);

        // Gait grouping: alternating stepping groups
        const isAnyOtherLegStepping = legs.some(otherLeg => 
          otherLeg.index !== idx && 
          (otherLeg.index % 2 === (idx % 2 === 0 ? 1 : 0)) && 
          otherLeg.stepProgress < 1
        );

        if (distToIdeal > 28 && leg.stepProgress >= 1 && !isAnyOtherLegStepping) {
          leg.startX = leg.currentX;
          leg.startY = leg.currentY;
          leg.targetX = snapX + (Math.random() - 0.5) * 5; // tiny wobble
          leg.targetY = snapY + (Math.random() - 0.5) * 5;
          leg.stepProgress = 0;
        }

        // Stepping animation (0 to 1)
        if (leg.stepProgress < 1) {
          leg.stepProgress += 0.15; // Speed of step
          if (leg.stepProgress > 1) leg.stepProgress = 1;

          // Hermite or cubic interpolation for a lifting arc
          const t = leg.stepProgress;
          leg.currentX = leg.startX + (leg.targetX - leg.startX) * t;
          
          // Lift leg upward in Y axis arc
          const liftHeight = 12 * Math.sin(t * Math.PI);
          leg.currentY = leg.startY + (leg.targetY - leg.startY) * t - liftHeight;
        }

        // 6. Draw Leg using Inverse Kinematics (IK)
        // Joint A: Attachment on body
        const bodyAttachAngle = bodyAngle + (leg.isLeft 
          ? Math.PI - 0.3 + (idx * 0.15) 
          : -0.3 + ((idx - 4) * 0.15));
        const attachX = bodyX + Math.cos(bodyAttachAngle) * 8;
        const attachY = bodyY + Math.sin(bodyAttachAngle) * 8;

        // Solve IK for Knee
        const targetX = leg.currentX;
        const targetY = leg.currentY;
        const dxLeg = targetX - attachX;
        const dyLeg = targetY - attachY;
        const d = Math.hypot(dxLeg, dyLeg);

        let kneeX, kneeY;
        if (d >= femurLength + tibiaLength) {
          // Stretched leg
          const scale = femurLength / d;
          kneeX = attachX + dxLeg * scale;
          kneeY = attachY + dyLeg * scale;
        } else {
          // Angle of vector from attachment to target
          const angleAT = Math.atan2(dyLeg, dxLeg);
          
          // Law of Cosines to find internal angle alpha
          const cosAlpha = (femurLength * femurLength + d * d - tibiaLength * tibiaLength) / (2 * femurLength * d);
          const alpha = Math.acos(Math.max(-1, Math.min(1, cosAlpha)));
          
          // Knee bends outwards/upwards
          const kneeAngle = angleAT + (leg.isLeft ? -alpha : alpha);
          
          kneeX = attachX + Math.cos(kneeAngle) * femurLength;
          kneeY = attachY + Math.sin(kneeAngle) * femurLength;
        }

        // Draw leg segment lines
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 4.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Shadows for legs
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 4;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 4;

        // Outer thicker stroke
        ctx.beginPath();
        ctx.moveTo(attachX, attachY);
        ctx.lineTo(kneeX, kneeY);
        ctx.lineTo(targetX, targetY);
        ctx.stroke();

        // Inner glowing highlights
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Foot dot
        ctx.fillStyle = '#c084fc';
        ctx.beginPath();
        ctx.arc(targetX, targetY, 2.5, 0, Math.PI * 2);
        ctx.fill();
      });

      // 7. Draw Spider Body
      ctx.save();
      ctx.translate(bodyX, bodyY);
      ctx.rotate(bodyAngle);

      // Body shadows
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 5;

      // Abdomen
      ctx.fillStyle = '#1e1b4b'; // Deep violet black
      ctx.beginPath();
      ctx.ellipse(0, 4, 7, 9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing pattern on Abdomen (hourglass/dots)
      ctx.fillStyle = '#a855f7';
      ctx.beginPath();
      ctx.arc(0, 2, 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Cephalothorax (head)
      ctx.fillStyle = '#312e81';
      ctx.beginPath();
      ctx.arc(0, -5, 5, 0, Math.PI * 2);
      ctx.fill();

      // Pedipalps (front mouth parts)
      ctx.strokeStyle = '#312e81';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(-2, -9, 2, 0, Math.PI, true);
      ctx.arc(2, -9, 2, 0, Math.PI, true);
      ctx.stroke();

      // Glowing Eyes
      ctx.fillStyle = '#22d3ee';
      ctx.beginPath();
      ctx.arc(-1.8, -7, 1.2, 0, Math.PI * 2);
      ctx.arc(1.8, -7, 1.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [spiderPos, isDragging, onCompleteTodo]);

  // Handle Dragging / Mouse Moves
  const handleMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    // Click tolerance near spider body
    const dist = Math.hypot(clientX - spiderPos.x, clientY - spiderPos.y);
    if (dist < 30) {
      setIsDragging(true);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = Math.max(15, Math.min(385, e.clientX - rect.left));
    const y = Math.max(15, Math.min(385, e.clientY - rect.top));
    setSpiderPos({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div 
      ref={containerRef} 
      className="spider-playground-card glass-panel"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="card-header">
        <h4>🕷️ Web of Tasks (Fidget Spider)</h4>
        <p className="card-desc">Drag UTHM Spider to eat flies (active tasks) and auto-complete them!</p>
      </div>
      <canvas 
        ref={canvasRef} 
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      />
    </div>
  );
};

export default SpiderWebCanvas;
