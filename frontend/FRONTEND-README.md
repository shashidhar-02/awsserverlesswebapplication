# Serverless Task Tracker - Frontend

A fully functional serverless web application frontend for managing tasks, built with vanilla JavaScript and AWS Cognito authentication.

## Features

### Authentication
- ✅ User Registration with email verification
- ✅ User Login with AWS Cognito
- ✅ Secure logout functionality
- ✅ Session management
- ✅ Password validation

### Task Management
- ✅ Create tasks with name, description, deadline, and priority
- ✅ View all tasks in a clean, organized interface
- ✅ Update/Edit existing tasks
- ✅ Mark tasks as completed
- ✅ Delete tasks
- ✅ Filter tasks (All, Pending, Completed)
- ✅ Sort tasks (Newest, Oldest, Name A-Z)
- ✅ Real-time task counter

### User Interface
- 📱 Fully responsive design (mobile, tablet, desktop)
- 🎨 Modern gradient UI with smooth animations
- 🔄 Loading states and spinners
- 💬 Success/Error message notifications
- 🎭 Modal dialogs for editing
- 📊 Priority badges (High, Medium, Low)
- ✨ Empty state illustrations

## File Structure

```
frontend/
├── tasks.html          # Main task tracker application page
├── task-app.js         # Complete JavaScript logic with Cognito & API integration
├── task-styles.css     # Comprehensive styling for the entire app
├── index.html          # Simple Cognito login demo page
├── next.html           # Sample next page after login
├── app.js              # Original app JavaScript (legacy)
├── styles.css          # Original styles (legacy)
└── FRONTEND-README.md  # This file
```

## Setup Instructions

### 1. AWS Cognito Configuration

The app is pre-configured with your Cognito settings:

```javascript
const AWS_CONFIG = {
    region: 'us-east-1',
    userPoolId: 'us-east-1_sKHiELm7h',
    clientId: '52di8mn56ifnrt3htpd7ep66m',
    apiEndpoint: 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod'
};
```

**Update Required:** Change the `apiEndpoint` in `task-app.js` to your actual API Gateway endpoint once you've deployed your Lambda functions.

### 2. S3 Deployment

Upload all frontend files to your S3 bucket:

```bash
aws s3 sync . s3://my-task-tracker-frontend --exclude "*.md" --exclude ".git/*"
```

Or use the AWS Console:
1. Go to S3 → `my-task-tracker-frontend`
2. Upload all files from the frontend directory
3. Make sure static website hosting is enabled
4. Set permissions for public read access

### 3. Update Cognito Callback URLs

In AWS Cognito Console:
1. Go to your User Pool → App Integration → App client settings
2. Add callback URL: `http://my-task-tracker-frontend.s3-website-us-east-1.amazonaws.com/`
3. Add sign-out URL: `http://my-task-tracker-frontend.s3-website-us-east-1.amazonaws.com/`

### 4. API Integration

Once your API Gateway and Lambda functions are deployed:

1. Open `task-app.js`
2. Update the `apiEndpoint` in AWS_CONFIG
3. Uncomment the actual API calls in the API Functions section
4. Comment out or remove the mock localStorage implementations

#### Example API Integration:

```javascript
async function getTasks() {
    const response = await fetch(`${AWS_CONFIG.apiEndpoint}/tasks`, {
        headers: {
            'Authorization': idToken,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) {
        throw new Error('Failed to fetch tasks');
    }
    
    return await response.json();
}
```

## Usage

### For Users

1. **Access the app:** Navigate to your S3 static website URL
2. **Sign up:** Create a new account with email and password
3. **Verify email:** Enter the verification code sent to your email
4. **Log in:** Sign in with your credentials
5. **Manage tasks:**
   - Add new tasks with the form
   - Filter by status (All/Pending/Completed)
   - Sort by date or name
   - Edit, complete, or delete tasks
6. **Log out:** Click the logout button in the header

### For Developers

#### Adding New Features

The app is structured for easy extension:

**Add new task fields:**
1. Update the form in `tasks.html`
2. Add field to task object in `task-app.js`
3. Update `createTaskCard()` to display the new field
4. Update Lambda functions to handle new field

**Change styling:**
- All styles are in `task-styles.css`
- CSS variables at the top for easy color customization
- Responsive breakpoints at the bottom

**Add new API endpoints:**
- Create new async functions in the API Functions section
- Follow the existing pattern with Authorization headers
- Handle errors appropriately

## Current Implementation

### Data Storage
Currently uses **localStorage** for demo purposes. Tasks are stored client-side per user.

**Production Ready:** The code includes commented API integration examples. Simply:
1. Deploy your Lambda functions
2. Create API Gateway endpoints
3. Update the API endpoint in config
4. Uncomment real API calls
5. Remove localStorage mock implementations

### Authentication
Fully integrated with **AWS Cognito**:
- Real user registration and verification
- Secure JWT token-based authentication
- Session management
- User attributes stored in Cognito

## Browser Compatibility

- ✅ Chrome (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Edge (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Lightweight: ~50KB total (HTML + CSS + JS)
- Fast load times
- Smooth animations (60fps)
- Minimal external dependencies (only Cognito SDK)

## Security

- ✅ JWT token authentication
- ✅ HTTPS recommended for production
- ✅ Input sanitization (XSS protection)
- ✅ Cognito password policies enforced
- ✅ Secure session management

## Troubleshooting

### "User Pool not found"
- Verify your `userPoolId` and `clientId` in `task-app.js`
- Check AWS region matches your User Pool

### "Callback URL mismatch"
- Ensure your S3 URL is added to Cognito callback URLs
- URLs must match exactly (including trailing slash)

### Tasks not persisting
- This is expected with localStorage mock
- Deploy Lambda functions and API Gateway
- Update API endpoint and uncomment real API calls

### CORS errors
- Configure CORS in API Gateway
- Add your S3 URL to allowed origins
- Enable required HTTP methods (GET, POST, PUT, DELETE)

## Next Steps

1. ✅ Frontend complete and functional
2. ⏳ Deploy Lambda functions (see `/lambda` directory)
3. ⏳ Create DynamoDB table (see docs)
4. ⏳ Set up API Gateway (see docs)
5. ⏳ Update frontend API endpoint
6. ⏳ Test end-to-end integration

## Additional Resources

- [AWS Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review AWS service logs (CloudWatch)
3. Verify all configuration settings match your AWS resources

---

**Built with ❤️ using AWS Serverless Services**
