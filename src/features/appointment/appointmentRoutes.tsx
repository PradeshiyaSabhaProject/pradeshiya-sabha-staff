import { Route } from 'react-router-dom';
import AppointmentPage from './AppointmentPage';
import ScheduleAppointmentPage from './ScheduleAppointmentPage';

// Feature-scoped routes for Appointment Management
export const appointmentRoutes = (
  <>
    <Route path="appointments/schedule" element={<ScheduleAppointmentPage />} />
    <Route path="appointments/all" element={<AppointmentPage mode="all" />} />
    <Route path="appointments/my" element={<AppointmentPage mode="my" />} />
  </>
);

export default appointmentRoutes;

