# 🚀 Frontend Deployment Guide

This guide walks you through deploying the Task Tracker frontend application to AWS S3.

## 📋 Prerequisites Checklist

Before deploying the frontend, ensure you have completed:

- ✅ **DynamoDB Table** - `TasksTable` created and active
- ✅ **Cognito User Pool** - User Pool and App Client configured
- ✅ **Lambda Functions** - All 4 CRUD functions deployed
- ✅ **API Gateway** - REST API created with Cognito authorizer
- ✅ **IAM Roles** - Lambda execution role with proper permissions

## 🔧 Step 1: Configure AWS Credentials

Before deployment, you need to configure `app.js` with your actual AWS resource values.

### **Edit `frontend/app.js`**

Open `app.js` and replace the placeholder values in the `CONFIG` object (lines 4-14):

```javascript
const CONFIG = {
    cognito: {
        userPoolId: 'us-east-1_XXXXXXXXX',      // ← Replace with your User Pool ID
        clientId: 'your-app-client-id',          // ← Replace with your App Client ID
        region: 'us-east-1'                      // ← Replace with your AWS Region
    },
    api: {
        invokeUrl: 'https://your-api-id.execute-api.us-east-1.amazonaws.com/prod'  // ← Replace with your API URL
    }
};
```

### **Where to Find These Values:**

#### **1. Cognito User Pool ID**
```
AWS Console → Amazon Cognito → User Pools → TaskTrackerUserPool
Look for: User pool ID (e.g., us-east-1_abc123xyz)
```

#### **2. Cognito App Client ID**
```
AWS Console → Amazon Cognito → User Pools → TaskTrackerUserPool → App integration tab
Look for: App client ID (e.g., 1a2b3c4d5e6f7g8h9i0j1k2l3m)
```

#### **3. AWS Region**
```
Check the region selector in AWS Console (top right)
Common regions: us-east-1, us-west-2, eu-west-1, ap-southeast-1
```

#### **4. API Gateway Invoke URL**
```
AWS Console → API Gateway → TaskTrackerAPI → Stages → prod
Look for: Invoke URL (e.g., https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod)
```

### **Example Configuration:**

```javascript
const CONFIG = {
    cognito: {
        userPoolId: 'us-east-1_abc123xyz',
        clientId: '1a2b3c4d5e6f7g8h9i0j1k2l3m',
        region: 'us-east-1'
    },
    api: {
        invokeUrl: 'https://abc123xyz.execute-api.us-east-1.amazonaws.com/prod'
    }
};
```

## 📦 Step 2: Prepare Files for Upload

Ensure all three frontend files are ready:

```
frontend/
├── index.html       ✅ No changes needed
├── styles.css       ✅ No changes needed
└── app.js           ✅ Must be configured (Step 1)
```

### **File Validation Checklist:**

- [ ] `app.js` contains your actual Cognito User Pool ID
- [ ] `app.js` contains your actual App Client ID
- [ ] `app.js` contains your correct AWS Region
- [ ] `app.js` contains your API Gateway Invoke URL
- [ ] All three files are saved and ready for upload

## ☁️ Step 3: Create S3 Bucket

### **3.1 Create Bucket**

1. Go to **AWS Console** → **S3**
2. Click **Create bucket**
3. **Bucket name**: `task-tracker-app-[your-unique-id]`
   - Example: `task-tracker-app-john-12345`
   - Must be globally unique
   - Use lowercase letters, numbers, and hyphens only
4. **AWS Region**: Select the same region as your other resources
5. **Block Public Access settings**:
   - ⚠️ **UNCHECK** "Block all public access"
   - ✅ Check the acknowledgment box
6. Keep other settings as default
7. Click **Create bucket**

### **3.2 Enable Static Website Hosting**

1. Click on your newly created bucket
2. Go to **Properties** tab
3. Scroll to **Static website hosting** section
4. Click **Edit**
5. Select **Enable**
6. **Hosting type**: Static website hosting
7. **Index document**: `index.html`
8. **Error document**: `index.html` (optional)
9. Click **Save changes**
10. 📝 **Note the Bucket website endpoint** (e.g., `http://task-tracker-app-john-12345.s3-website-us-east-1.amazonaws.com`)

## 📤 Step 4: Upload Frontend Files

### **4.1 Upload Files**

