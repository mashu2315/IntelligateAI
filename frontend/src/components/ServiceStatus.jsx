import useHealthCheck from '../hooks/useHealthCheck';
import './ServiceStatus.css';

const ServiceStatus = ({ name, url }) => {
  const { status, error } = useHealthCheck(url);

  const statusConfig = {
    online: { label: 'Online', className: 'status-online' },
    offline: { label: 'Offline', className: 'status-offline' },
    checking: { label: 'Checking...', className: 'status-checking' },
  };

  const { label, className } = statusConfig[status];

  return (
    <div className="service-card">
      <div className="service-header">
        <h3 className="service-name">{name}</h3>
        <span className={`status-badge ${className}`}>
          <span className="status-dot"></span>
          {label}
        </span>
      </div>
      <p className="service-url">{url}</p>
      {error && <p className="service-error">{error}</p>}
    </div>
  );
};

export default ServiceStatus;
