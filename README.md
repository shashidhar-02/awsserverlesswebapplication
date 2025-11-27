# AWS Serverless Task Tracker Application

## Project Overview

This comprehensive guide walks you through building a fully functional serverless web application using AWS services. The **Serverless Task Tracker App** is a productivity tool that allows users to register, authenticate, and manage their personal tasks without managing any servers.

## Architecture

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌─────────────┐
│   User      │─────▶│   Amazon S3  │      │  API Gateway│─────▶│   Lambda    │
│  (Browser)  │      │  (Frontend)  │─────▶│  (REST API) │      │  Functions  │
└─────────────┘      └──────────────┘      └─────────────┘      └─────────────┘
      │                                            │                     │
      │                                            │                     ▼
      │                                            │              ┌─────────────┐
      │                                            │              │  DynamoDB   │
      │                                            │              │  (Database) │
      └────────────────────────────────────────────┘              └─────────────┘
                    ▼
            ┌──────────────┐
            │   Cognito    │
            │ (Auth & User)│
            └──────────────┘
```

## Key AWS Services

1. **Amazon S3** - Hosts static frontend files (HTML, CSS, JavaScript)
2. **API Gateway** - RESTful API endpoints for task management
3. **AWS Lambda** - Serverless backend logic execution
4. **Amazon DynamoDB** - NoSQL database for task storage
5. **Amazon Cognito** - User authentication and authorization

## Core Features

- ✅ User registration and authentication
- ✅ Create, Read, Update, Delete (CRUD) tasks
- ✅ Secure API access with JWT tokens
- ✅ Fully serverless and auto-scaling
- ✅ Pay-per-use pricing model

## DynamoDB Table Schema

| Attribute     | Type   | Description                    |
|--------------|--------|--------------------------------|
| task_id      | String | Primary Key - Unique task ID   |
| user_id      | String | Cognito user ID                |
| task_name    | String | Title of the task              |
| description  | String | Task details                   |
| status       | String | Pending/Completed              |
| created_at   | String | Timestamp (ISO format)         |

## API Endpoints

| Method | Endpoint          | Description           | Authentication |
|--------|------------------|-----------------------|----------------|
| GET    | /tasks           | Get all user tasks    | Required       |
| POST   | /tasks           | Create a new task     | Required       |
| PUT    | /tasks/{id}      | Update a task         | Required       |
| DELETE | /tasks/{id}      | Delete a task         | Required       |

## Setup Guide Overview

Follow these documentation files in order:

1. **[01-DYNAMODB-SETUP.md](./docs/01-DYNAMODB-SETUP.md)** - Create and configure DynamoDB table
2. **[02-COGNITO-SETUP.md](./docs/02-COGNITO-SETUP.md)** - Set up user authentication
3. **[03-LAMBDA-SETUP.md](./docs/03-LAMBDA-SETUP.md)** - Create backend Lambda functions
4. **[04-API-GATEWAY-SETUP.md](./docs/04-API-GATEWAY-SETUP.md)** - Configure REST API
5. **[05-S3-FRONTEND-SETUP.md](./docs/05-S3-FRONTEND-SETUP.md)** - Deploy frontend to S3
6. **[06-TESTING.md](./docs/06-TESTING.md)** - Test and verify the application

## Prerequisites

- AWS Account (Free Tier eligible)
- Basic understanding of JavaScript/Python
- AWS Console access
- Text editor (VS Code recommended)

## Skills You'll Gain

- ✅ Serverless architecture design
- ✅ API development with API Gateway and Lambda
- ✅ NoSQL database management (DynamoDB)
- ✅ Cloud hosting with S3
- ✅ User authentication with Cognito
- ✅ AWS service integration

## Cost Estimate

This project falls within AWS Free Tier limits for learning purposes:

- **S3**: First 5GB storage free
- **Lambda**: 1M free requests per month
- **DynamoDB**: 25GB storage + 25 WCU/RCU free
- **API Gateway**: 1M API calls free (first 12 months)
- **Cognito**: 50,000 MAUs free

## Expected Outcome

By completing this project, you will have:

1. ✅ A fully deployed, functional task-tracking web application
2. ✅ Real-world experience integrating multiple AWS services
3. ✅ Understanding of serverless architecture patterns
4. ✅ Portfolio-ready project demonstrating cloud development skills
5. ✅ Knowledge of production-grade authentication and security

## Getting Started

Navigate to the [docs](./docs/) folder and start with **01-DYNAMODB-SETUP.md**.

## Project Structure

```
awsserverlesswebapplication/
├── README.md
├── docs/
│   ├── 01-DYNAMODB-SETUP.md
│   ├── 02-COGNITO-SETUP.md
│   ├── 03-LAMBDA-SETUP.md
│   ├── 04-API-GATEWAY-SETUP.md
│   ├── 05-S3-FRONTEND-SETUP.md
│   └── 06-TESTING.md
├── lambda/
│   ├── create-task.py
│   ├── get-tasks.py
│   ├── update-task.py
│   └── delete-task.py
└── frontend/
    ├── index.html
    ├── styles.css
    └── app.js
```

## Support

For issues or questions:

- Review AWS documentation for each service
- Check AWS CloudWatch logs for Lambda errors
- Verify IAM permissions if you encounter access issues

---

**Ready to build?** Start with [DynamoDB Setup](./docs/01-DYNAMODB-SETUP.md) →
