// ===================================
// Configuration
// ===================================
// TODO: Update these values after completing AWS setup (see COMPLETE-SETUP-MANUAL.md)
const AWS_CONFIG = {
    region: 'us-east-1',
    userPoolId: 'YOUR_USER_POOL_ID',  // Example: us-east-1_XXXXXXXXX
    clientId: 'YOUR_APP_CLIENT_ID',    // Example: 7kg28dfrbs9pjukg7n2n6230vm
    apiEndpoint: 'YOUR_API_GATEWAY_URL' // Example: https://abcd1234.execute-api.us-east-1.amazonaws.com/prod
};

// ===================================
// Global Variables
// ===================================
let cognitoUser = null;
let idToken = null;
let currentFilter = 'all';
let currentSort = 'newest';
let currentEditTaskId = null;
let allTasks = [];

// ===================================
// Cognito Setup
// ===================================
const poolData = {
    UserPoolId: AWS_CONFIG.userPoolId,
    ClientId: AWS_CONFIG.clientId
};
const userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

// ===================================
// DOM Elements
// ===================================
const elements = {
    // Overlays and sections
    loadingOverlay: document.getElementById('loading-overlay'),
    authSection: document.getElementById('auth-section'),
    tasksSection: document.getElementById('tasks-section'),
    
    // Auth forms
    loginForm: document.getElementById('login-form'),
    signupForm: document.getElementById('signup-form'),
    verifyForm: document.getElementById('verify-form'),
    
    // Auth inputs
    loginEmail: document.getElementById('login-email'),
    loginPassword: document.getElementById('login-password'),
    signupName: document.getElementById('signup-name'),
    signupEmail: document.getElementById('signup-email'),
    signupPassword: document.getElementById('signup-password'),
    verifyCode: document.getElementById('verify-code'),
    
    // Messages
    authMessage: document.getElementById('auth-message'),
    taskMessage: document.getElementById('task-message'),
    
    // Task elements
    taskName: document.getElementById('task-name'),
    taskDescription: document.getElementById('task-description'),
    taskDeadline: document.getElementById('task-deadline'),
    taskPriority: document.getElementById('task-priority'),
    tasksList: document.getElementById('tasks-list'),
    taskCount: document.getElementById('task-count'),
    noTasks: document.getElementById('no-tasks'),
    tasksLoading: document.getElementById('tasks-loading'),
    
    // User info
    userInfo: document.getElementById('user-info'),
    
    // Edit modal
    editModal: document.getElementById('edit-modal'),
    editTaskName: document.getElementById('edit-task-name'),
    editTaskDescription: document.getElementById('edit-task-description'),
    editTaskDeadline: document.getElementById('edit-task-deadline'),
    editTaskPriority: document.getElementById('edit-task-priority')
};

// ===================================
// Utility Functions
// ===================================
function showLoading() {
    elements.loadingOverlay.classList.remove('hidden');
}

function hideLoading() {
    elements.loadingOverlay.classList.add('hidden');
}

function showMessage(element, message, type = 'info') {
    element.textContent = message;
    element.className = `message ${type}`;
    element.style.display = 'block';
    setTimeout(() => {
        element.style.display = 'none';
    }, 5000);
}

function setButtonLoading(button, loading) {
    if (loading) {
        button.disabled = true;
        button.querySelector('.btn-text').style.display = 'none';
        button.querySelector('.btn-loader').style.display = 'flex';
    } else {
        button.disabled = false;
        button.querySelector('.btn-text').style.display = 'inline';
        button.querySelector('.btn-loader').style.display = 'none';
    }
}

function generateTaskId() {
    return 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function formatDate(dateString) {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// ===================================
// Authentication Functions
// ===================================

// Switch between forms
document.getElementById('show-signup')?.addEventListener('click', (e) => {
    e.preventDefault();
    elements.loginForm.classList.remove('active');
    elements.signupForm.classList.add('active');
});

document.getElementById('show-login')?.addEventListener('click', (e) => {
    e.preventDefault();
    elements.signupForm.classList.remove('active');
    elements.verifyForm.classList.remove('active');
    elements.loginForm.classList.add('active');
});

// Sign up
document.getElementById('signup')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = e.target.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    
    const name = elements.signupName.value;
    const email = elements.signupEmail.value;
    const password = elements.signupPassword.value;
    
    const attributeList = [
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'email', Value: email }),
        new AmazonCognitoIdentity.CognitoUserAttribute({ Name: 'name', Value: name })
    ];
    
    userPool.signUp(email, password, attributeList, null, (err, result) => {
        setButtonLoading(button, false);
        
        if (err) {
            showMessage(elements.authMessage, err.message || 'Sign up failed', 'error');
            return;
        }
        
        cognitoUser = result.user;
        showMessage(elements.authMessage, 'Sign up successful! Please check your email for verification code.', 'success');
        
        elements.signupForm.classList.remove('active');
        elements.verifyForm.classList.add('active');
    });
});

