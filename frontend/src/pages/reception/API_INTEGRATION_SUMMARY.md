# API Integration Summary - Reception Folder

## ✅ Updated Files

### 1. ForemanResponseDetailPage.tsx
**Purpose**: Display detailed foreman response and allow customer decision (approve/reject)

**Changes Made**:
- ✅ Replaced mock data with `useForemanResponse(id)` hook
- ✅ Added loading state with spinner
- ✅ Added error handling with retry button
- ✅ Integrated `useCustomerDecision` hook for decision submission
- ✅ Added button disabled states during submission
- ✅ Fixed all customer decision comparisons (approved/rejected)
- ✅ Data automatically refetches after decision submission

**API Endpoints Used**:
- `GET /foreman-responses/:id` - Fetch single response
- `POST /foreman-responses/:id/decision` - Submit customer decision

---

### 2. ForemanResponsePage.tsx
**Purpose**: List all pending foreman responses with search and filter capabilities

**Changes Made**:
- ✅ Replaced mock data with `useForemanResponseList` hook
- ✅ Added loading state with spinner
- ✅ Added error handling with retry button
- ✅ Maintained all filtering functionality (name, phone, plate, model)
- ✅ Added pagination state (currently set to page 1, limit 10)
- ✅ Only shows PENDING_CUSTOMER status responses

**API Endpoints Used**:
- `GET /foreman-responses?page=1&limit=10&status=PENDING_CUSTOMER` - Fetch response list

**Note**: Pagination controls not yet implemented in UI, but state is ready for future enhancement.

---

## 📋 Type Definitions Used

### ForemanResponse Interface
Already contains all necessary fields in flat structure:
- Customer info: `firstName`, `lastName`, `phone`, etc.
- Motorcycle info: `model`, `color`, `plateLine1`, `plateLine2`, `province`
- Original symptoms: `symptoms`, `tags`, `images`
- Foreman assessment: `foremanAnalysis`, `estimatedCost`, `estimatedDuration`, `requiredParts`
- Decision: `customerDecision` ('approved' | 'rejected' | null)
- Status: `status` ('PENDING_CUSTOMER' | 'APPROVED' | 'REJECTED' | etc.)

---

## 🔧 React Hooks Available

### `useForemanResponse(id: string)`
Returns: `{ data, loading, error, refetch }`
- Fetches single foreman response by ID
- Auto-refreshes on mount
- Provides manual refetch function

### `useForemanResponseList(params)`
Returns: `{ data, total, loading, error }`
- Fetches paginated list of responses
- Supports filters: search, status, page, limit
- Returns total count for pagination

### `useCustomerDecision()`
Returns: `{ submitDecision, submitting, error }`
- Submits customer decision (approve/reject)
- Handles loading state automatically
- Returns error if submission fails

### `usePendingForemanResponses()`
Returns: `{ data, count, loading, error }`
- Convenience hook for pending responses only
- Pre-filtered for PENDING_CUSTOMER status

### `useForemanResponseStats()`
Returns: `{ stats, loading, error }`
- Gets statistics (total, pending, approved, rejected)
- Useful for dashboard widgets

---

## ⚠️ Minor Warnings (Can Be Ignored)

In `ForemanResponsePage.tsx`:
- `currentPage` and `setCurrentPage` declared but not yet used → Ready for pagination UI
- `total` variable declared but not yet used → Ready for pagination display

These are intentionally left in place for future pagination feature implementation.

---

## 🎯 Ready for Backend Integration

Both pages are now **fully prepared** to connect with the backend API. When the backend is running:

1. **ForemanResponsePage** will fetch and display all pending responses
2. **ForemanResponseDetailPage** will show full details and allow customers to approve/reject
3. All loading states, error handling, and data refetching are already implemented

---

## 🚀 Next Steps (Optional Enhancements)

1. **Pagination UI**: Add pagination controls using `currentPage`, `setCurrentPage`, and `total`
2. **Real-time Updates**: Add polling or WebSocket for live status updates
3. **Optimistic Updates**: Update UI immediately before API confirmation
4. **Toast Notifications**: Add success/error toasts after decision submission
5. **Image Preview**: Enhance image display with lightbox/modal viewer

---

## 📝 Testing Checklist

When backend is ready:
- [ ] List page loads and displays responses
- [ ] Search filter works
- [ ] Name/Phone/Plate/Model filters work
- [ ] Clicking a response navigates to detail page
- [ ] Detail page shows all information correctly
- [ ] "อนุมัติ" (Approve) button submits decision
- [ ] "ไม่อนุมัติ" (Reject) button submits decision
- [ ] Loading states display during API calls
- [ ] Error messages show when API fails
- [ ] Page refetches data after decision submission
