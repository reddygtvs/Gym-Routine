import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserProfile } from '../types';

interface HeaderProps {
  user: UserProfile;
}

const Header: React.FC<HeaderProps> = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/progress', label: 'Progress' },
    { path: '/settings', label: 'Settings' }
  ];

  return (
    <header style={{
      borderBottom: '1px solid rgb(55, 55, 53)',
      backgroundColor: 'rgb(17, 17, 16)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      display: 'block'
    }}>
      <div className="container-content" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        minHeight: '56px',
        maxWidth: 'none',
        margin: '0'
      }}>
        <Link 
          to="/dashboard" 
          style={{ 
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}
        >
          <img 
            src="/images/logo_gym_routine.png" 
            alt="5/3/1 Routine" 
            style={{ 
              width: '32px', 
              height: '32px',
              flexShrink: 0
            }}
          />
          <span 
            className="text-primary" 
            style={{ 
              fontSize: '18px', 
              fontWeight: 600,
              whiteSpace: 'nowrap',
              flexShrink: 0,
              lineHeight: 1
            }}
          >
            5/3/1 Routine
          </span>
        </Link>

        <nav>
          <ul style={{
            display: 'flex',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            gap: '16px',
            alignItems: 'center'
          }}>
            {navItems.map((item) => (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={location.pathname === item.path ? 'text-accent' : 'text-secondary'}
                  style={{
                    textDecoration: 'none',
                    fontSize: '13px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    padding: '8px 4px'
                  }}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;