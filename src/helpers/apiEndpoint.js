// Mock API – point directly to json-server (no proxy; avoids CRA dev server allowedHosts bug)
export const apiEndPoint = process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : '';
