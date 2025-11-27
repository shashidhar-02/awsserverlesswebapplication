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
