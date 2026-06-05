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
    Alert,
    FormControl,
    InputLabel,
    Chip,
    IconButton,
    Tooltip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { fetchNotifications } from '../services/api';
import { markAsRead, isRead, clearReadNotifications } from '../utils/storage';

const AllNotifications = ({ token }) => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        loadNotifications();
    }, []);

    const loadNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchNotifications(token);
            setNotifications(data.notifications || []);
        } catch (err) {
            console.error('Error fetching:', err);
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

    const handleMarkAllAsRead = () => {
        notifications.forEach(notif => {
            const notifId = notif.ID || notif.Timestamp;
            if (notifId) markAsRead(notifId);
        });
        setNotifications([...notifications]);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Placement':
                return '#d32f2f'; // Red
            case 'Result':
                return '#f57c00'; // Orange
            case 'Event':
                return '#1976d2'; // Blue
            default:
                return '#757575'; // Grey
        }
    };

    const getTypeBgColor = (type) => {
        switch (type) {
            case 'Placement':
                return '#ffebee';
            case 'Result':
                return '#fff3e0';
            case 'Event':
                return '#e3f2fd';
            default:
                return '#f5f5f5';
        }
    };

    // Filter notifications locally
    const filteredNotifications = filter
        ? notifications.filter(notif => notif.Type === filter)
        : notifications;

    // Group filtered notifications by Type
    const groupedNotifications = filteredNotifications.reduce((acc, notif) => {
        const type = notif.Type || 'Other';
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a2035', letterSpacing: '-0.5px' }}>
                    All Notifications
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Mark all as read">
                        <IconButton onClick={handleMarkAllAsRead} color="primary" disabled={notifications.length === 0}>
                            <CheckCircleIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Refresh notifications">
                        <IconButton onClick={loadNotifications} color="primary" disabled={loading}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                <FormControl sx={{ minWidth: 220 }}>
                    <InputLabel id="filter-type-label">Filter by Type</InputLabel>
                    <Select
                        labelId="filter-type-label"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        label="Filter by Type"
                        sx={{
                            borderRadius: '12px',
                            backgroundColor: '#fff',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                        }}
                    >
                        <MenuItem value="">All Types</MenuItem>
                        <MenuItem value="Placement">Placement</MenuItem>
                        <MenuItem value="Result">Result</MenuItem>
                        <MenuItem value="Event">Event</MenuItem>
                    </Select>
                </FormControl>
                
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip label={`Total: ${notifications.length}`} variant="outlined" sx={{ fontWeight: 'bold' }} />
                    <Chip 
                        label={`Unread: ${notifications.filter(n => !isRead(n.ID || n.Timestamp)).length}`} 
                        color="primary" 
                        sx={{ fontWeight: 'bold' }} 
                    />
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={48} thickness={4} />
                </Box>
            ) : (
                displayGroups.map((type) => (
                    <Box key={type} sx={{ mb: 5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: '800',
                                    color: getTypeColor(type),
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.5px',
                                    fontSize: '15px'
                                }}
                            >
                                {type}
                            </Typography>
                            <Chip 
                                label={groupedNotifications[type].length} 
                                size="small" 
                                sx={{ 
                                    backgroundColor: getTypeColor(type), 
                                    color: '#fff', 
                                    fontWeight: 'bold',
                                    height: '20px',
                                    fontSize: '11px'
                                }} 
                            />
                            <Box sx={{ flexGrow: 1, height: '2px', backgroundColor: getTypeBgColor(type) }} />
                        </Box>
                        
                        <Grid container spacing={2}>
                            {groupedNotifications[type].map((notification, index) => {
                                const notifId = notification.ID || notification.Timestamp || `${type}-${index}`;
                                const read = isRead(notifId);

                                return (
                                    <Grid item xs={12} key={String(notifId)}>
                                        <Card
                                            onClick={() => handleNotificationClick(notifId)}
                                            sx={{
                                                cursor: 'pointer',
                                                borderRadius: '12px',
                                                border: '1px solid #eef2f6',
                                                boxShadow: read ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.03)',
                                                opacity: read ? 0.65 : 1,
                                                backgroundColor: read ? '#fafafa' : '#fff',
                                                borderLeft: `5px solid ${getTypeColor(type)}`,
                                                transition: 'all 0.2s ease-in-out',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
                                                    borderColor: getTypeColor(type)
                                                }
                                            }}
                                        >
                                            <CardContent sx={{ '&:last-child': { pb: 2 } }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                    {!read && (
                                                        <Box
                                                            sx={{
                                                                width: 10,
                                                                height: 10,
                                                                borderRadius: '50%',
                                                                backgroundColor: getTypeColor(type),
                                                                flexShrink: 0,
                                                                mt: 0.8,
                                                                boxShadow: `0 0 8px ${getTypeColor(type)}`
                                                            }}
                                                        />
                                                    )}
                                                    <Box sx={{ flex: 1 }}>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: read ? 500 : 700,
                                                                color: '#2c3e50',
                                                                mb: 0.5,
                                                                fontSize: '15px',
                                                                lineHeight: 1.5
                                                            }}
                                                        >
                                                            {notification.Message || 'No content'}
                                                        </Typography>
                                                        {notification.Timestamp && (
                                                            <Typography 
                                                                variant="caption" 
                                                                sx={{ 
                                                                    display: 'inline-block', 
                                                                    color: '#8a99ad',
                                                                    fontWeight: 500
                                                                }}
                                                            >
                                                                {new Date(notification.Timestamp).toLocaleString()}
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

            {!loading && filteredNotifications.length === 0 && (
                <Box sx={{ textAlign: 'center', py: 8, backgroundColor: '#fcfcfc', borderRadius: '16px', border: '1px dashed #e0e0e0' }}>
                    <Typography variant="h6" sx={{ color: '#888', mb: 1 }}>
                        No notifications found
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#aaa' }}>
                        There are no notifications matching your current filter.
                    </Typography>
                </Box>
            )}
        </Container>
    );
};

export default AllNotifications;

