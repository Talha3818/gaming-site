# bKash Number Update Troubleshooting Guide

## Issue Description
The option to submit bKash number from admin is not working properly.

## System Overview
The bKash number update functionality involves:
1. **Frontend**: Admin SystemSettings page with bKash number input
2. **Backend**: SystemSettings model and admin routes
3. **Database**: MongoDB collection for system settings
4. **API**: REST endpoints for CRUD operations

## Troubleshooting Steps

### 1. Check Database Connection
First, ensure the database is properly connected and the SystemSettings collection exists.

```bash
# Run the test script
node test-bkash-update.js
```

Expected output:
```
✅ Connected to MongoDB
🔍 Checking current bKash setting...
📱 Current bKash setting: 01XXXXXXXXX
   Description: bKash number for deposits
   Last updated: [timestamp]
🎉 bKash update test completed successfully!
```

### 2. Check System Settings Collection
Verify that the SystemSettings collection exists and contains the bKash setting.

```bash
# Run the initialization script
node scripts/init-system-settings.js
```

### 3. Test API Endpoints
Use the test endpoint to verify the system settings API is working.

**Frontend Test:**
1. Go to Admin > System Settings
2. Click the "Test Settings" button (yellow button)
3. Check browser console for results

**Backend Test:**
```bash
# Test the API endpoint directly
curl -X GET "http://localhost:5000/api/admin/settings-test" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### 4. Check Environment Variables
Ensure the BKASH_NUMBER environment variable is set in your `.env` file.

```env
BKASH_NUMBER=01XXXXXXXXX
```

### 5. Verify Admin Authentication
Ensure the admin user has proper authentication and permissions.

```javascript
// Check if user is admin
console.log('User is admin:', user.isAdmin);
```

### 6. Check Browser Console
Look for any JavaScript errors in the browser console when updating the bKash number.

### 7. Check Server Logs
Monitor the server console for any error messages during the update process.

## Common Issues and Solutions

### Issue 1: "Setting not found" Error
**Problem**: The bKash setting doesn't exist in the database.
**Solution**: Run the initialization script to create default settings.

```bash
node scripts/init-system-settings.js
```

### Issue 2: "Value is required" Error
**Problem**: The request body is missing the value field.
**Solution**: Check the frontend mutation call and ensure data is properly structured.

### Issue 3: "Unauthorized" Error
**Problem**: The user doesn't have admin privileges.
**Solution**: Verify the user's admin status and authentication token.

### Issue 4: Database Connection Error
**Problem**: Cannot connect to MongoDB.
**Solution**: Check MongoDB connection string and ensure the service is running.

## Debugging Tools

### 1. Frontend Debugging
Add console logs to track the update process:

```javascript
console.log('🔄 Updating bKash number:', bkashNumber);
console.log('📤 Sending request with data:', { key: 'bkash_deposit_number', data: { value: bkashNumber, description: '...' } });
```

### 2. Backend Debugging
The backend now includes detailed logging:

```javascript
console.log('📝 Updating system setting:', req.params.key, { value, description });
console.log('🔄 Updating existing setting:', setting.key, 'from', setting.value, 'to', value);
```

### 3. API Testing
Use the test endpoint to verify system health:

```bash
GET /api/admin/settings-test
```

## Manual Testing Steps

### Step 1: Initialize System Settings
```bash
node scripts/init-system-settings.js
```

### Step 2: Test Database Operations
```bash
node test-bkash-update.js
```

### Step 3: Test Frontend Update
1. Navigate to Admin > System Settings
2. Enter a valid bKash number (e.g., 01712345678)
3. Click "Update bKash Number"
4. Check for success/error messages

### Step 4: Verify Update
1. Refresh the page
2. Check if the bKash number is updated
3. Verify the number appears in the payment form

## Expected Behavior

### Successful Update
- ✅ Toast notification: "Setting 'bkash_deposit_number' updated successfully!"
- ✅ bKash number field updates immediately
- ✅ Database reflects the new value
- ✅ Payment forms show the new number

### Error Cases
- ❌ Validation errors for invalid phone numbers
- ❌ Database connection errors
- ❌ Authentication/permission errors
- ❌ Network/API errors

## Validation Rules

The bKash number must follow Bangladeshi mobile number format:
- **Pattern**: `^(\+880|880|0)?1[3-9]\d{8}$`
- **Examples**: 
  - ✅ 01712345678
  - ✅ 8801712345678
  - ✅ +8801712345678
  - ❌ 0171234567 (too short)
  - ❌ 02712345678 (invalid prefix)

## File Locations

- **Model**: `models/SystemSettings.js`
- **Admin Routes**: `routes/admin.js` (lines 1396-1496)
- **Frontend Page**: `client/src/pages/admin/SystemSettings.js`
- **API Service**: `client/src/services/api.js`
- **Test Scripts**: `test-bkash-update.js`, `scripts/init-system-settings.js`

## Support

If the issue persists after following these steps:

1. Check the server logs for detailed error messages
2. Verify the database connection and collection existence
3. Test the API endpoints directly using curl or Postman
4. Check browser console for frontend errors
5. Ensure all environment variables are properly set

## Quick Fix Commands

```bash
# 1. Initialize system settings
node scripts/init-system-settings.js

# 2. Test bKash update functionality
node test-bkash-update.js

# 3. Check system settings test endpoint
curl -X GET "http://localhost:5000/api/admin/settings-test" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```
