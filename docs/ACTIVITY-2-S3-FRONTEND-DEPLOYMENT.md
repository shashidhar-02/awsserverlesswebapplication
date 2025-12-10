# Activity 2: Frontend + S3 Deployment - Complete Manual Setup Guide

## 📋 Activity Overview

**Objective**: Deploy a Task Tracker web application to Amazon S3 with Cognito authentication

**What You'll Build**:
- ✅ Simple HTML/CSS/JavaScript frontend
- ✅ S3 bucket configured for static website hosting
- ✅ Cognito Hosted UI for user authentication
- ✅ Fully functional login system

**Time Required**: 1-2 hours

---

## 🎯 Learning Objectives

By completing this activity, you will learn:

1. **Amazon S3 Static Website Hosting**
   - How to create and configure an S3 bucket
   - Understanding bucket policies for public access
   - Enabling static website hosting features

2. **AWS Cognito Hosted UI**
   - Setting up Cognito Hosted UI
   - Configuring OAuth 2.0 flows
   - Redirect-based authentication

3. **Frontend Development**
   - Creating responsive web interfaces
   - Handling authentication tokens
   - Making secure API calls

---

## 📚 Prerequisites

Before starting, ensure you have:

- ✅ **Completed Activity 1** (DynamoDB + Cognito setup)
- ✅ **AWS Account** with console access
- ✅ **Cognito User Pool** created (from Step 2)
- ✅ **Text editor** (VS Code, Notepad++, or any code editor)
- ✅ **Web browser** (Chrome, Firefox, or Edge)

### Information You'll Need

From your previous setup, have these ready:

```
User Pool ID: us-east-1_XXXXXXXXX
App Client ID: YOUR_CLIENT_ID
AWS Region: us-east-1 (or your region)
```

---

## 📝 Part 1: Update Cognito for Hosted UI

### Why This Step?

Cognito Hosted UI provides a pre-built, secure login interface that handles user authentication without you writing authentication code from scratch.

### Step 1.1: Enable Hosted UI in Cognito

1. **Navigate to Cognito**
   - Open AWS Console
   - Search for **Cognito**
   - Click on your **TaskTrackerUserPool**

2. **Configure App Client Settings**
   - Click on **App integration** tab
   - Scroll to **App clients and analytics**
   - Click on your **TaskTrackerAppClient**

3. **Edit Hosted UI Settings**
   - Click **Edit** button (top right)
   - Scroll to **Hosted UI settings**

