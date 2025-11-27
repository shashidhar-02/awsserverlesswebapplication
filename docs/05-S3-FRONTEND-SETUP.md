# Step 5: Amazon S3 Frontend Setup

## Overview

Amazon S3 (Simple Storage Service) can host static websites (HTML, CSS, JavaScript) and serve them globally with high availability. In this step, you'll create a frontend for your Task Tracker app and host it on S3.

## Learning Objectives

- Create an S3 bucket
- Configure static website hosting
- Upload frontend files
- Configure bucket policies for public access
- Integrate Cognito and API Gateway in frontend code

---

## Architecture

```
User Browser → S3 Static Website → API Gateway → Lambda → DynamoDB
                ↓
             Cognito (for authentication)
```

---

## Part A: Create S3 Bucket

### 1. Navigate to S3

1. In AWS Console, search for **S3**
2. Click **S3** (Scalable Storage in the Cloud)
3. Click **Create bucket**

### 2. Configure Bucket

**General configuration**:

**Bucket name**: Must be globally unique

- Example: `task-tracker-yourname-2024`
- Use lowercase, numbers, and hyphens only
- Cannot contain spaces or uppercase letters

**AWS Region**: Select your region (e.g., `us-east-1`)

**Block Public Access settings for this bucket**:

- ☐ **Uncheck** "Block all public access"
- ⚠️ A warning appears - this is expected for website hosting
- ✅ Check "I acknowledge that the current settings might result in this bucket and the objects within becoming public"

> **Why?** Static websites need public read access for browsers to load the files.

**Bucket Versioning**: Disabled (default) - or enable for version history

**Tags** (Optional):

- Key: `Project`, Value: `TaskTracker`

**Default encryption**: Keep defaults (Server-side encryption with Amazon S3 managed keys)

3. Click **Create bucket**

---

## Part B: Enable Static Website Hosting

### 1. Configure Website Hosting

1. Click on your newly created bucket name
2. Go to the **Properties** tab
3. Scroll down to **Static website hosting**
4. Click **Edit**

**Static website hosting**:

- Select **Enable**

**Hosting type**:

- Select **Host a static website**

**Index document**:

- Enter: `index.html`

**Error document** (optional):

- Enter: `error.html`

5. Click **Save changes**

### 2. Note Website Endpoint

1. Go back to **Properties** tab
2. Scroll to **Static website hosting**
3. Copy the **Bucket website endpoint**

**Example**:

```
http://task-tracker-yourname-2024.s3-website-us-east-1.amazonaws.com
```

**Save this URL** - this is your application's public URL!

---

## Part C: Set Bucket Policy

Make the bucket contents publicly readable:

### 1. Configure Bucket Policy

1. Go to the **Permissions** tab
2. Scroll to **Bucket policy**
3. Click **Edit**

4. Paste the following policy (replace `YOUR-BUCKET-NAME` with your actual bucket name):

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

**Example** (if bucket name is `task-tracker-john-2024`):

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

5. Click **Save changes**

---

## Part D: Create Frontend Files

Now let's create the frontend application files.

### File Structure

```
frontend/
├── index.html
├── styles.css
└── app.js
```

### 1. Create index.html

