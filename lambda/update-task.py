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
