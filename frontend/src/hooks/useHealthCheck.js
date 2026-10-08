import { useState, useEffect } from 'react';
import { fetchHealth } from '../services/api';

/**
 * Custom hook to check the health of a service
 * @param {string} url - The health endpoint URL
 * @param {number} interval - Polling interval in ms (default: 10s)
 * @returns {{ status: string, data: object|null, error: string|null }}
 */
const useHealthCheck = (url, interval = 10000) => {
  const [status, setStatus] = useState('checking');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkHealth = async () => {
      try {
        const result = await fetchHealth(url);
        if (isMounted) {
          setStatus('online');
          setData(result);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          setStatus('offline');
          setData(null);
          setError(err.message);
        }
      }
    };

    // Initial check
    checkHealth();

    // Poll at interval
    const timer = setInterval(checkHealth, interval);

    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, [url, interval]);

  return { status, data, error };
};

export default useHealthCheck;