Create a file named `index.html` with the following content:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Tracker - Serverless App</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <!-- Authentication Section -->
        <div id="auth-section" class="auth-section">
            <h1>🚀 Task Tracker</h1>
            <p class="subtitle">Serverless Task Management with AWS</p>
            
            <div class="auth-forms">
                <!-- Login Form -->
                <div id="login-form" class="form-container active">
                    <h2>Login</h2>
                    <form id="login">
                        <input type="email" id="login-email" placeholder="Email" required>
                        <input type="password" id="login-password" placeholder="Password" required>
                        <button type="submit">Login</button>
                    </form>
                    <p class="form-switch">Don't have an account? <a href="#" id="show-signup">Sign up</a></p>
                </div>
                
                <!-- Signup Form -->
                <div id="signup-form" class="form-container">
                    <h2>Sign Up</h2>
                    <form id="signup">
                        <input type="text" id="signup-name" placeholder="Full Name" required>
                        <input type="email" id="signup-email" placeholder="Email" required>
                        <input type="password" id="signup-password" placeholder="Password (min 8 chars)" required>
                        <button type="submit">Sign Up</button>
                    </form>
                    <p class="form-switch">Already have an account? <a href="#" id="show-login">Login</a></p>
                </div>
                
                <!-- Verification Form -->
                <div id="verify-form" class="form-container">
                    <h2>Verify Email</h2>
                    <p>Please check your email for verification code</p>
                    <form id="verify">
                        <input type="text" id="verify-code" placeholder="Verification Code" required>
                        <button type="submit">Verify</button>
                    </form>
                </div>
            </div>
            
            <div id="auth-message" class="message"></div>
        </div>

        <!-- Tasks Section -->
        <div id="tasks-section" class="tasks-section" style="display: none;">
            <div class="header">
                <h1>📝 My Tasks</h1>
                <div class="user-info">
                    <span id="user-email"></span>
                    <button id="logout-btn" class="logout-btn">Logout</button>
                </div>
            </div>

            <!-- Add Task Form -->
            <div class="add-task-section">
                <h3>Add New Task</h3>
                <form id="add-task-form">
                    <input type="text" id="task-name" placeholder="Task Name" required>
                    <textarea id="task-description" placeholder="Description (optional)" rows="3"></textarea>
                    <button type="submit">Add Task</button>
                </form>
            </div>

            <div id="task-message" class="message"></div>

            <!-- Tasks List -->
            <div class="tasks-container">
                <h3>Your Tasks</h3>
                <div id="tasks-list"></div>
                <div id="no-tasks" class="no-tasks" style="display: none;">
                    <p>No tasks yet. Create your first task above! 🎯</p>
                </div>
            </div>
        </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/amazon-cognito-identity-js@6.3.6/dist/amazon-cognito-identity.min.js"></script>
    <script src="app.js"></script>
</body>
</html>
```

### 2. Create styles.css

Create a file named `styles.css`:

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 900px;
    margin: 0 auto;
}

/* Authentication Section */
.auth-section {
    background: white;
    border-radius: 15px;
    padding: 40px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
    text-align: center;
    max-width: 450px;
    margin: 50px auto;
}

.auth-section h1 {
    color: #667eea;
    font-size: 2.5em;
    margin-bottom: 10px;
}

.subtitle {
    color: #666;
    margin-bottom: 30px;
}

.auth-forms {
    margin: 30px 0;
}

.form-container {
    display: none;
}

.form-container.active {
    display: block;
}

.form-container h2 {
    color: #333;
    margin-bottom: 20px;
}

.form-container input,
.form-container textarea {
    width: 100%;
    padding: 12px;
    margin: 10px 0;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.form-container input:focus,
.form-container textarea:focus {
    outline: none;
    border-color: #667eea;
}

.form-container button {
    width: 100%;
    padding: 12px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 10px;
    transition: transform 0.2s;
}

.form-container button:hover {
    transform: translateY(-2px);
}

.form-switch {
    margin-top: 20px;
    color: #666;
}

.form-switch a {
    color: #667eea;
    text-decoration: none;
    font-weight: 600;
}

/* Tasks Section */
.tasks-section {
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 2px solid #e0e0e0;
}

.header h1 {
    color: #667eea;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 15px;
}

.user-info span {
    color: #666;
    font-weight: 500;
}

.logout-btn {
    padding: 8px 20px;
    background: #f44336;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
}

.logout-btn:hover {
    background: #d32f2f;
}

/* Add Task Section */
.add-task-section {
    background: #f5f5f5;
    padding: 20px;
    border-radius: 10px;
    margin-bottom: 30px;
}

.add-task-section h3 {
    color: #333;
    margin-bottom: 15px;
}

#add-task-form input,
#add-task-form textarea {
    width: 100%;
    padding: 12px;
    margin: 8px 0;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    font-size: 16px;
}

#add-task-form button {
    padding: 12px 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    margin-top: 10px;
}

/* Tasks Container */
.tasks-container h3 {
    color: #333;
    margin-bottom: 20px;
}

.task-item {
    background: white;
    border: 2px solid #e0e0e0;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 15px;
    transition: transform 0.2s, box-shadow 0.2s;
}

.task-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.task-item.completed {
    opacity: 0.7;
    background: #f5f5f5;
}

.task-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
}

.task-name {
    font-size: 18px;
    font-weight: 600;
    color: #333;
}

.task-status {
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
}

.task-status.pending {
    background: #fff3cd;
    color: #856404;
}

.task-status.completed {
    background: #d4edda;
    color: #155724;
}

.task-description {
    color: #666;
    margin-bottom: 15px;
    line-height: 1.6;
}

.task-meta {
    color: #999;
    font-size: 13px;
    margin-bottom: 15px;
}

.task-actions {
    display: flex;
    gap: 10px;
}

.task-actions button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.3s;
}

.btn-complete {
    background: #4caf50;
    color: white;
}

.btn-complete:hover {
    background: #45a049;
}

.btn-delete {
    background: #f44336;
    color: white;
}

.btn-delete:hover {
    background: #d32f2f;
}

.no-tasks {
    text-align: center;
    color: #999;
    padding: 40px;
    font-size: 18px;
}

/* Messages */
.message {
    margin-top: 20px;
    padding: 12px;
    border-radius: 8px;
    display: none;
}

.message.success {
    background: #d4edda;
    color: #155724;
    border: 1px solid #c3e6cb;
    display: block;
}

.message.error {
    background: #f8d7da;
    color: #721c24;
    border: 1px solid #f5c6cb;
    display: block;
}

/* Responsive Design */
@media (max-width: 768px) {
    .container {
        padding: 10px;
    }
    
    .auth-section,
    .tasks-section {
        padding: 20px;
    }
    
    .header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }
    
    .task-actions {
        flex-direction: column;
    }
}
```

