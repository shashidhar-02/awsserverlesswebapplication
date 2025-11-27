# Step 6: Testing and Verification

## Overview

This guide helps you comprehensively test your serverless Task Tracker application to ensure all components work together correctly. We'll test each layer from the database to the frontend.

## Testing Checklist

Use this checklist to track your testing progress:

- [ ] DynamoDB table is accessible and functional
- [ ] Cognito user pool allows sign-up and sign-in
- [ ] Lambda functions execute without errors
- [ ] API Gateway routes requests correctly
- [ ] Frontend loads and displays properly
- [ ] End-to-end user flows work seamlessly

---

## Part A: Component-Level Testing

### 1. Test DynamoDB

#### Via AWS Console:

1. Go to **DynamoDB** → **Tables** → `TasksTable`
2. Click **Explore table items**
3. Click **Create item**
4. Add a test item:
   ```json
   {
     "task_id": "test-001",
     "user_id": "test-user",
     "task_name": "Test Task",
     "description": "Testing DynamoDB",
     "status": "Pending",
     "created_at": "2024-01-15T10:00:00Z"
   }
   ```
5. Click **Create item**
6. Verify the item appears in the table
7. Delete the test item

✅ **Pass Criteria**: Item created and visible, then successfully deleted

---

### 2. Test Cognito User Pool

#### Test User Sign-Up:

1. Go to **Cognito** → **User Pools** → `TaskTrackerUserPool`
2. Go to **Users** tab
3. Click **Create user**
4. Create a test user:
   - Email: `testuser@example.com`
   - Mark email as verified: ✅
   - Set temporary password: `TestPass123!`
   - Uncheck "require password change"
5. Click **Create user**
6. Verify user appears with status **CONFIRMED**

#### Test Authentication (AWS CLI - Optional):

```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id YOUR_APP_CLIENT_ID \
  --auth-parameters USERNAME=testuser@example.com,PASSWORD=TestPass123! \
  --region us-east-1
```

Expected output: JSON with `IdToken`, `AccessToken`, and `RefreshToken`

✅ **Pass Criteria**: User created successfully, authentication returns tokens

---

### 3. Test Lambda Functions

#### Test CreateTask Function:

1. Go to **Lambda** → Functions → `CreateTask`
2. Click **Test** tab
3. Create new test event named `CreateTaskTest`
4. Use this test event:
   ```json
   {
     "body": "{\"task_name\": \"Lambda Test Task\", \"description\": \"Testing Lambda function\"}",
     "requestContext": {
       "authorizer": {
         "claims": {
           "sub": "test-user-123"
         }
       }
     }
   }
   ```
5. Click **Test**
6. Review execution result

**Expected Response**:
```json
{
  "statusCode": 201,
  "headers": {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*"
  },
  "body": "{\"message\": \"Task created successfully\", \"task\": {...}}"
}
```

#### Test GetTasks Function:

Test event:
```json
{
  "requestContext": {
    "authorizer": {
      "claims": {
        "sub": "test-user-123"
      }
    }
  }
}
```

**Expected Response**: Status 200, list of tasks for the user

#### Test UpdateTask Function:

Test event:
```json
{
  "pathParameters": {
    "id": "TASK_ID_FROM_DYNAMODB"
  },
  "body": "{\"status\": \"Completed\"}",
  "requestContext": {
    "authorizer": {
      "claims": {
        "sub": "test-user-123"
      }
    }
  }
}
```

**Expected Response**: Status 200, updated task details

#### Test DeleteTask Function:

Test event:
```json
{
  "pathParameters": {
    "id": "TASK_ID_FROM_DYNAMODB"
  },
  "requestContext": {
    "authorizer": {
      "claims": {
        "sub": "test-user-123"
      }
    }
  }
}
```

**Expected Response**: Status 200, deletion confirmation

✅ **Pass Criteria**: All Lambda functions execute successfully with correct status codes

---

### 4. Test API Gateway

#### Using Postman:

**Step 1: Get Authentication Token**

First, you need a valid Cognito token. Use the test user you created.

**Step 2: Test POST /tasks (Create Task)**

