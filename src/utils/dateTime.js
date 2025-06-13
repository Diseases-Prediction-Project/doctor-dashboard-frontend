export const dateTimeUtils = {
  // Format date/time for display
  formatDateTime: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatTime: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  formatDate: (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  },

  // Validate appointment times (8 AM - 6 PM)
  validateAppointmentTime: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Check working hours (8 AM - 6 PM)
    const startHour = start.getHours();
    const endHour = end.getHours();
    const endMinutes = end.getMinutes();
    
    if (startHour < 8 || startHour >= 18) {
      return { valid: false, error: 'Start time must be between 8 AM and 6 PM' };
    }
    
    if (endHour < 8 || endHour > 18 || (endHour === 18 && endMinutes > 0)) {
      return { valid: false, error: 'End time must be between 8 AM and 6 PM' };
    }
    
    // Check minimum duration (15 minutes)
    const duration = (end - start) / (1000 * 60); // minutes
    if (duration < 15) {
      return { valid: false, error: 'Appointment must be at least 15 minutes' };
    }
    
    // Check that end time is after start time
    if (end <= start) {
      return { valid: false, error: 'End time must be after start time' };
    }
    
    return { valid: true };
  },

  // Check if appointment is in the past
  isPastAppointment: (dateString) => {
    const appointmentDate = new Date(dateString);
    const now = new Date();
    return appointmentDate < now;
  },

  // Check if appointment is today
  isToday: (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  // Check if appointment is ongoing
  isOngoing: (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);
    return now >= start && now <= end;
  },

  // Calculate appointment duration in minutes
  calculateDuration: (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return Math.round((end - start) / (1000 * 60));
  },

  // Get appointment status
  getAppointmentStatus: (startDate, endDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (now < start) {
      return 'upcoming';
    } else if (now >= start && now <= end) {
      return 'ongoing';
    } else {
      return 'completed';
    }
  },

  // Format duration for display (e.g., "30 min", "1h 15min")
  formatDuration: (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
  },

  // Get today's date range for filtering
  getTodayDateRange: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    return { start: today, end: tomorrow };
  },

  // Get this week's date range
  getThisWeekDateRange: () => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const start = new Date(today);
    start.setDate(today.getDate() - dayOfWeek);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(start.getDate() + 7);
    return { start, end };
  },

  // Get next 7 days date range
  getNext7DaysDateRange: () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(today.getDate() + 7);
    return { start: today, end };
  }
};