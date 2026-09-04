import { Route } from 'react-router-dom';
import AppointmentPage from './AppointmentPage';

// The page supports both the complete appointment queue and the signed-in staff queue.
export const appointmentRoutes = (
  <>
    <Route path="appointments/all" element={<AppointmentPage mode="all" />} />
    <Route path="appointments/my" element={<AppointmentPage mode="my" />} />
  </>
);

export default appointmentRoutes;

