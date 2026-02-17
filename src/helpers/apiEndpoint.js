// API base URL. Development: json-server on port 3002; override with REACT_APP_API_URL or REACT_APP_API_PORT.
// Production (e.g. Vercel): use REACT_APP_API_URL if set, otherwise /api for same-origin serverless API.
const devApiUrl =
  process.env.REACT_APP_API_URL ||
  `http://localhost:${process.env.REACT_APP_API_PORT || '3002'}`;
const prodApiUrl = process.env.REACT_APP_API_URL || '/api';
export const apiEndPoint = process.env.NODE_ENV === 'development' ? devApiUrl : prodApiUrl;
