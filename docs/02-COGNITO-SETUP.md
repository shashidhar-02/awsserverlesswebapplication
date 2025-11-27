# Step 2: Amazon Cognito Setup

## Overview

Amazon Cognito handles user authentication, authorization, and user management for your application. It provides secure sign-up, sign-in, and access control without requiring you to build authentication from scratch.

## Learning Objectives

- Create a Cognito User Pool
- Configure user attributes and security settings
- Set up an App Client for frontend integration
- Understand JWT tokens and authentication flow

---

## Step-by-Step Instructions

### Part A: Create a User Pool

#### 1. Navigate to Amazon Cognito

1. In AWS Console, search for **Cognito** in the top search bar
2. Click on **Amazon Cognito**
3. Click **Create user pool** button

#### 2. Configure Sign-in Experience

**Step 1: Configure sign-in experience**

**Authentication providers**:

- Select **Cognito user pool** (should be selected by default)

**Cognito user pool sign-in options** - Choose how users will sign in:

- ✅ Check **Email**
- ☐ Leave Username unchecked (optional, can enable if desired)

> **Why email?** Most users prefer signing in with their email address rather than remembering a separate username.

**User name requirements**: Keep default settings

Click **Next**

#### 3. Configure Security Requirements

**Step 2: Configure security requirements**

**Password policy**:

- Select **Cognito defaults** (recommended for learning)
  - Minimum length: 8 characters
  - Contains uppercase, lowercase, numbers, special characters
  
Or choose **Custom** if you want simpler passwords during testing:

- Minimum length: `8`
- Uncheck complexity requirements for easier testing

**Multi-factor authentication (MFA)**:

- Select **No MFA** (for simplicity during development)
- In production, choose **Optional MFA** or **Require MFA**

**User account recovery**:

- ✅ Check **Enable self-service account recovery**
- Select **Email only**

Click **Next**

#### 4. Configure Sign-up Experience

**Step 3: Configure sign-up experience**

**Self-registration**:

- ✅ Enable **Allow Cognito to automatically send messages to verify and confirm** (default)
- ✅ Allow users to sign themselves up

**Attribute verification and user account confirmation**:

- ✅ Check **Send email message, verify email address**

**Required attributes** - Information collected during sign-up:

- ✅ **email** (already required)
- ✅ **name** (optional but recommended)
- You can add more like `family_name`, `phone_number` if needed

**Custom attributes**: Leave empty for now

Click **Next**

#### 5. Configure Message Delivery

**Step 4: Configure message delivery**

**Email provider**:

- Select **Send email with Cognito** (recommended for getting started)
- This uses Amazon SES for emails (2000 free emails/day)

**FROM email address**: Keep default or customize

- Example: `noreply@verificationemail.com`

**SES Region**: Keep default (usually same as your working region)

> **Note**: For production apps with high volume, configure Amazon SES separately.

Click **Next**

#### 6. Integrate Your App

**Step 5: Integrate your app**

**User pool name**:

- Enter: `TaskTrackerUserPool`

**Hosted authentication pages**:

- ☐ **Uncheck** "Use the Cognito Hosted UI" for now
- We'll use custom frontend authentication

**Initial app client**:

**App client name**: `TaskTrackerAppClient`

**Client secret**:

- Select **Don't generate a client secret**
- ⚠️ Important: Public clients (JavaScript) can't securely store secrets

**Authentication flows**:

- ✅ **ALLOW_USER_PASSWORD_AUTH** (username/password authentication)
- ✅ **ALLOW_REFRESH_TOKEN_AUTH** (token refresh)

Click **Next**

#### 7. Review and Create

**Step 6: Review and create**

1. Review all your configurations:
   - Sign-in: Email
   - Password policy: Cognito defaults
   - MFA: No MFA
   - Self-registration: Enabled
   - Email verification: Enabled
   - User pool name: TaskTrackerUserPool
   - App client: TaskTrackerAppClient

2. Click **Create user pool**

3. Wait for creation (~30 seconds)

---

### Part B: Note Important Information

After creation, you'll be on the User Pool details page.

#### 1. Collect User Pool Information

**User Pool ID**:

1. At the top of the page, find **User pool ID**
2. Copy and save it (format: `us-east-1_XXXXXXXXX`)

**Example**: `us-east-1_AbCd12345`

**AWS Region**:

- Note your region (e.g., `us-east-1`)

#### 2. Get App Client Details

1. Click on the **App integration** tab
2. Scroll down to **App clients and analytics**
3. Click on `TaskTrackerAppClient`

**Client ID**:

- Copy the **Client ID** (long alphanumeric string)
- Example: `5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p`

**Save these values** - you'll need them for:

- Lambda function environment variables
- Frontend configuration

---

### Part C: Create a Test User (Optional but Recommended)

Let's create a test user to verify everything works:

#### 1. Navigate to Users

