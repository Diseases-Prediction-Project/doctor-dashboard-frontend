import API from './api';
import { dateTimeUtils } from '../utils/dateTime';

export const appointmentService = {
  // Create a new appointment
  createAppointment: async (appointmentData) => {
    try {
      // Validate time constraints
      const validation = dateTimeUtils.validateAppointmentTime(
        appointmentData.appointmentStartDate,
        appointmentData.appointmentEndDate
      );
      
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }
      
      const response = await API.post('/appointments/create', appointmentData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to create appointment' 
      };
    }
  },

  // Get all appointments with optional filters
  getAllAppointments: async (queryParams = {}) => {
    try {
      // Only send supported parameters
      const supportedParams = {};
      if (queryParams.searchKey) supportedParams.searchKey = queryParams.searchKey;
      if (queryParams.page) supportedParams.page = queryParams.page;
      if (queryParams.pageSize) supportedParams.pageSize = queryParams.pageSize;
      if (queryParams.sortBy) supportedParams.sortBy = queryParams.sortBy;
      if (queryParams.sortOrder) supportedParams.sortOrder = queryParams.sortOrder;
      
      const response = await API.get('/appointments', { params: supportedParams });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointments' 
      };
    }
  },

  // Get today's appointments
  getTodayAppointments: async () => {
    try {
      const { start, end } = dateTimeUtils.getTodayDateRange();
      const response = await API.get('/appointments', { 
        params: {
          sortBy: 'appointmentStartDate',
          sortOrder: 'asc',
          pageSize: 100 // Get more appointments to ensure we have all for today
        }
      });
      
      // Filter appointments for today on the client side
      if (response.data.data) {
        const todayAppointments = response.data.data.filter(appointment => {
          const appointmentDate = new Date(appointment.appointmentStartDate);
          return appointmentDate >= start && appointmentDate < end;
        });
        return { 
          success: true, 
          data: { 
            ...response.data, 
            data: todayAppointments,
            items: todayAppointments 
          } 
        };
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch today\'s appointments' 
      };
    }
  },

  // Get upcoming appointments (next 7 days)
  getUpcomingAppointments: async () => {
    try {
      const { start, end } = dateTimeUtils.getNext7DaysDateRange();
      const response = await API.get('/appointments', { 
        params: {
          sortBy: 'appointmentStartDate',
          sortOrder: 'asc',
          pageSize: 100 // Get more appointments to ensure we have all upcoming
        }
      });
      
      // Filter appointments for next 7 days on the client side
      if (response.data.data) {
        const upcomingAppointments = response.data.data.filter(appointment => {
          const appointmentDate = new Date(appointment.appointmentStartDate);
          return appointmentDate >= start && appointmentDate < end;
        });
        return { 
          success: true, 
          data: { 
            ...response.data, 
            data: upcomingAppointments,
            items: upcomingAppointments 
          } 
        };
      }
      
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch upcoming appointments' 
      };
    }
  },

  // Get a specific appointment by ID
  getAppointment: async (id) => {
    try {
      const response = await API.get(`/appointments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to fetch appointment' 
      };
    }
  },

  // Update an appointment
  updateAppointment: async (id, updateData) => {
    try {
      // If updating time, validate constraints
      if (updateData.appointmentStartDate || updateData.appointmentEndDate) {
        const validation = dateTimeUtils.validateAppointmentTime(
          updateData.appointmentStartDate,
          updateData.appointmentEndDate
        );
        
        if (!validation.valid) {
          return { success: false, error: validation.error };
        }
      }
      
      const response = await API.patch(`/appointments/${id}`, updateData);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to update appointment' 
      };
    }
  },

  // Delete an appointment
  deleteAppointment: async (id) => {
    try {
      const response = await API.delete(`/appointments/${id}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to delete appointment' 
      };
    }
  },

  // Add or update notes for an appointment
  addNotes: async (id, notes) => {
    try {
      const response = await API.patch(`/appointments/${id}`, { notes });
      return { success: true, data: response.data };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to add notes' 
      };
    }
  },

  // Check for scheduling conflicts
  checkConflicts: async (doctorId, startDate, endDate, excludeAppointmentId = null) => {
    try {
      // Fetch all appointments (backend will filter by logged-in doctor)
      const response = await API.get('/appointments', {
        params: {
          pageSize: 100 // Get enough appointments to check conflicts
        }
      });
      
      const appointments = response.data.data || response.data.items || [];
      const conflicts = appointments.filter(apt => {
        if (excludeAppointmentId && apt.id === excludeAppointmentId) {
          return false;
        }
        
        // Only check conflicts for the same doctor
        if (apt.doctorId !== doctorId) {
          return false;
        }
        
        const aptStart = new Date(apt.appointmentStartDate);
        const aptEnd = new Date(apt.appointmentEndDate);
        const newStart = new Date(startDate);
        const newEnd = new Date(endDate);
        
        // Check for overlap
        return (newStart < aptEnd && newEnd > aptStart);
      });
      
      return { success: true, hasConflicts: conflicts.length > 0, conflicts };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Failed to check conflicts' 
      };
    }
  }
};