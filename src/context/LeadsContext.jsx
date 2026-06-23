// frontend/src/context/LeadsContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import toast from 'react-hot-toast';

const LeadsContext = createContext();

export const LeadsProvider = ({ children }) => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch leads from backend
  const fetchLeads = async () => {
    setLoading(true);
    try {
      const response = await api.get('/leads');
      setLeads(response.data);
    } catch (error) {
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add leads - THIS IS THE IMPORTANT FUNCTION
  const addLeads = async (newLeads) => {
    try {
      const toSave = Array.isArray(newLeads) ? newLeads : [newLeads];
      
      if (toSave.length === 0) {
        toast.error('No leads to save');
        return;
      }

      console.log('📝 Saving leads:', toSave.length);
      
      const response = await api.post('/leads/bulk', { leads: toSave });
      
      console.log('✅ Save response:', response.data);
      
      // Refresh leads after saving
      await fetchLeads();
      
      toast.success(`${toSave.length} leads saved successfully!`);
      return response.data;
    } catch (error) {
      console.error('❌ Save error:', error);
      toast.error(error.response?.data?.error || 'Failed to save leads');
      throw error;
    }
  };

  // Delete a lead
  const deleteLead = async (id) => {
    try {
      await api.delete(`/leads/${id}`);
      await fetchLeads();
      toast.success('Lead deleted');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete lead');
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  return (
    <LeadsContext.Provider value={{ 
      leads, 
      loading, 
      addLeads, 
      deleteLead,
      fetchLeads, 
      setLeads 
    }}>
      {children}
    </LeadsContext.Provider>
  );
};

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error('useLeads must be used within a LeadsProvider');
  }
  return context;
};

export default LeadsContext;
