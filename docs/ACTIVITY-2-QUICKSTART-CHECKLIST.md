# Activity 2: Quick Start Checklist

## 🎯 Overview

This is a condensed checklist for Activity 2. Use this alongside the main guide `ACTIVITY-2-S3-FRONTEND-DEPLOYMENT.md`.

---

## ⚡ Quick Reference

### Information You Need

```
From Cognito (Activity 1):
├─ User Pool ID: us-east-1_XXXXXXXXX
├─ App Client ID: [Your Client ID]
└─ AWS Region: us-east-1

New Information (Activity 2):
├─ Cognito Domain: tasktracker-yourname-12345
├─ S3 Bucket Name: tasktracker-frontend-yourname-12345
└─ S3 Website URL: [Will get after creation]
```

---

## 📋 Step-by-Step Checklist

### ☐ Phase 1: Configure Cognito Hosted UI (15 mins)

1. ☐ Go to AWS Cognito Console
2. ☐ Select your **TaskTrackerUserPool**
3. ☐ Click **App integration** → **TaskTrackerAppClient** → **Edit**
4. ☐ Add temporary callback URLs:
   - `http://localhost:8000/callback.html`
5. ☐ Add temporary sign-out URLs:
   - `http://localhost:8000/index.html`
6. ☐ Enable OAuth 2.0 flows:
   - ✅ Authorization code grant
   - ✅ Implicit grant
7. ☐ Select OpenID scopes:
   - ✅ openid
   - ✅ email
   - ✅ profile
8. ☐ **Save changes**

9. ☐ Create Cognito Domain:
   - Go to **Domain** section → **Create Cognito domain**
   - Enter prefix: `tasktracker-yourname-12345`
   - **Create**

10. ☐ **Note down Hosted UI URL**:
    ```
    https://tasktracker-yourname-12345.auth.us-east-1.amazoncognito.com
    ```

---

### ☐ Phase 2: Prepare Frontend Files (20 mins)

11. ☐ Navigate to your `frontend` folder

12. ☐ Create/Update **index.html**
    - Copy from main guide
    - Update config section with your values:
      ```javascript
      cognitoDomain: 'https://YOUR-DOMAIN.auth.REGION.amazoncognito.com'
      clientId: 'YOUR_CLIENT_ID'
      ```

13. ☐ Create **callback.html**
    - Copy from main guide
    - Update config section with same values

14. ☐ Update **tasks.html**
    - Add authentication check at top
    - Update config section

15. ☐ Create/Update **styles.css**
    - Copy from main guide

16. ☐ Create **task-styles.css**
    - Copy from main guide

17. ☐ **Test locally** (optional):
    ```powershell
    cd frontend
    python -m http.server 8000
    ```
    Open: `http://localhost:8000`

---

### ☐ Phase 3: Create S3 Bucket (10 mins)

18. ☐ Go to **S3 Console** → **Create bucket**

19. ☐ Configure bucket:
    - **Name**: `tasktracker-frontend-yourname-12345` (must be unique!)
    - **Region**: Same as Cognito (e.g., us-east-1)
    - **Block Public Access**: ☐ UNCHECK "Block all public access"
    - ✅ Acknowledge warning
    - **Create bucket**

20. ☐ **Note your bucket name**

---

### ☐ Phase 4: Upload Files to S3 (5 mins)

21. ☐ Open your S3 bucket

22. ☐ Click **Upload** → **Add files**

23. ☐ Select files:
    - ☐ index.html
    - ☐ callback.html
    - ☐ tasks.html
    - ☐ styles.css
    - ☐ task-styles.css

24. ☐ Click **Upload** → Wait for success → **Close**

---

### ☐ Phase 5: Enable Static Website Hosting (5 mins)

25. ☐ In your bucket, go to **Properties** tab

26. ☐ Scroll to **Static website hosting** → **Edit**

27. ☐ Configure:
    - **Static website hosting**: Enable
    - **Hosting type**: Host a static website
    - **Index document**: `index.html`
    - **Error document**: `index.html`
    - **Save changes**

28. ☐ **Copy Website Endpoint URL**:
    ```
    http://tasktracker-frontend-yourname-12345.s3-website-us-east-1.amazonaws.com
    ```

---

### ☐ Phase 6: Configure Bucket Policy (5 mins)

29. ☐ Go to **Permissions** tab

30. ☐ Scroll to **Bucket policy** → **Edit**

31. ☐ Paste this policy (replace bucket name):
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

32. ☐ Replace `YOUR-BUCKET-NAME` with actual bucket name

33. ☐ **Save changes**

---

### ☐ Phase 7: Update Cognito with S3 URL (5 mins)

34. ☐ Go back to **Cognito Console**

35. ☐ Click your User Pool → **App integration** → **TaskTrackerAppClient** → **Edit**

36. ☐ Update **Allowed callback URLs** (replace with your S3 URL):
    ```
    http://YOUR-S3-WEBSITE-URL/callback.html
    ```