4. **Configure Allowed Callback URLs**
   
   Add these URLs (we'll update with real S3 URL later):
   ```
   http://localhost:8000/callback.html
   https://YOUR-BUCKET-NAME.s3.amazonaws.com/callback.html
   ```
   
   > **Note**: We'll replace `YOUR-BUCKET-NAME` with actual bucket name later

5. **Configure Allowed Sign-out URLs**
   
   Add:
   ```
   http://localhost:8000/index.html
   https://YOUR-BUCKET-NAME.s3.amazonaws.com/index.html
   ```

6. **Identity Providers**
   
   - ✅ Check **Cognito user pool**

7. **OAuth 2.0 Grant Types**
   
   - ✅ Check **Authorization code grant**
   - ✅ Check **Implicit grant**

8. **OpenID Connect Scopes**
   
   - ✅ Check **openid**
   - ✅ Check **email**
   - ✅ Check **profile**

9. **Save Changes**
   - Click **Save changes** at the bottom

### Step 1.2: Get Your Hosted UI Domain

1. **Create Cognito Domain** (if not already created)
   - In **App integration** tab
   - Scroll to **Domain** section
   - Click **Actions** → **Create Cognito domain**

2. **Enter Domain Prefix**
   ```
   Domain prefix: tasktracker-yourname-12345
   ```
   > Use lowercase letters, numbers, and hyphens only
   > Must be unique across all AWS

3. **Check Availability** → **Create**

4. **Note Your Hosted UI URL**
   ```
   Format: https://YOUR-DOMAIN-PREFIX.auth.REGION.amazoncognito.com
   
   Example: https://tasktracker-john-12345.auth.us-east-1.amazoncognito.com
   ```

### Step 1.3: Test Hosted UI

1. **Get Login URL**
   ```
   https://YOUR-DOMAIN.auth.REGION.amazoncognito.com/login?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=http://localhost:8000/callback.html
   ```

2. **Replace placeholders**:
   - `YOUR-DOMAIN`: Your domain prefix
   - `REGION`: Your AWS region (e.g., us-east-1)
   - `YOUR_CLIENT_ID`: Your App Client ID

3. **Open in browser** - you should see Cognito login page

> ✅ **Checkpoint**: If you see the Cognito login page, you're ready to proceed!

---

## 📝 Part 2: Create Frontend Files

### Step 2.1: Update index.html (Login Page)

Create/update `frontend/index.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Tracker - Login</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="login-card">
            <h1>📝 Task Tracker</h1>
            <p class="subtitle">Manage your tasks efficiently</p>
            
            <div class="welcome-message">
                <h2>Welcome!</h2>
                <p>Sign in to manage your tasks</p>
            </div>

            <button id="loginBtn" class="login-btn">
                Sign In with Cognito
            </button>

            <div class="info-box">
                <h3>Test Credentials</h3>
                <p><strong>Email:</strong> testuser@example.com</p>
                <p><strong>Password:</strong> TestPass123!</p>
            </div>

            <div class="features">
                <div class="feature">
                    <span class="icon">✅</span>
                    <span>Create Tasks</span>
                </div>
                <div class="feature">
                    <span class="icon">📋</span>
                    <span>Track Progress</span>
                </div>
                <div class="feature">
                    <span class="icon">🔒</span>
                    <span>Secure Login</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        // Configuration - UPDATE THESE VALUES
        const config = {
            cognitoDomain: 'https://YOUR-DOMAIN.auth.REGION.amazoncognito.com',
            clientId: 'YOUR_CLIENT_ID',
            redirectUri: window.location.origin + '/callback.html',
            responseType: 'code'
        };

        // Login button handler
        document.getElementById('loginBtn').addEventListener('click', () => {
            const loginUrl = `${config.cognitoDomain}/login?client_id=${config.clientId}&response_type=${config.responseType}&redirect_uri=${encodeURIComponent(config.redirectUri)}`;
            window.location.href = loginUrl;
        });

        // Check if user is already logged in
        window.onload = () => {
            const accessToken = sessionStorage.getItem('accessToken');
            if (accessToken) {
                window.location.href = 'tasks.html';
            }
        };
    </script>
</body>
</html>
```

### Step 2.2: Create callback.html (Authentication Handler)

Create `frontend/callback.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Authenticating...</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <div class="container">
        <div class="login-card">
            <h1>🔄 Authenticating...</h1>
            <p>Please wait while we log you in</p>
            <div class="loader"></div>
        </div>
    </div>

    <script>
        // Configuration - UPDATE THESE VALUES
        const config = {
            cognitoDomain: 'https://YOUR-DOMAIN.auth.REGION.amazoncognito.com',
            clientId: 'YOUR_CLIENT_ID',
            redirectUri: window.location.origin + '/callback.html'
        };

        // Extract authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
            alert('Authentication error: ' + error);
            window.location.href = 'index.html';
        } else if (code) {
            // Exchange code for tokens
            exchangeCodeForTokens(code);
        } else {
            alert('No authorization code found');
            window.location.href = 'index.html';
        }

        async function exchangeCodeForTokens(code) {
            const tokenUrl = `${config.cognitoDomain}/oauth2/token`;
            
            const params = new URLSearchParams({
                grant_type: 'authorization_code',
                client_id: config.clientId,
                code: code,
                redirect_uri: config.redirectUri
            });

            try {
                const response = await fetch(tokenUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                    body: params
                });

                if (response.ok) {
                    const tokens = await response.json();
                    
                    // Store tokens
                    sessionStorage.setItem('idToken', tokens.id_token);
                    sessionStorage.setItem('accessToken', tokens.access_token);
                    sessionStorage.setItem('refreshToken', tokens.refresh_token);
                    
                    // Decode and store user info
                    const userInfo = parseJwt(tokens.id_token);
                    sessionStorage.setItem('userEmail', userInfo.email);
                    
                    // Redirect to tasks page
                    window.location.href = 'tasks.html';
                } else {
                    const errorData = await response.json();
                    console.error('Token exchange failed:', errorData);
                    alert('Login failed. Please try again.');
                    window.location.href = 'index.html';
                }
            } catch (error) {
                console.error('Error exchanging code for tokens:', error);
                alert('Login failed. Please try again.');
                window.location.href = 'index.html';
            }
        }

        // Helper function to parse JWT
        function parseJwt(token) {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return JSON.parse(jsonPayload);
        }
    </script>
</body>
</html>
```

### Step 2.3: Update tasks.html (Main Application)

Update `frontend/tasks.html` with authentication check:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Task Tracker - My Tasks</title>
    <link rel="stylesheet" href="task-styles.css">
</head>
<body>
    <div class="container">
        <header class="app-header">
            <h1>📝 My Tasks</h1>
            <div class="user-info">
                <span id="userEmail">Loading...</span>
                <button id="logoutBtn" class="logout-btn">Logout</button>
            </div>
        </header>

        <div class="task-input-section">
            <input type="text" id="taskInput" placeholder="Enter a new task..." />
            <button id="addTaskBtn">Add Task</button>
        </div>

        <div class="tasks-container">
            <h2>Active Tasks</h2>
            <div id="tasksList"></div>
            <p id="emptyMessage" style="display: none; text-align: center; color: #666;">
                No tasks yet. Add your first task above!
            </p>
        </div>
    </div>

    <script>
        // Configuration - UPDATE THESE VALUES
        const config = {
            cognitoDomain: 'https://YOUR-DOMAIN.auth.REGION.amazoncognito.com',
            apiEndpoint: 'https://YOUR-API-GATEWAY-ID.execute-api.REGION.amazonaws.com/prod'
        };

        // Check authentication
        const idToken = sessionStorage.getItem('idToken');
        const accessToken = sessionStorage.getItem('accessToken');
        const userEmail = sessionStorage.getItem('userEmail');

        if (!idToken || !accessToken) {
            alert('Please login first');
            window.location.href = 'index.html';
        }

        // Display user email
        document.getElementById('userEmail').textContent = userEmail || 'User';

        // Logout handler
        document.getElementById('logoutBtn').addEventListener('click', () => {
            sessionStorage.clear();
            const logoutUrl = `${config.cognitoDomain}/logout?client_id=${config.clientId}&logout_uri=${encodeURIComponent(window.location.origin + '/index.html')}`;
            window.location.href = logoutUrl;
        });

        // Task management (placeholder - will connect to API later)
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            const taskInput = document.getElementById('taskInput');
            const taskText = taskInput.value.trim();
            
            if (taskText) {
                addTaskToUI(taskText);
                taskInput.value = '';
            }
        });

        function addTaskToUI(taskText) {
            const tasksList = document.getElementById('tasksList');
            const emptyMessage = document.getElementById('emptyMessage');
            
            emptyMessage.style.display = 'none';
            
            const taskDiv = document.createElement('div');
            taskDiv.className = 'task-item';
            taskDiv.innerHTML = `
                <span>${taskText}</span>
                <button onclick="this.parentElement.remove()">Delete</button>
            `;
            
            tasksList.appendChild(taskDiv);
        }

        // Load tasks on page load
        window.onload = () => {
            console.log('Tasks page loaded');
            console.log('User authenticated:', !!idToken);
        };
    </script>
