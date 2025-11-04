// Mock Backend Server for Testing Dashboard
// Run with: node mock-server.js

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock login endpoint
app.post('/api/auth/login', (req, res) => {
  console.log('Login attempt:', req.body);
  const { email, password } = req.body;
  
  // Accept demo credentials
  if (email === 'admin@sqb-tunisie.com' && password === 'admin123') {
    console.log('✅ Login successful');
    res.json({
      success: true,
      data: {
        user: {
          id: '1',
          email: 'admin@sqb-tunisie.com',
          firstName: 'Admin',
          lastName: 'User',
          role: 'ADMIN'
        },
        token: 'mock-jwt-token-12345',
        refreshToken: 'mock-refresh-token-67890'
      }
    });
  } else {
    console.log('❌ Login failed');
    res.status(401).json({
      success: false,
      error: {
        message: 'Invalid credentials'
      }
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Mock server running'
  });
});

// Catch all for debugging
app.use((req, res) => {
  console.log('Unhandled request:', req.method, req.url);
  res.status(404).json({ error: 'Not found' });
});

const server = app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════╗
║   Mock Backend Server                     ║
║   Port: ${PORT}                              ║
║   Status: Running ✓                       ║
║                                           ║
║   Login Credentials:                      ║
║   Email: admin@sqb-tunisie.com            ║
║   Password: admin123                      ║
║                                           ║
║   Test: curl http://localhost:3001/health ║
╚═══════════════════════════════════════════╝
  `);
});

// Keep server alive
process.on('SIGINT', () => {
  console.log('\n\nShutting down mock server...');
  server.close();
  process.exit(0);
});
