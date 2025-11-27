# Step 4: Amazon API Gateway Setup

## Overview

Amazon API Gateway acts as the "front door" for your application. It receives HTTP requests from your frontend, routes them to the appropriate Lambda functions, handles authentication, and returns responses.

## Learning Objectives

- Create a REST API in API Gateway
- Configure API endpoints and methods
- Integrate API with Lambda functions
- Set up Cognito authorizer for authentication
- Enable CORS for cross-origin requests
- Deploy API to a stage

---

## Architecture Flow

```
Frontend (Browser)
    ↓
    HTTP Request (GET/POST/PUT/DELETE)
    ↓
API Gateway
    ↓ (validates JWT token with Cognito)
    ↓
Lambda Function
    ↓
DynamoDB
```

---

## Part A: Create REST API

### 1. Navigate to API Gateway

1. In AWS Console, search for **API Gateway**
2. Click **API Gateway**
3. Click **Create API** button

### 2. Choose API Type

You'll see several options:

- **HTTP API** - Simpler, lower cost
- **REST API** - More features, what we'll use
- **WebSocket API** - For real-time apps
- **Private REST API** - For VPC-only access

**Select**: **REST API** (under "REST API", click **Build**)

> ⚠️ Make sure you choose **REST API**, not "REST API Private"

### 3. Create API

**Choose the protocol**:

- Select **REST**

**Create new API**:

- Select **New API**

**Settings**:

- **API name**: `TaskTrackerAPI`
- **Description**: REST API for Task Tracker Application
- **Endpoint Type**: **Regional** (best for most use cases)

Click **Create API**

---

## Part B: Create Cognito Authorizer

Before creating endpoints, set up authentication:

### 1. Create Authorizer

1. In the left sidebar, click **Authorizers**
2. Click **Create New Authorizer** button

**Settings**:

- **Name**: `CognitoAuthorizer`
- **Type**: **Cognito**
- **Cognito User Pool**: Select your `TaskTrackerUserPool`
  - If you don't see it, ensure you're in the correct region
- **Token Source**: `Authorization`
  - This is the header name where the token will be sent
- **Token Validation**: Leave blank (optional regex validation)

3. Click **Create**

### 2. Test Authorizer (Optional)

To test, you need a valid JWT token from Cognito. We'll test this later with the full integration.

---

## Part C: Create API Resources and Methods

We'll create a structure like this:

```
/tasks
  - GET     (Get all tasks)
  - POST    (Create task)
  - OPTIONS (CORS preflight)
  
/tasks/{id}
  - PUT     (Update task)
  - DELETE  (Delete task)
  - OPTIONS (CORS preflight)
```

---

## Resource 1: /tasks

### 1. Create /tasks Resource

1. Click **Resources** in the left sidebar (should be default view)
2. Select the root `/` (highlighted by default)
3. Click **Actions** dropdown → **Create Resource**

**Resource settings**:

- **Resource Name**: `tasks`
- **Resource Path**: `/tasks` (auto-filled)
- ✅ Check **Enable API Gateway CORS**

4. Click **Create Resource**

You should now see `/tasks` in the resource tree.

---

### 2. Create POST Method (Create Task)

1. Select `/tasks` resource
2. Click **Actions** → **Create Method**
3. A dropdown appears under `/tasks` - select **POST**
4. Click the checkmark ✓

**POST Setup**:

- **Integration type**: **Lambda Function**
- **Use Lambda Proxy integration**: ✅ **Check this box** (important!)
- **Lambda Region**: Select your region (e.g., us-east-1)
- **Lambda Function**: Start typing `CreateTask` and select it
- **Use Default Timeout**: Keep checked

5. Click **Save**
6. A popup appears: "Add Permission to Lambda Function" - Click **OK**

**Configure Method Request**:

1. Click on **Method Request** (at the top of the right panel)
2. Click the pencil icon next to **Authorization**
3. Select **CognitoAuthorizer** from dropdown
4. Click the checkmark ✓
5. **API Key Required**: No (leave as false)

**Enable CORS** (if not already done):

1. Select the `/tasks` resource
2. Click **Actions** → **Enable CORS**
3. Keep default settings:
   - Access-Control-Allow-Headers: `Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token`
   - Access-Control-Allow-Methods: Check **POST, OPTIONS** (GET will be added next)
4. Click **Enable CORS and replace existing CORS headers**
5. Click **Yes, replace existing values**

---

### 3. Create GET Method (Get All Tasks)

1. Select `/tasks` resource
2. Click **Actions** → **Create Method**
3. Select **GET** from dropdown
4. Click checkmark ✓

**GET Setup**:

- **Integration type**: Lambda Function
- **Use Lambda Proxy integration**: ✅ Check
- **Lambda Function**: Select `GetTasks`

5. Click **Save** → **OK**

**Configure Authorization**:

1. Click **Method Request**
2. Set **Authorization** to **CognitoAuthorizer**
3. Click checkmark ✓