### 3. Create app.js

Create a file named `app.js` and **replace the configuration values** with your actual AWS values:

```javascript
// ========================================
// AWS Configuration
// ========================================
// TODO: Replace these values with your actual AWS configuration
const CONFIG = {
    cognito: {
        userPoolId: 'us-east-1_XXXXXXXXX',      // Your Cognito User Pool ID
        clientId: 'your-app-client-id',          // Your Cognito App Client ID
        region: 'us-east-1'                      // Your AWS Region
    },
    api: {
        invokeUrl: 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod'  // Your API Gateway URL
    }
};

// ========================================
// Cognito Setup
// ========================================
const poolData = {
    UserPoolId: CONFIG.cognito.userPoolId,
    ClientId: CONFIG.cognito.clientId
};

const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
let currentUser = null;
let idToken = null;

// ========================================
// DOM Elements
// ========================================
const authSection = document.getElementById('auth-section');
const tasksSection = document.getElementById('tasks-section');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const verifyForm = document.getElementById('verify-form');

// ========================================
// Authentication Functions
// ========================================

// Show message
function showMessage(elementId, message, type = 'success') {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

// Switch between login and signup forms
document.getElementById('show-signup').addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
});

document.getElementById('show-login').addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.remove('active');
    loginForm.classList.add('active');
});

// Sign Up
document.getElementById('signup').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    const attributeList = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email }),
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'name', Value: name })
    ];
    
    userPool.signUp(email, password, attributeList, null, (err, result) => {
        if (err) {
            showMessage('auth-message', err.message || JSON.stringify(err), 'error');
            return;
        }
        showMessage('auth-message', 'Sign up successful! Please check your email for verification code.', 'success');
        signupForm.classList.remove('active');
        verifyForm.classList.add('active');
        currentUser = result.user;
    });
});

// Verify Email
document.getElementById('verify').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const code = document.getElementById('verify-code').value;
    
    if (!currentUser) {
        showMessage('auth-message', 'Please sign up first', 'error');
        return;
    }
    
    currentUser.confirmRegistration(code, true, (err, result) => {
        if (err) {
            showMessage('auth-message', err.message || JSON.stringify(err), 'error');
            return;
        }
        showMessage('auth-message', 'Email verified! You can now login.', 'success');
        verifyForm.classList.remove('active');
        loginForm.classList.add('active');
    });
});

// Login
document.getElementById('login').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
        Username: email,
        Password: password
    });
    
    const userData = {
        Username: email,
        Pool: userPool
    };
    
    const cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            idToken = result.getIdToken().getJwtToken();
            currentUser = cognitoUser;
            
            // Show tasks section
            authSection.style.display = 'none';
            tasksSection.style.display = 'block';
            document.getElementById('user-email').textContent = email;
            
            // Load tasks
            loadTasks();
        },
        onFailure: (err) => {
            showMessage('auth-message', err.message || JSON.stringify(err), 'error');
        }
    });
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    if (currentUser) {
        currentUser.signOut();
    }
    idToken = null;
    currentUser = null;
    tasksSection.style.display = 'none';
    authSection.style.display = 'block';
    document.getElementById('tasks-list').innerHTML = '';
});

// ========================================
// Task Management Functions
// ========================================

// API Call Helper
async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': idToken
        }
    };
    
    if (body) {
        options.body = JSON.stringify(body);
    }
    
    try {
        const response = await fetch(`${CONFIG.api.invokeUrl}${endpoint}`, options);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'API request failed');
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load Tasks
async function loadTasks() {
    try {
        const data = await apiCall('/tasks');
        displayTasks(data.tasks || []);
    } catch (error) {
        showMessage('task-message', 'Failed to load tasks: ' + error.message, 'error');
    }
}

// Display Tasks
function displayTasks(tasks) {
    const tasksList = document.getElementById('tasks-list');
    const noTasks = document.getElementById('no-tasks');
    
    if (tasks.length === 0) {
        tasksList.innerHTML = '';
        noTasks.style.display = 'block';
        return;
    }
    
    noTasks.style.display = 'none';
    
    tasksList.innerHTML = tasks.map(task => `
        <div class="task-item ${task.status === 'Completed' ? 'completed' : ''}">
            <div class="task-header">
                <div class="task-name">${escapeHtml(task.task_name)}</div>
                <div class="task-status ${task.status.toLowerCase()}">${task.status}</div>
            </div>
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">Created: ${new Date(task.created_at).toLocaleString()}</div>
            <div class="task-actions">
                ${task.status === 'Pending' ? 
                    `<button class="btn-complete" onclick="completeTask('${task.task_id}')">Mark Complete</button>` : 
                    ''}
                <button class="btn-delete" onclick="deleteTask('${task.task_id}')">Delete</button>
            </div>
        </div>
    `).join('');
}

// Add Task
document.getElementById('add-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const taskName = document.getElementById('task-name').value;
    const taskDescription = document.getElementById('task-description').value;
    
    try {
        await apiCall('/tasks', 'POST', {
            task_name: taskName,
            description: taskDescription
        });
        
        showMessage('task-message', 'Task created successfully!', 'success');
        document.getElementById('add-task-form').reset();
        loadTasks();
    } catch (error) {
        showMessage('task-message', 'Failed to create task: ' + error.message, 'error');
    }
});

// Complete Task
async function completeTask(taskId) {
    try {
        await apiCall(`/tasks/${taskId}`, 'PUT', { status: 'Completed' });
        showMessage('task-message', 'Task marked as completed!', 'success');
        loadTasks();
    } catch (error) {
        showMessage('task-message', 'Failed to update task: ' + error.message, 'error');
    }
}

// Delete Task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    try {
        await apiCall(`/tasks/${taskId}`, 'DELETE');
        showMessage('task-message', 'Task deleted successfully!', 'success');
        loadTasks();
    } catch (error) {
        showMessage('task-message', 'Failed to delete task: ' + error.message, 'error');
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ========================================
// Check if user is already logged in
// ========================================
window.addEventListener('load', () => {
    const cognitoUser = userPool.getCurrentUser();
    
    if (cognitoUser != null) {
        cognitoUser.getSession((err, session) => {
            if (err) {
                console.log(err);
                return;
            }
            
            if (session.isValid()) {
                idToken = session.getIdToken().getJwtToken();
                currentUser = cognitoUser;
                
                cognitoUser.getUserAttributes((err, attributes) => {
                    if (err) {
                        console.log(err);
                        return;
                    }
                    
                    const email = attributes.find(attr => attr.Name === 'email')?.Value || 'User';
                    
                    authSection.style.display = 'none';
                    tasksSection.style.display = 'block';
                    document.getElementById('user-email').textContent = email;
                    loadTasks();
                });
            }
        });
    }
});
```

