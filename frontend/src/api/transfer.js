import request from './request';

export const createTransfer = (data) => {
  return request.post('/transfers', data);
};

export const shipTransfer = (id, data) => {
  return request.post(`/transfers/${id}/ship`, data);
};

export const receiveTransfer = (id, data) => {
  return request.post(`/transfers/${id}/receive`, data);
};

export const cancelTransfer = (id, data) => {
  return request.post(`/transfers/${id}/cancel`, data);
};

export const getTransfers = (params) => {
  return request.get('/transfers', { params });
};

export const getTransfer = (id) => {
  return request.get(`/transfers/${id}`);
};
