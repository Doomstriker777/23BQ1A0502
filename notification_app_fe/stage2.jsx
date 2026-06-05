// notification_app_fe/stage2.jsx

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container,
  Typography
} from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AllNotifications from './src/pages/AllNotifications';
import PriorityInbox from './src/pages/PriorityInbox';

function Stage2App() {
  const [currentPage, setCurrentPage] = useState('all');

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Navigation Bar */}
      <AppBar 
        position="sticky" 
        sx={{ 
          backgroundColor: '#1e293b', 
          boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
        }}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ height: '70px' }}>
            <NotificationsActiveIcon sx={{ mr: 1.5, fontSize: 28, color: '#f59e0b' }} />
            
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 4,
                fontWeight: 800,
                color: '#fff',
                textDecoration: 'none',
                letterSpacing: '-0.5px'
              }}
            >
              AffordMed Alerts
            </Typography>

            <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
              <Button
                onClick={() => setCurrentPage('all')}
                sx={{
                  color: '#fff',
                  fontWeight: currentPage === 'all' ? 700 : 500,
                  fontSize: '14px',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  backgroundColor: currentPage === 'all' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)'
                  }
                }}
              >
                All Notifications
              </Button>
              
              <Button
                onClick={() => setCurrentPage('priority')}
                sx={{
                  color: '#fff',
                  fontWeight: currentPage === 'priority' ? 700 : 500,
                  fontSize: '14px',
                  px: 2,
                  py: 1,
                  borderRadius: '8px',
                  backgroundColor: currentPage === 'priority' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)'
                  }
                }}
              >
                Priority Inbox (Top 10)
              </Button>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Page Content */}
      <Container maxWidth="lg" sx={{ mt: 2 }}>
        {currentPage === 'all' && <AllNotifications />}
        {currentPage === 'priority' && <PriorityInbox />}
      </Container>
    </Box>
  );
}

export default Stage2App;

