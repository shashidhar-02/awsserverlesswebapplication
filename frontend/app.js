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
let currentFilter = 'all';
let currentSort = 'newest';
let allTasks = [];

// ========================================
// DOM Elements
// ========================================
const authSection = document.getElementById('auth-section');
const tasksSection = document.getElementById('tasks-section');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const verifyForm = document.getElementById('verify-form');
const loadingOverlay = document.getElementById('loading-overlay');

// ========================================
// Utility Functions
// ========================================

// Show/hide loading overlay
function showLoading(message = 'Loading...') {
    if (loadingOverlay) {
        loadingOverlay.querySelector('p').textContent = message;
        loadingOverlay.style.display = 'flex';
    }
}

function hideLoading() {
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// Show/hide button loader
function setButtonLoading(button, loading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoader = button.querySelector('.btn-loader');
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline-block';
        button.disabled = true;
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        button.disabled = false;
    }
}

// Show message
function showMessage(elementId, message, type = 'success') {
    const messageEl = document.getElementById(elementId);
    messageEl.textContent = message;
    messageEl.className = `message ${type}`;
    messageEl.style.display = 'block';
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        messageEl.style.display = 'none';
    }, 5000);
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// ========================================
// Authentication Functions
// ========================================

// Switch between login and signup forms
document.getElementById('show-signup')?.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.classList.remove('active');
    signupForm.classList.add('active');
});

document.getElementById('show-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.classList.remove('active');
    verifyForm.classList.remove('active');
    loginForm.classList.add('active');
});

// Sign Up
document.getElementById('signup').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const button = e.target.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    
    // Basic validation
    if (!name || !email || !password) {
        showMessage('auth-message', 'Please fill in all fields', 'error');
        setButtonLoading(button, false);
        return;
    }
    
    if (password.length < 8) {
        showMessage('auth-message', 'Password must be at least 8 characters', 'error');
        setButtonLoading(button, false);
        return;
    }
    
    const attributeList = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email }),
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'name', Value: name })
    ];
    
    userPool.signUp(email, password, attributeList, null, (err, result) => {
        setButtonLoading(button, false);
        
        if (err) {
            console.error('Signup error:', err);
            showMessage('auth-message', err.message || 'Sign up failed', 'error');
            return;
        }
        
        showMessage('auth-message', 'Sign up successful! Please check your email for verification code.', 'success');
        signupForm.classList.remove('active');
        verifyForm.classList.add('active');
        currentUser = result.user;
        
        // Clear form
        e.target.reset();
    });
});

// Verify Email
document.getElementById('verify').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const button = e.target.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    
    const code = document.getElementById('verify-code').value.trim();
    
    if (!currentUser) {
        showMessage('auth-message', 'Please sign up first', 'error');
        setButtonLoading(button, false);
        return;
    }
    
    if (!code || code.length !== 6) {
        showMessage('auth-message', 'Please enter a valid 6-digit code', 'error');
        setButtonLoading(button, false);
        return;
    }
    
    currentUser.confirmRegistration(code, true, (err, result) => {
        setButtonLoading(button, false);
        
        if (err) {
            console.error('Verification error:', err);
            showMessage('auth-message', err.message || 'Verification failed', 'error');
            return;
        }
        
        showMessage('auth-message', 'Email verified! You can now login.', 'success');
        verifyForm.classList.remove('active');
        loginForm.classList.add('active');
        
        // Clear form
        e.target.reset();
    });
});

// Resend verification code
document.getElementById('resend-code')?.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (!currentUser) {
        showMessage('auth-message', 'Please sign up first', 'error');
        return;
    }
    
    currentUser.resendConfirmationCode((err, result) => {
        if (err) {
            showMessage('auth-message', err.message || 'Failed to resend code', 'error');
            return;
        }
        showMessage('auth-message', 'Verification code resent! Check your email.', 'success');
    });
});

