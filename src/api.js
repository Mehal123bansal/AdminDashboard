import axios from 'axios';

// Axios instance
const API = axios.create({ baseURL: 'http://localhost:5000' });

// 🔐 Authentication
export const login = (data) => API.post('/login', data);

// 👤 User Info
export const fetchUsers = () => API.get('/userinfo');

// 📊 Dashboard Cards & Graphs
export const getDashboardInfo = () => API.get('/dashboard-info');
export const getMonthlyGraphData = () => API.get('/dashboard-monthly-graph');
export const getWeeklyGraphData = () => API.get('/dashboard-weekly-graph');

// 📄 CV Management
export const getCVsByMonth = (month) => API.get(`/api/cvs?month=${month}`);
export const deleteCVById = (id) => API.delete(`/api/cvs/${id}`);
export const searchCVs = (filters) => API.post('/api/search-cvs', filters);

// 🧑‍🤝‍🧑 Referral Eligibility
export const checkReferralEligibility = () => API.get('/backend-api/referrals/is_eligible_for_referrals');