</body>
</html>
```

### Step 2.4: Update styles.css

Create/update `frontend/styles.css`:

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
}

.container {
    width: 100%;
    max-width: 500px;
}

.login-card {
    background: white;
    border-radius: 20px;
    padding: 40px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    text-align: center;
}

h1 {
    font-size: 2.5em;
    color: #333;
    margin-bottom: 10px;
}

.subtitle {
    color: #666;
    margin-bottom: 30px;
    font-size: 1.1em;
}

.welcome-message {
    background: #f8f9fa;
    border-radius: 10px;
    padding: 20px;
    margin-bottom: 30px;
}

.welcome-message h2 {
    color: #667eea;
    margin-bottom: 10px;
}

.welcome-message p {
    color: #666;
}

.login-btn {
    width: 100%;
    padding: 15px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 10px;
    font-size: 1.1em;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
}

.login-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
}

.login-btn:active {
    transform: translateY(0);
}

.info-box {
    background: #fff3cd;
    border: 1px solid #ffc107;
    border-radius: 10px;
    padding: 15px;
    margin-top: 20px;
    text-align: left;
}

.info-box h3 {
    color: #856404;
    margin-bottom: 10px;
    font-size: 1em;
}

.info-box p {
    color: #856404;
    margin: 5px 0;
    font-size: 0.9em;
}

.features {
    display: flex;
    justify-content: space-around;
    margin-top: 30px;
    padding-top: 30px;
    border-top: 1px solid #eee;
}

.feature {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
}

.feature .icon {
    font-size: 2em;
}

.feature span:last-child {
    color: #666;
    font-size: 0.9em;
}

.loader {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 1s linear infinite;
    margin: 30px auto;
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Responsive Design */
@media (max-width: 600px) {
    .login-card {
        padding: 30px 20px;
    }
    
    h1 {
        font-size: 2em;
    }
    
    .features {
        flex-direction: column;
        gap: 20px;
    }
}
```

