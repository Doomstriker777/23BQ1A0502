# Stage 1

## Overview
Stage 1 implements a Priority Inbox system that fetches, sorts, and displays the top 10 notifications from the Affordmed Notifications API.

## Sorting Logic

The priority inbox uses a weighted sorting system to determine the importance of notifications:

1. **Weight Assignment**: Each notification type is assigned a numerical weight:
   - `Placement` = 3 (highest priority)
   - `Result` = 2 (medium priority)
   - `Event` = 1 (low priority)

2. **Multi-Level Sort**: Notifications are sorted using a two-step comparison:
   - **Primary Sort**: Notifications are sorted by weight in descending order (higher weight = higher priority)
   - **Secondary Sort**: If two notifications have the same weight, they are sorted by timestamp. The timestamp strings are parsed into JavaScript `Date` objects and compared, with the newest notification appearing first.

3. **Top 10 Selection**: After sorting, the `.slice(0, 10)` method extracts the first 10 items from the sorted array, which represent the most important notifications.

### Example Sorting Behavior:
- If we have 2 Placements (weight 3) and 3 Results (weight 2):
  - Both Placements appear first, ordered by most recent timestamp
  - Then the 3 Results appear, ordered by most recent timestamp
  - The 10th item could be an Event (weight 1) if there are enough results

## Streaming Data & Top 10 Maintenance

**Also note that new notifications will keep coming in. How will you maintain the top 10 efficiently?**

As new notifications arrive in real-time, re-sorting the entire array every time would be inefficient, especially as the notification list grows large. Here are two optimal approaches:

### Approach 1: Priority Queue (Min-Heap)
- Maintain a Priority Queue (implemented as a Min-Heap) that always keeps the top 10 items.
- When a new notification arrives:
  - Compare it with the smallest item in the heap
  - If it has higher priority, remove the smallest and insert the new notification
  - The heap automatically maintains the correct order
- **Benefit**: O(log 10) = O(1) insertion time, very fast for incoming data

### Approach 2: Binary Search Insertion
- Keep the top 10 items in a sorted array
- When a new notification arrives:
  - Use binary search to find the correct insertion position
  - Insert at that position, then remove the last item if size exceeds 10
- **Benefit**: O(log 10) search time + O(1) insertion/deletion, simple to implement

Both approaches avoid the O(n log n) cost of sorting the entire array each time, making the system efficient for continuous data streams.

## Components
1. **src/priorityInbox.js** - Standalone script for fetching and sorting notifications
2. **notification_app_be** - Backend notification service
3. **notification_app_fe** - Frontend notification UI component
4. **logging_middleware** - Logging middleware for tracking API calls

## API Integration
- Fetches notifications from: `http://4.224.186.213/evaluation-service/notifications`
- Requires Bearer token authentication
- Returns a JSON array of notification objects with `type` and `timestamp` properties

