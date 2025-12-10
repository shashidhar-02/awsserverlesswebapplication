# Configuration Checklist

## 📝 Before You Begin

This checklist will help you track all the configuration values you need to collect during setup and update in your code.

---

## ✅ Step 1: DynamoDB Configuration

- [ ] **Table Created:** TasksTable
- [ ] **Partition Key:** task_id (String)
- [ ] **Capacity Mode:** On-demand
- [ ] **Status:** Active

**Table ARN to save:**

```
arn:aws:dynamodb:us-east-1:____________:table/TasksTable
```

---

## ✅ Step 2: Cognito Configuration

### User Pool Details

- [ ] **User Pool Created:** TaskTrackerUserPool
- [ ] **Email Verification:** Enabled
- [ ] **Self-registration:** Enabled

**Values to save:**

```
User Pool ID: us-east-1_____________
User Pool ARN: arn:aws:cognito-idp:us-east-1:____________:userpool/us-east-1_____________
```

### App Client Details

- [ ] **App Client Created:** TaskTrackerWebClient
- [ ] **Client Secret:** None (public client)
- [ ] **Authentication Flows:** ALLOW_USER_PASSWORD_AUTH, ALLOW_REFRESH_TOKEN_AUTH

**Values to save:**

```
App Client ID: ____________________________
```

### Cognito Domain

- [ ] **Domain Configured:** tasktracker-[unique-id]

**Values to save:**

```
Cognito Domain: https://tasktracker-____________.auth.us-east-1.amazoncognito.com
```

### Callback URLs Configuration

- [ ] **Callback URLs Set:**
  - [ ] `http://localhost:8000/`
  - [ ] `http://[YOUR-S3-BUCKET].s3-website-us-east-1.amazonaws.com/`

- [ ] **Sign-out URLs Set:**
  - [ ] `http://localhost:8000/`
  - [ ] `http://[YOUR-S3-BUCKET].s3-website-us-east-1.amazonaws.com/`

- [ ] **OAuth Settings:**
  - [ ] Implicit grant enabled
  - [ ] Scopes: openid, email, profile

---

## ✅ Step 3: Lambda Functions Configuration

### IAM Role

- [ ] **Role Created:** TaskTrackerLambdaRole
- [ ] **Permissions Attached:**
  - [ ] AmazonDynamoDBFullAccess
  - [ ] AWSLambdaBasicExecutionRole
  - [ ] CloudWatchLogsFullAccess

**Role ARN to save:**

```
arn:aws:iam::____________:role/TaskTrackerLambdaRole
```

### Lambda Functions Created

- [ ] **CreateTask**
  - [ ] Runtime: Python 3.12
  - [ ] Role: TaskTrackerLambdaRole
  - [ ] Environment Variable: TABLE_NAME=TasksTable
  - [ ] Code deployed
  - [ ] Test successful

- [ ] **GetTasks**
  - [ ] Runtime: Python 3.12
  - [ ] Role: TaskTrackerLambdaRole
  - [ ] Environment Variable: TABLE_NAME=TasksTable
  - [ ] Code deployed
  - [ ] Test successful

- [ ] **UpdateTask**
  - [ ] Runtime: Python 3.12
  - [ ] Role: TaskTrackerLambdaRole
  - [ ] Environment Variable: TABLE_NAME=TasksTable
  - [ ] Code deployed
  - [ ] Test successful

- [ ] **DeleteTask**
  - [ ] Runtime: Python 3.12
  - [ ] Role: TaskTrackerLambdaRole
  - [ ] Environment Variable: TABLE_NAME=TasksTable
  - [ ] Code deployed
  - [ ] Test successful

---

## ✅ Step 4: API Gateway Configuration

### REST API

- [ ] **API Created:** TaskTrackerAPI
- [ ] **Type:** REST API
- [ ] **Endpoint:** Regional

**Values to save:**

```
API ID: ____________
API Name: TaskTrackerAPI
```

### Cognito Authorizer

- [ ] **Authorizer Created:** CognitoAuthorizer
- [ ] **Type:** Cognito User Pool
- [ ] **Token Source:** Authorization
- [ ] **User Pool:** TaskTrackerUserPool linked

### Resources and Methods

