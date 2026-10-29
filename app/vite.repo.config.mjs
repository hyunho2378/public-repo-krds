import base from './vite.config.js';
export default { ...base, server: { ...base.server, port: 5771, proxy: { '/api': { target: 'http://127.0.0.1:5772' }, '/auth': { target: 'http://127.0.0.1:5772' } } } };
