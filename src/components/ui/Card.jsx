// src/components/ui/Card.jsx
import React from 'react';

export function Card({ className, children }) {
  return (
    <div className={`rounded-lg shadow-md p-6 ${className}`}>
      {children}
    </div>
  );
}

export function CardContent({ children }) {
  return <div className="card-content">{children}</div>;
}
