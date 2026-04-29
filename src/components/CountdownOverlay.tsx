import React, { useEffect, useState } from 'react';

interface CountdownOverlayProps {
  seconds: number;
  onComplete: () => void;
}

const CountdownOverlay: React.FC<CountdownOverlayProps> = ({ seconds, onComplete }) => {
  const [count, setCount] = useState(seconds);

  useEffect(() => {
    if (count <= 0) {
      onComplete();
      return;
    }
    const timer = setTimeout(() => setCount(count - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, onComplete]);

  if (count <= 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <span style={{
        color: 'white',
        fontSize: '6rem',
        fontWeight: 'bold',
        textShadow: '0 2px 8px #000',
      }}>{count}</span>
    </div>
  );
};

export default CountdownOverlay;

