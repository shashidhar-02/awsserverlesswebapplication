# Complete AWS Serverless Task Tracker - Setup Manual

## 📋 Table of Contents
1. [Prerequisites](#prerequisites)
2. [Step 1: DynamoDB Setup](#step-1-dynamodb-setup)
3. [Step 2: AWS Cognito Setup](#step-2-aws-cognito-setup)
4. [Step 3: Lambda Functions Setup](#step-3-lambda-functions-setup)
5. [Step 4: API Gateway Setup](#step-4-api-gateway-setup)
6. [Step 5: Frontend S3 Setup](#step-5-frontend-s3-setup)
7. [Step 6: Integration & Testing](#step-6-integration--testing)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools
- AWS Account with administrative access
- AWS CLI installed and configured
- Basic knowledge of AWS Console
- Text editor (VS Code recommended)

### Estimated Time
- Complete setup: 45-60 minutes
- Testing: 15-20 minutes

---

## Step 1: DynamoDB Setup

### 1.1 Create DynamoDB Table

1. **Navigate to DynamoDB Console**
   - Go to AWS Console → Services → DynamoDB
   - Click "Create table"

2. **Configure Table Settings**
   ```
   Table name: TasksTable
   Partition key: task_id (String)
   Sort key: (Leave empty)
   
   Table settings: Default settings
   Read/write capacity mode: On-demand
   ```

3. **Click "Create table"**
   - Wait for table status to become "Active" (30-60 seconds)

4. **Note the Table ARN**
   - Click on the table name
   - Copy the ARN (e.g., `arn:aws:dynamodb:us-east-1:123456789012:table/TasksTable`)
   - Save this for Lambda permissions

### 1.2 Verify Table Structure

Your table should support these attributes:
- `task_id` (String) - Primary Key
- `user_id` (String) - Cognito user ID
- `task_name` (String) - Task title
- `description` (String) - Task details
- `status` (String) - "pending" or "completed"
- `priority` (String) - "low", "medium", or "high"
- `deadline` (String) - ISO date string
- `created_at` (String) - ISO timestamp

---

## Step 2: AWS Cognito Setup

### 2.1 Create User Pool

1. **Navigate to Cognito Console**
   - AWS Console → Services → Cognito
   - Click "Create user pool"

2. **Configure Sign-in Experience**
   ```
   Step 1: Configure sign-in experience
   - Provider types: Cognito user pool
   - Cognito user pool sign-in options: ☑ Email
   ```

3. **Configure Security Requirements**
   ```
   Step 2: Configure security requirements
   - Password policy: Cognito defaults
   - Multi-factor authentication: No MFA
   - User account recovery: ☑ Email only
   ```

4. **Configure Sign-up Experience**
   ```
   Step 3: Configure sign-up experience
   - Self-registration: ☑ Enable self-registration
   - Attribute verification: ☑ Send email message, verify email address
   - Required attributes: ☑ name, ☑ email
   ```

5. **Configure Message Delivery**
   ```
   Step 4: Configure message delivery
   - Email: Send email with Cognito
   ```

6. **Integrate Your App**
   ```
   Step 5: Integrate your app
   - User pool name: TaskTrackerUserPool
   - Hosted authentication pages: ☑ Use the Cognito Hosted UI
   - Domain type: Use a Cognito domain
   - Cognito domain: tasktracker-[YOUR-UNIQUE-ID]
   
   Initial app client:
   - App client name: TaskTrackerWebClient
   - Client secret: Don't generate a client secret
   - Authentication flows: ☑ ALLOW_USER_PASSWORD_AUTH
                         ☑ ALLOW_REFRESH_TOKEN_AUTH
   ```

7. **Review and Create**
   - Click "Create user pool"
   - Wait for creation to complete

### 2.2 Configure App Client Settings

1. **Open Your User Pool**
   - Click on "TaskTrackerUserPool"
   - Go to "App integration" tab

2. **Configure App Client**
   - Scroll to "App clients and analytics"
   - Click on "TaskTrackerWebClient"
   
3. **Edit Hosted UI Settings**
   ```
   Allowed callback URLs:
   - http://localhost:8000/
   - http://YOUR-S3-BUCKET.s3-website-us-east-1.amazonaws.com/
   - http://taskfrontend2291.s3-website-us-east-1.amazonaws.com/
   
   Allowed sign-out URLs:
   - http://localhost:8000/
   - http://YOUR-S3-BUCKET.s3-website-us-east-1.amazonaws.com/
   - http://taskfrontend2291.s3-website-us-east-1.amazonaws.com/
   
   Identity providers: ☑ Cognito user pool
   
   OAuth 2.0 grant types:
   - ☑ Implicit grant
   
   OpenID Connect scopes:
   - ☑ openid
   - ☑ email
   - ☑ profile
   ```

4. **Save Changes**

### 2.3 Note Important Values

Save these for frontend configuration:
```
User Pool ID: us-east-1_XXXXXXXXX
App Client ID: 1234567890abcdefghijklmnop
Cognito Domain: https://tasktracker-xxxxx.auth.us-east-1.amazoncognito.com
```

---

## Step 3: Lambda Functions Setup

### 3.1 Create IAM Role for Lambda

1. **Navigate to IAM Console**
   - AWS Console → Services → IAM → Roles
   - Click "Create role"

2. **Configure Role**
   ```
   Trusted entity type: AWS service
   Use case: Lambda
   ```

3. **Add Permissions**
   - Search and attach: `AmazonDynamoDBFullAccess`
   - Search and attach: `AWSLambdaBasicExecutionRole`
   - Search and attach: `CloudWatchLogsFullAccess`

4. **Name and Create**
   ```
   Role name: TaskTrackerLambdaRole
   Description: Role for Task Tracker Lambda functions
   ```

### 3.2 Create Lambda Functions

You need to create **4 Lambda functions**. For each:

#### Common Configuration
```
Runtime: Python 3.12
Architecture: x86_64
Execution role: Use existing role → TaskTrackerLambdaRole
```

---

#### Function 1: Create Task

**Function name:** `CreateTask`

**Code:**
```python
import json
import boto3
import uuid
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TasksTable')

def lambda_handler(event, context):
    try:
        # Parse request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        # Get user ID from authorizer context
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # Generate unique task ID
        task_id = str(uuid.uuid4())
        
        # Prepare task item
        task = {
            'task_id': task_id,
            'user_id': user_id,
            'task_name': body.get('task_name', ''),
            'description': body.get('description', ''),
            'status': body.get('status', 'pending'),
            'priority': body.get('priority', 'medium'),
            'deadline': body.get('deadline', ''),
            'created_at': datetime.utcnow().isoformat()
        }
        
        # Put item in DynamoDB
        table.put_item(Item=task)
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'POST,OPTIONS'
            },
            'body': json.dumps({
                'message': 'Task created successfully',
                'task': task
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Failed to create task',
                'message': str(e)
            })
        }
```

**Environment Variables:**
```
TABLE_NAME: TasksTable
```

---

#### Function 2: Get Tasks

**Function name:** `GetTasks`

**Code:**
```python
import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TasksTable')

class DecimalEncoder(json.JSONEncoder):
    def default(self, obj):
        if isinstance(obj, Decimal):
            return float(obj)
        return super(DecimalEncoder, self).default(obj)

def lambda_handler(event, context):
    try:
        # Get user ID from authorizer context
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # Scan table for user's tasks
        response = table.scan(
            FilterExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_id}
        )
        
        tasks = response.get('Items', [])
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'GET,OPTIONS'
            },
            'body': json.dumps({
                'tasks': tasks
            }, cls=DecimalEncoder)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Failed to retrieve tasks',
                'message': str(e)
            })
        }
```

**Environment Variables:**
```
TABLE_NAME: TasksTable
```

---

#### Function 3: Update Task

**Function name:** `UpdateTask`

**Code:**
```python
import json
import boto3
from datetime import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TasksTable')

def lambda_handler(event, context):
    try:
        # Get task ID from path parameters
        task_id = event['pathParameters']['id']
        
        # Get user ID from authorizer context
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # Parse request body
        if isinstance(event.get('body'), str):
            body = json.loads(event['body'])
        else:
            body = event.get('body', {})
        
        # Verify task belongs to user
        existing_task = table.get_item(Key={'task_id': task_id})
        if 'Item' not in existing_task:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Task not found'})
            }
        
        if existing_task['Item']['user_id'] != user_id:
            return {
                'statusCode': 403,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Unauthorized to update this task'})
            }
        
        # Build update expression
        update_expr = "SET "
        expr_attr_values = {}
        expr_attr_names = {}
        
        if 'task_name' in body:
            update_expr += "#tn = :tn, "
            expr_attr_names['#tn'] = 'task_name'
            expr_attr_values[':tn'] = body['task_name']
        
        if 'description' in body:
            update_expr += "description = :desc, "
            expr_attr_values[':desc'] = body['description']
        
        if 'status' in body:
            update_expr += "#st = :st, "
            expr_attr_names['#st'] = 'status'
            expr_attr_values[':st'] = body['status']
        
        if 'priority' in body:
            update_expr += "priority = :pri, "
            expr_attr_values[':pri'] = body['priority']
        
        if 'deadline' in body:
            update_expr += "deadline = :dl, "
            expr_attr_values[':dl'] = body['deadline']
        
        update_expr += "updated_at = :ua"
        expr_attr_values[':ua'] = datetime.utcnow().isoformat()
        
        # Update item
        response = table.update_item(
            Key={'task_id': task_id},
            UpdateExpression=update_expr,
            ExpressionAttributeValues=expr_attr_values,
            ExpressionAttributeNames=expr_attr_names if expr_attr_names else None,
            ReturnValues='ALL_NEW'
        )
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'PUT,OPTIONS'
            },
            'body': json.dumps({
                'message': 'Task updated successfully',
                'task': response['Attributes']
            }, default=str)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Failed to update task',
                'message': str(e)
            })
        }
```

**Environment Variables:**
```
TABLE_NAME: TasksTable
```

---

#### Function 4: Delete Task

**Function name:** `DeleteTask`

**Code:**
```python
import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TasksTable')

def lambda_handler(event, context):
    try:
        # Get task ID from path parameters
        task_id = event['pathParameters']['id']
        
        # Get user ID from authorizer context
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # Verify task belongs to user
        existing_task = table.get_item(Key={'task_id': task_id})
        if 'Item' not in existing_task:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Task not found'})
            }
        
        if existing_task['Item']['user_id'] != user_id:
            return {
                'statusCode': 403,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Unauthorized to delete this task'})
            }
        
        # Delete item
        table.delete_item(Key={'task_id': task_id})
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type,Authorization',
                'Access-Control-Allow-Methods': 'DELETE,OPTIONS'
            },
            'body': json.dumps({
                'message': 'Task deleted successfully'
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': 'Failed to delete task',
                'message': str(e)
            })
        }
```

**Environment Variables:**
```
TABLE_NAME: TasksTable
```

---

### 3.3 Test Lambda Functions

For each function, create a test event:

**Test Event for CreateTask:**
```json
{
  "body": "{\"task_name\":\"Test Task\",\"description\":\"Testing\",\"status\":\"pending\",\"priority\":\"high\"}",
  "requestContext": {
    "authorizer": {
      "claims": {
        "sub": "test-user-123"
      }
    }
  }
}
```

---

## Step 4: API Gateway Setup

### 4.1 Create REST API

1. **Navigate to API Gateway Console**
   - AWS Console → Services → API Gateway
   - Click "Create API"
   - Choose "REST API" (not private)
   - Click "Build"

2. **Configure API**
   ```
   Protocol: REST
   Create new API: New API
   API name: TaskTrackerAPI
   Description: API for Task Tracker application
   Endpoint Type: Regional
   ```

3. **Click "Create API"**

### 4.2 Create Cognito Authorizer

1. **In your API, click "Authorizers"**
2. **Click "Create New Authorizer"**
   ```
   Name: CognitoAuthorizer
   Type: Cognito
   Cognito User Pool: [Select your TaskTrackerUserPool]
   Token Source: Authorization
   Token Validation: (leave empty)
   ```
3. **Click "Create"**

### 4.3 Create Resources and Methods

#### Create /tasks Resource

1. **Click "Resources" → "Actions" → "Create Resource"**
   ```
   Resource Name: tasks
   Resource Path: /tasks
   Enable API Gateway CORS: ☑
   ```

2. **Create POST Method (Create Task)**
   - Select `/tasks` resource
   - Actions → Create Method → POST
   - Integration type: Lambda Function
   - Use Lambda Proxy integration: ☑
   - Lambda Function: CreateTask
   - Save and confirm permissions

3. **Configure Method Request**
   - Click "Method Request"
   - Authorization: CognitoAuthorizer
   - API Key Required: false

4. **Create GET Method (Get All Tasks)**
   - Select `/tasks` resource
   - Actions → Create Method → GET
   - Integration type: Lambda Function
   - Use Lambda Proxy integration: ☑
   - Lambda Function: GetTasks
   - Authorization: CognitoAuthorizer

#### Create /tasks/{id} Resource

1. **Select `/tasks` resource**
2. **Actions → Create Resource**
   ```
   Resource Name: task
   Resource Path: {id}
   Enable API Gateway CORS: ☑
   ```

3. **Create PUT Method (Update Task)**
   - Select `/tasks/{id}` resource
   - Actions → Create Method → PUT
   - Integration type: Lambda Function
   - Use Lambda Proxy integration: ☑
   - Lambda Function: UpdateTask
   - Authorization: CognitoAuthorizer

4. **Create DELETE Method (Delete Task)**
   - Select `/tasks/{id}` resource
   - Actions → Create Method → DELETE
   - Integration type: Lambda Function
   - Use Lambda Proxy integration: ☑
   - Lambda Function: DeleteTask
   - Authorization: CognitoAuthorizer

### 4.4 Enable CORS for All Methods

For **each method** (POST, GET, PUT, DELETE):

1. **Select the method**
2. **Actions → Enable CORS**
3. **Configure:**
   ```
   Access-Control-Allow-Headers: Content-Type,Authorization
   Access-Control-Allow-Origin: '*'
   ```
4. **Click "Enable CORS and replace existing CORS headers"**

### 4.5 Deploy API

1. **Actions → Deploy API**
2. **Deployment stage:** [New Stage]
3. **Stage name:** prod
4. **Stage description:** Production stage
5. **Click "Deploy"**

6. **Note the Invoke URL**
   ```
   Example: https://abcd1234.execute-api.us-east-1.amazonaws.com/prod
   ```
   - Save this URL for frontend configuration

---

## Step 5: Frontend S3 Setup

### 5.1 Create S3 Bucket

1. **Navigate to S3 Console**
   - AWS Console → Services → S3
   - Click "Create bucket"

2. **Configure Bucket**
   ```
   Bucket name: taskfrontend2291 (must be globally unique)
   AWS Region: us-east-1
   
   Object Ownership: ACLs disabled
   
   Block Public Access settings:
   ☐ Block all public access (UNCHECK THIS)
   ☑ I acknowledge that the current settings might result in this bucket...
   
   Bucket Versioning: Disable
   Default encryption: Disable
   ```

3. **Create bucket**

### 5.2 Enable Static Website Hosting

1. **Click on your bucket**
2. **Go to "Properties" tab**
3. **Scroll to "Static website hosting"**
4. **Click "Edit"**
   ```
   Static website hosting: Enable
   Hosting type: Host a static website
   Index document: index.html
   Error document: index.html
   ```
5. **Save changes**
6. **Note the Website endpoint**
   ```
   Example: http://taskfrontend2291.s3-website-us-east-1.amazonaws.com
   ```

### 5.3 Configure Bucket Policy

1. **Go to "Permissions" tab**
2. **Scroll to "Bucket policy"**
3. **Click "Edit"**
4. **Paste this policy (replace YOUR-BUCKET-NAME):**

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

5. **Save changes**

### 5.4 Update Frontend Configuration

Update `frontend/task-app.js` with your actual values:

```javascript
const AWS_CONFIG = {
    region: 'us-east-1',
    userPoolId: 'YOUR_USER_POOL_ID',  // e.g., us-east-1_XXXXXXXXX
    clientId: 'YOUR_APP_CLIENT_ID',    // e.g., 7kg28dfrbs9pjukg7n2n6230vm
    apiEndpoint: 'YOUR_API_GATEWAY_INVOKE_URL'  // e.g., https://abcd1234.execute-api.us-east-1.amazonaws.com/prod
};
```

Update `frontend/index.html` with your Cognito domain:

```javascript
const COGNITO_DOMAIN = "YOUR_COGNITO_DOMAIN";  // e.g., https://tasktracker-xxxxx.auth.us-east-1.amazoncognito.com
const CLIENT_ID = "YOUR_APP_CLIENT_ID";
const REDIRECT_URI = "YOUR_S3_WEBSITE_URL";  // e.g., http://taskfrontend2291.s3-website-us-east-1.amazonaws.com/
```

### 5.5 Upload Frontend Files

**Option 1: Using AWS Console**

1. **Go to your S3 bucket**
2. **Click "Upload"**
3. **Upload these files:**
   - index.html
   - tasks.html
   - task-app.js
   - task-styles.css
   - app.js (optional)
   - styles.css (optional)
4. **Click "Upload"**

**Option 2: Using AWS CLI**

```bash
cd frontend
aws s3 sync . s3://taskfrontend2291/ --exclude ".git/*" --exclude "*.md"
```

### 5.6 Update Cognito Callback URLs

1. **Go back to Cognito Console**
2. **Select your User Pool**
3. **Go to "App integration" → "App clients"**
4. **Edit your app client**
5. **Update Callback URLs with your actual S3 URL:**
   ```
   http://taskfrontend2291.s3-website-us-east-1.amazonaws.com/
   ```
6. **Update Sign out URLs with the same**
7. **Save changes**

---

## Step 6: Integration & Testing

### 6.1 Test Authentication Flow

1. **Open your S3 website URL in a browser**
   ```
   http://taskfrontend2291.s3-website-us-east-1.amazonaws.com/
   ```

2. **Click "Sign In with Cognito"**
3. **You should be redirected to Cognito Hosted UI**
4. **Click "Sign up"**
5. **Create a new account:**
   - Email: your-email@example.com
   - Password: (must meet requirements)
   - Name: Your Name

6. **Check your email for verification code**
7. **Enter verification code**
8. **Sign in with your credentials**
9. **You should be redirected back with tokens displayed**

### 6.2 Test Task Operations (Using Browser Console)

Once signed in, open browser DevTools Console and test:

**Create a Task:**
```javascript
const API_ENDPOINT = 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod';
const accessToken = localStorage.getItem('auth') ? JSON.parse(localStorage.getItem('auth')).access_token : null;

fetch(`${API_ENDPOINT}/tasks`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': accessToken
    },
    body: JSON.stringify({
        task_name: 'Test Task from API',
        description: 'Testing the API integration',
        status: 'pending',
        priority: 'high'
    })
})
.then(res => res.json())
.then(data => console.log('Create:', data))
.catch(err => console.error('Error:', err));
```

**Get All Tasks:**
```javascript
fetch(`${API_ENDPOINT}/tasks`, {
    headers: {
        'Authorization': accessToken
    }
})
.then(res => res.json())
.then(data => console.log('Tasks:', data))
.catch(err => console.error('Error:', err));
```

### 6.3 Test Using Postman

1. **Get Access Token**
   - Sign in via browser
   - Copy access token from browser DevTools → Application → Local Storage

2. **Create New Request in Postman**

**POST Create Task:**
```
URL: https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/tasks
Method: POST
Headers:
  Content-Type: application/json
  Authorization: YOUR_ACCESS_TOKEN
Body (raw JSON):
{
    "task_name": "Complete project documentation",
    "description": "Write comprehensive docs",
    "status": "pending",
    "priority": "high",
    "deadline": "2024-12-31"
}
```

**GET All Tasks:**
```
URL: https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/tasks
Method: GET
Headers:
  Authorization: YOUR_ACCESS_TOKEN
```

**PUT Update Task:**
```
URL: https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/tasks/{task_id}
Method: PUT
Headers:
  Content-Type: application/json
  Authorization: YOUR_ACCESS_TOKEN
Body (raw JSON):
{
    "status": "completed"
}
```

**DELETE Task:**
```
URL: https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod/tasks/{task_id}
Method: DELETE
Headers:
  Authorization: YOUR_ACCESS_TOKEN
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. CORS Errors

**Problem:** Browser shows CORS policy error

**Solution:**
- Ensure CORS is enabled on all API Gateway methods
- Check Lambda functions return proper CORS headers
- Verify OPTIONS method is created for each resource

#### 2. Unauthorized (401) Errors

**Problem:** API returns 401 Unauthorized

**Solution:**
- Verify access token is valid (not expired)
- Check Authorization header is correctly set
- Ensure Cognito Authorizer is configured on the method
- Verify user pool ID in authorizer matches your user pool

#### 3. Internal Server Error (500)

**Problem:** Lambda returns 500 error

**Solution:**
- Check CloudWatch Logs for Lambda function
- Go to: CloudWatch → Log groups → /aws/lambda/[FunctionName]
- Look for error messages and stack traces
- Verify environment variables are set correctly
- Check DynamoDB table name matches

#### 4. Task Not Found After Creation

**Problem:** Task created but not appearing in GET requests

**Solution:**
- Verify user_id is correctly captured from Cognito token
- Check DynamoDB table for the item
- Ensure scan filter in GetTasks matches user_id format

#### 5. Cognito Redirect Errors

**Problem:** Redirect URL mismatch error

**Solution:**
- Ensure S3 URL exactly matches callback URL in Cognito
- Include or exclude trailing slash consistently
- Check both http/https protocols match

#### 6. S3 Website Not Accessible

**Problem:** 403 Forbidden or Access Denied

**Solution:**
- Verify bucket policy allows public read access
- Ensure "Block all public access" is disabled
- Check static website hosting is enabled
- Verify index document is set to index.html

---

## Monitoring and Maintenance

### CloudWatch Logs

Monitor your Lambda functions:
```
CloudWatch → Log groups → /aws/lambda/CreateTask
CloudWatch → Log groups → /aws/lambda/GetTasks
CloudWatch → Log groups → /aws/lambda/UpdateTask
CloudWatch → Log groups → /aws/lambda/DeleteTask
```

### DynamoDB Metrics

Monitor database performance:
```
DynamoDB → Tables → TasksTable → Monitor tab
```

### API Gateway Metrics

Monitor API usage:
```
API Gateway → TaskTrackerAPI → Stages → prod → Logs/Tracing
```

---

## Cost Optimization

### Free Tier Limits (First 12 Months)

- **Lambda:** 1M free requests/month, 400,000 GB-seconds compute
- **API Gateway:** 1M API calls/month
- **DynamoDB:** 25 GB storage, 25 read/write units
- **S3:** 5 GB storage, 20,000 GET requests, 2,000 PUT requests
- **Cognito:** 50,000 MAUs (Monthly Active Users)

### Beyond Free Tier

Estimated costs for moderate usage:
- Lambda: ~$0.20/million requests
- API Gateway: ~$3.50/million requests
- DynamoDB: ~$1.25/million read requests
- S3: ~$0.023/GB storage
- Cognito: ~$0.0055/MAU

**Expected monthly cost for small app:** $1-5

---

## Security Best Practices

1. **Use HTTPS in Production**
   - Set up CloudFront with SSL certificate
   - Update all callback URLs to https://

2. **Implement Request Throttling**
   - Configure usage plans in API Gateway
   - Set rate limits per user/API key

3. **Enable MFA on Cognito**
   - For production, enable multi-factor authentication
   - Require SMS or TOTP verification

4. **Least Privilege IAM**
   - Limit Lambda role to specific DynamoDB table
   - Remove FullAccess policies

5. **Enable CloudTrail**
   - Track all API calls
   - Monitor for suspicious activity

---

## Next Steps

### Enhancements to Consider

1. **Add More Features**
   - Task categories/tags
   - Task sharing between users
   - File attachments for tasks
   - Due date reminders

2. **Improve UI**
   - Add drag-and-drop for task reordering
   - Implement dark mode
   - Add data visualization (charts)

3. **Set Up CI/CD**
   - Use AWS CodePipeline
   - Automate deployments
   - Add automated testing

4. **Add Monitoring**
   - Set up CloudWatch alarms
   - Create dashboards
   - Configure SNS notifications

5. **Implement Caching**
   - Add CloudFront CDN
   - Enable API Gateway caching
   - Use DynamoDB DAX for caching

---

## Quick Reference

### Important URLs and IDs

```
User Pool ID: _____________________
App Client ID: _____________________
Cognito Domain: _____________________
API Gateway Invoke URL: _____________________
S3 Website URL: _____________________
DynamoDB Table Name: TasksTable
```

### AWS Console Links

- [DynamoDB Tables](https://console.aws.amazon.com/dynamodb/home)
- [Cognito User Pools](https://console.aws.amazon.com/cognito/users/)
- [Lambda Functions](https://console.aws.amazon.com/lambda/home)
- [API Gateway](https://console.aws.amazon.com/apigateway/home)
- [S3 Buckets](https://console.aws.amazon.com/s3/)
- [CloudWatch Logs](https://console.aws.amazon.com/cloudwatch/home)

---

## Support and Resources

### Official Documentation

- [AWS Lambda Developer Guide](https://docs.aws.amazon.com/lambda/)
- [API Gateway Developer Guide](https://docs.aws.amazon.com/apigateway/)
- [DynamoDB Developer Guide](https://docs.aws.amazon.com/dynamodb/)
- [Cognito Developer Guide](https://docs.aws.amazon.com/cognito/)
- [S3 User Guide](https://docs.aws.amazon.com/s3/)

### Community Resources

- [AWS Forums](https://forums.aws.amazon.com/)
- [Stack Overflow AWS Tag](https://stackoverflow.com/questions/tagged/amazon-web-services)
- [AWS Subreddit](https://reddit.com/r/aws/)

---

**Congratulations! 🎉**

You've successfully built and deployed a fully functional serverless task tracker application on AWS!

*Last Updated: December 2024*
*Version: 1.0*
