# Complete Beginner Setup - Start From Scratch

## 🎯 Overview

This guide will take you from **zero to deployed** for Activity 2. You'll create:

1. ✅ DynamoDB Table
2. ✅ Cognito User Pool + App Client
3. ✅ S3 Bucket + Static Website
4. ✅ Working authentication flow

**Total Time:** ~2 hours

---

## 📚 Prerequisites

- ✅ AWS Account (create at <https://aws.amazon.com>)
- ✅ Text editor (VS Code, Notepad++, etc.)
- ✅ Web browser (Chrome, Firefox, Edge)

---

## 🗂️ Part 1: DynamoDB Table (5 minutes)

### Step 1.1: Create Table

1. **Open AWS Console**
   - Sign in to <https://console.aws.amazon.com>
   - Make sure you're in your desired region (e.g., **us-east-1**)

2. **Navigate to DynamoDB**
   - Search for "DynamoDB" in the top search bar
   - Click **DynamoDB**

3. **Create Table**
   - Click **Create table** (orange button)

4. **Configure Table**

   **Table name:**

   ```
   TasksTable
   ```

   **Partition key:**

   ```
   task_id
   ```

   Type: **String**

   **Sort key:**
   - Leave unchecked (we don't need one)

5. **Table Settings**
   - Select **On-demand** (default)
   - This auto-scales and you pay per request

6. **Create**
   - Click **Create table** at the bottom
   - Wait ~30 seconds for creation

7. **✅ Note Your Table ARN**
   - Click on your table name
   - Copy the **ARN** (looks like: `arn:aws:dynamodb:us-east-1:123456789012:table/TasksTable`)
   - Save this for later

---

## 👤 Part 2: Cognito User Pool (15 minutes)

### Step 2.1: Create User Pool

1. **Navigate to Cognito**
   - Search for "Cognito" in AWS Console
   - Click **Amazon Cognito**
   - Click **Create user pool**

2. **Configure Sign-in Experience**

   **Step 1: Configure sign-in experience**

   - Authentication providers: **Cognito user pool**
   - Cognito user pool sign-in options:
     - ✅ **Email** (check this)
     - ☐ Username (leave unchecked)

   Click **Next**

3. **Configure Security Requirements**

   **Step 2: Configure security requirements**

   - Password policy: **Cognito defaults** (or Custom if you want easier testing)
   - Multi-factor authentication: **No MFA**
   - User account recovery: **Email only**

   Click **Next**

4. **Configure Sign-up Experience**

   **Step 3: Configure sign-up experience**

   - Self-registration: ✅ **Allow users to sign themselves up**
   - Attribute verification: ✅ **Send email message, verify email address**
   - Required attributes:
     - ✅ **email** (required by default)
     - ✅ **name** (optional but recommended)

   Click **Next**

5. **Configure Message Delivery**

   **Step 4: Configure message delivery**

   - Email provider: **Send email with Cognito**

   Click **Next**

6. **Integrate Your App**

   **Step 5: Integrate your app**

   **User pool name:**

   ```
   TaskTrackerUserPool
   ```

   **Hosted authentication pages:**
   - ☐ Leave unchecked for now (we'll configure later)

   **Initial app client:**

   **App client name:**

   ```
   TaskTrackerAppClient
   ```

   **Client secret:**
   - ☐ **Don't generate a client secret**

   **Authentication flows:**
   - ✅ **ALLOW_USER_PASSWORD_AUTH**
   - ✅ **ALLOW_REFRESH_TOKEN_AUTH**

   Click **Next**

7. **Review and Create**

   **Step 6: Review and create**

   - Review all settings
   - Click **Create user pool**
   - Wait for creation (~30 seconds)

### Step 2.2: Save Important Information

After creation, you'll see your User Pool details:

1. **User Pool ID**
   - At the top of the page
   - Format: `us-east-1_XXXXXXXXX`
   - **✅ SAVE THIS**

2. **App Client ID**
   - Click **App integration** tab
   - Scroll to **App clients and analytics**
   - Click your **TaskTrackerAppClient**
   - Copy the **Client ID**
   - **✅ SAVE THIS**

3. **Region**
   - Note your AWS region (e.g., `us-east-1`)
   - **✅ SAVE THIS**

**Save these values - you'll need them shortly!**

```
User Pool ID: us-east-1_XXXXXXXXX
App Client ID: [Your Client ID]
Region: us-east-1
```

### Step 2.3: Create Test User

1. **Navigate to Users**
   - In your User Pool, click **Users** tab
   - Click **Create user**

2. **Configure User**

   - Invitation message: ☐ Uncheck "Send an email invitation"

   **User name:**

   ```
   testuser@example.com
   ```

   **Email address:**
   - ✅ Mark email as verified

   ```
   testuser@example.com
   ```

   **Temporary password:**
   - Select **Set a password**

   ```
   TestPass123!
   ```

   - ☐ Uncheck "User must change password"

3. **Create User**
   - Click **Create user**
   - User should show as **CONFIRMED**

---

## 🌐 Part 3: Configure Cognito Hosted UI (10 minutes)

### Step 3.1: Create Cognito Domain

1. **In your User Pool**
   - Click **App integration** tab
   - Scroll to **Domain** section
   - Click **Actions** → **Create Cognito domain**

2. **Enter Domain Prefix**

   ```
   tasktracker-yourname-12345
   ```

   > Replace `yourname` with your name and add random numbers
   > Example: `tasktracker-john-78945`
   > Must be unique across all AWS

3. **Create Domain**
   - Click **Create Cognito domain**
   - Wait for creation

4. **✅ Save Hosted UI URL**

   ```
   Format: https://tasktracker-yourname-12345.auth.us-east-1.amazoncognito.com
   ```

   **SAVE THIS URL**

### Step 3.2: Configure App Client for Hosted UI

1. **Edit App Client**
   - Click **App integration** tab
   - Click **App clients and analytics**
   - Click your **TaskTrackerAppClient**
   - Click **Edit** (top right)

2. **Add Temporary Callback URLs**

   Scroll to **Hosted UI settings**

   **Allowed callback URLs:**

   ```
   http://localhost:8000/callback.html
   ```

   **Allowed sign-out URLs:**

   ```
   http://localhost:8000/index.html
   ```

   > We'll update these with S3 URL later

3. **Configure OAuth Settings**

   **Identity providers:**
   - ✅ **Cognito user pool**

   **OAuth 2.0 grant types:**
   - ✅ **Authorization code grant**
   - ✅ **Implicit grant**

   **OpenID Connect scopes:**
   - ✅ **openid**
   - ✅ **email**
   - ✅ **profile**

4. **Save Changes**
   - Scroll to bottom
   - Click **Save changes**

---

## 💾 Part 4: Prepare Frontend Files (20 minutes)

### Step 4.1: Update Configuration Values

You now have all the information needed. Let's update the frontend files.

1. **Open `frontend/index.html`**

   Find the configuration section (around line 50):

   ```javascript
   const config = {
       cognitoDomain: 'https://YOUR-DOMAIN.auth.REGION.amazoncognito.com',
       clientId: 'YOUR_CLIENT_ID',
       redirectUri: window.location.origin + '/callback.html',
       responseType: 'code'
   };
   ```

2. **Replace with YOUR values:**

   ```javascript
   const config = {
       cognitoDomain: 'https://tasktracker-yourname-12345.auth.us-east-1.amazoncognito.com',
       clientId: '5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p',  // YOUR CLIENT ID
       redirectUri: window.location.origin + '/callback.html',
       responseType: 'code'
   };
   ```

3. **Update `frontend/callback.html`**

   Same configuration update around line 20

4. **Update `frontend/tasks.html`**

   Update configuration around line 40:

   ```javascript
   const config = {
       cognitoDomain: 'https://tasktracker-yourname-12345.auth.us-east-1.amazoncognito.com',
       clientId: '5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p',  // YOUR CLIENT ID
       apiEndpoint: 'https://YOUR-API-GATEWAY-ID.execute-api.us-east-1.amazonaws.com/prod'
   };
   ```

### Step 4.2: Test Locally (Optional)

1. **Open PowerShell in your project folder**

   ```powershell
   cd C:\Users\s9409\Downloads\awsserverlesswebapplication\frontend
   python -m http.server 8000
   ```

2. **Open browser**

   ```
   http://localhost:8000
   ```

3. **Test login flow**
   - Click "Sign In with Cognito"
   - Should redirect to Cognito Hosted UI
   - Login with: `testuser@example.com` / `TestPass123!`
   - Should redirect back to tasks page

4. **Stop server**
   - Press `Ctrl+C` in PowerShell

---

## 🪣 Part 5: Create S3 Bucket (10 minutes)

### Step 5.1: Create Bucket

1. **Navigate to S3**
   - Search for "S3" in AWS Console
   - Click **S3**
   - Click **Create bucket**

2. **Configure Bucket**

   **Bucket name:**

   ```
   tasktracker-frontend-yourname-12345
   ```

   > Must be globally unique
   > Use lowercase, numbers, hyphens only
   > Example: `tasktracker-frontend-john-78945`

   **AWS Region:**
   - Same as Cognito (e.g., **us-east-1**)

3. **Block Public Access**

   ⚠️ **IMPORTANT:**
   - ☐ **UNCHECK** "Block all public access"
   - ✅ Check the acknowledgment box

   > This allows your website to be publicly accessible

4. **Other Settings**
   - Keep all other defaults
   - Click **Create bucket**

5. **✅ Save Bucket Name**

   ```
   Bucket name: tasktracker-frontend-yourname-12345
   ```

### Step 5.2: Enable Static Website Hosting

1. **Open Your Bucket**
   - Click on your bucket name

2. **Go to Properties**
   - Click **Properties** tab
   - Scroll to bottom

3. **Edit Static Website Hosting**
   - Click **Edit** in "Static website hosting" section

   **Static website hosting:**
   - Select **Enable**

   **Hosting type:**
   - **Host a static website**

   **Index document:**

   ```
   index.html
   ```

   **Error document:**

   ```
   index.html
   ```

4. **Save Changes**
   - Click **Save changes**

5. **✅ Copy Website Endpoint**

   You'll see:

   ```
   Bucket website endpoint:
   http://tasktracker-frontend-yourname-12345.s3-website-us-east-1.amazonaws.com
   ```

   **SAVE THIS URL - this is your website!**

### Step 5.3: Set Bucket Policy

1. **Go to Permissions Tab**
   - Click **Permissions** tab

2. **Edit Bucket Policy**
   - Scroll to **Bucket policy**
   - Click **Edit**

3. **Paste Policy**

   Copy this JSON and paste it:

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

4. **Replace Bucket Name**

   Replace `YOUR-BUCKET-NAME` with your actual bucket name:

   ```json
   "Resource": "arn:aws:s3:::tasktracker-frontend-john-78945/*"
   ```

5. **Save Changes**
   - Click **Save changes**
   - Should see "Successfully edited bucket policy"

---

## 📤 Part 6: Upload Files to S3 (5 minutes)

### Step 6.1: Upload Frontend Files

1. **In Your Bucket**
   - Go to **Objects** tab
   - Click **Upload**

2. **Add Files**
   - Click **Add files**
   - Navigate to your `frontend` folder
   - Select these files:
     - `index.html`
     - `callback.html`
     - `tasks.html`
     - `styles.css` (or `styles-new.css`)
     - `task-styles.css`

3. **Upload**
   - Click **Upload** at bottom
   - Wait for "Upload succeeded"
   - Click **Close**

---

## 🔗 Part 7: Update Cognito with S3 URL (5 minutes)

### Step 7.1: Update Callback URLs

1. **Go Back to Cognito**
   - Open Cognito Console
   - Click your **TaskTrackerUserPool**
   - Click **App integration** tab
   - Click **TaskTrackerAppClient**
   - Click **Edit**

2. **Update Allowed Callback URLs**

   Replace the localhost URL with your S3 URL:

   ```
   http://tasktracker-frontend-yourname-12345.s3-website-us-east-1.amazonaws.com/callback.html
   ```

3. **Update Allowed Sign-out URLs**

   ```
   http://tasktracker-frontend-yourname-12345.s3-website-us-east-1.amazonaws.com/index.html
   ```

4. **Save Changes**
   - Scroll to bottom
   - Click **Save changes**

---

## ✅ Part 8: Test Your Website (10 minutes)

### Step 8.1: Access Website

1. **Open S3 Website URL in browser**

   ```
   http://tasktracker-frontend-yourname-12345.s3-website-us-east-1.amazonaws.com
   ```

2. **You should see:**
   - ✅ Beautiful login page with gradient
   - ✅ "Sign In with Cognito" button
   - ✅ Test credentials displayed

### Step 8.2: Test Authentication

1. **Click "Sign In with Cognito"**
   - Should redirect to Cognito Hosted UI
   - URL shows `amazoncognito.com`

2. **Login**

   ```
   Email: testuser@example.com
   Password: TestPass123!
   ```

3. **After Login**
   - Redirects to `callback.html` (shows "Authenticating...")
   - Then redirects to `tasks.html`
   - Should see your email in header
   - Can add/delete tasks (local only for now)

4. **Test Logout**
   - Click "Logout" button
   - Should return to login page

### Step 8.3: Take Screenshots

For your submission, capture:

1. **Screenshot 1:** Login page on S3
   - Full browser with S3 URL visible

2. **Screenshot 2:** Cognito Hosted UI
   - After clicking "Sign In"

3. **Screenshot 3:** Tasks page after login
   - Showing user email and interface

---

## 📝 Part 9: Prepare Submission (15 minutes)

### Step 9.1: Write Explanation (200-300 words)

Write about:

1. What S3 static website hosting is
2. How authentication works with Cognito
3. Benefits you observed
4. Challenges you faced

See `docs/ACTIVITY-2-SUBMISSION-TEMPLATE.md` for detailed template.

### Step 9.2: Create Submission Document

Include:

- ✅ Your S3 website URL
- ✅ 3 screenshots (labeled)
- ✅ Explanation note (200-300 words)
- ✅ Configuration summary (optional)

---

## 🎉 Congratulations

You've successfully:

- ✅ Created DynamoDB table
- ✅ Set up Cognito User Pool + App Client
- ✅ Configured Cognito Hosted UI
- ✅ Created and configured S3 bucket
- ✅ Deployed your frontend
- ✅ Implemented working authentication

**Your website is now live on AWS!** 🚀

---

## 📊 Configuration Summary

Fill this out as you complete each step:

```
=== DYNAMODB ===
Table Name: TasksTable
Table ARN: arn:aws:dynamodb:us-east-1:____________:table/TasksTable

=== COGNITO ===
User Pool ID: us-east-1_____________
App Client ID: _________________________________
Cognito Domain: https://tasktracker-yourname-12345.auth.us-east-1.amazoncognito.com
Region: us-east-1

=== S3 ===
Bucket Name: tasktracker-frontend-yourname-12345
Website URL: http://tasktracker-frontend-yourname-12345.s3-website-us-east-1.amazonaws.com

=== TEST USER ===
Email: testuser@example.com
Password: TestPass123!
```

---

## 🔧 Troubleshooting

### "403 Forbidden" on S3 URL

→ Check bucket policy is correct
→ Verify "Block all public access" is OFF

### "Invalid redirect_uri" in Cognito

→ Verify callback URL matches S3 URL exactly
→ No typos, no trailing slashes

### Blank page after login

→ Open browser console (F12)
→ Check for JavaScript errors
→ Verify config values in HTML files

### CSS not loading

→ Verify CSS files uploaded to S3
→ Check file names match exactly
→ Clear browser cache (Ctrl+Shift+R)

---

## 📚 Next Steps

After Activity 2:

- **Activity 3:** Lambda functions + API Gateway
- **Activity 4:** Connect frontend to backend APIs
- **Activity 5:** Full application integration

---

## 📞 Need Help?

1. Check the detailed guides:
   - `docs/02-COGNITO-SETUP.md`
   - `docs/ACTIVITY-2-S3-FRONTEND-DEPLOYMENT.md`
   - `docs/ACTIVITY-2-QUICKSTART-CHECKLIST.md`

2. Review troubleshooting sections

3. Check browser console for errors (F12)

4. Ask instructor with specific error messages

---

**Good luck! You've got this! 💪**

Take it step by step, and don't rush. If something doesn't work, check the troubleshooting section or review the detailed guides.
