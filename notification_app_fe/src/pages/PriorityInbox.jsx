// src/pages/PriorityInbox.jsx

import { useState, useEffect, useRef } from 'react';
import {
    Container,
    Card,
    CardContent,
    Typography,
    Box,
    Grid,
    CircularProgress,
    Alert,
    Chip,
    Paper,
    Divider,
    IconButton,
    Tooltip
} from '@mui/material';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import TerminalIcon from '@mui/icons-material/Terminal';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { fetchNotifications } from '../services/api';
import { markAsRead, isRead } from '../utils/storage';

// Helper function to assign weight based on notification type
const getWeight = (notificationType) => {
    if (notificationType === "Placement") return 3;
    if (notificationType === "Result") return 2;
    if (notificationType === "Event") return 1;
    return 0;
};

// Priority sorting comparator (higher weight first, newer timestamp first)
const compareNotifications = (a, b) => {
    const weightA = getWeight(a.Type);
    const weightB = getWeight(b.Type);
    if (weightA !== weightB) {
        return weightB - weightA;
    }
    const dateA = new Date(a.Timestamp);
    const dateB = new Date(b.Timestamp);
    return dateB - dateA;
};

// Binary Search Insertion Index Finder
const findInsertionIndex = (arr, item) => {
    let low = 0;
    let high = arr.length - 1;
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const cmp = compareNotifications(item, arr[mid]);
        if (cmp < 0) {
            high = mid - 1;
        } else if (cmp > 0) {
            low = mid + 1;
        } else {
            return mid;
        }
    }
    return low;
};