- [ ] **/tasks Resource**
  - [ ] POST method (CreateTask)
    - [ ] Lambda integration enabled
    - [ ] Authorizer: CognitoAuthorizer
    - [ ] CORS enabled
  - [ ] GET method (GetTasks)
    - [ ] Lambda integration enabled
    - [ ] Authorizer: CognitoAuthorizer
    - [ ] CORS enabled

- [ ] **/tasks/{id} Resource**
  - [ ] PUT method (UpdateTask)
    - [ ] Lambda integration enabled
    - [ ] Authorizer: CognitoAuthorizer
    - [ ] CORS enabled
  - [ ] DELETE method (DeleteTask)
    - [ ] Lambda integration enabled
    - [ ] Authorizer: CognitoAuthorizer
    - [ ] CORS enabled

### API Deployment

- [ ] **Stage Created:** prod
- [ ] **API Deployed to prod stage**

**API Invoke URL to save:**

```
https://____________.execute-api.us-east-1.amazonaws.com/prod
```

### CORS Configuration

- [ ] **CORS Enabled on all methods**
  - [ ] Access-Control-Allow-Headers: Content-Type,Authorization
  - [ ] Access-Control-Allow-Origin: *
  - [ ] Access-Control-Allow-Methods: Appropriate methods per resource

---

## ✅ Step 5: S3 Configuration

### Bucket Creation

- [ ] **Bucket Created:** (Choose unique name)
- [ ] **Region:** us-east-1
- [ ] **Block Public Access:** DISABLED

**Bucket name to save:**

```
Bucket Name: ____________________________
```

### Static Website Hosting

- [ ] **Static Website Hosting:** Enabled
- [ ] **Index Document:** index.html
- [ ] **Error Document:** index.html

**Website endpoint to save:**

```
S3 Website URL: http://____________.s3-website-us-east-1.amazonaws.com
```

### Bucket Policy

- [ ] **Public Read Policy Applied**

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

### Files Uploaded

- [ ] index.html
- [ ] tasks.html
- [ ] task-app.js
- [ ] task-styles.css
- [ ] app.js (optional)
- [ ] styles.css (optional)

---

## ✅ Step 6: Code Configuration Updates

### Update frontend/index.html

Location: Lines 482-486

```javascript
const COGNITO_DOMAIN = "https://tasktracker-______.auth.us-east-1.amazoncognito.com";
const CLIENT_ID = "____________________________";
const REDIRECT_URI = "http://____________.s3-website-us-east-1.amazonaws.com/";
```

**Update with your values:**

- [ ] COGNITO_DOMAIN updated
- [ ] CLIENT_ID updated
- [ ] REDIRECT_URI updated

### Update frontend/task-app.js

Location: Lines 4-9

```javascript
const AWS_CONFIG = {
    region: 'us-east-1',
    userPoolId: 'us-east-1_____________',
    clientId: '____________________________',
    apiEndpoint: 'https://____________.execute-api.us-east-1.amazonaws.com/prod'
};
```

**Update with your values:**

- [ ] userPoolId updated
- [ ] clientId updated
- [ ] apiEndpoint updated

### Re-upload Updated Files to S3

- [ ] Updated index.html uploaded to S3
- [ ] Updated task-app.js uploaded to S3

---

## ✅ Step 7: Integration Testing

### Authentication Testing

- [ ] **Navigate to S3 Website URL**
- [ ] **Click "Sign In with Cognito"**
- [ ] **Create new account (Sign up)**
- [ ] **Verify email received**
- [ ] **Enter verification code**
- [ ] **Sign in successful**
- [ ] **Tokens displayed on page**
- [ ] **Sign out works**

### API Testing (Browser Console)

After signing in, open browser console and test:

- [ ] **Create Task (POST /tasks)**

  ```javascript
  // Copy test code from COMPLETE-SETUP-MANUAL.md
  // Expected: 201 Created response
  ```

- [ ] **Get Tasks (GET /tasks)**

  ```javascript
  // Copy test code from COMPLETE-SETUP-MANUAL.md
  // Expected: 200 OK with tasks array
  ```

- [ ] **Update Task (PUT /tasks/{id})**

  ```javascript
  // Copy test code from COMPLETE-SETUP-MANUAL.md
  // Expected: 200 OK with updated task
  ```