1. Open Postman
2. Create new request:
   - **Method**: POST
   - **URL**: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/tasks`
   - **Headers**:
     - `Authorization`: `YOUR_COGNITO_ID_TOKEN`
     - `Content-Type`: `application/json`
   - **Body** (raw JSON):
     ```json
     {
       "task_name": "API Test Task",
       "description": "Testing via Postman"
     }
     ```
3. Click **Send**

**Expected**: Status 201, task creation confirmation

**Step 3: Test GET /tasks**

1. **Method**: GET
2. **URL**: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/tasks`
3. **Headers**: `Authorization`: `YOUR_COGNITO_ID_TOKEN`
4. Click **Send**

**Expected**: Status 200, array of tasks

**Step 4: Test PUT /tasks/{id}**

1. **Method**: PUT
2. **URL**: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/tasks/TASK_ID`
3. **Headers**: Authorization + Content-Type
4. **Body**:
   ```json
   {
     "status": "Completed"
   }
   ```
5. Click **Send**

**Expected**: Status 200, updated task

**Step 5: Test DELETE /tasks/{id}**

1. **Method**: DELETE
2. **URL**: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/tasks/TASK_ID`
3. **Headers**: `Authorization`: `YOUR_COGNITO_ID_TOKEN`
4. Click **Send**

**Expected**: Status 200, deletion confirmation

✅ **Pass Criteria**: All API endpoints return correct status codes and data

---

## Part B: End-to-End Testing

### 1. Frontend Loading Test

1. Open your S3 website URL in a browser:
   ```
   http://your-bucket-name.s3-website-us-east-1.amazonaws.com
   ```

2. **Check**:
   - Page loads without errors
   - Login form is visible
   - Styling is applied correctly
   - No console errors (F12 → Console)

✅ **Pass Criteria**: Page loads successfully with proper styling

---

### 2. User Registration Flow

**Steps**:

1. Click **"Sign up"** link
2. Fill in the form:
   - Name: `Test User`
   - Email: `yourrealemail@example.com` (use a real email you can access)
   - Password: `TestPassword123!`
3. Click **Sign Up**
4. Wait for success message: "Sign up successful! Please check your email..."
5. Check your email inbox (and spam folder)
6. Copy the 6-digit verification code
7. Enter the code in the verification form
8. Click **Verify**
9. Wait for confirmation: "Email verified! You can now login."

**Expected Results**:
- Success message appears after sign-up
- Verification email received within 1-2 minutes
- Verification succeeds
- Form switches back to login

✅ **Pass Criteria**: Full registration flow completes without errors

---

### 3. User Login Flow

**Steps**:

1. Enter your registered email and password
2. Click **Login**
3. Wait for page to switch to tasks dashboard

**Expected Results**:
- No error messages
- Auth section hides
- Tasks section appears
- Email displayed in header
- "No tasks yet" message visible (if no tasks exist)

✅ **Pass Criteria**: Successful login and dashboard display

---

### 4. Create Task Test

**Steps**:

1. In the "Add New Task" section:
   - Task Name: `Complete AWS Project`
   - Description: `Finish all setup steps for serverless app`
2. Click **Add Task**
3. Wait for success message
4. Observe task appearing in the list below

**Expected Results**:
- Success message: "Task created successfully!"
- Task appears in the task list
- Task shows:
  - ✅ Task name
  - ✅ Description
  - ✅ Status: Pending (yellow badge)
  - ✅ Created timestamp
  - ✅ "Mark Complete" and "Delete" buttons

✅ **Pass Criteria**: Task created and displayed correctly

---

### 5. View Tasks Test

**Steps**:

1. Refresh the page (F5)
2. Login again if prompted
3. Wait for tasks to load

**Expected Results**:
- Previously created task(s) still visible
- Tasks sorted by creation date (newest first)
- No errors in console

✅ **Pass Criteria**: Tasks persist and load correctly after refresh

---

### 6. Update Task Test (Mark Complete)

**Steps**:

1. Find a task with status "Pending"
2. Click **Mark Complete** button
3. Wait for success message

**Expected Results**:
- Success message: "Task marked as completed!"
- Task updates visually:
  - Status changes to "Completed" (green badge)
  - Task card becomes slightly faded
  - "Mark Complete" button disappears