const PriorityInbox = ({ token }) => {
    const [top10, setTop10] = useState([]);
    const [processedIds, setProcessedIds] = useState(new Set());
    const [algoLogs, setAlgoLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isLive, setIsLive] = useState(true);

    // Store refs to keep values fresh in the interval closure
    const top10Ref = useRef([]);
    const processedIdsRef = useRef(new Set());
    
    useEffect(() => {
        top10Ref.current = top10;
    }, [top10]);

    useEffect(() => {
        processedIdsRef.current = processedIds;
    }, [processedIds]);

    const loadInitialNotifications = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchNotifications(token);
            const notifications = data.notifications || [];
            
            // Sort notifications by priority and pick top 10
            const sorted = [...notifications].sort(compareNotifications);
            const initialTop10 = sorted.slice(0, 10);
            
            // Populate seen IDs
            const ids = new Set(notifications.map(n => n.ID));
            
            setTop10(initialTop10);
            setProcessedIds(ids);
            setAlgoLogs([
                {
                    time: new Date().toLocaleTimeString(),
                    text: `Init: Fetched ${notifications.length} notifications. Sorted and selected top 10.`
                }
            ]);
        } catch (err) {
            console.error('Error fetching initial notifications:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Poll for new notifications
    useEffect(() => {
        loadInitialNotifications();

        const interval = setInterval(async () => {
            if (!isLive) return;
            try {
                const data = await fetchNotifications(token);
                const notifications = data.notifications || [];
                
                // Identify new items not yet processed
                const currentProcessed = processedIdsRef.current;
                const newItems = notifications.filter(n => !currentProcessed.has(n.ID));
                
                if (newItems.length > 0) {
                    processNewNotifications(newItems);
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
        }, 5000); // Poll every 5 seconds

        return () => clearInterval(interval);
    }, [isLive]);

    const processNewNotifications = (newItems) => {
        const currentTop10 = [...top10Ref.current];
        const currentProcessed = new Set(processedIdsRef.current);
        const newLogs = [];

        // Sort incoming notifications oldest-first to insert in chronological order
        const sortedNewItems = [...newItems].sort((a, b) => new Date(a.Timestamp) - new Date(b.Timestamp));

        for (const item of sortedNewItems) {
            currentProcessed.add(item.ID);
            const idx = findInsertionIndex(currentTop10, item);
            
            if (idx < 10) {
                currentTop10.splice(idx, 0, item);
                let text = `Binary Search: Inserted ${item.Type} (${item.Message.substring(0, 20)}...) at Rank ${idx + 1}.`;
                
                if (currentTop10.length > 10) {
                    const popped = currentTop10.pop();
                    text += ` Kicked out ${popped.Type} (${popped.Message.substring(0, 20)}...).`;
                }
                
                newLogs.unshift({
                    time: new Date().toLocaleTimeString(),
                    text: text
                });
            } else {
                newLogs.unshift({
                    time: new Date().toLocaleTimeString(),
                    text: `Binary Search: Ignored ${item.Type} (${item.Message.substring(0, 20)}...) - priority too low for Top 10 (Rank ${idx + 1}).`
                });
            }
        }

        setTop10(currentTop10);
        setProcessedIds(currentProcessed);
        setAlgoLogs(prev => [...newLogs, ...prev].slice(0, 50));
    };

    const handleNotificationClick = (notificationId) => {
        markAsRead(notificationId);
        setTop10([...top10]);
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'Placement': return '#d32f2f'; // Red
            case 'Result': return '#f57c00'; // Orange
            case 'Event': return '#1976d2'; // Blue
            default: return '#757575';
        }
    };

    const getTypeBgColor = (type) => {
        switch (type) {
            case 'Placement': return '#ffebee';
            case 'Result': return '#fff3e0';
            case 'Event': return '#e3f2fd';
            default: return '#f5f5f5';
        }
    };

    // Calculate count of each type in current top 10
    const stats = top10.reduce((acc, n) => {
        acc[n.Type] = (acc[n.Type] || 0) + 1;
        return acc;
    }, { Placement: 0, Result: 0, Event: 0 });

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            {/* Page Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 0.5 }}>
                        <Typography variant="h4" sx={{ fontWeight: 800, color: '#1a2035', letterSpacing: '-0.5px' }}>
                            Priority Inbox
                        </Typography>
                        <Chip
                            icon={<Box sx={{
                                width: 8,
                                height: 8,
                                borderRadius: '50%',
                                backgroundColor: isLive ? '#4caf50' : '#757575',
                                boxShadow: isLive ? '0 0 8px #4caf50' : 'none',
                                animation: isLive ? 'pulse 1.5s infinite' : 'none',
                                '@keyframes pulse': {
                                    '0%': { opacity: 0.4 },
                                    '50%': { opacity: 1 },
                                    '100%': { opacity: 0.4 }
                                }
                            }} />}
                            label={isLive ? "Live Streaming" : "Paused"}
                            size="small"
                            onClick={() => setIsLive(!isLive)}
                            sx={{
                                fontWeight: 'bold',
                                backgroundColor: isLive ? '#e8f5e9' : '#f5f5f5',
                                color: isLive ? '#2e7d32' : '#616161',
                                border: '1px solid',
                                borderColor: isLive ? '#a5d6a7' : '#e0e0e0',
                                '& .MuiChip-icon': { ml: 1, mr: -0.5 },
                                cursor: 'pointer'
                            }}
                        />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#64748b' }}>
                        Showing the Top 10 highest priority notifications (sorted by weight and timestamp).
                    </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Tooltip title="Trigger refresh now">
                        <IconButton onClick={loadInitialNotifications} color="primary" disabled={loading}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Metrics cards */}
            <Grid container spacing={2} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderLeft: `5px solid ${getTypeColor('Placement')}`, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Placements (Highest)</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: getTypeColor('Placement'), mt: 0.5 }}>{stats.Placement}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderLeft: `5px solid ${getTypeColor('Result')}`, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Results (Medium)</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: getTypeColor('Result'), mt: 0.5 }}>{stats.Result}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderLeft: `5px solid ${getTypeColor('Event')}`, borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
                        <CardContent sx={{ py: 2, '&:last-child': { pb: 2 } }}>
                            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 'bold', textTransform: 'uppercase' }}>Events (Low)</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 800, color: getTypeColor('Event'), mt: 0.5 }}>{stats.Event}</Typography>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '12px' }}>{error}</Alert>}

            {loading && top10.length === 0 ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={48} thickness={4} />
                </Box>
            ) : (
                <Grid container spacing={3}>
                    {/* Left side: Top 10 Notifications list */}
                    <Grid item xs={12} md={7}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2035', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <FlashOnIcon sx={{ color: '#f57c00' }} />
                            Live Top 10 Stack
                        </Typography>
                        
                        {top10.length === 0 ? (
                            <Box sx={{ textAlign: 'center', py: 8, backgroundColor: '#fcfcfc', borderRadius: '16px', border: '1px dashed #e0e0e0' }}>
                                <Typography variant="body1" sx={{ color: '#888' }}>
                                    No notifications in inbox.
                                </Typography>
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                {top10.map((notification, index) => {
                                    const notifId = notification.ID || notification.Timestamp || `priority-${index}`;
                                    const read = isRead(notifId);

                                    return (
                                        <Card
                                            key={String(notifId)}
                                            onClick={() => handleNotificationClick(notifId)}
                                            sx={{
                                                cursor: 'pointer',
                                                borderRadius: '12px',
                                                border: '1px solid #eef2f6',
                                                boxShadow: read ? 'none' : '0 4px 12px rgba(0, 0, 0, 0.03)',
                                                opacity: read ? 0.65 : 1,
                                                backgroundColor: read ? '#fafafa' : '#fff',
                                                borderLeft: `5px solid ${getTypeColor(notification.Type)}`,
                                                transition: 'all 0.2s ease-in-out',
                                                position: 'relative',
                                                overflow: 'visible',
                                                '&:hover': {
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.06)',
                                                    borderColor: getTypeColor(notification.Type)
                                                }
                                            }}
                                        >
                                            {/* Rank Badge */}
                                            <Box
                                                sx={{
                                                    position: 'absolute',
                                                    left: '-12px',
                                                    top: 'calc(50% - 12px)',
                                                    width: '24px',
                                                    height: '24px',
                                                    borderRadius: '50%',
                                                    backgroundColor: '#1a2035',
                                                    color: '#fff',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    fontSize: '11px',
                                                    fontWeight: 'bold',
                                                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                                                    zIndex: 2
                                                }}
                                            >
                                                {index + 1}
                                            </Box>

                                            <CardContent sx={{ py: 1.5, px: 3, '&:last-child': { pb: 1.5 } }}>
                                                <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                                                    {!read && (
                                                        <Box
                                                            sx={{
                                                                width: 10,
                                                                height: 10,
                                                                borderRadius: '50%',
                                                                backgroundColor: getTypeColor(notification.Type),
                                                                flexShrink: 0,
                                                                mt: 0.8,
                                                                boxShadow: `0 0 8px ${getTypeColor(notification.Type)}`
                                                            }}
                                                        />
                                                    )}
                                                    <Box sx={{ flex: 1 }}>
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', mb: 0.5 }}>
                                                            <Chip
                                                                label={notification.Type}
                                                                size="small"
                                                                sx={{
                                                                    backgroundColor: getTypeBgColor(notification.Type),
                                                                    color: getTypeColor(notification.Type),
                                                                    fontWeight: 'bold',
                                                                    fontSize: '10px',
                                                                    height: '18px'
                                                                }}
                                                            />
                                                            <Typography variant="caption" sx={{ color: '#8a99ad', fontWeight: 500 }}>
                                                                {new Date(notification.Timestamp).toLocaleString()}
                                                            </Typography>
                                                        </Box>
                                                        <Typography
                                                            variant="body1"
                                                            sx={{
                                                                fontWeight: read ? 500 : 700,
                                                                color: '#2c3e50',
                                                                fontSize: '14px',
                                                                lineHeight: 1.4
                                                            }}
                                                        >
                                                            {notification.Message}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </CardContent>
                                        </Card>
                                    );
                                })}
                            </Box>
                        )}
                    </Grid>

                    {/* Right side: Real-time algorithm logs console */}
                    <Grid item xs={12} md={5}>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a2035', mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <TerminalIcon sx={{ color: '#4caf50' }} />
                            Binary Search Insertion Log
                        </Typography>
                        
                        <Paper
                            sx={{
                                p: 2,
                                backgroundColor: '#1e1e2e',
                                color: '#a6adc8',
                                borderRadius: '12px',
                                border: '1px solid #313244',
                                fontFamily: 'Consolas, monospace',
                                minHeight: '380px',
                                maxHeight: '500px',
                                overflowY: 'auto',
                                boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.3)'
                            }}
                        >
                            {algoLogs.length === 0 ? (
                                <Typography variant="body2" sx={{ color: '#585b70', fontStyle: 'italic' }}>
                                    Waiting for algorithm activity logs...
                                </Typography>
                            ) : (
                                algoLogs.map((log, index) => (
                                    <Box key={index} sx={{ mb: 1, borderBottom: '1px solid #313244', pb: 1, '&:last-child': { borderBottom: 'none' } }}>
                                        <Typography component="span" sx={{ color: '#f9e2af', fontSize: '11px', mr: 1 }}>
                                            [{log.time}]
                                        </Typography>
                                        <Typography component="span" sx={{ 
                                            fontSize: '12px', 
                                            color: log.text.includes('Inserted') ? '#a6e3a1' : log.text.includes('Ignored') ? '#f38ba8' : '#89b4fa' 
                                        }}>
                                            {log.text}
                                        </Typography>
                                    </Box>
                                ))
                            )}
                        </Paper>
                    </Grid>
                </Grid>
            )}
        </Container>
    );
};

export default PriorityInbox;