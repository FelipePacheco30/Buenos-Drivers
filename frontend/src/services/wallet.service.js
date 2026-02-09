import api from './api';

const WalletService = {
  getBalance: async () => {
    const res = await api.get('/wallet/balance');
    return res.data;
  },
  addFunds: async (amount) => {
    const res = await api.post('/wallet/add', { amount });
    return res.data;
  },
};

export default WalletService;
