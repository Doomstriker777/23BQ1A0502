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

    const getTypeColor = (type) => {
        switch (type) {
            case 'Placement':
                return '#d32f2f';
            case 'Result':
                return '#f57c00';
            case 'Event':
                return '#1976d2';
            default:
                return '#757575';
        }
    };

    // Group notifications by type
    const groupedNotifications = notifications.reduce((acc, notif) => {
        const type = notif.type || 'Other';
        if (!acc[type]) acc[type] = [];
        acc[type].push(notif);
        return acc;
    }, {});

    const displayGroups = Object.keys(groupedNotifications).sort((a, b) => {
        const order = { 'Placement': 0, 'Result': 1, 'Event': 2 };
        return (order[a] || 3) - (order[b] || 3);
    });

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
                displayGroups.map((type) => (
                    <Box key={type} sx={{ mb: 4 }}>
                        <Typography
                            variant="h6"
                            sx={{
                                mb: 2,
                                pb: 1,
                                borderBottom: `3px solid ${getTypeColor(type)}`,
                                fontWeight: 'bold',
                                color: getTypeColor(type)
                            }}
                        >
                            {type}
                        </Typography>
                        <Grid container spacing={2}>
                            {groupedNotifications[type].map((notification, index) => {
                                const notifId = notification.id || notification.timestamp || `${type}-${index}`;
                                const read = isRead(notifId);

                                return (
                                    <Grid item xs={12} key={String(notifId)}>
                                        <Card
                                            onClick={() => handleNotificationClick(notifId)}
                                            sx={{
                                                cursor: 'pointer',
                                                opacity: read ? 0.6 : 1,
                                                backgroundColor: read ? '#f5f5f5' : '#fff',
                                                borderLeft: `4px solid ${getTypeColor(type)}`,
                                                transition: 'all 0.2s',
                                                '&:hover': {
                                                    boxShadow: 3
                                                }
                                            }}
                                        >
                                            <CardContent>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, mb: 1 }}>
                                                    {!read && (
                                                        <Box
                                                            sx={{
                                                                width: 10,
                                                                height: 10,
                                                                borderRadius: '50%',
                                                                backgroundColor: getTypeColor(type),
                                                                flexShrink: 0,
                                                                mt: 0.5
                                                            }}
                                                        />
                                                    )}
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: read ? 'normal' : 'bold',
                                                                mb: 0.5
                                                            }}
                                                        >
                                                            {notification.message || notification.description || notification.body || 'No content'}
                                                        </Typography>
                                                        {notification.timestamp && (
                                                            <Typography variant="caption" sx={{ display: 'block', color: '#999' }}>
                                                                {new Date(notification.timestamp).toLocaleString()}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    </Grid>
                                );
                            })}
                        </Grid>
                    </Box>
                ))
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