// Verify email
document.getElementById('verify')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const button = e.target.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    
    const code = elements.verifyCode.value;
    
    if (!cognitoUser) {
        showMessage(elements.authMessage, 'Please sign up first', 'error');
        setButtonLoading(button, false);
        return;
    }
    
    cognitoUser.confirmRegistration(code, true, (err, result) => {
        setButtonLoading(button, false);
        
        if (err) {
            showMessage(elements.authMessage, err.message || 'Verification failed', 'error');
            return;
        }
        
        showMessage(elements.authMessage, 'Email verified! You can now log in.', 'success');
        
        setTimeout(() => {
            elements.verifyForm.classList.remove('active');
            elements.loginForm.classList.add('active');
        }, 2000);
    });
});

// Resend verification code
document.getElementById('resend-code')?.addEventListener('click', (e) => {
    e.preventDefault();
    
    if (!cognitoUser) {
        showMessage(elements.authMessage, 'Please sign up first', 'error');
        return;
    }
    
    cognitoUser.resendConfirmationCode((err, result) => {
        if (err) {
            showMessage(elements.authMessage, err.message || 'Failed to resend code', 'error');
            return;
        }
        showMessage(elements.authMessage, 'Verification code sent!', 'success');
    });
});

// Login
document.getElementById('login')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const button = e.target.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    
    const email = elements.loginEmail.value;
    const password = elements.loginPassword.value;
    
    const authenticationData = {
        Username: email,
        Password: password
    };
    
    const authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
    
    const userData = {
        Username: email,
        Pool: userPool
    };
    
    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    
    cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
            setButtonLoading(button, false);
            idToken = result.getIdToken().getJwtToken();
            
            showMessage(elements.authMessage, 'Login successful!', 'success');
            
            setTimeout(() => {
                showTasksSection();
            }, 1000);
        },
        onFailure: (err) => {
            setButtonLoading(button, false);
            showMessage(elements.authMessage, err.message || 'Login failed', 'error');
        }
    });
});

// Logout
document.getElementById('logout-btn')?.addEventListener('click', () => {
    if (cognitoUser) {
        cognitoUser.signOut();
    }
    
    cognitoUser = null;
    idToken = null;
    allTasks = [];
    
    elements.tasksSection.classList.remove('active');
    elements.tasksSection.style.display = 'none';
    elements.authSection.style.display = 'flex';
    
    // Reset forms
    document.getElementById('login').reset();
    document.getElementById('signup').reset();
});

// ===================================
// Tasks Section Functions
// ===================================
function showTasksSection() {
    elements.authSection.style.display = 'none';
    elements.tasksSection.style.display = 'block';
    elements.tasksSection.classList.add('active');
    
    // Get user info
    cognitoUser.getUserAttributes((err, attributes) => {
        if (!err && attributes) {
            const email = attributes.find(attr => attr.Name === 'email')?.Value;
            const name = attributes.find(attr => attr.Name === 'name')?.Value;
            elements.userInfo.textContent = name || email || 'User';
        }
    });
    
    loadTasks();
}

// ===================================
// Task CRUD Operations
// ===================================

// Add Task
document.getElementById('add-task-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = e.target.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    
    const taskData = {
        task_id: generateTaskId(),
        task_name: elements.taskName.value,
        description: elements.taskDescription.value || '',
        deadline: elements.taskDeadline.value || '',
        priority: elements.taskPriority.value,
        status: 'pending',
        created_at: new Date().toISOString()
    };
    
    try {
        // In a real application, this would call your API Gateway endpoint
        // For now, we'll store tasks locally
        await createTask(taskData);
        
        showMessage(elements.taskMessage, 'Task created successfully!', 'success');
        document.getElementById('add-task-form').reset();
        
        loadTasks();
    } catch (error) {
        showMessage(elements.taskMessage, error.message || 'Failed to create task', 'error');
    } finally {
        setButtonLoading(button, false);
    }
});

