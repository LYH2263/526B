import request from './request';

export const getBranches = (status) => {
  const params = status ? { status } : {};
  return request.get('/branches', { params });
};

export const getBranch = (id) => {
  return request.get(`/branches/${id}`);
};
