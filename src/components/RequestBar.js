import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBackendContext } from '../contexts/BackendContext';
import PropTypes from 'prop-types';

const styles = {
  requestBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    padding: '16px 24px',
    background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.3)',
    border: 'none',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 600,
    minWidth: '200px',
  },
  icon: {
    fontSize: '24px',
  },
  label: {
    margin: 0,
  },
  sublabel: {
    fontSize: '12px',
    opacity: 0.9,
    marginTop: '2px',
  },
  dropdown: {
    position: 'relative',
    display: 'inline-block',
  },
  dropdownContent: {
    position: 'absolute',
    top: '100%',
    left: '50%',
    transform: 'translateX(-50%)',
    marginTop: '8px',
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)',
    border: '1px solid #e2e8f0',
    minWidth: '280px',
    zIndex: 1000,
    overflow: 'hidden',
  },
  dropdownOption: {
    padding: '16px 20px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    borderBottom: '1px solid #f1f5f9',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  dropdownOptionLast: {
    borderBottom: 'none',
  },
  dropdownOptionHover: {
    background: '#f8fafc',
  },
  optionIcon: {
    fontSize: '20px',
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#1e293b',
    margin: 0,
  },
  optionDesc: {
    fontSize: '12px',
    color: '#64748b',
    margin: '2px 0 0',
    lineHeight: 1.4,
  },
};

function RequestBar({ variant = 'default', style = {} }) {
  const { currentUser } = useBackendContext();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showDropdown && !event.target.closest('.request-dropdown')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  if (!currentUser) return null;

  const isPatient = currentUser.role === 'patient';
  const isDoctor = currentUser.role === 'doctor';

  const handleClick = () => {
    if (isPatient) {
      setShowDropdown(!showDropdown);
    } else if (isDoctor) {
      navigate('/patient-directory');
    }
  };

  const handlePatientOption = (option) => {
    setShowDropdown(false);
    if (option === 'medicine-request') {
      navigate('/medicine-request');
    } else if (option === 'prescription-request') {
      navigate('/patient-prescription');
    }
  };

  const getContent = () => {
    if (isPatient) {
      return {
        icon: '💊',
        label: 'Medical Request',
        sublabel: 'Choose your preferred request type',
      };
    }
    if (isDoctor) {
      return {
        icon: '👥',
        label: 'Patient Directory',
        sublabel: 'View patients and manage access requests',
      };
    }
    return null;
  };

  const content = getContent();
  if (!content) return null;

  const variantStyles = {
    default: {},
    compact: {
      padding: '12px 20px',
      minWidth: '160px',
    },
    inline: {
      display: 'inline-flex',
      minWidth: 'auto',
    },
  };

  return (
    <div className="request-dropdown" style={styles.dropdown}>
      <button
        onClick={handleClick}
        style={{
          ...styles.requestBar,
          ...(variantStyles[variant] || {}),
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 99, 235, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.3)';
        }}
      >
        <span style={styles.icon}>{content.icon}</span>
        <div>
          <p style={styles.label}>{content.label}</p>
          {variant !== 'compact' && <p style={styles.sublabel}>{content.sublabel}</p>}
        </div>
        {isPatient && (
          <span style={{ marginLeft: '8px', fontSize: '14px' }}>
            {showDropdown ? '▲' : '▼'}
          </span>
        )}
      </button>

      {/* Dropdown for patients */}
      {isPatient && showDropdown && (
        <div style={styles.dropdownContent}>
          <div
            style={styles.dropdownOption}
            onClick={() => handlePatientOption('medicine-request')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = styles.dropdownOptionHover.background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '';
            }}
          >
            <span style={styles.optionIcon}>📄</span>
            <div style={styles.optionContent}>
              <p style={styles.optionTitle}>Request Medicine</p>
              <p style={styles.optionDesc}>
                Upload existing prescription or request verification from a doctor
              </p>
            </div>
          </div>
          <div
            style={{ ...styles.dropdownOption, ...styles.dropdownOptionLast }}
            onClick={() => handlePatientOption('prescription-request')}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = styles.dropdownOptionHover.background;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '';
            }}
          >
            <span style={styles.optionIcon}>⚕️</span>
            <div style={styles.optionContent}>
              <p style={styles.optionTitle}>Create Prescription Request</p>
              <p style={styles.optionDesc}>
                Submit detailed prescription request for doctor review and approval
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

RequestBar.propTypes = {
  variant: PropTypes.oneOf(['default', 'compact', 'inline']),
  style: PropTypes.object,
};

RequestBar.defaultProps = {
  variant: 'default',
  style: {},
};

export default RequestBar;
