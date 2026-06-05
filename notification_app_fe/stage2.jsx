// notification_app_fe/stage1.js

import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  Container
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AllNotifications from './src/pages/AllNotifications';
import PriorityInbox from './src/pages/PriorityInbox';

// Replace with your actual token from Postman
const AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJhZGFyc2hraXJhbjEzQGdtYWlsLmNvbSIsImV4cCI6MTc4MDY0MDYyOCwiaWF0IjoxNzgwNjM5NzI4LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiNDcxNGNiOTAtNThmMS00OWI0LTgzNmMtM2UwZWQ3MWRhZWViIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoiYWRhcnNoIGtpcmFuIHRhcHBpdGEiLCJzdWIiOiI3MzVjZTg0MS1lZWJhLTQzZGQtYTA5NC1mYWRjY2JhODVmYTAifSwiZW1haWwiOiJhZGFyc2hraXJhbjEzQGdtYWlsLmNvbSIsIm5hbWUiOiJhZGFyc2gga2lyYW4gdGFwcGl0YSIsInJvbGxObyI6IjIzYnExYTA1MDIiLCJhY2Nlc3NDb2RlIjoiUVFkRVl5IiwiY2xpZW50SUQiOiI3MzVjZTg0MS1lZWJhLTQzZGQtYTA5NC1mYWRjY2JhODVmYTAiLCJjbGllbnRTZWNyZXQiOiJtUnhjWGp4WHpheFhLaFZ3In0.e-q6pMpUOgRbzTs014BGu6u70NaxPmGILuEff2wU6NE";

function Stage2App() {
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
              Priority Inbox (Top 10)
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

export default Stage2App;
