import React from "react";
import { X } from "lucide-react";

export function PageHeading({ title, description, actions }) {
  return (
    <div className="section-heading">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      {actions != null && <div className="heading-actions">{actions}</div>}
    </div>
  );
}

export function StatCard({ label, value, icon: Icon, tone = "green", note }) {
  return (
    <div className={`stat-card ${tone}`}>
      <div className="stat-icon">
        <Icon size={18} />
      </div>
      <div className="stat-copy">
        <span>{label}</span>
        <strong>{value}</strong>
        {note && <small>{note}</small>}
      </div>
    </div>
  );
}

export function Panel({ title, action, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <h3>{title}</h3>
        {action != null && <div className="panel-heading-actions">{action}</div>}
      </div>
      {children}
    </section>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div
      dir="rtl"
      className="modal-backdrop"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <section className="modal">
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label="بستن صفحه">
            <X size={18} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </section>
    </div>
  );
}
