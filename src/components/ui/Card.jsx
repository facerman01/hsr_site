// components/ui/card.jsx
import React from "react";

export const Card = ({ className = "", children }) => {
  return (
    <div className={`rounded-lg border bg-white shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export const CardContent = ({ className = "", children }) => {
  return <div className={`p-6 ${className}`}>{children}</div>;
};