**⚠️ IMPORTANT**: In `app.js`, replace these placeholder values with your actual AWS values:

```javascript
const CONFIG = {
    cognito: {
        userPoolId: 'YOUR_USER_POOL_ID',     // From Step 2 (Cognito)
        clientId: 'YOUR_APP_CLIENT_ID',       // From Step 2 (Cognito)
        region: 'YOUR_REGION'                 // e.g., 'us-east-1'
    },
    api: {
        invokeUrl: 'YOUR_API_GATEWAY_URL'     // From Step 4 (API Gateway)
    }
};
```

---

## Part E: Upload Files to S3

### Method 1: Using AWS Console (Recommended for beginners)

1. Go to S3 console
2. Click on your bucket name
3. Click **Upload** button
4. Click **Add files**
5. Select all three files: `index.html`, `styles.css`, `app.js`
6. Click **Upload**
7. Wait for upload to complete
8. Click **Close**

### Method 2: Using AWS CLI

If you have AWS CLI installed:

```bash
# Navigate to your frontend folder
cd path/to/frontend

# Upload files
aws s3 cp index.html s3://YOUR-BUCKET-NAME/
aws s3 cp styles.css s3://YOUR-BUCKET-NAME/
aws s3 cp app.js s3://YOUR-BUCKET-NAME/
```

