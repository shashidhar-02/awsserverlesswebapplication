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