**Update CORS**:

1. Select `/tasks` resource
2. **Actions** → **Enable CORS**
3. Ensure **GET, POST, OPTIONS** are all checked
4. Click **Enable CORS and replace existing CORS headers** → **Yes**

---

## Resource 2: /tasks/{id}

### 1. Create {id} Resource

1. Select the `/tasks` resource
2. Click **Actions** → **Create Resource**

**Resource settings**:

- **Resource Name**: `id`
- **Resource Path**: `{id}` (use curly braces)
- ✅ Check **Enable API Gateway CORS**

3. Click **Create Resource**

You should see `/tasks/{id}` in the tree.

---

### 2. Create PUT Method (Update Task)

1. Select `/tasks/{id}` resource
2. Click **Actions** → **Create Method**
3. Select **PUT**
4. Click checkmark ✓

**PUT Setup**:

- **Integration type**: Lambda Function
- **Use Lambda Proxy integration**: ✅ Check
- **Lambda Function**: Select `UpdateTask`

5. Click **Save** → **OK**

**Configure Authorization**:

1. Click **Method Request**
2. Set **Authorization** to **CognitoAuthorizer**

**Enable CORS**:

1. Select `/tasks/{id}` resource
2. **Actions** → **Enable CORS**
3. Check **PUT, DELETE, OPTIONS**
4. Enable CORS

---

### 3. Create DELETE Method (Delete Task)

1. Select `/tasks/{id}` resource
2. Click **Actions** → **Create Method**
3. Select **DELETE**
4. Click checkmark ✓

**DELETE Setup**:

- **Integration type**: Lambda Function
- **Use Lambda Proxy integration**: ✅ Check
- **Lambda Function**: Select `DeleteTask`

5. Click **Save** → **OK**

**Configure Authorization**:

1. Click **Method Request**
2. Set **Authorization** to **CognitoAuthorizer**

**Update CORS** (if needed):

1. Select `/tasks/{id}` resource
2. **Actions** → **Enable CORS**
3. Ensure **PUT, DELETE, OPTIONS** are checked
4. Enable CORS

---

## Part D: Deploy API

Your API is configured but not yet live. You need to deploy it to a "stage".

### 1. Create Deployment

1. Click **Actions** → **Deploy API**

**Deployment stage**:

- Select **[New Stage]**

**Stage name**: `prod`
**Stage description**: Production stage
**Deployment description**: Initial deployment

2. Click **Deploy**

### 2. Get Your API URL

After deployment:

1. You'll be redirected to the **Stages** screen
2. Expand the **prod** stage
3. At the top, you'll see **Invoke URL**

**Example**:

```
https://abc123def4.execute-api.us-east-1.amazonaws.com/prod
```

**Copy this URL** - you'll need it for your frontend configuration!

### 3. View Endpoints

Your full endpoints are:

```
POST   https://abc123def4.execute-api.us-east-1.amazonaws.com/prod/tasks
GET    https://abc123def4.execute-api.us-east-1.amazonaws.com/prod/tasks
PUT    https://abc123def4.execute-api.us-east-1.amazonaws.com/prod/tasks/{id}
DELETE https://abc123def4.execute-api.us-east-1.amazonaws.com/prod/tasks/{id}
```

---

## Part E: Test API with Postman (Optional)

### Prerequisites

