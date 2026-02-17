// API base URL. Development: json-server on port 3002; override with REACT_APP_API_URL or REACT_APP_API_PORT.
const devApiUrl =
  process.env.REACT_APP_API_URL ||
  `http://localhost:${process.env.REACT_APP_API_PORT || '3002'}`;
export const apiEndPoint = process.env.NODE_ENV === 'development' ? devApiUrl : '';
