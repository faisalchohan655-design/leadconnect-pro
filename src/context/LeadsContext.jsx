import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';

const LeadsContext = createContext();

export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leads');
      setLeads(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to load leads');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addLeads = (newLeads) => {
    setLeads(prev => [...newLeads, ...prev]);
  };

  const deleteLead = (id) => {
    setLeads(prev => prev.filter(l => l._id !== id));
  };

  const deleteMultiple = (ids) => {
    setLeads(prev => prev.filter(l => !ids.includes(l._id)));
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <LeadsContext.Provider value={{ leads, loading, error, fetchLeads, addLeads, deleteLead, deleteMultiple }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => useContext(LeadsContext);