- Changes persist after page refresh

✅ **Pass Criteria**: Task status updates successfully

---

### 7. Delete Task Test

**Steps**:

1. Click **Delete** button on any task
2. Confirm deletion in the popup dialog
3. Wait for success message

**Expected Results**:
- Confirmation dialog appears
- Success message: "Task deleted successfully!"
- Task disappears from the list
- If all tasks deleted, "No tasks yet" message appears

✅ **Pass Criteria**: Task deletes successfully

---

### 8. Logout Test

**Steps**:

1. Click **Logout** button
2. Observe page behavior

**Expected Results**:
- Tasks section hides
- Auth section (login form) appears
- Task list is cleared
- No errors

✅ **Pass Criteria**: Logout works correctly

---

### 9. Session Persistence Test

**Steps**:

1. Login to the application
2. Create a task
3. Close the browser tab completely
4. Reopen the browser and navigate to the S3 URL
5. Observe behavior

**Expected Results**:
- You remain logged in (session persists)
- Tasks dashboard appears automatically
- Your tasks are visible

✅ **Pass Criteria**: Session persists across browser sessions

---

## Part C: Error Handling Tests

### 1. Test Invalid Login

**Steps**:
1. Try to login with wrong password
2. Observe error message

**Expected**: Error message displayed: "Incorrect username or password"

---

### 2. Test Expired Token

**Steps**:
1. Login and wait for token to expire (1 hour by default)
2. Try to create a task

**Expected**: Error message about authentication or automatic re-login prompt

---

### 3. Test Network Errors

**Steps**:
1. Open browser developer tools (F12)
2. Go to Network tab
3. Enable "Offline" mode
4. Try to load tasks

**Expected**: Error message: "Failed to load tasks"

---

## Part D: Performance Testing

### Check CloudWatch Logs

1. Go to **CloudWatch** → **Log groups**
2. Find log groups for your Lambda functions:
   - `/aws/lambda/CreateTask`
   - `/aws/lambda/GetTasks`
   - `/aws/lambda/UpdateTask`
   - `/aws/lambda/DeleteTask`
3. Click on each log group
4. Review latest log streams
5. Check for:
   - Execution duration (should be < 1000ms)
   - Memory usage
   - No error stack traces

✅ **Pass Criteria**: No errors, reasonable execution times

---

## Part E: Security Testing

### 1. Test Authorization

**Steps**:
1. Login as User A
2. Create a task and note its task_id
3. Logout
4. Login as User B (create new user if needed)
5. Try to access User A's task via API (using Postman):
   - Try to update User A's task
   - Try to delete User A's task

**Expected**: 403 Forbidden error - users can only access their own tasks

---

### 2. Test CORS

**Steps**:
1. Open browser console (F12)
2. Try to make API call from console:
   ```javascript
   fetch('YOUR_API_URL/tasks', {
     headers: { 'Authorization': 'invalid-token' }
   })
   ```

**Expected**: 
- Request completes (not blocked by CORS)
- Returns 401 Unauthorized (invalid token)

---

### 3. Test Without Authentication

**Steps**:
1. Using Postman, try to call API without Authorization header
2. Send GET request to `/tasks` without token

**Expected**: 401 Unauthorized response

---

## Common Issues and Solutions

### Issue: "Access Denied" in S3

**Solution**:
- Check bucket policy allows public read
- Verify static website hosting is enabled
- Ensure files are uploaded to bucket root

### Issue: "CORS Error" in Browser

**Solution**:
- Enable CORS on API Gateway resources
- Ensure Lambda functions return CORS headers
- Redeploy API Gateway

### Issue: "User does not exist" in Cognito

**Solution**:
- Verify email is confirmed/verified
- Check user pool ID in frontend config
- Ensure user was created in correct user pool

### Issue: API Returns 500 Error

**Solution**:
- Check CloudWatch logs for Lambda errors
- Verify DynamoDB table name is correct
- Check IAM role has DynamoDB permissions

### Issue: Tasks Not Loading

**Solution**:
- Open browser console, check for errors
- Verify API Gateway URL in `app.js`
- Check Cognito token is valid
- Verify API Gateway authorizer is configured