// Character counter for description
elements.taskDescription?.addEventListener('input', (e) => {
    const count = e.target.value.length;
    document.getElementById('desc-char-count').textContent = count;
});

// Load Tasks
async function loadTasks() {
    elements.tasksLoading.classList.add('active');
    elements.noTasks.classList.remove('active');
    elements.tasksList.innerHTML = '';
    
    try {
        // In a real application, this would fetch from your API Gateway endpoint
        allTasks = await getTasks();
        
        displayTasks();
    } catch (error) {
        showMessage(elements.taskMessage, 'Failed to load tasks', 'error');
    } finally {
        elements.tasksLoading.classList.remove('active');
    }
}

// Display Tasks
function displayTasks() {
    let filteredTasks = [...allTasks];
    
    // Apply filter
    if (currentFilter !== 'all') {
        filteredTasks = filteredTasks.filter(task => task.status === currentFilter);
    }
    
    // Apply sort
    filteredTasks.sort((a, b) => {
        if (currentSort === 'newest') {
            return new Date(b.created_at) - new Date(a.created_at);
        } else if (currentSort === 'oldest') {
            return new Date(a.created_at) - new Date(b.created_at);
        } else if (currentSort === 'name') {
            return a.task_name.localeCompare(b.task_name);
        }
        return 0;
    });
    
    // Update count
    elements.taskCount.textContent = `${filteredTasks.length} task${filteredTasks.length !== 1 ? 's' : ''}`;
    
    // Display tasks
    if (filteredTasks.length === 0) {
        elements.noTasks.classList.add('active');
        elements.tasksList.innerHTML = '';
    } else {
        elements.noTasks.classList.remove('active');
        elements.tasksList.innerHTML = filteredTasks.map(task => createTaskCard(task)).join('');
    }
}

