import React from 'react';
import { Link } from 'react-router-dom';

const menu = [
  { route: '/dashboard', label: 'Dashboard', icon: 'bi bi-house' },
  { route: '/appointments', label: 'Appointments', icon: 'bi bi-calendar' },
  { route: '/add-appointment', label: 'Add Appointment', icon: 'bi bi-plus-circle' },
  { route: '/edit-profile', label: 'Profile', icon: 'bi bi-person' },
];

const Sidebar = ({ isCollapsed, handleLogout }) => {
  return (
    <nav
      className={`sidebar bg-primary text-white p-3 d-md-block ${
        isCollapsed ? 'd-none' : ''
      }`}
    >
      <ul className="nav flex-column">
        {menu.map((item, index) => (
          <li className="nav-item" key={index}>
            <Link className="nav-link text-white" to={item.route}>
              <i className={`${item.icon} me-2`}></i> {item.label}
            </Link>
          </li>
        ))}
        <li className="nav-item mt-3">
          <button className="btn btn-outline-light w-100" onClick={handleLogout}>
            <i className="bi bi-box-arrow-right me-2"></i> Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Sidebar;