### Step 2.5: Create task-styles.css

Create `frontend/task-styles.css`:

```css
* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    padding: 20px;
}

.container {
    max-width: 800px;
    margin: 0 auto;
}

.app-header {
    background: white;
    border-radius: 15px;
    padding: 20px 30px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.app-header h1 {
    color: #333;
    font-size: 1.8em;
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
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 600;
    transition: background 0.2s;
}

.logout-btn:hover {
    background: #c82333;
}

.task-input-section {
    background: white;
    border-radius: 15px;
    padding: 25px;
    margin-bottom: 20px;
    display: flex;
    gap: 10px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

#taskInput {
    flex: 1;
    padding: 12px 15px;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1em;
    transition: border-color 0.2s;
}

#taskInput:focus {
    outline: none;
    border-color: #667eea;
}

#addTaskBtn {
    padding: 12px 30px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: transform 0.2s;
}

#addTaskBtn:hover {
    transform: translateY(-2px);
}

.tasks-container {
    background: white;
    border-radius: 15px;
    padding: 25px;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.tasks-container h2 {
    color: #333;
    margin-bottom: 20px;
}

.task-item {
    background: #f8f9fa;
    padding: 15px;
    border-radius: 8px;
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    transition: transform 0.2s;
}

.task-item:hover {
    transform: translateX(5px);
}

.task-item span {
    color: #333;
    font-size: 1em;
}

.task-item button {
    padding: 6px 15px;
    background: #dc3545;
    color: white;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 0.9em;
}

.task-item button:hover {
    background: #c82333;
}

@media (max-width: 600px) {
    .app-header {
        flex-direction: column;
        gap: 15px;
        text-align: center;
    }
    
    .task-input-section {
        flex-direction: column;
    }
    
    #addTaskBtn {
        width: 100%;
    }
}
```

---

## 📝 Part 3: Create S3 Bucket for Static Website Hosting

### Step 3.1: Create S3 Bucket