37. ☐ Update **Allowed sign-out URLs**:
    ```
    http://YOUR-S3-WEBSITE-URL/index.html
    ```

38. ☐ **Save changes**

---

### ☐ Phase 8: Test Your Website (10 mins)

39. ☐ Open S3 Website URL in browser

40. ☐ Verify login page loads correctly

41. ☐ Click "Sign In with Cognito"

42. ☐ Login with test credentials:
    - Email: `testuser@example.com`
    - Password: `TestPass123!`

43. ☐ Verify redirect to tasks page

44. ☐ Test adding a task (local only)

45. ☐ Test logout button

46. ☐ **All working?** ✅ Proceed to screenshots

---

### ☐ Phase 9: Capture Screenshots (5 mins)

47. ☐ **Screenshot 1**: Login page on S3
    - Show full browser with S3 URL in address bar
    - Entire login interface visible

48. ☐ **Screenshot 2**: Cognito Hosted UI
    - After clicking "Sign In"
    - Show `amazoncognito.com` URL

49. ☐ **Screenshot 3**: Tasks page after login
    - Show user email in header
    - Show S3 URL in address bar

---

### ☐ Phase 10: Write Explanation (15 mins)

50. ☐ Write 200-300 word explanation covering:
    - How S3 static website hosting works
    - Benefits of S3 hosting
    - How Cognito authentication flow works
    - Your experience/challenges

---

### ☐ Phase 11: Prepare Submission

51. ☐ Create submission document (Word/PDF)

52. ☐ Include:
    - ☐ Cover page with your details
    - ☐ S3 Website URL (copy-pasteable)
    - ☐ All 3 screenshots (labeled)
    - ☐ Explanation note (200-300 words)
    - ☐ Configuration summary (optional)

53. ☐ **Verify S3 URL is accessible** before submitting

54. ☐ **Proofread** explanation note

55. ☐ **Submit** assignment

---

## 🔧 Quick Troubleshooting

### Website shows 403 Forbidden
→ Check bucket policy is correct and public access is unblocked

### Cognito shows "Invalid redirect_uri"
→ Verify callback URL in Cognito matches S3 URL exactly

### Page is blank after login
→ Check browser console (F12) for JavaScript errors
→ Verify config values in HTML files

### CSS not loading
→ Verify CSS files are uploaded to S3
→ Check file names match exactly

---

## 📊 Time Estimate

| Phase | Task | Time |
|-------|------|------|
| 1 | Configure Cognito Hosted UI | 15 min |
| 2 | Prepare Frontend Files | 20 min |
| 3 | Create S3 Bucket | 10 min |
| 4 | Upload Files | 5 min |
| 5 | Enable Website Hosting | 5 min |
| 6 | Configure Bucket Policy | 5 min |
| 7 | Update Cognito URLs | 5 min |
| 8 | Test Website | 10 min |
| 9 | Capture Screenshots | 5 min |
| 10 | Write Explanation | 15 min |
| 11 | Prepare Submission | 10 min |
| **Total** | | **~1.5-2 hours** |

---

## ✅ Success Criteria

Your Activity 2 is complete when:

- ✅ S3 bucket created and configured
- ✅ Website accessible via S3 URL
- ✅ Login redirects to Cognito Hosted UI
- ✅ Authentication flow works end-to-end
- ✅ Tasks page displays after login
- ✅ All 3 screenshots captured
- ✅ Explanation written
- ✅ Submission document prepared

---

## 📁 Files Checklist

Ensure these files exist in your frontend folder:

- ☐ `index.html` (login page)
- ☐ `callback.html` (auth handler)
- ☐ `tasks.html` (main app)
- ☐ `styles.css` (login styles)
- ☐ `task-styles.css` (app styles)

All should be uploaded to S3!

---

## 🎯 Configuration Values Template

Fill this out as you go:

```
=== COGNITO CONFIGURATION ===
User Pool ID: _________________________
App Client ID: ________________________
Cognito Domain: _______________________
Region: _______________________________

=== S3 CONFIGURATION ===
Bucket Name: __________________________
S3 Website URL: _______________________

=== HOSTED UI URLS ===
Login URL: ____________________________
Callback URL: _________________________
Sign-out URL: _________________________
```

---

## 📞 Need Help?

1. ✅ Check main guide: `ACTIVITY-2-S3-FRONTEND-DEPLOYMENT.md`
2. ✅ Review troubleshooting section
3. ✅ Check browser console for errors (F12)
4. ✅ Verify all configuration values are correct
5. ✅ Ask instructor/TA with specific error messages

---

**Pro Tips:**

- 💡 Keep AWS Console and this checklist side-by-side
- 💡 Take notes of all IDs and URLs as you create them
- 💡 Test each phase before moving to next
- 💡 Use browser incognito mode for clean testing
- 💡 Save screenshots with descriptive names

---

**Good luck! 🚀**