1. In your S3 bucket, click **Upload**
2. Click **Add files**
3. Select all three files:
   - `index.html`
   - `styles.css`
   - `app.js`
4. Click **Upload**
5. Wait for "Upload succeeded" message

### **4.2 Set File Permissions**

You need to make the files publicly readable:

**Option A: Bucket Policy (Recommended)**

1. Go to **Permissions** tab
2. Scroll to **Bucket policy** section
3. Click **Edit**
4. Paste this policy (replace `YOUR-BUCKET-NAME`):

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

5. Click **Save changes**

**Option B: Individual File Permissions**

1. Select all three uploaded files
2. Click **Actions** → **Make public using ACL**
3. Confirm by clicking **Make public**

## 🧪 Step 5: Test Your Application

### **5.1 Access the Application**

1. Copy your **Bucket website endpoint** from Step 3.2
2. Open it in a web browser
3. You should see the Task Tracker login page

### **5.2 Test Authentication Flow**

**Test Sign Up:**
1. Click "Sign up here"
2. Fill in:
   - Name: Your Name
   - Email: your-email@example.com (use a real email)
   - Password: At least 8 characters
3. Click "Sign Up"
4. Check your email for verification code
5. Enter the 6-digit code
6. Click "Verify Email"

**Test Login:**
1. Enter your verified email and password
2. Click "Login"
3. You should see the tasks dashboard

### **5.3 Test Task Management**

**Create a Task:**
1. In the "Add New Task" form:
   - Task Name: "Test Task"
   - Description: "This is a test"
2. Click "Create Task"
3. Verify task appears in the list

**Complete a Task:**
1. Click "✓ Mark Complete" on a pending task
2. Verify status changes to "Completed"
3. Task should appear grayed out

**Filter Tasks:**
1. Click "Pending" filter button
2. Only pending tasks should show
3. Click "Completed" filter button
4. Only completed tasks should show

**Sort Tasks:**
1. Use the sort dropdown
2. Try "Newest First", "Oldest First", "Name (A-Z)"
3. Verify tasks reorder correctly

**Delete a Task:**
1. Click "🗑️ Delete" on a task
2. Confirm deletion in popup
3. Task should disappear

### **5.4 Test Logout**
1. Click user icon → "Logout"
2. Confirm logout
3. Verify you're redirected to login page

## 🔍 Troubleshooting

### **Issue: "Cannot read properties of null"**

**Cause**: Invalid or missing AWS configuration values

**Solution**:
1. Open browser Developer Tools (F12)
2. Check Console tab for errors
3. Verify `app.js` has correct values:
   - User Pool ID format: `us-east-1_XXXXXXXXX`
   - App Client ID is not empty
   - API URL starts with `https://`

### **Issue: "Access Denied" or 403 Error**

**Cause**: S3 bucket or files are not public

**Solution**:
1. Check bucket policy is correctly applied
2. Verify "Block all public access" is OFF
3. Try Option B (Individual File Permissions)

### **Issue: "Sign up failed" or "Login failed"**

**Cause**: Cognito configuration issues

**Solution**:
1. Verify User Pool exists and is ACTIVE
2. Check App Client ID matches exactly
3. Ensure App Client has:
   - ✅ "ALLOW_USER_PASSWORD_AUTH" enabled
   - ✅ No client secret (should be public client)

### **Issue: "Failed to load tasks" or API errors**

**Cause**: API Gateway or Lambda issues

**Solution**:
1. Verify API Gateway URL is correct (includes `/prod`)
2. Test API endpoint directly:
   ```bash
   curl -X GET https://your-api-url.amazonaws.com/prod/tasks \
        -H "Authorization: YOUR-ID-TOKEN"
   ```
3. Check Lambda functions are deployed
4. Verify Cognito Authorizer is attached to API routes

### **Issue: Tasks don't load after login**

**Cause**: CORS configuration or Lambda permissions

**Solution**:
1. Check Lambda functions have CORS headers:
   ```python
   'Access-Control-Allow-Origin': '*'
   'Access-Control-Allow-Headers': 'Content-Type,Authorization'
   ```
2. Verify API Gateway CORS is enabled
3. Check browser Console for CORS errors

### **Issue: Verification email not received**

**Cause**: Cognito email configuration

