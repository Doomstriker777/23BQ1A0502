// src/pages/AllNotifications.jsx

import { useState, useEffect } from 'react';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    Select,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';
import { fetchNotifications } from '../services/api';
import { markAsRead, isRead } from '../utils/storage';

const AllNotifications = ({ token }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadNotifications();
    }, [filter]);

    const loadNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchNotifications(token);
            setNotifications(data.notifications || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = (notificationId) => {
        markAsRead(notificationId);
        // Force re-render by updating state
        setNotifications([...notifications]);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                All Notifications
            </Typography>

            <Box sx={{ mb: 3 }}>
                <Select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    sx={{ minWidth: 200 }}
                >
                    <MenuItem value="">All Types</MenuItem>
                    <MenuItem value="Event">Event</MenuItem>
                    <MenuItem value="Result">Result</MenuItem>
                    <MenuItem value="Placement">Placement</MenuItem>
                </Select>
            </Box>

            {error && <Alert severity="error">{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={2}>
                    {notifications.map((notification, index) => {
                        const notifId = notification.id || notification.timestamp || index;
                        const read = isRead(notifId);

                        return (
                            <Grid item xs={12} key={String(notifId)}>
                                <Card
                                    onClick={() => handleNotificationClick(notifId)}
                                    sx={{
                                        cursor: 'pointer',
                                        opacity: read ? 0.6 : 1,
                                        backgroundColor: read ? '#f5f5f5' : '#fff',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            boxShadow: 3,
                                            backgroundColor: read ? '#f5f5f5' : '#fafafa'
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            {!read && (
                                                <Box
                                                    sx={{
                                                        width: 10,
                                                        height: 10,
                                                        borderRadius: '50%',
                                                        backgroundColor: '#2196f3',
                                                        flexShrink: 0
                                                    }}
                                                />
                                            )}
                                            <Typography
                                                variant="h6"
                                                sx={{
                                                    fontWeight: read ? 'normal' : 'bold',
                                                    flex: 1
                                                }}
                                            >
                                                {notification.title || notification.subject || 'Notification'}
                                            </Typography>
                                            {notification.type && (
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        backgroundColor: '#e3f2fd',
                                                        padding: '4px 8px',
                                                        borderRadius: '4px',
                                                        color: '#1976d2',
                                                        flexShrink: 0
                                                    }}
                                                >
                                                    {notification.type}
                                                </Typography>
                                            )}
                                        </Box>
                                        <Typography variant="body2" sx={{ mt: 1, mb: 1 }}>
                                            {notification.message || notification.description || notification.body || 'No content'}
                                        </Typography>
                                        {notification.timestamp && (
                                            <Typography variant="caption" sx={{ display: 'block', color: '#999' }}>
                                                {new Date(notification.timestamp).toLocaleString()}
                                            </Typography>
                                        )}
                                    </CardContent>
                                </Card>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

            {!loading && notifications.length === 0 && (
                <Typography variant="body1" sx={{ textAlign: 'center', py: 5 }}>
                    No notifications found.
                </Typography>
            )}
        </Container>
    );
};

export default AllNotifications;
