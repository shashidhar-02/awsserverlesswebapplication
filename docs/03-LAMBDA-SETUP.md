# Step 3: AWS Lambda Functions Setup

## Overview

AWS Lambda is a serverless compute service that runs your backend code in response to events (like API calls). You don't need to manage servers - AWS automatically handles scaling, patching, and infrastructure.

In this step, you'll create four Lambda functions to handle all task operations (Create, Read, Update, Delete).

## Learning Objectives

- Create Lambda functions using Python
- Configure execution roles and permissions
- Connect Lambda to DynamoDB
- Understand environment variables and error handling

---

## Architecture Overview

```
API Gateway → Lambda Functions → DynamoDB

Four Lambda Functions:
1. create-task   → POST   /tasks
2. get-tasks     → GET    /tasks
3. update-task   → PUT    /tasks/{id}
4. delete-task   → DELETE /tasks/{id}
```

---

## Part A: Create IAM Role for Lambda

Lambda needs permission to write logs and access DynamoDB.

### 1. Navigate to IAM

1. In AWS Console, search for **IAM**
2. Click on **IAM** (Identity and Access Management)
3. Click **Roles** in the left sidebar
4. Click **Create role**

### 2. Configure Role

**Step 1: Select trusted entity**

- **Trusted entity type**: AWS service
- **Use case**: Select **Lambda**
- Click **Next**

**Step 2: Add permissions**

Search and select these policies:

1. ✅ **AWSLambdaBasicExecutionRole** (for CloudWatch Logs)
2. ✅ **AmazonDynamoDBFullAccess** (for DynamoDB operations)

> **Production Note**: In production, use more restrictive policies that only grant specific DynamoDB actions on specific tables.

Click **Next**

**Step 3: Name, review, and create**

- **Role name**: `TaskTrackerLambdaRole`
- **Description**: Role for Task Tracker Lambda functions to access DynamoDB
- Click **Create role**

### 3. Note the Role ARN

1. Find your newly created role in the roles list
2. Click on `TaskTrackerLambdaRole`
3. Copy the **ARN** (Amazon Resource Name)
   - Format: `arn:aws:iam::123456789012:role/TaskTrackerLambdaRole`
4. Save this for later use

---

## Part B: Create Lambda Functions

We'll create 4 Lambda functions. Follow these steps for each one.

---

## Function 1: Create Task

### 1. Navigate to Lambda

1. Search for **Lambda** in AWS Console
2. Click **Lambda**
3. Click **Create function**

### 2. Configure Function

**Function option**: Author from scratch

**Basic information**:

- **Function name**: `CreateTask`
- **Runtime**: **Python 3.12** (or latest available)
- **Architecture**: x86_64 (default)

**Permissions**:

- Expand **Change default execution role**
- Select **Use an existing role**
- Choose **TaskTrackerLambdaRole** (the role we just created)

Click **Create function**

### 3. Add Function Code

Wait for the function to be created, then:

1. Scroll down to the **Code source** section
2. Delete the default code in `lambda_function.py`
3. Paste the following code:

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

4. Click **Deploy** (orange button above the code editor)
5. Wait for "Successfully deployed" message

### 4. Configure Function Settings

**Environment Variables** (Optional but recommended):

1. Click the **Configuration** tab
2. Click **Environment variables** in the left menu
3. Click **Edit**
4. Click **Add environment variable**
   - Key: `TABLE_NAME`
   - Value: `TasksTable`
5. Click **Save**

**Timeout Settings**:

1. Still in **Configuration** tab
2. Click **General configuration**
3. Click **Edit**
4. Change **Timeout** to `10 seconds` (from default 3)
5. Click **Save**

---

## Function 2: Get Tasks

### 1. Create Function

1. Go back to Lambda console
2. Click **Create function**

**Basic information**:

- **Function name**: `GetTasks`
- **Runtime**: Python 3.12
- **Permissions**: Use existing role → `TaskTrackerLambdaRole`

Click **Create function**

### 2. Add Function Code

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
        
        # Scan table for user's tasks (in production, use GSI for better performance)
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

3. Click **Deploy**

### 3. Configure Settings

- Add environment variable: `TABLE_NAME` = `TasksTable`
- Set timeout to 10 seconds

---

## Function 3: Update Task

### 1. Create Function

**Basic information**:

- **Function name**: `UpdateTask`
- **Runtime**: Python 3.12
- **Permissions**: Use existing role → `TaskTrackerLambdaRole`

### 2. Add Function Code

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

3. Click **Deploy**

### 3. Configure Settings

- Add environment variable: `TABLE_NAME` = `TasksTable`
- Set timeout to 10 seconds

---

## Function 4: Delete Task

### 1. Create Function

**Basic information**:

- **Function name**: `DeleteTask`
- **Runtime**: Python 3.12
- **Permissions**: Use existing role → `TaskTrackerLambdaRole`

### 2. Add Function Code

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

3. Click **Deploy**

### 3. Configure Settings

- Add environment variable: `TABLE_NAME` = `TasksTable`
- Set timeout to 10 seconds

---

## Part C: Test Lambda Functions (Optional)

### Test CreateTask Function

1. Open the `CreateTask` function
2. Click the **Test** tab
3. Click **Create new event**

**Event name**: `CreateTaskTest`

**Event JSON**:

```json
{
  "body": "{\"task_name\": \"Test Task\", \"description\": \"This is a test task\"}",
  "requestContext": {
    "authorizer": {
      "claims": {
        "sub": "test-user-123"
      }
    }
  }
}
```

4. Click **Save**
5. Click **Test**

**Expected Result**: Success with status code 201 and task details

### Test GetTasks Function

**Event JSON**:

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

Test and verify you get the task list (including the one you just created).

---

## Understanding the Code

### Key Components

**1. Boto3 SDK**:

- `boto3.resource('dynamodb')` - High-level DynamoDB interface
- `table.put_item()`, `table.get_item()`, `table.update_item()`, `table.delete_item()`

**2. Event Object**:

- Contains request data from API Gateway
- `event['body']` - Request body (JSON string)
- `event['pathParameters']` - URL path parameters
- `event['requestContext']` - Context including Cognito user info

**3. User Authorization**:

```python
user_id = event['requestContext']['authorizer']['claims']['sub']
```

- Extracts Cognito user ID from JWT token
- Ensures users only access their own tasks

**4. CORS Headers**:

```python
'Access-Control-Allow-Origin': '*'
```

- Allows frontend to call API from different domain
- In production, specify your exact domain

**5. Error Handling**:

- Try-catch blocks for all operations
- Return appropriate HTTP status codes
- Log errors to CloudWatch

---

## Monitoring and Debugging

### View Logs

1. In any Lambda function, click **Monitor** tab
2. Click **View CloudWatch logs**
3. Click on the latest log stream
4. View execution logs, errors, and print statements

### Common Issues

**"Unable to import module"**:

- Python runtime mismatch
- Check your runtime is Python 3.12

**"Insufficient permissions"**:

- IAM role doesn't have DynamoDB access
- Verify `TaskTrackerLambdaRole` has correct policies

**"Table does not exist"**:

- Check table name spelling: `TasksTable`
- Verify table exists in the same region

---

## Checkpoint ✅

Before moving to the next step, ensure:

- ✅ IAM Role created: `TaskTrackerLambdaRole`
- ✅ Four Lambda functions created:
  - `CreateTask`
  - `GetTasks`
  - `UpdateTask`
  - `DeleteTask`
- ✅ All functions deployed successfully
- ✅ Timeout set to 10 seconds for each
- ✅ Environment variable `TABLE_NAME` = `TasksTable` (optional)
- ✅ (Optional) Test events run successfully

---

## Lambda Function Summary

| Function | HTTP Method | Purpose | DynamoDB Operation |
|----------|-------------|---------|-------------------|
| CreateTask | POST | Create new task | put_item |
| GetTasks | GET | Get all user tasks | scan (with filter) |
| UpdateTask | PUT | Update task | update_item |
| DeleteTask | DELETE | Delete task | delete_item |

---

## Next Step

Continue to **[04-API-GATEWAY-SETUP.md](./04-API-GATEWAY-SETUP.md)** to create the REST API that connects your frontend to these Lambda functions.

---

## Additional Resources

- [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)
- [Boto3 DynamoDB Documentation](https://boto3.amazonaws.com/v1/documentation/api/latest/reference/services/dynamodb.html)
- [Lambda Best Practices](https://docs.aws.amazon.com/lambda/latest/dg/best-practices.html)
- [Python Lambda Function Handler](https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html)