---

## Part F: Test Your Application

### 1. Access Your Website

Open your browser and go to your S3 website endpoint:

```
http://task-tracker-yourname-2024.s3-website-us-east-1.amazonaws.com
```

### 2. Test Sign Up Flow

1. Click "Sign up"
2. Enter your name, email, and password
3. Check your email for verification code
4. Enter the code and verify

### 3. Test Login

1. Login with your verified credentials
2. You should see the tasks dashboard

### 4. Test Task Operations

1. **Create a task**: Fill in task name and description, click "Add Task"
2. **View tasks**: Your tasks should appear in the list
3. **Complete a task**: Click "Mark Complete" button
4. **Delete a task**: Click "Delete" button and confirm

---

## Troubleshooting

### Website not loading

- Check bucket policy is set correctly
- Verify static website hosting is enabled
- Check you're using the correct website endpoint URL

### "Failed to load tasks" error

- Open browser developer console (F12)
- Check for CORS errors
- Verify API Gateway URL in `app.js` is correct
- Ensure you're logged in and have a valid token

### Authentication not working

- Verify Cognito User Pool ID and App Client ID in `app.js`
- Check region is correct
- Ensure Cognito user pool exists

### CORS errors

- Go back to API Gateway
- Ensure CORS is enabled on all resources
- Check Lambda functions return CORS headers
- Redeploy the API

### Console errors

- Open Developer Tools (F12) → Console tab
- Look for specific error messages
- Common issues: typos in configuration, wrong IDs, network errors

---

## Optional Enhancements

### Add CloudFront CDN (Faster loading, HTTPS)

1. Go to CloudFront in AWS Console
2. Create distribution
3. Origin domain: Your S3 bucket
4. Enable "Redirect HTTP to HTTPS"
5. Wait for deployment (~15 minutes)
6. Use CloudFront URL instead of S3 URL

### Custom Domain

1. Register domain in Route 53 or use existing domain
2. Create CloudFront distribution
3. Add alternate domain name (CNAME)
4. Create Route 53 record pointing to CloudFront

### Add Error Page

Create `error.html`:

```html
<!DOCTYPE html>
<html>
<head>
    <title>Error - Task Tracker</title>
</head>
<body>
    <h1>Oops! Something went wrong.</h1>
    <p><a href="/">Go back home</a></p>
</body>
</html>
```

Upload to S3 bucket.

---

## Checkpoint ✅

Before moving to the next step, ensure:

- ✅ S3 bucket created with unique name
- ✅ Static website hosting enabled
- ✅ Bucket policy set for public read access
- ✅ All three files uploaded: `index.html`, `styles.css`, `app.js`
- ✅ Configuration updated in `app.js` with your AWS values:
  - User Pool ID
  - App Client ID
  - API Gateway URL
  - Region
- ✅ Website accessible via S3 endpoint URL
- ✅ (Optional) Tested sign up, login, and task operations

---

## Configuration Summary

Save these values:

```
S3 Bucket Name: task-tracker-yourname-2024
Website Endpoint: http://task-tracker-yourname-2024.s3-website-us-east-1.amazonaws.com
Region: us-east-1
```

---

## Next Step

Continue to **[06-TESTING.md](./06-TESTING.md)** for comprehensive testing procedures and verification.

---

## Additional Resources

- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [S3 Bucket Policies](https://docs.aws.amazon.com/AmazonS3/latest/userguide/bucket-policies.html)
- [Amazon Cognito JavaScript SDK](https://github.com/aws-amplify/amplify-js/tree/main/packages/amazon-cognito-identity-js)
- [CloudFront with S3](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html)
