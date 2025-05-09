import { useState, useEffect } from 'react';
import axios from 'axios';

// Set the API URL consistently across the application
const API_URL = 'http://localhost:8000/api';

export function useFetchStats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios.get(`${API_URL}/admin/stats/`)
      .then(response => {
        setStats(response.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { stats, loading, error };
}