- Install [Postman](https://www.postman.com/downloads/)
- Have a Cognito user created
- Get a JWT token from Cognito

### Get JWT Token

#### Option 1: Using AWS CLI

```bash
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id YOUR_APP_CLIENT_ID \
  --auth-parameters USERNAME=testuser@example.com,PASSWORD=TestPass123!
```

Copy the `IdToken` from the response.

#### Option 2: Using Frontend (covered in next step)

### Test POST /tasks (Create Task)

1. Open Postman
2. Create new request:
   - **Method**: POST
   - **URL**: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/tasks`

3. **Headers** tab:
   - Key: `Authorization`
   - Value: `YOUR_ID_TOKEN` (paste the JWT token)
   - Key: `Content-Type`
   - Value: `application/json`

4. **Body** tab:
   - Select **raw**
   - Select **JSON** format
   - Enter:

   ```json
   {
     "task_name": "My First Task",
     "description": "Testing the API"
   }
   ```

5. Click **Send**

**Expected Response** (201 Created):

```json
{
  "message": "Task created successfully",
  "task": {
    "task_id": "uuid-string",
    "user_id": "cognito-user-id",
    "task_name": "My First Task",
    "description": "Testing the API",
    "status": "Pending",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

### Test GET /tasks (Get All Tasks)

1. Create new request:
   - **Method**: GET
   - **URL**: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/tasks`

2. **Headers**:
   - Key: `Authorization`
   - Value: `YOUR_ID_TOKEN`

3. Click **Send**

**Expected Response** (200 OK):

```json
{
  "tasks": [
    {
      "task_id": "uuid-string",
      "task_name": "My First Task",
      "description": "Testing the API",
      "status": "Pending",
      "user_id": "cognito-user-id",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ],
  "count": 1
}
```

### Test PUT /tasks/{id} (Update Task)

1. **Method**: PUT
2. **URL**: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/tasks/{task_id}`
   - Replace `{task_id}` with actual task_id from previous response

3. **Headers**: Same as above (Authorization + Content-Type)

4. **Body**:

   ```json
   {
     "status": "Completed"
   }
   ```

5. Click **Send**

### Test DELETE /tasks/{id}

1. **Method**: DELETE
2. **URL**: `https://YOUR_API_ID.execute-api.us-east-1.amazonaws.com/prod/tasks/{task_id}`
3. **Headers**: Authorization header with token
4. Click **Send**

**Expected Response** (200 OK):

```json
{
  "message": "Task deleted successfully",
  "task_id": "uuid-string"
}
```

---

## Understanding API Gateway Concepts

### Lambda Proxy Integration

When you check **"Use Lambda Proxy integration"**:

- API Gateway passes the entire request to Lambda as an event object
- Lambda has full control over the response (status code, headers, body)
- Your Lambda code must format responses correctly

### Authorizer

The Cognito Authorizer:

- Intercepts requests before they reach Lambda
- Validates the JWT token with Cognito
- Returns 401 Unauthorized if token is invalid
- Passes user info to Lambda in `event['requestContext']['authorizer']['claims']`

### CORS (Cross-Origin Resource Sharing)

CORS allows your frontend (on a different domain) to call the API:

- **OPTIONS** method handles preflight requests
- Headers specify allowed origins, methods, and headers
- Your Lambda functions also include CORS headers in responses

### Stages

Stages allow multiple versions of your API:

- **dev** - Development environment
- **test** - Testing environment
- **prod** - Production environment

Each stage has its own invoke URL.

---

## Troubleshooting

### "Missing Authentication Token"

- Check your endpoint URL is correct
- Ensure you've deployed the API
- Verify the HTTP method matches

### "Unauthorized" or "401"

- JWT token is invalid or expired
- Token is not in the `Authorization` header
- User pool ID in authorizer is incorrect

### "403 Forbidden"

- API Key required but not provided (shouldn't happen in our setup)
- Cognito authorizer is not configured for the method

### "500 Internal Server Error"

- Check Lambda function logs in CloudWatch
- Verify Lambda has correct permissions
- Check Lambda function code for errors

### "CORS Error" in Browser

- Ensure CORS is enabled on resources
- Check Lambda functions return CORS headers
- Verify OPTIONS method exists

---

## Best Practices

### Security

- ✅ Always use HTTPS (API Gateway enforces this)
- ✅ Use Cognito authorizer for all authenticated endpoints
- ✅ Validate and sanitize input in Lambda functions
- ✅ Use resource policies to restrict API access by IP (production)

### Performance

- ✅ Enable caching for frequently accessed data
- ✅ Use throttling to prevent abuse
- ✅ Monitor API metrics in CloudWatch

### Cost Optimization

- ✅ Use HTTP API instead of REST API for simpler use cases (lower cost)
- ✅ Enable caching to reduce Lambda invocations
- ✅ Set up usage plans to control API access

---

## Checkpoint ✅

Before moving to the next step, ensure:

- ✅ REST API created: `TaskTrackerAPI`
- ✅ Cognito Authorizer configured: `CognitoAuthorizer`
- ✅ Resources created:
  - `/tasks` with GET and POST methods
  - `/tasks/{id}` with PUT and DELETE methods
- ✅ All methods have:
  - Lambda Proxy integration enabled
  - CognitoAuthorizer assigned
  - CORS enabled
- ✅ API deployed to **prod** stage
- ✅ Invoke URL copied for frontend use
- ✅ (Optional) API tested successfully with Postman

---

## API Configuration Summary

Save these values:

```
API Name: TaskTrackerAPI
API ID: abc123def4
Invoke URL: https://abc123def4.execute-api.us-east-1.amazonaws.com/prod
Region: us-east-1

Endpoints:
POST   /tasks       → CreateTask
GET    /tasks       → GetTasks
PUT    /tasks/{id}  → UpdateTask
DELETE /tasks/{id}  → DeleteTask
```

---

## Next Step

Continue to **[05-S3-FRONTEND-SETUP.md](./05-S3-FRONTEND-SETUP.md)** to create and deploy your frontend application.

---

## Additional Resources

- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [Working with Lambda Proxy Integration](https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html)
- [Enable CORS for API Gateway](https://docs.aws.amazon.com/apigateway/latest/developerguide/how-to-cors.html)
- [API Gateway Authorizers](https://docs.aws.amazon.com/apigateway/latest/developerguide/apigateway-use-lambda-authorizer.html)
