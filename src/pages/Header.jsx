import React from 'react';

const Header = ({ toggleSidebar }) => {
  return (
    <header className="d-flex justify-content-between align-items-center p-3 bg-body-secondary shadow-sm">
      <button className="btn btn-primary sidebar-toggle d-md-none" onClick={toggleSidebar}>
        <i className="bi bi-list"></i>
      </button>

      <span className="fw-semibold">Doctor's Portal</span>

      <nav className="d-flex justify-content-end">
        <button className="btn btn-outline-secondary">
          <i className="bi bi-bell"></i>
        </button>
      </nav>
    </header>
  );
};

export default Header;
