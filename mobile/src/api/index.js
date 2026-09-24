import client from './client';

export const authAPI = {
  register:    data    => client.post('/api/auth/register', data),
  login:       data    => client.post('/api/auth/login-mobile', data),
  refresh:     token   => client.post('/api/auth/refresh-mobile', {refreshToken: token}),
  logout:      token   => client.post('/api/auth/logout-mobile', {refreshToken: token}),
  employers:   ()      => client.get('/api/auth/employers'),
};

export const employeeAPI = {
  dashboard:        ()         => client.get('/api/employee/dashboard'),
  payslips:         ()         => client.get('/api/employee/payslips'),
  advances:         ()         => client.get('/api/employee/advances'),
  requestAdvance:   data       => client.post('/api/employee/advances', data),
  savings:          ()         => client.get('/api/employee/savings'),
  createSavingsPot: data       => client.post('/api/employee/savings', data),
  updateSavingsPot: (id, data) => client.patch(`/api/employee/savings/${id}`, data),
  credit:           ()         => client.get('/api/employee/credit'),
  updateConsent:    data       => client.patch('/api/employee/credit/consent', data),
  activity:         (n = 20)   => client.get(`/api/employee/activity?limit=${n}`),
};

export const hrAPI = {
  dashboard:    ()         => client.get('/api/hr/dashboard'),
  advances:     status     => client.get(`/api/hr/advances?status=${status || 'PENDING'}`),
  actionAdvance:(id, data) => client.patch(`/api/hr/advances/${id}`, data),
  employees:    ()         => client.get('/api/hr/employees'),
  deductions:   ()         => client.get('/api/hr/deductions'),
  updatePolicy: data       => client.patch('/api/hr/policy', data),
};

export const aiAPI = {
  initial: ()    => client.get('/api/ai/initial'),
  chat:    msg   => client.post('/api/ai/chat', {message: msg}),
};