// Login
document.getElementById('login').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const button = e.target.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    
    if (!email || !password) {
        showMessage('auth-message', 'Please enter email and password', 'error');
        setButtonLoading(button, false);
        return;
    }
    
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
            
            // Get user attributes
            cognitoUser.getUserAttributes((err, attributes) => {
                setButtonLoading(button, false);
                
                const name = attributes?.find(attr => attr.Name === 'name')?.Value || 'User';
                
                // Show tasks section
                authSection.style.display = 'none';
                tasksSection.style.display = 'block';
                document.getElementById('user-name').textContent = name;
                document.getElementById('user-email').textContent = email;
                
                // Clear login form
                e.target.reset();
                
                // Load tasks
                loadTasks();
            });
        },
        onFailure: (err) => {
            setButtonLoading(button, false);
            console.error('Login error:', err);
            showMessage('auth-message', err.message || 'Login failed', 'error');
        }
    });
});

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        if (currentUser) {
            currentUser.signOut();
        }
        idToken = null;
        currentUser = null;
        allTasks = [];
        
        tasksSection.style.display = 'none';
        authSection.style.display = 'block';
        document.getElementById('tasks-list').innerHTML = '';
        
        showMessage('auth-message', 'Logged out successfully', 'success');
    }
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
        
        // Handle non-JSON responses
        const contentType = response.headers.get('content-type');
        let data;
        
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = { message: text };
        }
        
        if (!response.ok) {
            throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        return data;
    } catch (error) {
        console.error('API Error:', error);
        throw error;
    }
}

// Load Tasks
async function loadTasks() {
    const tasksLoading = document.getElementById('tasks-loading');
    tasksLoading.style.display = 'block';
    
    try {
        const data = await apiCall('/tasks');
        allTasks = data.tasks || [];
        updateTaskCount();
        displayTasks();
    } catch (error) {
        console.error('Load tasks error:', error);
        showMessage('task-message', 'Failed to load tasks: ' + error.message, 'error');
        allTasks = [];
        displayTasks();
    } finally {
        tasksLoading.style.display = 'none';
    }
}

// Update task count
function updateTaskCount() {
    const taskCount = document.querySelector('.task-count');
    const total = allTasks.length;
    const pending = allTasks.filter(t => t.status === 'Pending').length;
    const completed = allTasks.filter(t => t.status === 'Completed').length;
    
    taskCount.textContent = `${total} total • ${pending} pending • ${completed} completed`;
}

// Filter and sort tasks
function filterAndSortTasks() {
    let filtered = [...allTasks];
    
    // Apply filter
    if (currentFilter === 'pending') {
        filtered = filtered.filter(t => t.status === 'Pending');
    } else if (currentFilter === 'completed') {
        filtered = filtered.filter(t => t.status === 'Completed');
    }
    
    // Apply sort
    if (currentSort === 'newest') {
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    } else if (currentSort === 'oldest') {
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else if (currentSort === 'name') {
        filtered.sort((a, b) => a.task_name.localeCompare(b.task_name));
    }
    
    return filtered;
}

// Display Tasks
function displayTasks() {
    const tasksList = document.getElementById('tasks-list');
    const noTasks = document.getElementById('no-tasks');
    
    const filteredTasks = filterAndSortTasks();
    
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = '';
        noTasks.style.display = 'block';
        return;
    }
    
    noTasks.style.display = 'none';
    
    tasksList.innerHTML = filteredTasks.map(task => `
        <div class="task-item ${task.status === 'Completed' ? 'completed' : ''}" data-task-id="${task.task_id}">
            <div class="task-header">
                <div class="task-name">${escapeHtml(task.task_name)}</div>
                <div class="task-status ${task.status.toLowerCase()}">${task.status}</div>
            </div>
            ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
            <div class="task-meta">
                <span>📅 Created ${formatDate(task.created_at)}</span>
            </div>
            <div class="task-actions">
                ${task.status === 'Pending' ? 
                    `<button class="btn-complete" onclick="completeTask('${task.task_id}')">✓ Mark Complete</button>` : 
                    ''}
                <button class="btn-delete" onclick="deleteTask('${task.task_id}')">🗑️ Delete</button>
            </div>
        </div>
    `).join('');
}