1. **Navigate to S3**
   - Open AWS Console
   - Search for **S3**
   - Click **Create bucket**

2. **Configure Bucket**
   
   **Bucket name**:
   ```
   tasktracker-frontend-yourname-12345
   ```
   > Must be globally unique (across all AWS accounts)
   > Use lowercase letters, numbers, and hyphens only
   > Cannot contain spaces or uppercase letters

   **AWS Region**:
   - Choose same region as your Cognito User Pool (e.g., `us-east-1`)

3. **Object Ownership**
   - Keep **ACLs disabled** (default)

4. **Block Public Access settings**
   
   ⚠️ **IMPORTANT**: Uncheck "Block all public access"
   
   - ☐ **Uncheck** "Block all public access"
   - ✅ Acknowledge the warning
   
   > This allows your website to be publicly accessible

5. **Bucket Versioning**
   - Keep **Disable** (default)

6. **Tags** (Optional)
   - Key: `Project`
   - Value: `TaskTracker`

7. **Default encryption**
   - Keep **Server-side encryption with Amazon S3 managed keys (SSE-S3)** (default)

8. **Click Create bucket**

### Step 3.2: Upload Frontend Files

1. **Open Your Bucket**
   - Click on your newly created bucket name

2. **Upload Files**
   - Click **Upload** button
   - Click **Add files**
   
   **Select these files from your `frontend` folder**:
   - `index.html`
   - `callback.html`
   - `tasks.html`
   - `styles.css`
   - `task-styles.css`

3. **Upload Settings**
   - Keep default settings
   - Click **Upload** at the bottom
   - Wait for "Upload succeeded" message
   - Click **Close**

### Step 3.3: Enable Static Website Hosting

1. **Go to Properties Tab**
   - In your bucket, click **Properties** tab
   - Scroll to the bottom

2. **Static Website Hosting**
   - Click **Edit** in "Static website hosting" section

3. **Configure Hosting**
   
   **Static website hosting**:
   - Select **Enable**

   **Hosting type**:
   - Select **Host a static website**

   **Index document**:
   ```
   index.html
   ```

   **Error document** (optional):
   ```
   index.html
   ```

4. **Save Changes**
   - Click **Save changes**

5. **Note Your Website Endpoint**
   
   After saving, you'll see:
   ```
   Bucket website endpoint:
   http://tasktracker-frontend-yourname-12345.s3-website-us-east-1.amazonaws.com
   ```
   
   **Copy this URL** - this is your S3 website URL!

### Step 3.4: Configure Bucket Policy for Public Access

1. **Go to Permissions Tab**
   - Click **Permissions** tab in your bucket

2. **Edit Bucket Policy**
   - Scroll to **Bucket policy** section
   - Click **Edit**

3. **Add Policy**
   
   Copy and paste this policy (replace `YOUR-BUCKET-NAME`):

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

   **Replace** `YOUR-BUCKET-NAME` with your actual bucket name
   
   Example:
   ```json
   "Resource": "arn:aws:s3:::tasktracker-frontend-john-12345/*"
   ```

4. **Save Changes**
   - Click **Save changes**

---

## 📝 Part 4: Update Configuration with S3 URL

### Step 4.1: Update Cognito Callback URLs

Now that you have your S3 website URL, update Cognito:

1. **Go to Cognito Console**
   - Navigate to your **TaskTrackerUserPool**
   - Click **App integration** tab
   - Click your **TaskTrackerAppClient**

2. **Edit Hosted UI Settings**
   - Click **Edit**
   - Update **Allowed callback URLs**:
   
   ```
   http://YOUR-S3-WEBSITE-URL/callback.html
   ```
   
   Example:
   ```
   http://tasktracker-frontend-john-12345.s3-website-us-east-1.amazonaws.com/callback.html
   ```

3. **Update Sign-out URLs**:
   
   ```
   http://YOUR-S3-WEBSITE-URL/index.html
   ```

4. **Save Changes**

