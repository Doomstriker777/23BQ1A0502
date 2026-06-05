import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AllNotifications from './pages/AllNotifications';
import PriorityInbox from './pages/PriorityInbox';

// Replace with your actual token from Postman
const AUTH_TOKEN = "YOUR_TOKEN_HERE";

function App() {
  const [currentPage, setCurrentPage] = useState('all');

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: '#fafafa' }}>
      {/* Navigation Bar */}
      <AppBar position="static" sx={{ backgroundColor: '#1976d2' }}>
        <Toolbar>
          <NotificationsIcon sx={{ mr: 2, fontSize: 28 }} />
          <Box sx={{ flexGrow: 1 }}>
            <Button
              color="inherit"
              onClick={() => setCurrentPage('all')}
              sx={{
                fontWeight: currentPage === 'all' ? 'bold' : 'normal',
                fontSize: 16
              }}
            >
              All Notifications
            </Button>
            <Button
              color="inherit"
              onClick={() => setCurrentPage('priority')}
              sx={{
                fontWeight: currentPage === 'priority' ? 'bold' : 'normal',
                fontSize: 16,
                ml: 2
              }}
            >
              Priority Inbox
            </Button>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Page Content */}
      <Container maxWidth="lg">
        {currentPage === 'all' && <AllNotifications token={AUTH_TOKEN} />}
        {currentPage === 'priority' && <PriorityInbox token={AUTH_TOKEN} />}
      </Container>
    </Box>
  );
}

export default App;
