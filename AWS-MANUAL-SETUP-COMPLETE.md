# 🚀 AWS Serverless Task Tracker - Complete Manual Setup Guide

## 📋 **Production Deployment Manual**

**Version:** 1.0  
**Last Updated:** November 2025  
**Deployment Time:** 2-3 hours  
**Skill Level:** Beginner to Intermediate

---

## 🎯 **Overview**

This guide provides step-by-step instructions to manually deploy a production-ready serverless task tracking application on AWS using:

- **Amazon DynamoDB** - NoSQL database for task storage
- **Amazon Cognito** - User authentication and authorization
- **AWS Lambda** - Serverless backend functions (Python 3.12)
- **Amazon API Gateway** - RESTful API management
- **Amazon S3** - Static website hosting

**Architecture:**
```
User Browser → S3 (Frontend) → API Gateway → Cognito Auth → Lambda → DynamoDB
```

---

## ✅ **Prerequisites**

Before starting, ensure you have:

- [ ] Active AWS Account with admin/power user access
- [ ] Valid email address (for Cognito verification emails)
- [ ] AWS Region selected (recommended: `us-east-1`)
- [ ] Web browser (Chrome, Firefox, Safari, or Edge)
- [ ] Text editor for editing configuration values

**Cost Estimate:** $0-5/month within AWS Free Tier limits

---

## 📚 **Table of Contents**

