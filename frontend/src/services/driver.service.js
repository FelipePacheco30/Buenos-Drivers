import api from './api';

const DriverService = {
  getEarnings: async () => {
    const res = await api.get('/driver/earnings');
    return res.data;
  },
  getWallet: async () => {
    const res = await api.get('/driver/wallet');
    return res.data;
  },
  startTrip: async (tripId) => {
    const res = await api.post(`/driver/trips/${tripId}/start`);
    return res.data;
  },
};

export default DriverService;