- [ ] **Delete Task (DELETE /tasks/{id})**

  ```javascript
  // Copy test code from COMPLETE-SETUP-MANUAL.md
  // Expected: 200 OK with success message
  ```

### Postman Testing

- [ ] **Import collection**
- [ ] **Set Authorization token**
- [ ] **Test POST /tasks**
- [ ] **Test GET /tasks**
- [ ] **Test PUT /tasks/{id}**
- [ ] **Test DELETE /tasks/{id}**

### tasks.html Testing

- [ ] **Navigate to tasks.html**
- [ ] **Sign up with new user**
- [ ] **Verify email**
- [ ] **Sign in**
- [ ] **Add new task**
- [ ] **View tasks list**
- [ ] **Edit task**
- [ ] **Mark task as completed**
- [ ] **Delete task**
- [ ] **Test filters (all/pending/completed)**
- [ ] **Test sorting (newest/oldest/priority)**
- [ ] **Sign out**

---

## ✅ Step 8: Monitoring Setup

### CloudWatch Logs

- [ ] **Lambda Logs Accessible:**
  - [ ] /aws/lambda/CreateTask
  - [ ] /aws/lambda/GetTasks
  - [ ] /aws/lambda/UpdateTask
  - [ ] /aws/lambda/DeleteTask

- [ ] **API Gateway Logs Enabled**

### DynamoDB Monitoring

- [ ] **Table metrics visible**
- [ ] **Read/Write capacity monitored**

---

## 🎯 Final Verification

### Functionality Checklist

- [ ] Users can register
- [ ] Users can verify email
- [ ] Users can sign in
- [ ] Users can view their tasks only
- [ ] Users can create tasks
- [ ] Users can edit tasks
- [ ] Users can delete tasks
- [ ] Users can filter tasks
- [ ] Users can sort tasks
- [ ] Users can sign out
- [ ] Tasks persist in DynamoDB
- [ ] Authentication tokens work correctly
- [ ] CORS is working (no browser errors)

### Security Checklist

- [ ] API endpoints require authentication
- [ ] Users can only access their own tasks
- [ ] Cognito authorizer validates tokens
- [ ] Lambda functions check user_id
- [ ] S3 bucket only allows read access
- [ ] No sensitive data in browser console

### Performance Checklist

- [ ] API responses < 1 second
- [ ] Lambda cold start acceptable
- [ ] DynamoDB queries efficient
- [ ] Frontend loads quickly
- [ ] No console errors

---

## 📊 Reference Values Summary

**Copy all your configuration values here for quick reference:**

```
=== DynamoDB ===
Table Name: TasksTable
Table ARN: 

=== Cognito ===
User Pool ID: 
User Pool Name: TaskTrackerUserPool
App Client ID: 
Cognito Domain: 

=== Lambda ===
IAM Role: TaskTrackerLambdaRole
Functions: CreateTask, GetTasks, UpdateTask, DeleteTask

=== API Gateway ===
API Name: TaskTrackerAPI
API ID: 
Invoke URL: 
Stage: prod

=== S3 ===
Bucket Name: 
Website URL: 

=== Updated Code Files ===
✓ frontend/index.html (lines 482-486)
✓ frontend/task-app.js (lines 4-9)
✓ Files uploaded to S3
```

---

## 🚀 Next Steps After Setup

1. **Enable CloudFront** for HTTPS and CDN
2. **Set up custom domain** with Route 53
3. **Add CloudWatch alarms** for monitoring
4. **Implement API throttling** with usage plans
5. **Enable MFA** on Cognito for security
6. **Add more features** to the application

---

## 📞 Troubleshooting Quick Links

- **CORS Issues:** See COMPLETE-SETUP-MANUAL.md → Troubleshooting → Issue #1
- **401 Unauthorized:** See COMPLETE-SETUP-MANUAL.md → Troubleshooting → Issue #2
- **500 Server Error:** See COMPLETE-SETUP-MANUAL.md → Troubleshooting → Issue #3
- **CloudWatch Logs:** [Link to your log groups]

---

**Setup Date:** _______________
**Completed By:** _______________
**Status:** ☐ In Progress  ☐ Complete  ☐ Tested

---

*Save this file and check off items as you complete them!*
