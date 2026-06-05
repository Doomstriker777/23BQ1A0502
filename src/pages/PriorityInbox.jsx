// src/pages/PriorityInbox.jsx

import { useState, useEffect } from 'react';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    CircularProgress,
    Alert,
    Chip
} from '@mui/material';
import { fetchNotifications } from '../services/api';
import { markAsRead, isRead } from '../utils/storage';

const getWeight = (notificationType) => {
    if (notificationType === "Placement") return 3;
    if (notificationType === "Result") return 2;
    if (notificationType === "Event") return 1;
    return 0;
};

const PriorityInbox = ({ token }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadPriorityNotifications();
    }, []);

    const loadPriorityNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchNotifications(token);
            
            // Sort by priority: weight first, then timestamp
            const sorted = (data.notifications || []).sort((a, b) => {
                const weightA = getWeight(a.type);
                const weightB = getWeight(b.type);
                
                if (weightA !== weightB) {
                    return weightB - weightA;
                }
                
                const dateA = new Date(a.timestamp);
                const dateB = new Date(b.timestamp);
                return dateB - dateA;
            });

            // Get top 10
            const topTen = sorted.slice(0, 10);
            setNotifications(topTen);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleNotificationClick = (notificationId) => {
        markAsRead(notificationId);
        setNotifications([...notifications]);
    };

    const getPriorityColor = (type) => {
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

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
                Priority Inbox (Top 10)
            </Typography>

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
                                        borderLeft: `4px solid ${getPriorityColor(notification.type)}`,
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            boxShadow: 3
                                        }
                                    }}
                                >
                                    <CardContent>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                            <Typography variant="h6" sx={{ fontWeight: 'bold', minWidth: 30 }}>
                                                #{index + 1}
                                            </Typography>
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
                                                <Chip
                                                    label={notification.type}
                                                    size="small"
                                                    sx={{
                                                        backgroundColor: getPriorityColor(notification.type),
                                                        color: 'white',
                                                        flexShrink: 0
                                                    }}
                                                />
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
                    No notifications in priority inbox.
                </Typography>
            )}
        </Container>
    );
};

export default PriorityInbox;
