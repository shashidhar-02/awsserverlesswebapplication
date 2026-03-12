# AWS Serverless Web Application

A fully serverless task management application built with AWS services, featuring user authentication and task CRUD operations.

## Architecture

This application demonstrates a modern serverless architecture using:

- **Frontend**: Static HTML/CSS/JavaScript hosted on AWS S3
- **Authentication**: Amazon Cognito for user management
- **API**: AWS API Gateway for RESTful endpoints
- **Compute**: AWS Lambda functions (Python)
- **Database**: Amazon DynamoDB for data persistence

## Features

- ✅ User authentication and authorization with Cognito
- ✅ Create, read, update, and delete tasks
- ✅ Secure API endpoints with Cognito authorizer
- ✅ Real-time task status updates
- ✅ Responsive design for mobile and desktop
- ✅ Serverless architecture with auto-scaling

## Project Structure

```
awsserverlesswebapplication/
├── frontend/           # Frontend application files
│   ├── index.html     # Main application page
│   ├── tasks.html     # Tasks management page
│   ├── callback.html  # OAuth callback handler
│   ├── task-app.js    # Application logic
│   ├── app.js         # Additional app functionality
│   ├── styles.css     # Styling
│   └── start-server.ps1  # Local development server
├── lambda/            # AWS Lambda functions
│   ├── create-task.py # Create new tasks
│   ├── get-tasks.py   # Retrieve all tasks
│   ├── update-task.py # Update existing tasks
│   └── delete-task.py # Delete tasks
├── deploy.ps1         # Deployment script
└── README.md          # Project documentation
```

## Lambda Functions

### 1. create-task.py
Creates new tasks in DynamoDB with auto-generated IDs and timestamps.

**Endpoint**: `POST /create-task`

**Request Body**:
```json
{
  "task_name": "Task name",
  "description": "Optional description"
}
```

### 2. get-tasks.py
Retrieves all tasks for the authenticated user from DynamoDB.

**Endpoint**: `GET /get-tasks`

**Response**:
```json
{
  "tasks": [...],
  "count": 5
}
```

### 3. update-task.py
Updates task properties including status, name, and description.

**Endpoint**: `PUT /update-task`

### 4. delete-task.py
Deletes a task from DynamoDB by task ID.

**Endpoint**: `DELETE /delete-task`

## API Endpoints

- **Create Task**: `https://yfsh5mb20i.execute-api.us-east-1.amazonaws.com/prod/create-task`
- **Get Tasks**: `https://kflgro3072.execute-api.us-east-1.amazonaws.com/prod/get-tasks`

## AWS Services Configuration

### Amazon Cognito
- **User Pool**:`
- **App Client**: ``
- Provides authentication and JWT tokens for API authorization

### API Gateway
- RESTful API with Cognito authorizer
- CORS enabled for cross-origin requests
- Production stage deployment

### DynamoDB
- Table for storing task data
- Primary key: `task_id`
- Attributes: task_name, description, status, created_at, user_id

### Lambda Functions
- Python 3.x runtime
- IAM roles with DynamoDB access
- Triggered by API Gateway requests

## Local Development

### Running the Frontend Locally

Use the provided PowerShell script to run a local development server:

```powershell
# Default port 8000
.\frontend\start-server.ps1

# Custom port
.\frontend\start-server.ps1 -Port 8001
```

The application will automatically open in your default browser.

**Note**: The local server is for frontend testing only. Full functionality requires AWS services to be deployed.

## Deployment

1. **Configure AWS Services**:
   - Create DynamoDB table
   - Set up Cognito User Pool
   - Deploy Lambda functions
   - Configure API Gateway
   - Create S3 bucket for static hosting

2. **Update Configuration**:
   - Update API endpoints in frontend files
   - Configure Cognito settings
   - Set up CORS policies

3. **Deploy Frontend**:
   ```powershell
   .\deploy.ps1
   ```

4. **Upload to S3**:
   - Upload frontend files to S3 bucket
   - Enable static website hosting
   - Configure bucket policy for public access

## Security Features

- **Authentication**: Cognito-based user authentication
- **Authorization**: JWT tokens for API access
- **CORS**: Configured for secure cross-origin requests
- **IAM Roles**: Least privilege access for Lambda functions
- **Input Validation**: Server-side validation in Lambda functions

## Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: AWS Lambda (Python 3.x)
- **Database**: Amazon DynamoDB
- **Authentication**: Amazon Cognito
- **API**: AWS API Gateway
- **Storage**: Amazon S3
- **Infrastructure**: Serverless architecture

## Prerequisites

- AWS Account
- AWS CLI configured
- PowerShell (for deployment scripts)
- Modern web browser

## Environment Variables

Lambda functions use the following environment variables:
- `TABLE_NAME`: DynamoDB table name
- `REGION`: AWS region (us-east-1)

## CORS Configuration

The application is configured to handle CORS properly:
- Allowed origins: S3 bucket URL
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS
- Allowed headers: Content-Type, Authorization

## Known Limitations

- Tasks are user-specific (requires authentication)
- No file attachment support
- No real-time updates (requires page refresh)
- Single region deployment

## Future Enhancements

- [ ] Add task categories and tags
- [ ] Implement task sharing between users
- [ ] Add email notifications
- [ ] Support file attachments
- [ ] Real-time updates with WebSockets
- [ ] Task search and filtering
- [ ] Export tasks to CSV/PDF
- [ ] Mobile app version

## License

MIT License - See LICENSE file for details

## Author

Shashidhar

## Repository

https://github.com/shashidhar-02/awsserverlesswebapplication

---

Built with ❤️ using AWS Serverless Technologies