**Solution**:
1. Check spam/junk folder
2. In Cognito User Pool → Messaging:
   - Verify email configuration is set
   - Check SES verification status (if using SES)
3. Try "Resend verification code" link

## 📱 Step 6: Custom Domain (Optional)

To use a custom domain like `tasks.yourdomain.com`:

### **Option A: CloudFront + Route 53**

1. **Create CloudFront Distribution**:
   - Origin: Your S3 bucket website endpoint
   - Alternate domain name (CNAME): `tasks.yourdomain.com`
   - SSL certificate: Request from AWS Certificate Manager

2. **Update Route 53**:
   - Create A record
   - Alias to CloudFront distribution

### **Option B: S3 + Route 53 Only**

1. Create bucket named exactly: `tasks.yourdomain.com`
2. Upload files and configure static hosting
3. In Route 53:
   - Create A record
   - Alias to S3 website endpoint

## 🔐 Security Best Practices

### **For Production Deployment:**

1. **Enable HTTPS**:
   - Use CloudFront with SSL certificate
   - Never use HTTP for production

2. **Restrict S3 Bucket Policy**:
   ```json
   {
       "Version": "2012-10-17",
       "Statement": [
           {
               "Effect": "Allow",
               "Principal": {
                   "AWS": "arn:aws:iam::cloudfront:user/CloudFront Origin Access Identity YOUR-OAI-ID"
               },
               "Action": "s3:GetObject",
               "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
           }
       ]
   }
   ```

3. **Enable CloudFront Logging**:
   - Monitor access patterns
   - Detect suspicious activity

4. **Use WAF (Web Application Firewall)**:
   - Attach to CloudFront
   - Block common attacks

5. **Set Security Headers**:
   - Use CloudFront Functions or Lambda@Edge
   - Add headers:
     - `Strict-Transport-Security`
     - `X-Frame-Options`
     - `X-Content-Type-Options`
     - `Content-Security-Policy`

## 📊 Monitoring

### **CloudWatch Metrics to Monitor:**

1. **S3 Bucket Metrics**:
   - Number of requests
   - Bytes downloaded
   - 4xx/5xx errors

2. **CloudFront Metrics** (if used):
   - Cache hit rate
   - Error rate
   - Origin latency

### **Set Up Alarms:**

1. Go to **CloudWatch** → **Alarms**
2. Create alarm for:
   - High 4xx error rate (> 5%)
   - High 5xx error rate (> 1%)
   - Low cache hit rate (< 80% if using CloudFront)

## 🎯 Deployment Checklist

Use this final checklist before going live:

### **Pre-Deployment:**
- [ ] All backend services (DynamoDB, Cognito, Lambda, API Gateway) are working
- [ ] `app.js` configured with production AWS values
- [ ] API Gateway is deployed to `prod` stage
- [ ] Cognito User Pool allows sign-ups (if desired)

### **S3 Configuration:**
- [ ] Bucket created with unique name
- [ ] Static website hosting enabled
- [ ] Bucket policy or ACLs make files public
- [ ] All three files uploaded successfully

### **Testing:**
- [ ] Can access website via S3 endpoint
- [ ] Can sign up new user
- [ ] Receive and verify email
- [ ] Can login with verified account
- [ ] Can create, view, update, and delete tasks
- [ ] Filters and sorting work correctly
- [ ] Can logout and login again
- [ ] No console errors in browser DevTools

### **Optional (Production):**
- [ ] CloudFront distribution created
- [ ] SSL certificate issued and attached
- [ ] Custom domain configured
- [ ] DNS records updated
- [ ] Security headers configured
- [ ] CloudWatch alarms set up
- [ ] Monitoring dashboard created

## 🎉 Success!

Your Task Tracker application is now deployed! 

**Next Steps:**
- Share the URL with others
- Monitor usage in CloudWatch
- Collect feedback and iterate
- Add to your portfolio with screenshots

## 📚 Additional Resources

- [AWS S3 Static Website Hosting](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [CloudFront + S3 Tutorial](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/GettingStarted.SimpleDistribution.html)
- [Cognito Hosted UI](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html)
- [AWS Certificate Manager](https://docs.aws.amazon.com/acm/latest/userguide/gs.html)

---

**Need Help?** Review the troubleshooting section or check AWS CloudWatch logs for your Lambda functions and API Gateway.