### Step 4.2: Update Frontend Configuration Files

Now update your HTML files with actual values:

1. **Update index.html Configuration**
   
   Open `index.html` and find:
   ```javascript
   const config = {
       cognitoDomain: 'https://YOUR-DOMAIN.auth.REGION.amazoncognito.com',
       clientId: 'YOUR_CLIENT_ID',
       redirectUri: window.location.origin + '/callback.html',
       responseType: 'code'
   };
   ```
   
   Replace with your actual values:
   ```javascript
   const config = {
       cognitoDomain: 'https://tasktracker-john-12345.auth.us-east-1.amazoncognito.com',
       clientId: '5a6b7c8d9e0f1g2h3i4j5k6l7m',
       redirectUri: window.location.origin + '/callback.html',
       responseType: 'code'
   };
   ```

2. **Update callback.html Configuration**
   
   Same changes in `callback.html`

3. **Update tasks.html Configuration**
   
   In `tasks.html`:
   ```javascript
   const config = {
       cognitoDomain: 'https://tasktracker-john-12345.auth.us-east-1.amazoncognito.com',
       clientId: '5a6b7c8d9e0f1g2h3i4j5k6l7m',
       apiEndpoint: 'https://YOUR-API-ID.execute-api.us-east-1.amazonaws.com/prod'
   };
   ```

4. **Re-upload Updated Files**
   - Go back to S3 bucket
   - Select the old files (index.html, callback.html, tasks.html)
   - Click **Delete**
   - Upload the updated files

---

## 📝 Part 5: Test Your Deployment

### Step 5.1: Access Your Website

1. **Open S3 Website URL** in your browser:
   ```
   http://tasktracker-frontend-yourname-12345.s3-website-us-east-1.amazonaws.com
   ```

2. **You should see**:
   - ✅ Beautiful login page
   - ✅ "Sign In with Cognito" button
   - ✅ Test credentials displayed

### Step 5.2: Test Login Flow

1. **Click "Sign In with Cognito"**
   - Should redirect to Cognito Hosted UI
   - URL should show: `https://YOUR-DOMAIN.auth.REGION.amazoncognito.com/login...`

2. **Login with Test User**
   ```
   Email: testuser@example.com
   Password: TestPass123!
   ```

3. **After Login**:
   - Should redirect to `callback.html`
   - Shows "Authenticating..." message
   - Automatically redirects to `tasks.html`

4. **On Tasks Page**:
   - Should see your email displayed
   - Can add and delete tasks (local only for now)
   - Logout button should work

### Step 5.3: Take Screenshots

For your submission, capture:

1. **Screenshot 1**: Login page hosted on S3
   - Show full browser with S3 URL visible

2. **Screenshot 2**: Cognito Hosted UI login page
   - After clicking "Sign In with Cognito"

3. **Screenshot 3**: Tasks page after successful login
   - Showing user email and task interface

---

## 📝 Part 6: Understanding S3 Static Website Hosting

### What is S3 Static Website Hosting?

Amazon S3 (Simple Storage Service) can host static websites directly from a bucket, making it:

- **Cost-effective**: Pay only for storage and bandwidth used
- **Scalable**: Automatically handles traffic spikes
- **Highly available**: 99.99% availability SLA
- **No servers**: No need to manage web servers

### How S3 Hosting Works

```
User Browser Request
        ↓
    S3 Bucket (Website Endpoint)
        ↓
    Returns HTML/CSS/JS Files
        ↓
    Browser Renders Website
        ↓
    JavaScript Runs (Authentication, API Calls)
```

### Key Concepts

**1. Static Website**:
- Contains HTML, CSS, JavaScript files
- No server-side processing in S3
- All logic runs in the browser
- API calls made from browser to backend services

**2. Bucket Policy**:
- JSON document defining access permissions
- `"Principal": "*"` means anyone can access
- `"Action": "s3:GetObject"` allows reading files
- Required for public website access