1. [Step 1: DynamoDB Database Setup](#step-1-dynamodb-database-setup)
2. [Step 2: Cognito User Authentication](#step-2-cognito-user-authentication)
3. [Step 3: IAM Role Configuration](#step-3-iam-role-configuration)
4. [Step 4: Lambda Functions Deployment](#step-4-lambda-functions-deployment)
5. [Step 5: API Gateway Configuration](#step-5-api-gateway-configuration)
6. [Step 6: Frontend S3 Hosting](#step-6-frontend-s3-hosting)
7. [Step 7: Testing & Verification](#step-7-testing--verification)
8. [Troubleshooting Guide](#troubleshooting-guide)
9. [Production Checklist](#production-checklist)

---

## 🗄️ **Step 1: DynamoDB Database Setup**

### **Objective:** Create a NoSQL database table to store task data

### **Instructions:**

1. **Navigate to DynamoDB Console**
   - Log in to AWS Management Console
   - Search for "DynamoDB" in the top search bar
   - Click on **DynamoDB** service

2. **Create New Table**
   - Click **Create table** (orange button)

3. **Configure Table Settings**

   | Setting | Value | Notes |
   |---------|-------|-------|
   | **Table name** | `TasksTable` | Exact name required |
   | **Partition key** | `task_id` | Type: **String** |
   | **Sort key** | Leave empty | Not needed |
   | **Table settings** | Default settings | - |
   | **Table class** | DynamoDB Standard | - |
   | **Capacity mode** | **On-demand** | Recommended for variable workloads |
   | **Encryption** | Default (AWS owned key) | - |

4. **Add Optional Tags** (Recommended)
   - Key: `Project` → Value: `TaskTracker`
   - Key: `Environment` → Value: `Production`

5. **Create Table**
   - Click **Create table**
   - Wait 30-60 seconds until status shows **Active**

6. **Record Table Information**
   - Copy the **Table ARN** from the table overview
   - Format: `arn:aws:dynamodb:us-east-1:123456789012:table/TasksTable`
   - Save this for IAM permissions

### **✅ Verification:**
- Table status shows "Active" in green
- Table appears in your DynamoDB tables list

### **Table Schema** (Auto-created by Lambda):

| Attribute | Type | Description |
|-----------|------|-------------|
| `task_id` | String | Primary key (UUID format) |
| `user_id` | String | Cognito user ID (sub claim) |
| `task_name` | String | Task title/name |
| `description` | String | Task description (optional) |
| `status` | String | "Pending" or "Completed" |
| `created_at` | String | ISO 8601 timestamp |

---

## 🔐 **Step 2: Cognito User Authentication**

### **Objective:** Set up user authentication and authorization

### **Part A: Create User Pool**

1. **Navigate to Cognito**
   - Search for "Cognito" in AWS Console
   - Click **Amazon Cognito**
   - Click **Create user pool**

2. **Step 1: Configure Sign-in Experience**
   - **Authentication providers:** Cognito user pool
   - **Cognito user pool sign-in options:**
     - ✅ **Email** (check this)
     - ☐ Username (optional, leave unchecked)
   - Click **Next**

3. **Step 2: Configure Security Requirements**
   - **Password policy:** Choose **Cognito defaults**
     - Minimum 8 characters
     - Requires uppercase, lowercase, number, special character
   - **Multi-factor authentication (MFA):** **No MFA** (for simplicity)
   - **User account recovery:**
     - ✅ Enable self-service account recovery
     - Select **Email only**
   - Click **Next**

4. **Step 3: Configure Sign-up Experience**
   - **Self-registration:** ✅ Allow users to sign themselves up
   - **Attribute verification:**
     - ✅ Send email message, verify email address
   - **Required attributes:**
     - ✅ `email` (required by default)
     - ✅ `name` (recommended - check this)
   - **Custom attributes:** Leave empty
   - Click **Next**

5. **Step 4: Configure Message Delivery**
   - **Email provider:** Send email with Cognito (free 50 emails/day)
   - **FROM email address:** Keep default or customize
   - **Reply-to email:** (optional)
   - Click **Next**

6. **Step 5: Integrate Your App**
   
   **User pool name:**
   ```
   TaskTrackerUserPool
   ```
   
   **Hosted authentication pages:** ☐ Don't use (we'll build custom UI)
   
   **Domain:** Leave empty (not needed)
   
   Click **Next**

7. **Step 6: Create App Client**
   
   **App client name:**
   ```
   TaskTrackerAppClient
   ```
   
   **Client secret:** ☐ **Don't generate a client secret** ⚠️ **CRITICAL**
   
   **Authentication flows:**
   - ✅ ALLOW_USER_PASSWORD_AUTH
   - ✅ ALLOW_REFRESH_TOKEN_AUTH
   - ✅ ALLOW_USER_SRP_AUTH (optional)
   
   **Advanced settings:**
   - Token expiration: Keep defaults
   - Access token: 60 minutes
   - ID token: 60 minutes
   - Refresh token: 30 days
   
   Click **Next**

8. **Step 7: Review and Create**
   - Review all settings
   - Click **Create user pool**
   - Wait for pool creation (30 seconds)

### **Part B: Record Cognito Values**

⚠️ **CRITICAL:** Save these values - you'll need them later!

1. **Get User Pool ID**
   - Open your `TaskTrackerUserPool`
   - Copy **User pool ID**
   - Format: `us-east-1_XXXXXXXXX`
   ```
   USER_POOL_ID: _______________________
   ```

2. **Get App Client ID**
   - Go to **App integration** tab
   - Scroll to **App clients and analytics**
   - Copy **Client ID**
   - Format: `1a2b3c4d5e6f7g8h9i0j1k2l3m`
   ```
   APP_CLIENT_ID: _______________________
   ```

3. **Get User Pool Region**
   - Extract from User Pool ID (part before underscore)
   - Example: `us-east-1` from `us-east-1_XXXXXXXXX`
   ```
   REGION: _______________________
   ```

### **✅ Verification:**
- User pool status is "Active"
- App client appears in the app clients list
- Client secret is "No secret" (not generated)

---

## 🔑 **Step 3: IAM Role Configuration**

### **Objective:** Create execution role for Lambda functions

### **Instructions:**

1. **Navigate to IAM**
   - Search for "IAM" in AWS Console
   - Click **IAM** (Identity and Access Management)
   - Click **Roles** in left sidebar
   - Click **Create role**

2. **Select Trusted Entity**
   - **Trusted entity type:** AWS service
   - **Use case:** Select **Lambda**
   - Click **Next**

3. **Attach Permissions Policies**
   
   Search and select these two policies:
   
   - ✅ **AWSLambdaBasicExecutionRole**
     - Allows Lambda to write logs to CloudWatch
   
   - ✅ **AmazonDynamoDBFullAccess**
     - Allows Lambda to read/write DynamoDB
   
   > **Production Note:** In production, use least-privilege custom policies

   Click **Next**

4. **Name and Create Role**
   
   **Role name:**
   ```
   TaskTrackerLambdaRole
   ```
   
   **Description:**
   ```
   Execution role for Task Tracker Lambda functions
   ```
   
   **Tags (Optional):**
   - Key: `Project` → Value: `TaskTracker`
   
   Click **Create role**

5. **Record Role ARN**
   - Find `TaskTrackerLambdaRole` in roles list
   - Click on role name
   - Copy **ARN**
   - Format: `arn:aws:iam::123456789012:role/TaskTrackerLambdaRole`
   ```
   ROLE_ARN: _______________________
   ```

### **✅ Verification:**
- Role appears in roles list
- Has 2 attached policies
- Trust relationship shows Lambda service

---

## ⚡ **Step 4: Lambda Functions Deployment**

### **Objective:** Create 4 serverless backend functions

### **Overview:**
- `CreateTask` - POST /tasks (create new task)
- `GetTasks` - GET /tasks (retrieve all tasks)
- `UpdateTask` - PUT /tasks/{id} (update task status)
- `DeleteTask` - DELETE /tasks/{id} (delete task)

---

### **Function 1: CreateTask**

1. **Navigate to Lambda**
   - Search for "Lambda" in AWS Console
   - Click **Lambda**
   - Click **Create function**

2. **Configure Function**
   - **Function option:** Author from scratch
   - **Function name:** `CreateTask`
   - **Runtime:** **Python 3.12** (or latest)
   - **Architecture:** x86_64
   - **Permissions:**
     - Expand "Change default execution role"
     - Select "Use an existing role"
     - Choose **TaskTrackerLambdaRole**
   - Click **Create function**

3. **Add Function Code**
   - Scroll to **Code source** section
   - Delete default code in `lambda_function.py`
   - Paste this code:

```python
import json
import boto3
import uuid
from datetime import datetime
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TasksTable')

def lambda_handler(event, context):
    """
    Create a new task in DynamoDB
    Expects: task_name, description (optional), user_id
    """
    try:
        # Parse request body
        body = json.loads(event['body']) if isinstance(event.get('body'), str) else event.get('body', {})
        
        # Get user_id from request context (from Cognito)
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # Validate required fields
        if 'task_name' not in body:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'task_name is required'})
            }
        
        # Generate unique task ID
        task_id = str(uuid.uuid4())
        
        # Create task item
        item = {
            'task_id': task_id,
            'user_id': user_id,
            'task_name': body['task_name'],
            'description': body.get('description', ''),
            'status': 'Pending',
            'created_at': datetime.utcnow().isoformat() + 'Z'
        }
        
        # Save to DynamoDB
        table.put_item(Item=item)
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Task created successfully',
                'task': item
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
            'body': json.dumps({'message': 'Internal server error', 'error': str(e)})
        }
```

4. **Deploy Function**
   - Click **Deploy** (orange button above code editor)
   - Wait for "Successfully deployed" message

5. **Configure Settings** (Optional but Recommended)
   - Click **Configuration** tab
   - Click **General configuration** → **Edit**
   - **Timeout:** 30 seconds
   - **Memory:** 256 MB
   - Click **Save**

---

### **Function 2: GetTasks**

1. **Create New Function**
   - Lambda → **Create function**
   - **Function name:** `GetTasks`
   - **Runtime:** Python 3.12
   - **Role:** TaskTrackerLambdaRole (existing)
   - Click **Create function**

2. **Add Code**

```python
import json
import boto3
from boto3.dynamodb.conditions import Key
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TasksTable')

# Helper to convert Decimal to int/float for JSON serialization
def decimal_default(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError

def lambda_handler(event, context):
    """
    Get all tasks for the authenticated user
    Returns: List of tasks
    """
    try:
        # Get user_id from Cognito token
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # Scan table for user's tasks
        response = table.scan(
            FilterExpression='user_id = :uid',
            ExpressionAttributeValues={':uid': user_id}
        )
        
        tasks = response.get('Items', [])
        
        # Sort by created_at (newest first)
        tasks.sort(key=lambda x: x.get('created_at', ''), reverse=True)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'tasks': tasks,
                'count': len(tasks)
            }, default=decimal_default)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'message': 'Internal server error', 'error': str(e)})
        }
```

3. **Deploy** - Click **Deploy**

---

### **Function 3: UpdateTask**

1. **Create New Function**
   - Lambda → **Create function**
   - **Function name:** `UpdateTask`
   - **Runtime:** Python 3.12
   - **Role:** TaskTrackerLambdaRole (existing)
   - Click **Create function**

2. **Add Code**

```python
import json
import boto3
from decimal import Decimal

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TasksTable')

def decimal_default(obj):
    if isinstance(obj, Decimal):
        return int(obj) if obj % 1 == 0 else float(obj)
    raise TypeError

def lambda_handler(event, context):
    """
    Update an existing task
    Expects: task_id in path, update fields in body
    """
    try:
        # Get task_id from path parameters
        task_id = event['pathParameters']['id']
        
        # Get user_id from Cognito token
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # Parse request body
        body = json.loads(event['body']) if isinstance(event.get('body'), str) else event.get('body', {})
        
        # First, verify the task belongs to the user
        response = table.get_item(Key={'task_id': task_id})
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Task not found'})
            }
        
        task = response['Item']
        
        # Verify ownership
        if task['user_id'] != user_id:
            return {
                'statusCode': 403,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Not authorized to update this task'})
            }
        
        # Build update expression dynamically
        update_expression = "SET "
        expression_attribute_values = {}
        expression_attribute_names = {}
        
        if 'task_name' in body:
            update_expression += "#tn = :tn, "
            expression_attribute_names['#tn'] = 'task_name'
            expression_attribute_values[':tn'] = body['task_name']
        
        if 'description' in body:
            update_expression += "description = :desc, "
            expression_attribute_values[':desc'] = body['description']
        
        if 'status' in body:
            update_expression += "#st = :st, "
            expression_attribute_names['#st'] = 'status'
            expression_attribute_values[':st'] = body['status']
        
        # Remove trailing comma and space
        update_expression = update_expression.rstrip(', ')
        
        if not expression_attribute_values:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'No valid fields to update'})
            }
        
        # Update the item
        update_params = {
            'Key': {'task_id': task_id},
            'UpdateExpression': update_expression,
            'ExpressionAttributeValues': expression_attribute_values,
            'ReturnValues': 'ALL_NEW'
        }
        
        if expression_attribute_names:
            update_params['ExpressionAttributeNames'] = expression_attribute_names
        
        response = table.update_item(**update_params)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Task updated successfully',
                'task': response['Attributes']
            }, default=decimal_default)
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'message': 'Internal server error', 'error': str(e)})
        }
```

3. **Deploy** - Click **Deploy**

---

### **Function 4: DeleteTask**

1. **Create New Function**
   - Lambda → **Create function**
   - **Function name:** `DeleteTask`
   - **Runtime:** Python 3.12
   - **Role:** TaskTrackerLambdaRole (existing)
   - Click **Create function**

2. **Add Code**

```python
import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('TasksTable')

def lambda_handler(event, context):
    """
    Delete a task from DynamoDB
    Expects: task_id in path parameters
    """
    try:
        # Get task_id from path parameters
        task_id = event['pathParameters']['id']
        
        # Get user_id from Cognito token
        user_id = event['requestContext']['authorizer']['claims']['sub']
        
        # First, verify the task belongs to the user
        response = table.get_item(Key={'task_id': task_id})
        
        if 'Item' not in response:
            return {
                'statusCode': 404,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Task not found'})
            }
        
        task = response['Item']
        
        # Verify ownership
        if task['user_id'] != user_id:
            return {
                'statusCode': 403,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'message': 'Not authorized to delete this task'})
            }
        
        # Delete the task
        table.delete_item(Key={'task_id': task_id})
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'message': 'Task deleted successfully',
                'task_id': task_id
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
            'body': json.dumps({'message': 'Internal server error', 'error': str(e)})
        }
```

3. **Deploy** - Click **Deploy**

### **✅ Verification:**
- All 4 Lambda functions appear in functions list
- Each function shows "Active" status
- Test each function using the "Test" tab (create test events)

---

## 🌐 **Step 5: API Gateway Configuration**

### **Objective:** Create REST API to expose Lambda functions

### **Part A: Create REST API**

1. **Navigate to API Gateway**
   - Search for "API Gateway" in AWS Console
   - Click **API Gateway**
   - Click **Create API**

2. **Select API Type**
   - Find **REST API** (not Private)
   - Click **Build**

3. **Configure API**
   - **Protocol:** REST
   - **Create new API:** New API
   - **API name:** `TaskTrackerAPI`
   - **Description:** REST API for Task Tracker Application
   - **Endpoint Type:** Regional
   - Click **Create API**

### **Part B: Create Cognito Authorizer**

1. **Navigate to Authorizers**
   - Left sidebar → **Authorizers**
   - Click **Create New Authorizer**

2. **Configure Authorizer**
   - **Name:** `CognitoAuthorizer`
   - **Type:** Cognito
   - **Cognito User Pool:** Select `TaskTrackerUserPool`
   - **Token Source:** `Authorization` (header name)
   - **Token Validation:** Leave empty
   - Click **Create**

### **Part C: Create /tasks Resource**

1. **Create Resource**
   - Left sidebar → **Resources**
   - Select root `/`
   - **Actions** → **Create Resource**
   - **Resource Name:** `tasks`
   - **Resource Path:** `/tasks`
   - ✅ **Enable API Gateway CORS**
   - Click **Create Resource**

### **Part D: Create POST /tasks Method**

1. **Add POST Method**
   - Select `/tasks` resource
   - **Actions** → **Create Method**
   - Select **POST** from dropdown
   - Click checkmark ✓

2. **Setup Method**
   - **Integration type:** Lambda Function
   - ✅ **Use Lambda Proxy integration** (CRITICAL!)
   - **Lambda Region:** Your region (e.g., us-east-1)
   - **Lambda Function:** `CreateTask`
   - Click **Save**
   - Click **OK** to grant permissions

3. **Configure Method Request**
   - Click **Method Request**
   - **Authorization:** Select `CognitoAuthorizer`
   - **API Key Required:** false
   - Click back arrow

### **Part E: Create GET /tasks Method**

1. **Add GET Method**
   - Select `/tasks` resource
   - **Actions** → **Create Method**
   - Select **GET**
   - Click checkmark ✓

2. **Setup Method**
   - **Integration type:** Lambda Function
   - ✅ **Use Lambda Proxy integration**
   - **Lambda Function:** `GetTasks`
   - Click **Save** → **OK**

3. **Configure Authorization**
   - Click **Method Request**
   - **Authorization:** `CognitoAuthorizer`
   - Click back arrow

### **Part F: Create /tasks/{id} Resource**

1. **Create Resource**
   - Select `/tasks` resource
   - **Actions** → **Create Resource**
   - **Resource Name:** `{id}`
   - **Resource Path:** `{id}`
   - ✅ **Enable API Gateway CORS**
   - Click **Create Resource**

### **Part G: Create PUT /tasks/{id} Method**

1. **Add PUT Method**
   - Select `/tasks/{id}` resource
   - **Actions** → **Create Method**
   - Select **PUT**
   - Click checkmark ✓

2. **Setup Method**
   - **Integration type:** Lambda Function
   - ✅ **Use Lambda Proxy integration**
   - **Lambda Function:** `UpdateTask`
   - Click **Save** → **OK**

3. **Configure Authorization**
   - Click **Method Request**
   - **Authorization:** `CognitoAuthorizer`

### **Part H: Create DELETE /tasks/{id} Method**

1. **Add DELETE Method**
   - Select `/tasks/{id}` resource
   - **Actions** → **Create Method**
   - Select **DELETE**
   - Click checkmark ✓

2. **Setup Method**
   - **Integration type:** Lambda Function
   - ✅ **Use Lambda Proxy integration**
   - **Lambda Function:** `DeleteTask`
   - Click **Save** → **OK**

3. **Configure Authorization**
   - Click **Method Request**
   - **Authorization:** `CognitoAuthorizer`

### **Part I: Enable CORS**

1. **For /tasks resource:**
   - Select `/tasks`
   - **Actions** → **Enable CORS**
   - **Access-Control-Allow-Methods:** GET, POST, OPTIONS
   - **Access-Control-Allow-Headers:** Add:
     ```
     Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
     ```
   - **Access-Control-Allow-Origin:** `*`
   - Click **Enable CORS and replace existing CORS headers**
   - Click **Yes, replace existing values**

2. **For /tasks/{id} resource:**
   - Select `/tasks/{id}`
   - **Actions** → **Enable CORS**
   - **Access-Control-Allow-Methods:** PUT, DELETE, OPTIONS
   - Add same headers as above
   - Click **Enable CORS and replace existing CORS headers**

### **Part J: Deploy API**

1. **Create Deployment**
   - **Actions** → **Deploy API**
   - **Deployment stage:** [New Stage]
   - **Stage name:** `prod`
   - **Stage description:** Production deployment
   - Click **Deploy**

2. **Get API Invoke URL**
   - After deployment, you'll see **Invoke URL** at top
   - Format: `https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod`
   - **Save this URL!**
   ```
   API_INVOKE_URL: _______________________
   ```

### **✅ Verification:**
- API shows 6 methods total:
  - POST /tasks
  - GET /tasks
  - OPTIONS /tasks
  - PUT /tasks/{id}
  - DELETE /tasks/{id}
  - OPTIONS /tasks/{id}
- Invoke URL is accessible

---

## 🌍 **Step 6: Frontend S3 Hosting**

### **Objective:** Deploy frontend application to S3

### **Part A: Create S3 Bucket**

1. **Navigate to S3**
   - Search for "S3" in AWS Console
   - Click **S3**
   - Click **Create bucket**

2. **Configure Bucket**
   
   **Bucket name:** (must be globally unique)
   ```
   task-tracker-[your-name]-2024
   ```
   Example: `task-tracker-john-2024`
   
   **AWS Region:** Your region (e.g., us-east-1)
   
   **Block Public Access:**
   - ☐ **Uncheck** "Block all public access"
   - ✅ Check acknowledgment box
   
   **Bucket Versioning:** Disabled
   
   **Encryption:** Keep defaults
   
   **Tags (Optional):**
   - Key: `Project` → Value: `TaskTracker`
   
   Click **Create bucket**

### **Part B: Enable Static Website Hosting**

1. **Configure Website Hosting**
   - Click on your bucket name
   - Go to **Properties** tab
   - Scroll to **Static website hosting**
   - Click **Edit**

2. **Settings**
   - **Static website hosting:** Enable
   - **Hosting type:** Host a static website
   - **Index document:** `index.html`
   - **Error document:** `index.html` (for SPA routing)
   - Click **Save changes**

3. **Get Website Endpoint**
   - Return to **Properties** tab
   - Scroll to **Static website hosting**
   - Copy **Bucket website endpoint**
   - Format: `http://task-tracker-john-2024.s3-website-us-east-1.amazonaws.com`
   ```
   WEBSITE_URL: _______________________
   ```

### **Part C: Set Bucket Policy**

1. **Add Public Read Policy**
   - Go to **Permissions** tab
   - Scroll to **Bucket policy**
   - Click **Edit**

2. **Paste Policy** (replace `YOUR-BUCKET-NAME` with your actual bucket name):

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

3. **Example** (for bucket `task-tracker-john-2024`):
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::task-tracker-john-2024/*"
        }
    ]
}
```

4. Click **Save changes**

### **Part D: Configure Frontend Files**

You need to update the frontend configuration with your AWS values.

#### **Update app.js Configuration**

1. **Open** `frontend/app.js` in a text editor
2. **Find** the configuration section (near top of file):

```javascript
const CONFIG = {
    REGION: 'YOUR_REGION',
    USER_POOL_ID: 'YOUR_USER_POOL_ID',
    CLIENT_ID: 'YOUR_CLIENT_ID',
    API_URL: 'YOUR_API_GATEWAY_URL'
};
```

3. **Replace with your actual values:**

```javascript
const CONFIG = {
    REGION: 'us-east-1',  // Your region
    USER_POOL_ID: 'us-east-1_abcdef123',  // From Step 2
    CLIENT_ID: '1a2b3c4d5e6f7g8h9i0j1k2l3m',  // From Step 2
    API_URL: 'https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod'  // From Step 5
};
```

4. **Save** the file

### **Part E: Upload Files to S3**

1. **Navigate to Bucket**
   - Go to S3 Console
   - Click on your bucket name
   - Click **Upload**

2. **Add Files**
   - Click **Add files**
   - Select these 3 files:
     - `frontend/index.html`
     - `frontend/styles.css`
     - `frontend/app.js` (the updated one!)
   - Click **Upload**
   - Wait for upload completion

3. **Verify Upload**
   - You should see 3 objects in your bucket
   - All files should be accessible

### **✅ Verification:**
- S3 bucket contains 3 files
- Website endpoint is accessible
- Files are publicly readable

---

## ✅ **Step 7: Testing & Verification**

### **Objective:** Verify complete application functionality

### **Part A: Access Application**

1. **Open Website**
   - Use your S3 website endpoint URL
   - Example: `http://task-tracker-john-2024.s3-website-us-east-1.amazonaws.com`

2. **Check Page Load**
   - Should see "Task Tracker" title
   - Login/Register form visible
   - No console errors (F12 → Console)

### **Part B: Test User Registration**

1. **Sign Up New User**
   - Click **Register** tab
   - Enter:
     - Name: `Test User`
     - Email: Your valid email
     - Password: `TestPass123!` (meets requirements)
   - Click **Sign Up**

2. **Verify Email**
   - Check your email inbox (may take 1-2 minutes)
   - Look for email from `no-reply@verificationemail.com`
   - Copy verification code
   - Enter code in app
   - Click **Verify**

3. **Expected Result:**
   - "Email verified successfully!" message
   - Redirected to login

### **Part C: Test Login**

1. **Sign In**
   - Email: Your registered email
   - Password: Your password
   - Click **Sign In**

2. **Expected Result:**
   - Dashboard loads
   - User profile shows your name
   - "Sign Out" button visible
   - Task form visible

### **Part D: Test Task Creation**

1. **Create Task**
   - Task name: `Test Task 1`
   - Description: `This is a test task`
   - Click **Add Task**

2. **Expected Result:**
   - "Task created!" success message
   - Task appears in list below
   - Task shows "Pending" status

### **Part E: Test Task Operations**

1. **Mark Complete**
   - Click ✓ button on task
   - Task status changes to "Completed"
   - Green checkmark appears

2. **Update Task**
   - Change status back to "Pending"
   - Task updates immediately

3. **Delete Task**
   - Click 🗑️ button
   - Confirm deletion
   - Task disappears from list

### **Part F: Test Filters & Sorting**

1. **Create Multiple Tasks**
   - Add 3-5 tasks with different statuses

2. **Test Filters**
   - Filter: **All** → Shows all tasks
   - Filter: **Pending** → Shows only pending
   - Filter: **Completed** → Shows only completed

3. **Test Sorting**
   - **Newest First** → Latest at top
   - **Oldest First** → Oldest at top
   - **By Name** → Alphabetical order

### **Part G: Test Sign Out**

1. **Sign Out**
   - Click **Sign Out** button
   - Should return to login page
   - Token cleared from storage

2. **Test Protected Access**
   - Try accessing dashboard without login
   - Should redirect to login

### **✅ Complete Testing Checklist:**

- [ ] Application loads without errors
- [ ] User registration works
- [ ] Email verification received and works
- [ ] Login successful
- [ ] User profile displays correctly
- [ ] Task creation works
- [ ] Task appears in list
- [ ] Task status can be toggled
- [ ] Task deletion works
- [ ] Filters work correctly
- [ ] Sorting works correctly
- [ ] Sign out works
- [ ] Protected routes enforce authentication

---

## 🔧 **Troubleshooting Guide**

### **Issue: "Cannot read property 'body' of undefined" in Lambda**

**Cause:** API Gateway not using Lambda Proxy Integration

**Solution:**
- Edit each API method
- Check "Use Lambda Proxy integration" checkbox
- Redeploy API

---

### **Issue: CORS errors in browser console**

**Symptoms:**
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Solution:**
1. API Gateway → Resources
2. Select each resource
3. Actions → Enable CORS
4. Add headers:
   ```
   Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token
   ```
5. Deploy API again

---

### **Issue: "User is not authenticated" error**

**Cause:** Cognito authorizer not properly configured

**Solution:**
1. Check API Gateway → Authorizers
2. Verify Cognito User Pool is selected
3. Token Source must be: `Authorization`
4. Each method must use authorizer in Method Request
5. Redeploy API

---

### **Issue: Tasks not loading (empty list)**

**Possible Causes:**

**A) DynamoDB Permissions**
- Check IAM role has `AmazonDynamoDBFullAccess`
- Verify role is attached to Lambda functions

**B) Wrong User ID**
- Check Lambda logs in CloudWatch
- Verify `user_id` is being extracted from token

**C) JavaScript errors**
- Open browser console (F12)
- Check for API errors
- Verify API_URL is correct in app.js

---

### **Issue: Email verification code not received**

**Solutions:**
1. Check spam/junk folder
2. Wait 2-3 minutes (emails can be delayed)
3. Request new code in app
4. Verify email service in Cognito is configured
5. Check AWS SES sending limits (50 emails/day free)

---

### **Issue: "Invalid token" or "Token expired"**

**Solution:**
1. Sign out and sign in again
2. Check token expiration in Cognito settings
3. Verify system clock is correct
4. Clear browser local storage

---

### **Issue: S3 website shows 403 Forbidden**

**Cause:** Bucket policy not allowing public read

**Solution:**
1. S3 → Bucket → Permissions
2. Uncheck "Block all public access"
3. Add bucket policy (see Step 6, Part C)
4. Verify Resource ARN matches your bucket

---

### **Issue: API returns 500 Internal Server Error**

**Debugging Steps:**
1. **Check CloudWatch Logs:**
   - CloudWatch → Log groups
   - Find `/aws/lambda/CreateTask` (or other function)
   - Check recent logs for Python errors

2. **Common Errors:**
   - `Table not found` → Check DynamoDB table name
   - `AccessDeniedException` → Check IAM permissions
   - `KeyError` → Check event structure in Lambda

3. **Test Lambda Directly:**
   - Lambda → Function → Test tab
   - Create test event with sample data
   - View execution results

---

### **Issue: App.js config not updating**

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Re-upload app.js to S3
3. Verify S3 file has new content
4. Do hard refresh (Ctrl+F5)

---

## 🚀 **Production Checklist**

Before going live with real users:

### **Security**

- [ ] Replace `AmazonDynamoDBFullAccess` with least-privilege policy
- [ ] Enable MFA in Cognito for all users
- [ ] Use custom domain with SSL/TLS (CloudFront + ACM)
- [ ] Enable AWS WAF for API Gateway
- [ ] Rotate IAM credentials regularly
- [ ] Enable CloudTrail for audit logging
- [ ] Set up AWS Config for compliance

### **Performance**

- [ ] Enable DynamoDB Auto Scaling or switch to On-Demand
- [ ] Add DynamoDB Global Secondary Index (GSI) on user_id
- [ ] Enable API Gateway caching
- [ ] Use CloudFront for S3 static website
- [ ] Compress frontend assets (gzip/brotli)
- [ ] Implement Lambda function versioning
- [ ] Set appropriate Lambda memory/timeout

### **Monitoring**

- [ ] Set up CloudWatch Alarms for:
  - Lambda errors
  - API Gateway 4xx/5xx errors
  - DynamoDB throttling
  - High Lambda duration
- [ ] Enable X-Ray tracing for debugging
- [ ] Create CloudWatch Dashboard
- [ ] Set up SNS alerts for critical errors
- [ ] Monitor cost with AWS Budgets

### **Backup & Recovery**

- [ ] Enable DynamoDB Point-in-Time Recovery (PITR)
- [ ] Enable S3 bucket versioning
- [ ] Set up automated backups
- [ ] Document disaster recovery procedures
- [ ] Test restore procedures

### **Documentation**

- [ ] Document architecture diagram
- [ ] Create runbook for common operations
- [ ] Document API endpoints
- [ ] Create user guide
- [ ] Document troubleshooting steps

### **Cost Optimization**

- [ ] Review and right-size Lambda memory
- [ ] Use DynamoDB On-Demand for variable workloads
- [ ] Set up S3 lifecycle policies
- [ ] Delete unused Lambda versions
- [ ] Review CloudWatch Logs retention
- [ ] Use AWS Cost Explorer

---

## 📊 **Architecture Summary**

```
┌──────────────────────────────────────────────────────────────┐
│                         End User                              │
│                      (Web Browser)                            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ HTTPS
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                    Amazon S3 Bucket                           │
│              (Static Website Hosting)                         │
│   ┌─────────────────────────────────────────────┐            │
│   │  index.html  │  styles.css  │  app.js       │            │
│   └─────────────────────────────────────────────┘            │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         │ REST API (HTTPS + JWT)
                         ▼
┌──────────────────────────────────────────────────────────────┐
│                  Amazon API Gateway                           │
│                    (REST API)                                 │
│   ┌──────────────────────────────────────────────┐           │
│   │  /tasks (GET, POST)                          │           │
│   │  /tasks/{id} (PUT, DELETE)                   │           │
│   │  + CORS Configuration                         │           │
│   │  + Cognito Authorizer                         │           │
│   └──────────────────────────────────────────────┘           │
└─────┬──────────────┬──────────────┬──────────────┬───────────┘
      │              │              │              │
      │ Invoke       │ Invoke       │ Invoke       │ Invoke
      ▼              ▼              ▼              ▼
┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐
│ Lambda   │  │ Lambda   │  │ Lambda   │  │ Lambda   │
│ Create   │  │ Get      │  │ Update   │  │ Delete   │
│ Task     │  │ Tasks    │  │ Task     │  │ Task     │
└────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘
     │             │             │             │
     │ Read/Write  │ Read        │ Read/Write  │ Delete
     └─────────────┴─────────────┴─────────────┘
                          │
                          ▼
          ┌───────────────────────────────┐
          │      Amazon DynamoDB          │
          │       (TasksTable)            │
          │  ┌─────────────────────────┐  │
          │  │ task_id (PK)            │  │
          │  │ user_id                 │  │
          │  │ task_name               │  │
          │  │ description             │  │
          │  │ status                  │  │
          │  │ created_at              │  │
          │  └─────────────────────────┘  │
          └───────────────────────────────┘

          ┌───────────────────────────────┐
          │      Amazon Cognito           │
          │      (User Pool)              │
          │  ┌─────────────────────────┐  │
          │  │ User Authentication     │  │
          │  │ JWT Token Generation    │  │
          │  │ Email Verification      │  │
          │  └─────────────────────────┘  │
          └───────────────────────────────┘
```

---

## 📝 **Configuration Summary Sheet**

Save these values for future reference:

```
PROJECT: Task Tracker Serverless Application
DEPLOYMENT DATE: _______________

AWS REGION: _______________

DYNAMODB:
- Table Name: TasksTable
- Table ARN: arn:aws:dynamodb:_______________

COGNITO:
- User Pool ID: _______________
- User Pool ARN: _______________
- App Client ID: _______________
- Region: _______________

IAM:
- Lambda Execution Role: TaskTrackerLambdaRole
- Role ARN: arn:aws:iam::_______________

LAMBDA FUNCTIONS:
- CreateTask ARN: _______________
- GetTasks ARN: _______________
- UpdateTask ARN: _______________
- DeleteTask ARN: _______________

API GATEWAY:
- API ID: _______________
- API Name: TaskTrackerAPI
- Stage: prod
- Invoke URL: _______________

S3:
- Bucket Name: _______________
- Bucket ARN: _______________
- Website Endpoint: _______________

ESTIMATED MONTHLY COST: $0-5 (within free tier)
```

---

## 🎓 **What You've Accomplished**

Congratulations! You have successfully deployed a production-ready serverless application with:

✅ **Serverless Architecture** - No servers to manage, auto-scaling
✅ **User Authentication** - Secure sign-up, login, email verification
✅ **RESTful API** - Four CRUD endpoints with proper HTTP methods
✅ **NoSQL Database** - Fast, scalable data storage
✅ **Modern Frontend** - Responsive UI with animations
✅ **Security** - JWT-based auth, HTTPS, IAM permissions
✅ **CORS Support** - Cross-origin resource sharing configured
✅ **Error Handling** - Proper status codes and error messages
✅ **Cloud-Native** - Fully managed AWS services

---

## 📚 **Next Steps**

### **Enhancements:**
1. Add task categories/tags
2. Implement task search functionality
3. Add due dates and reminders
4. Enable task sharing between users
5. Add file attachments to tasks
6. Implement real-time notifications

### **Advanced Topics:**
1. Set up CI/CD pipeline (AWS CodePipeline)
2. Implement Infrastructure as Code (AWS CDK/Terraform)
3. Add monitoring and alerting (CloudWatch, SNS)
4. Implement caching (API Gateway caching, DynamoDB DAX)
5. Add global distribution (CloudFront)
6. Implement A/B testing
7. Add analytics (Amazon Pinpoint)

### **Learning Resources:**
- [AWS Serverless Documentation](https://aws.amazon.com/serverless/)
- [AWS Well-Architected Framework](https://aws.amazon.com/architecture/well-architected/)
- [Serverless Application Lens](https://docs.aws.amazon.com/wellarchitected/latest/serverless-applications-lens/)
- [AWS Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)

---

## 📞 **Support**

If you encounter issues:
1. Check the Troubleshooting Guide above
2. Review AWS CloudWatch Logs
3. Verify all configuration values
4. Check AWS Service Health Dashboard
5. Review AWS documentation

---

## 📄 **License**

This project is provided as educational material for learning AWS serverless technologies.

---

**🎉 Congratulations on deploying your AWS Serverless Task Tracker!**

*Last Updated: November 2025*