// Add Task
document.getElementById('add-task-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const button = e.target.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    
    const taskName = document.getElementById('task-name').value.trim();
    const taskDescription = document.getElementById('task-description').value.trim();
    
    if (!taskName) {
        showMessage('task-message', 'Please enter a task name', 'error');
        setButtonLoading(button, false);
        return;
    }
    
    try {
        await apiCall('/tasks', 'POST', {
            task_name: taskName,
            description: taskDescription
        });
        
        showMessage('task-message', '✅ Task created successfully!', 'success');
        e.target.reset();
        document.getElementById('desc-char-count').textContent = '0';
        await loadTasks();
    } catch (error) {
        console.error('Create task error:', error);
        showMessage('task-message', 'Failed to create task: ' + error.message, 'error');
    } finally {
        setButtonLoading(button, false);
    }
});

// Character count for description
document.getElementById('task-description')?.addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('desc-char-count').textContent = count;
});

// Complete Task
async function completeTask(taskId) {
    try {
        await apiCall(`/tasks/${taskId}`, 'PUT', { status: 'Completed' });
        showMessage('task-message', '✅ Task marked as completed!', 'success');
        await loadTasks();
    } catch (error) {
        console.error('Complete task error:', error);
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
        showMessage('task-message', '✅ Task deleted successfully!', 'success');
        await loadTasks();
    } catch (error) {
        console.error('Delete task error:', error);
        showMessage('task-message', 'Failed to delete task: ' + error.message, 'error');
    }
}

// Helper function to escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Refresh tasks button
document.getElementById('refresh-tasks')?.addEventListener('click', async () => {
    const icon = document.querySelector('.refresh-icon');
    icon.style.transform = 'rotate(360deg)';
    icon.style.transition = 'transform 0.5s ease';
    
    await loadTasks();
    
    setTimeout(() => {
        icon.style.transform = 'rotate(0deg)';
    }, 500);
});

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        displayTasks();
    });
});

// Sort select
document.getElementById('sort-select')?.addEventListener('change', (e) => {
    currentSort = e.target.value;
    displayTasks();
});

// ========================================
// Check if user is already logged in
// ========================================
window.addEventListener('load', () => {
    const cognitoUser = userPool.getCurrentUser();
    
    if (cognitoUser != null) {
        cognitoUser.getSession((err, session) => {
            if (err) {
                console.log('Session error:', err);
                return;
            }
            
            if (session.isValid()) {
                showLoading('Restoring session...');
                
                idToken = session.getIdToken().getJwtToken();
                currentUser = cognitoUser;
                
                cognitoUser.getUserAttributes((err, attributes) => {
                    if (err) {
                        console.log('User attributes error:', err);
                        hideLoading();
                        return;
                    }
                    
                    const email = attributes.find(attr => attr.Name === 'email')?.Value || 'User';
                    const name = attributes.find(attr => attr.Name === 'name')?.Value || email;
                    
                    authSection.style.display = 'none';
                    tasksSection.style.display = 'block';
                    document.getElementById('user-name').textContent = name;
                    document.getElementById('user-email').textContent = email;
                    
                    loadTasks().finally(() => hideLoading());
                });
            }
        });
    }
});

// ========================================
// Service Worker Registration (Optional)
// ========================================
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Uncomment to enable service worker for offline support
        // navigator.serviceWorker.register('/sw.js')
        //     .then(reg => console.log('Service Worker registered'))
        //     .catch(err => console.log('Service Worker registration failed'));
    });
}

console.log('Task Tracker App initialized successfully! 🚀');