**3. Website Endpoint**:
- Special URL format for website hosting
- Format: `http://BUCKET-NAME.s3-website-REGION.amazonaws.com`
- Different from standard S3 URL
- Supports index and error documents

**4. Index Document**:
- Default file served when accessing directory
- Typically `index.html`
- Loaded when user visits root URL

### Benefits of S3 Hosting

✅ **No server management**: No EC2 instances to maintain
✅ **Global reach**: Can use CloudFront CDN for worldwide distribution
✅ **Version control**: Enable versioning for file history
✅ **Cost-effective**: Pennies per GB per month
✅ **Secure**: Integrate with CloudFront for HTTPS
✅ **Reliable**: Built on AWS infrastructure

### Limitations

❌ **No server-side processing**: Can't run PHP, Python, etc.
❌ **HTTP only**: Direct S3 hosting doesn't support HTTPS (use CloudFront)
❌ **No dynamic content generation**: Must use APIs for dynamic data
❌ **Limited routing**: No advanced URL rewriting

### Cost Breakdown (Approximate)

For a small application:
- **Storage**: $0.023 per GB/month
- **Data transfer**: $0.09 per GB (first 10 TB)
- **Requests**: $0.005 per 10,000 requests

Example: 100 MB website with 10,000 monthly visitors ≈ $1-2/month

---

## 📋 Submission Checklist

### Required Deliverables

#### 1. S3 Website URL ✅

**Format**:
```
http://tasktracker-frontend-yourname-12345.s3-website-us-east-1.amazonaws.com
```

**Verification**: URL should be publicly accessible and show login page

---

#### 2. Screenshots (3 Required) 📸

**Screenshot 1: Login Page on S3**
- Full browser window
- S3 URL visible in address bar
- Complete login interface visible
- Test credentials box visible

**Screenshot 2: Cognito Hosted UI**
- Shows Cognito authentication page
- URL shows `amazoncognito.com`
- Login form visible

**Screenshot 3: Authenticated Tasks Page**
- Shows tasks interface
- User email visible in header
- S3 URL in address bar
- Shows successful login

---

#### 3. Explanation Note 📝

Write a short explanation (200-300 words) covering:

**a) How S3 Static Website Hosting Works**:
- What S3 is and its purpose
- How static website hosting differs from traditional hosting
- What makes content "static"

**b) Benefits You Observed**:
- Ease of deployment
- No server management needed
- Cost considerations

**c) Authentication Flow**:
- How redirect-based authentication works
- Role of Cognito Hosted UI
- What happens during login

**Example Template**:

```
Amazon S3 Static Website Hosting Explanation

S3 (Simple Storage Service) is AWS's object storage service that can 
also host static websites. In this project, I used S3 to host my Task 
Tracker frontend application.

How It Works:
[Explain the hosting mechanism, bucket policy, and public access]

Authentication Flow:
[Describe the Cognito Hosted UI redirect process]

Benefits:
[List advantages you experienced]

Challenges:
[Mention any difficulties encountered]
```

---

## 🎓 Submission Format

Create a document (Word/PDF) with:

1. **Cover Page**
   - Activity 2: Frontend + S3 Deployment
   - Your name
   - Date
   - Course/Assignment details

2. **S3 Website URL**
   - Clear, copy-pasteable URL
   - Verify it works before submitting

3. **Screenshots Section**
   - Labeled screenshots (Screenshot 1, 2, 3)
   - High resolution, clear text
   - Annotate if helpful

4. **Explanation Section**
   - 200-300 words
   - Covers all required points
   - Shows understanding of concepts

5. **Configuration Details** (Optional but helpful)
   - Bucket name
   - Region used
   - Cognito domain prefix
   - Any customizations made

---

## 🔧 Troubleshooting Guide

### Common Issues and Solutions

#### Issue 1: "403 Forbidden" when accessing S3 URL

**Cause**: Bucket policy not set correctly