1. In your User Pool, click the **Users** tab
2. Click **Create user** button

#### 2. Configure Test User

**User information**:

- ☐ Uncheck "Send an email invitation"
- Invitation message: Skip

**User name**:

- Enter: `testuser@example.com`

**Email address**:

- Check **Mark email as verified** (to skip verification during testing)
- Enter: `testuser@example.com`

**Temporary password**:

- Select **Set a password**
- Enter a temporary password: `TestPass123!`
- ☐ Uncheck "User must change password at next sign-in" (for testing convenience)

3. Click **Create user**

#### 3. Verify User Creation

1. You should see the test user in the users list
2. Status should be **CONFIRMED** or **FORCE_CHANGE_PASSWORD**
3. Email should show as **Verified**

---

## Understanding Cognito Authentication Flow

### How Authentication Works in Your App

```
1. User Registration (Sign-Up)
   ↓
   Frontend → Cognito User Pool → Email Verification
   ↓
   User confirms email → Account activated

2. User Login (Sign-In)
   ↓
   Frontend sends email + password → Cognito
   ↓
   Cognito validates credentials → Returns JWT tokens
   ↓
   Frontend stores tokens (IdToken, AccessToken, RefreshToken)

3. API Requests
   ↓
   Frontend includes IdToken in Authorization header
   ↓
   API Gateway validates token with Cognito
   ↓
   Lambda function executes if token is valid
```

### JWT Tokens Explained

**IdToken**:

- Contains user identity information (user ID, email, name)
- Used for authentication
- Send this to API Gateway

**AccessToken**:

- Used to authorize access to resources
- Needed for Cognito operations

**RefreshToken**:

- Used to get new tokens when they expire
- Long-lived (default 30 days)

---

## Configure App Client Settings (Advanced - Optional)

If you need to modify settings later:

### 1. Token Expiration

1. Go to **App integration** tab → **App clients**
2. Select your app client
3. Scroll to **Token expiration**

Recommended settings:

- **ID token expiration**: 1 hour (3600 seconds)
- **Access token expiration**: 1 hour (3600 seconds)
- **Refresh token expiration**: 30 days

### 2. Allowed OAuth Flows (if using Hosted UI later)

If you decide to use Cognito's hosted UI:

- Enable **Authorization code grant**
- Add callback URLs (your app's URL)

---

## Security Best Practices

### For Development

- ✅ Use simple passwords for test users
- ✅ Disable MFA to simplify testing
- ✅ Create test users manually

### For Production

- ✅ Enable MFA (Multi-Factor Authentication)
- ✅ Use strong password policies
- ✅ Enable advanced security features
- ✅ Set up CloudWatch logging
- ✅ Implement account lockout policies
- ✅ Use Cognito Identity Pools for AWS resource access

---

## Testing Cognito Setup

### Using AWS Console

1. Go to your User Pool → **Users** tab
2. Click on your test user
3. Check user status and attributes
4. Try **Disable user** and **Enable user** to test controls

### Using AWS CLI (Advanced)

```bash
# Test user authentication
aws cognito-idp initiate-auth \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id YOUR_APP_CLIENT_ID \
  --auth-parameters USERNAME=testuser@example.com,PASSWORD=TestPass123!
```

You should receive a response with tokens if successful.

---

## Troubleshooting

### Common Issues

**"User pool with this name already exists"**

- User pool names must be unique in your account per region
- Use a different name or delete the existing pool

**Email not sending during verification**

- Check spam folder
- Verify your email provider settings
- For testing, manually verify users in the console

**"Invalid client" error**

- Ensure you're using the correct App Client ID
- Verify you didn't enable client secret for a public app

**Token expired errors**

- Tokens expire after 1 hour by default
- Implement token refresh in your frontend
- Use RefreshToken to get new tokens

---

## Checkpoint ✅

Before moving to the next step, ensure:

- ✅ User Pool created: `TaskTrackerUserPool`
- ✅ App Client created: `TaskTrackerAppClient`
- ✅ You have noted down:
  - User Pool ID (e.g., `us-east-1_XXXXXXXXX`)
  - App Client ID
  - AWS Region
- ✅ (Optional) Test user created and verified
- ✅ You understand JWT tokens (IdToken for API requests)

---

## Configuration Summary

Save these values for later steps:

```
User Pool ID: us-east-1_XXXXXXXXX
App Client ID: 5a6b7c8d9e0f1g2h3i4j5k6l7m8n9o0p
Region: us-east-1
```

---

## Next Step

Continue to **[03-LAMBDA-SETUP.md](./03-LAMBDA-SETUP.md)** to create backend Lambda functions.

---

## Additional Resources

- [Amazon Cognito Documentation](https://docs.aws.amazon.com/cognito/)
- [Cognito User Pools](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-identity-pools.html)
- [JWT Token Structure](https://jwt.io/)
- [Cognito Authentication Flow](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-authentication-flow.html)
