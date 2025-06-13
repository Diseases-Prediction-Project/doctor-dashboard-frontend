import React, { useState, useEffect } from 'react';
import { appointmentService } from '../services/appointments';
import { usersService } from '../services/users';
import { dateTimeUtils } from '../utils/dateTime';

function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [notesMode, setNotesMode] = useState(false);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    status: 'all'
  });

  // Edit form data
  const [editData, setEditData] = useState({
    date: '',
    startTime: '',
    duration: '30',
    notes: ''
  });

  useEffect(() => {
    fetchAppointments();
  }, [filters]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError('');

    try {
      const result = await appointmentService.getAllAppointments({
        sortBy: 'appointmentStartDate',
        sortOrder: 'desc',
        pageSize: 100
      });

      if (result.success) {
        let appointments = result.data.data || result.data.items || [];
        
        // Client-side date filtering
        if (filters.dateFrom) {
          const fromDate = new Date(filters.dateFrom);
          fromDate.setHours(0, 0, 0, 0);
          appointments = appointments.filter(apt => 
            new Date(apt.appointmentStartDate) >= fromDate
          );
        }
        
        if (filters.dateTo) {
          const toDate = new Date(filters.dateTo);
          toDate.setHours(23, 59, 59, 999);
          appointments = appointments.filter(apt => 
            new Date(apt.appointmentStartDate) <= toDate
          );
        }
        
        const enrichedAppointments = await enrichAppointmentsWithPatientData(appointments);
        
        // Filter by status if needed
        const filteredAppointments = filters.status === 'all' 
          ? enrichedAppointments
          : enrichedAppointments.filter(apt => apt.status === filters.status);
          
        setAppointments(filteredAppointments);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load appointments');
    } finally {
      setLoading(false);
    }
  };

  const enrichAppointmentsWithPatientData = async (appointments) => {
    const enrichedAppointments = await Promise.all(
      appointments.map(async (appointment) => {
        try {
          const patientResult = await usersService.getCurrentUser(appointment.patientId);
          if (patientResult.success) {
            return {
              ...appointment,
              patient: patientResult.data,
              status: dateTimeUtils.getAppointmentStatus(
                appointment.appointmentStartDate,
                appointment.appointmentEndDate
              ),
              duration: dateTimeUtils.calculateDuration(
                appointment.appointmentStartDate,
                appointment.appointmentEndDate
              )
            };
          }
        } catch (err) {
          console.error('Failed to fetch patient data:', err);
        }
        return {
          ...appointment,
          status: dateTimeUtils.getAppointmentStatus(
            appointment.appointmentStartDate,
            appointment.appointmentEndDate
          ),
          duration: dateTimeUtils.calculateDuration(
            appointment.appointmentStartDate,
            appointment.appointmentEndDate
          )
        };
      })
    );
    return enrichedAppointments;
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleEdit = (appointment) => {
    const startDate = new Date(appointment.appointmentStartDate);
    const endDate = new Date(appointment.appointmentEndDate);
    const duration = dateTimeUtils.calculateDuration(
      appointment.appointmentStartDate,
      appointment.appointmentEndDate
    );

    setEditData({
      date: startDate.toISOString().split('T')[0],
      startTime: `${startDate.getHours().toString().padStart(2, '0')}:${startDate.getMinutes().toString().padStart(2, '0')}`,
      duration: duration.toString(),
      notes: appointment.notes || ''
    });
    setSelectedAppointment(appointment);
    setEditMode(true);
    setNotesMode(false);
  };

  const handleAddNotes = (appointment) => {
    setEditData({
      ...editData,
      notes: appointment.notes || ''
    });
    setSelectedAppointment(appointment);
    setNotesMode(true);
    setEditMode(false);
  };

  const handleDelete = async (appointment) => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) {
      return;
    }

    const result = await appointmentService.deleteAppointment(appointment.id);
    if (result.success) {
      fetchAppointments();
    } else {
      alert('Failed to delete appointment: ' + result.error);
    }
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    try {
      if (notesMode) {
        // Just updating notes
        const result = await appointmentService.addNotes(selectedAppointment.id, editData.notes);
        if (result.success) {
          setNotesMode(false);
          setSelectedAppointment(null);
          fetchAppointments();
        } else {
          alert('Failed to update notes: ' + result.error);
        }
      } else {
        // Full update
        const startDate = new Date(editData.date);
        const [hours, minutes] = editData.startTime.split(':');
        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
        
        const endDate = new Date(startDate.getTime() + parseInt(editData.duration) * 60000);

        const updateData = {
          appointmentStartDate: startDate.toISOString(),
          appointmentEndDate: endDate.toISOString(),
          notes: editData.notes
        };

        const result = await appointmentService.updateAppointment(selectedAppointment.id, updateData);
        if (result.success) {
          setEditMode(false);
          setSelectedAppointment(null);
          fetchAppointments();
        } else {
          alert('Failed to update appointment: ' + result.error);
        }
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return '#3498db';
      case 'ongoing':
        return '#2ecc71';
      case 'completed':
        return '#95a5a6';
      default:
        return '#34495e';
    }
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 8; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        if (hour === 17 && minute > 30) continue;
        
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const label = new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit'
        });
        options.push({ value: time, label });
      }
    }
    return options;
  };

  if (loading) {
    return (
      <div className="container">
        <p style={{ textAlign: 'center' }}>Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="heading">Appointment Management</h1>
      
      {error && (
        <div style={{ 
          backgroundColor: '#fee', 
          color: '#c00', 
          padding: '10px', 
          borderRadius: '4px',
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      {/* Filters */}
      <div style={{ 
        backgroundColor: '#f8f9fa', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <h3 style={{ marginTop: 0 }}>Filters</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          <div>
            <label style={{ fontSize: '14px' }}>From Date</label>
            <input
              type="date"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '14px' }}>To Date</label>
            <input
              type="date"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              style={{ width: '100%' }}
            />
          </div>
          <div>
            <label style={{ fontSize: '14px' }}>Status</label>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
              style={{ width: '100%' }}
            >
              <option value="all">All</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Appointments List */}
      <div>
        <h3>Appointments ({appointments.length})</h3>
        {appointments.length === 0 ? (
          <p>No appointments found.</p>
        ) : (
          <div className="table-responsive">
            <table style={{ borderCollapse: 'collapse', minWidth: '800px' }}>
              <thead>
                <tr style={{ backgroundColor: '#f8f9fa' }}>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6', width: '12%' }}>Date</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6', width: '15%' }}>Time</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6', width: '20%' }}>Patient</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6', width: '10%' }}>Duration</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6', width: '10%' }}>Status</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6', width: '18%' }}>Notes</th>
                  <th style={{ padding: '10px', textAlign: 'left', borderBottom: '2px solid #dee2e6', width: '15%' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map(appointment => (
                  <tr key={appointment.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '10px' }}>
                      {dateTimeUtils.formatDate(appointment.appointmentStartDate)}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {dateTimeUtils.formatTime(appointment.appointmentStartDate)} - 
                      {dateTimeUtils.formatTime(appointment.appointmentEndDate)}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {appointment.patient?.email || 'Unknown'}
                    </td>
                    <td style={{ padding: '10px' }}>
                      {dateTimeUtils.formatDuration(appointment.duration)}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        backgroundColor: getStatusColor(appointment.status),
                        color: 'white',
                        textTransform: 'capitalize'
                      }}>
                        {appointment.status}
                      </span>
                    </td>
                    <td style={{ padding: '10px', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {appointment.notes ? 
                        <span style={{ fontSize: '14px' }} title={appointment.notes}>{appointment.notes.substring(0, 30)}...</span> : 
                        <span style={{ color: '#999' }}>-</span>
                      }
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        {appointment.status === 'upcoming' && (
                          <>
                            <button 
                              onClick={() => handleEdit(appointment)}
                              style={{ padding: '4px 8px', fontSize: '12px' }}
                            >
                              Edit
                            </button>
                            <button 
                              onClick={() => handleDelete(appointment)}
                              style={{ padding: '4px 8px', fontSize: '12px', backgroundColor: '#dc3545' }}
                            >
                              Delete
                            </button>
                          </>
                        )}
                        {appointment.status === 'completed' && (
                          <button 
                            onClick={() => handleAddNotes(appointment)}
                            style={{ padding: '4px 8px', fontSize: '12px' }}
                          >
                            {appointment.notes ? 'Edit Notes' : 'Add Notes'}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit/Notes Modal */}
      {(editMode || notesMode) && selectedAppointment && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '90vh',
            overflow: 'auto'
          }}>
            <h2>{notesMode ? 'Add/Edit Notes' : 'Edit Appointment'}</h2>
            <form onSubmit={handleUpdateSubmit}>
              {!notesMode && (
                <>
                  <label>Date</label>
                  <input
                    type="date"
                    value={editData.date}
                    onChange={(e) => setEditData({ ...editData, date: e.target.value })}
                    required
                  />

                  <label>Start Time</label>
                  <select
                    value={editData.startTime}
                    onChange={(e) => setEditData({ ...editData, startTime: e.target.value })}
                    required
                  >
                    {generateTimeOptions().map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>

                  <label>Duration</label>
                  <select
                    value={editData.duration}
                    onChange={(e) => setEditData({ ...editData, duration: e.target.value })}
                    required
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="45">45 minutes</option>
                    <option value="60">1 hour</option>
                  </select>
                </>
              )}

              <label>Notes</label>
              <textarea
                value={editData.notes}
                onChange={(e) => setEditData({ ...editData, notes: e.target.value })}
                rows={6}
                placeholder="Add appointment notes..."
                style={{ width: '100%' }}
              />

              <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                <button type="submit" className="btn">
                  {notesMode ? 'Save Notes' : 'Update Appointment'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setEditMode(false);
                    setNotesMode(false);
                    setSelectedAppointment(null);
                  }}
                  style={{ backgroundColor: '#6c757d' }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Appointments;