**Solution**:
1. Check bucket policy is applied
2. Verify `YOUR-BUCKET-NAME` is correct in policy
3. Ensure "Block all public access" is OFF
4. Re-upload files to ensure they're readable

---

#### Issue 2: Cognito login shows "Invalid redirect_uri"

**Cause**: Callback URL not configured in Cognito

**Solution**:
1. Go to Cognito → App Client → Hosted UI
2. Add exact S3 URL with `/callback.html`
3. Ensure no typos or trailing slashes
4. Save and try again

---

#### Issue 3: After login, blank page or error

**Cause**: JavaScript configuration incorrect

**Solution**:
1. Open browser DevTools (F12) → Console tab
2. Look for errors
3. Verify `cognitoDomain` and `clientId` in HTML files
4. Ensure all three HTML files have correct config
5. Re-upload files to S3

---

#### Issue 4: "Access Denied" when uploading to S3

**Cause**: Insufficient IAM permissions

**Solution**:
1. Check your IAM user has S3 permissions
2. Required permissions: `s3:PutObject`, `s3:PutObjectAcl`
3. Contact AWS admin if in managed account

---

#### Issue 5: CSS not loading, page looks unstyled

**Cause**: CSS files not uploaded or wrong file names

**Solution**:
1. Verify `styles.css` and `task-styles.css` are in bucket
2. Check file names match exactly (case-sensitive)
3. Re-upload CSS files
4. Clear browser cache (Ctrl+Shift+R)

---

#### Issue 6: Can't create bucket - name already exists

**Cause**: Bucket names are globally unique

**Solution**:
1. Choose a different bucket name
2. Add more unique identifiers (date, random numbers)
3. Example: `tasktracker-frontend-john-20231210-7845`

---

## 🚀 Next Steps

After completing Activity 2:

1. **Test thoroughly**: Try different browsers, devices
2. **Share your URL**: Show to friends/classmates
3. **Prepare for Activity 3**: API Gateway integration
4. **Optional enhancements**:
   - Add custom domain (Route 53)
   - Enable HTTPS (CloudFront)
   - Add more styling
   - Implement password reset flow

---

## 📚 Additional Resources

### AWS Documentation
- [S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Cognito Hosted UI](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html)
- [OAuth 2.0 Authorization Code Flow](https://oauth.net/2/grant-types/authorization-code/)

### Video Tutorials
- AWS S3 Static Website Hosting (YouTube)
- Cognito Authentication Flow Explained
- Frontend Development Basics

### Community Resources
- AWS re:Post (Q&A forum)
- Stack Overflow (search: aws-s3, amazon-cognito)
- AWS Discord/Slack communities

---

## ✅ Final Checklist

Before submission, verify:

- ☐ S3 bucket created and configured
- ☐ Static website hosting enabled
- ☐ Bucket policy applied for public access
- ☐ All frontend files uploaded
- ☐ Cognito Hosted UI configured
- ☐ Callback URLs updated with S3 URL
- ☐ Configuration values updated in HTML files
- ☐ Website accessible via S3 URL
- ☐ Login flow tested and working
- ☐ Screenshots captured (3 required)
- ☐ Explanation note written (200-300 words)
- ☐ All deliverables compiled in document

---

## 🎉 Congratulations!

You've successfully:
- ✅ Created a responsive web application
- ✅ Deployed to AWS S3
- ✅ Implemented authentication with Cognito
- ✅ Learned cloud hosting fundamentals

**You're now ready for Activity 3** where you'll connect your frontend to backend APIs!

---

## 📞 Support

If you encounter issues:

1. **Re-read relevant sections** of this guide
2. **Check Troubleshooting** section
3. **Review AWS Console** for error messages
4. **Use browser DevTools** to debug JavaScript
5. **Ask instructor/TA** for help with specific errors

---

**Document Version**: 1.0  
**Last Updated**: December 2025  
**Compatible With**: AWS Free Tier, Cognito User Pools, S3 Static Hosting