### Issue: Authentication Token Errors

**Solution**:
- Verify User Pool ID and App Client ID in `app.js`
- Check region matches across all services
- Ensure app client doesn't require client secret

---

## Verification Checklist

Complete this checklist to verify your application:

### Infrastructure:
- [ ] DynamoDB table created and active
- [ ] Cognito user pool configured
- [ ] Four Lambda functions deployed
- [ ] API Gateway deployed to prod stage
- [ ] S3 bucket configured for static hosting
- [ ] All services in the same region

### Configuration:
- [ ] `app.js` has correct User Pool ID
- [ ] `app.js` has correct App Client ID
- [ ] `app.js` has correct API Gateway URL
- [ ] `app.js` has correct region
- [ ] Bucket policy allows public read
- [ ] CORS enabled on API Gateway

### Functionality:
- [ ] User registration works
- [ ] Email verification works
- [ ] User login works
- [ ] Create task works
- [ ] View tasks works
- [ ] Update task works
- [ ] Delete task works
- [ ] Logout works
- [ ] Session persists

### Security:
- [ ] Users can only access their own tasks
- [ ] API requires authentication
- [ ] Passwords are strong (Cognito policy)
- [ ] HTTPS used (API Gateway default)

---

## Performance Benchmarks

### Expected Performance:

| Operation | Expected Time | Acceptable Range |
|-----------|--------------|------------------|
| Page Load | < 2 seconds | < 5 seconds |
| Login | < 1 second | < 3 seconds |
| Create Task | < 1 second | < 2 seconds |
| Load Tasks | < 1 second | < 3 seconds |
| Update Task | < 1 second | < 2 seconds |
| Delete Task | < 1 second | < 2 seconds |

### Lambda Metrics:

- **Duration**: < 500ms average
- **Memory Used**: < 100MB
- **Cold Start**: < 2 seconds (first invocation)
- **Warm Start**: < 100ms

---

## Final Deployment Checklist

Before considering your project complete:

- [ ] All tests pass successfully
- [ ] No errors in browser console
- [ ] No errors in CloudWatch logs
- [ ] Application is accessible via public URL
- [ ] Multiple users can register and use independently
- [ ] Data persists across sessions
- [ ] Application is responsive on mobile devices
- [ ] README documentation is complete
- [ ] Configuration values are documented

---

## Monitoring and Maintenance

### Set Up CloudWatch Alarms (Optional):

1. Go to **CloudWatch** → **Alarms**
2. Create alarms for:
   - Lambda errors (> 5 in 5 minutes)
   - Lambda throttles
   - API Gateway 4XX/5XX errors
   - DynamoDB throttles

### Regular Checks:

- Review CloudWatch logs weekly
- Check AWS costs in Billing dashboard
- Monitor DynamoDB storage usage
- Review Cognito user activity

---

## Conclusion

By completing all tests in this guide, you've verified:

✅ Your serverless application is fully functional  
✅ All AWS services are properly integrated  
✅ Security measures are working correctly  
✅ The application is production-ready for demonstration purposes  

---

## Next Steps

Now that your application is tested and verified:

1. **Share your project**: Add it to your portfolio or resume
2. **Enhance functionality**: Add features like task due dates, priorities, tags
3. **Improve UI**: Enhance the design, add animations
4. **Add features**: 
   - Task categories
   - Search and filter
   - Export tasks to CSV
   - Email notifications
   - Task sharing
5. **Scale up**: Add CloudFront CDN, custom domain, SSL certificate
6. **Monitor**: Set up comprehensive monitoring and alerting
7. **Document**: Create a blog post or video about your experience

---

## Additional Resources

- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Serverless Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [AWS Cost Management](https://aws.amazon.com/aws-cost-management/)
- [AWS Security Best Practices](https://docs.aws.amazon.com/security/)

---

## Congratulations! 🎉

You've successfully built, deployed, and tested a fully functional serverless web application using AWS services. This project demonstrates your ability to:

- Design serverless architectures
- Integrate multiple AWS services
- Implement user authentication and authorization
- Build REST APIs
- Deploy web applications
- Test and verify cloud applications

This is a significant achievement that showcases real-world cloud development skills!
