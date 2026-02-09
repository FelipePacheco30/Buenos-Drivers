import api from './api';

const AdminService = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },
  getDrivers: async () => {
    const res = await api.get('/admin/drivers');
    return res.data;
  },
  approveRequest: async (requestId) => {
    const res = await api.post(`/admin/requests/${requestId}/approve`);
    return res.data;
  },
};

export default AdminService;