// Create Task Card HTML
function createTaskCard(task) {
    const isCompleted = task.status === 'completed';
    
    return `
        <div class="task-card ${isCompleted ? 'completed' : ''}" data-task-id="${task.task_id}">
            <div class="task-header">
                <div class="task-left">
                    <div class="task-name">${escapeHtml(task.task_name)}</div>
                    <div class="task-meta">
                        <span class="priority-badge priority-${task.priority}">
                            ${task.priority.toUpperCase()}
                        </span>
                        <span class="status-badge status-${task.status}">
                            ${task.status === 'completed' ? '✓ Completed' : '○ Pending'}
                        </span>
                        <span>📅 ${formatDate(task.deadline)}</span>
                        <span>🕒 ${formatDate(task.created_at)}</span>
                    </div>
                    ${task.description ? `<div class="task-description">${escapeHtml(task.description)}</div>` : ''}
                </div>
                <div class="task-actions">
                    ${!isCompleted ? `<button class="action-btn btn-complete" onclick="completeTask('${task.task_id}')">✓ Complete</button>` : ''}
                    <button class="action-btn btn-edit" onclick="openEditModal('${task.task_id}')">✏️ Edit</button>
                    <button class="action-btn btn-delete" onclick="deleteTask('${task.task_id}')">🗑️ Delete</button>
                </div>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Complete Task
async function completeTask(taskId) {
    try {
        await updateTask(taskId, { status: 'completed' });
        showMessage(elements.taskMessage, 'Task completed!', 'success');
        loadTasks();
    } catch (error) {
        showMessage(elements.taskMessage, 'Failed to complete task', 'error');
    }
}

// Open Edit Modal
function openEditModal(taskId) {
    const task = allTasks.find(t => t.task_id === taskId);
    if (!task) return;
    
    currentEditTaskId = taskId;
    elements.editTaskName.value = task.task_name;
    elements.editTaskDescription.value = task.description || '';
    elements.editTaskDeadline.value = task.deadline || '';
    elements.editTaskPriority.value = task.priority;
    
    elements.editModal.classList.add('active');
}

// Close Edit Modal
document.querySelector('.modal-close')?.addEventListener('click', () => {
    elements.editModal.classList.remove('active');
    currentEditTaskId = null;
});

document.getElementById('cancel-edit')?.addEventListener('click', () => {
    elements.editModal.classList.remove('active');
    currentEditTaskId = null;
});

// Edit Task Submit
document.getElementById('edit-task-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const button = e.target.querySelector('button[type="submit"]');
    setButtonLoading(button, true);
    
    const updates = {
        task_name: elements.editTaskName.value,
        description: elements.editTaskDescription.value,
        deadline: elements.editTaskDeadline.value,
        priority: elements.editTaskPriority.value
    };
    
    try {
        await updateTask(currentEditTaskId, updates);
        showMessage(elements.taskMessage, 'Task updated successfully!', 'success');
        elements.editModal.classList.remove('active');
        currentEditTaskId = null;
        loadTasks();
    } catch (error) {
        showMessage(elements.taskMessage, 'Failed to update task', 'error');
    } finally {
        setButtonLoading(button, false);
    }
});

// Delete Task
async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        await deleteTaskById(taskId);
        showMessage(elements.taskMessage, 'Task deleted successfully!', 'success');
        loadTasks();
    } catch (error) {
        showMessage(elements.taskMessage, 'Failed to delete task', 'error');
    }
}

// ===================================
// Filter and Sort Handlers
// ===================================
document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        displayTasks();
    });
});

document.getElementById('sort-select')?.addEventListener('change', (e) => {
    currentSort = e.target.value;
    displayTasks();
});

document.getElementById('refresh-tasks')?.addEventListener('click', () => {
    loadTasks();
});

// ===================================
// API Functions (Mock Implementation)
// ===================================
// NOTE: Replace these with actual API calls to your Lambda functions via API Gateway

async function getTasks() {
    // Mock implementation - in production, call your API Gateway endpoint
    // Example:
    // const response = await fetch(`${AWS_CONFIG.apiEndpoint}/tasks`, {
    //     headers: { 'Authorization': idToken }
    // });
    // return await response.json();
    
    const tasksJson = localStorage.getItem('tasks_' + cognitoUser.getUsername()) || '[]';
    return JSON.parse(tasksJson);
}

async function createTask(taskData) {
    // Mock implementation - in production, call your API Gateway endpoint
    // Example:
    // const response = await fetch(`${AWS_CONFIG.apiEndpoint}/tasks`, {
    //     method: 'POST',
    //     headers: {
    //         'Authorization': idToken,
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(taskData)
    // });
    // return await response.json();
    
    const tasks = await getTasks();
    tasks.push(taskData);
    localStorage.setItem('tasks_' + cognitoUser.getUsername(), JSON.stringify(tasks));
    return taskData;
}

async function updateTask(taskId, updates) {
    // Mock implementation - in production, call your API Gateway endpoint
    // Example:
    // const response = await fetch(`${AWS_CONFIG.apiEndpoint}/tasks/${taskId}`, {
    //     method: 'PUT',
    //     headers: {
    //         'Authorization': idToken,
    //         'Content-Type': 'application/json'
    //     },
    //     body: JSON.stringify(updates)
    // });
    // return await response.json();
    
    const tasks = await getTasks();
    const taskIndex = tasks.findIndex(t => t.task_id === taskId);
    if (taskIndex !== -1) {
        tasks[taskIndex] = { ...tasks[taskIndex], ...updates };
        localStorage.setItem('tasks_' + cognitoUser.getUsername(), JSON.stringify(tasks));
    }
    return tasks[taskIndex];
}

async function deleteTaskById(taskId) {
    // Mock implementation - in production, call your API Gateway endpoint
    // Example:
    // const response = await fetch(`${AWS_CONFIG.apiEndpoint}/tasks/${taskId}`, {
    //     method: 'DELETE',
    //     headers: { 'Authorization': idToken }
    // });
    // return await response.json();
    
    const tasks = await getTasks();
    const filteredTasks = tasks.filter(t => t.task_id !== taskId);
    localStorage.setItem('tasks_' + cognitoUser.getUsername(), JSON.stringify(filteredTasks));
}

// ===================================
// Initialize App
// ===================================
window.addEventListener('DOMContentLoaded', () => {
    hideLoading();
    
    // Check if user is already logged in
    cognitoUser = userPool.getCurrentUser();
    
    if (cognitoUser) {
        cognitoUser.getSession((err, session) => {
            if (err || !session.isValid()) {
                elements.authSection.style.display = 'flex';
                elements.tasksSection.style.display = 'none';
                return;
            }
            
            idToken = session.getIdToken().getJwtToken();
            showTasksSection();
        });
    } else {
        elements.authSection.style.display = 'flex';
        elements.tasksSection.style.display = 'none';
    }
});

// Make functions globally available
window.completeTask = completeTask;
window.openEditModal = openEditModal;
window.deleteTask = deleteTask;
