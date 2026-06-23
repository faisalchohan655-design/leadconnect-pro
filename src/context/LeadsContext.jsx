// frontend/src/context/LeadsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const LeadsContext = createContext();

export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);

  const fetchLeads = async () => {
    try {
      const res = await api.get('/leads');
      setLeads(res.data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    }
  };

  const addLeads = async (newLeads) => {
    try {
      const toSave = Array.isArray(newLeads) ? newLeads : [newLeads];
      
      // ✅ Save to backend
      await api.post('/leads/bulk', { leads: toSave });
      
      // ✅ FORCE REFRESH - YAHI FIX HAI
      const fresh = await api.get('/leads');
      setLeads(fresh.data || []);
      
      toast.success(`${toSave.length} leads saved!`);
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save');
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <LeadsContext.Provider value={{ leads, addLeads, fetchLeads, setLeads }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const ctx = useContext(LeadsContext);
  if (!ctx) throw new Error('useLeads must be used within LeadsProvider');
  return ctx;
};

export default LeadsContext;
