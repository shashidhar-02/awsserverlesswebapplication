# Activity 2: Submission Template & Guidelines

## 📄 Submission Document Template

Use this template to create your Activity 2 submission document.

---

# Activity 2: Frontend + S3 Deployment

**Student Name:** [Your Name]  
**Date:** [Submission Date]  
**Course:** [Course Code/Name]  
**Instructor:** [Instructor Name]

---

## Part 1: S3 Website URL

### Website URL

```
[Paste your S3 website URL here]

Example:
http://tasktracker-frontend-john-12345.s3-website-us-east-1.amazonaws.com
```

### Verification

- ✅ URL is publicly accessible
- ✅ Login page loads correctly
- ✅ Authentication flow works
- ✅ Tasks page accessible after login

---

## Part 2: Screenshots

### Screenshot 1: S3 Hosted Login Page

**Description:** Login page hosted on Amazon S3 showing the Task Tracker interface

![Screenshot 1 - S3 Login Page](screenshot1.png)

**What to show:**
- Full browser window
- S3 URL visible in address bar
- Complete login interface
- "Sign In with Cognito" button
- Test credentials box

---

### Screenshot 2: Cognito Hosted UI

**Description:** Amazon Cognito Hosted UI authentication page

![Screenshot 2 - Cognito Hosted UI](screenshot2.png)

**What to show:**
- Cognito authentication page
- URL showing `amazoncognito.com`
- Login form (email and password fields)
- Cognito branding

---

### Screenshot 3: Authenticated Tasks Page

**Description:** Task Tracker application after successful authentication

![Screenshot 3 - Tasks Page](screenshot3.png)

**What to show:**
- Tasks interface
- User email displayed in header
- S3 URL in address bar
- Task input field and buttons
- Logout button

---

## Part 3: Explanation - How S3 Static Website Hosting Works

### Introduction to S3 Static Website Hosting

[Write your explanation here - 200-300 words]

**Suggested structure:**

**Paragraph 1: What is S3 Static Website Hosting?**
- Define S3 and its role in AWS
- Explain static vs dynamic websites
- How S3 serves web content

**Paragraph 2: How It Works in This Project**
- Bucket configuration
- Public access and bucket policies
- File storage and delivery process
- Website endpoint functionality

**Paragraph 3: Authentication Flow**
- How Cognito Hosted UI works
- Redirect-based authentication process
- Token storage and usage
- Integration between S3 frontend and Cognito

**Paragraph 4: Benefits and Observations**
- Cost-effectiveness
- Scalability
- No server management
- Your personal experience/challenges

---

### Example Explanation (Use as Reference)

Amazon S3 (Simple Storage Service) is AWS's object storage service that can also host static websites. Static websites consist of fixed HTML, CSS, and JavaScript files that don't require server-side processing. In my Task Tracker project, S3 serves as the hosting platform for the frontend application.

When a user accesses the S3 website URL, Amazon S3 serves the HTML files directly from the bucket. The bucket is configured with a public access policy that allows anyone to read (GET) the files, making the website publicly accessible. The static website hosting feature enables S3 to treat index.html as the default landing page and handle routing appropriately.

The authentication flow uses AWS Cognito Hosted UI with OAuth 2.0 redirect-based authentication. When users click "Sign In," they're redirected to Cognito's hosted login page. After successful authentication, Cognito redirects back to the callback.html page with an authorization code. JavaScript in the callback page exchanges this code for JWT tokens (ID token, access token, refresh token) and stores them in the browser's session storage. These tokens are then used to authenticate API requests.

The main benefits I observed include zero server management, automatic scalability, and cost-effectiveness (pennies per month for small applications). The deployment process was straightforward—simply upload files and configure bucket settings. One challenge was understanding the OAuth flow, but the redirect mechanism ensures secure authentication without exposing credentials. Overall, S3 static hosting provides an excellent solution for frontend applications that rely on APIs for dynamic functionality.

---

## Part 4: Configuration Summary

### AWS Resources Created

| Resource | Name/ID | Region |
|----------|---------|--------|
| **S3 Bucket** | [Your bucket name] | [Your region] |
| **User Pool** | TaskTrackerUserPool | [Your region] |
| **App Client** | TaskTrackerAppClient | [Your region] |
| **Cognito Domain** | [Your domain prefix] | [Your region] |

### Configuration Values Used

```
=== COGNITO CONFIGURATION ===
User Pool ID: [Your User Pool ID]
App Client ID: [Your Client ID]
Cognito Domain: [Your domain URL]
Region: [Your AWS region]

=== S3 CONFIGURATION ===
Bucket Name: [Your bucket name]
S3 Website URL: [Your S3 website URL]
Bucket Policy: Public read access enabled

=== HOSTED UI CONFIGURATION ===
Callback URL: [S3 URL]/callback.html
Sign-out URL: [S3 URL]/index.html
OAuth Flows: Authorization code grant, Implicit grant
OAuth Scopes: openid, email, profile
```

---

## Part 5: Testing Results

### Test Cases Performed

1. **✅ Website Accessibility**
   - Accessed S3 URL from browser
   - Login page loaded successfully
   - All CSS styles applied correctly

2. **✅ Cognito Authentication**
   - Clicked "Sign In with Cognito" button
   - Redirected to Cognito Hosted UI
   - Entered test credentials
   - Successfully authenticated

3. **✅ Post-Authentication**
   - Redirected to callback.html
   - Token exchange completed
   - Redirected to tasks.html
   - User email displayed correctly

4. **✅ Task Management (Local)**
   - Added sample tasks
   - Tasks displayed in interface
   - Delete functionality worked

5. **✅ Logout Functionality**
   - Clicked logout button
   - Session cleared
   - Redirected to login page

### Browser Compatibility

Tested on:
- ☐ Google Chrome (Version: ___)
- ☐ Mozilla Firefox (Version: ___)
- ☐ Microsoft Edge (Version: ___)
- ☐ Mobile browser (Device: ___)

---

## Part 6: Challenges and Solutions

### Challenges Encountered

**Challenge 1:** [Describe a challenge you faced]
- **Issue:** [What went wrong]
- **Solution:** [How you resolved it]
- **Learning:** [What you learned]

**Challenge 2:** [Another challenge]
- **Issue:** [What went wrong]
- **Solution:** [How you resolved it]
- **Learning:** [What you learned]

**Example:**
- **Issue:** Cognito showed "Invalid redirect_uri" error
- **Solution:** Updated the callback URL in Cognito to exactly match the S3 URL with /callback.html
- **Learning:** OAuth redirect URLs must match exactly, including protocol (http/https) and path

---

## Part 7: Key Learnings

### Technical Skills Gained

1. **Amazon S3**
   - Creating and configuring S3 buckets
   - Setting up static website hosting
   - Managing bucket policies for public access
   - Understanding S3 website endpoints

2. **AWS Cognito**
   - Configuring Hosted UI
   - Understanding OAuth 2.0 flows
   - Working with JWT tokens
   - Implementing redirect-based authentication

3. **Frontend Development**
   - Building responsive web interfaces
   - Handling authentication in JavaScript
   - Working with session storage
   - Parsing and using JWT tokens

4. **Cloud Deployment**
   - Deploying static websites to the cloud
   - Managing cloud resources
   - Understanding serverless architecture
   - Cost-effective hosting solutions

---

## Part 8: Future Enhancements

### Potential Improvements

1. **HTTPS Support**
   - Configure CloudFront distribution
   - Add SSL certificate
   - Enable secure connections

2. **Custom Domain**
   - Register domain with Route 53
   - Configure DNS records
   - Professional branding

3. **Enhanced UI**
   - Add animations and transitions
   - Improve responsive design
   - Add dark mode theme

4. **Advanced Features**
   - Remember me functionality
   - Social login integration
   - Multi-language support

---

## Part 9: References

### Documentation Used

1. [AWS S3 Static Website Hosting Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
2. [Amazon Cognito Hosted UI Documentation](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html)
3. [OAuth 2.0 Authorization Framework](https://oauth.net/2/)
4. Course materials and guides provided

### Tools Used

- AWS Management Console
- Text Editor: [VS Code / Notepad++ / etc.]
- Browser Developer Tools
- Screenshot Tool: [Name of tool]

---

## Appendix: Code Snippets

### Bucket Policy Used

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

### JavaScript Configuration (index.html)

```javascript
const config = {
    cognitoDomain: 'https://YOUR-DOMAIN.auth.REGION.amazoncognito.com',
    clientId: 'YOUR_CLIENT_ID',
    redirectUri: window.location.origin + '/callback.html',
    responseType: 'code'
};
```

---

## Certification

I certify that:
- ✅ All work submitted is my own
- ✅ All resources and references are properly cited
- ✅ The S3 URL provided is functional and accessible
- ✅ Screenshots are authentic and unedited (except for annotations)
- ✅ Configuration values have been properly sanitized (if required)

**Student Signature:** ___________________  
**Date:** ___________________

---

## Submission Checklist

Before submitting, verify:

- ☐ Document is properly formatted (PDF/Word)
- ☐ All sections are completed
- ☐ S3 URL is copy-pasteable and working
- ☐ All 3 screenshots are included and labeled
- ☐ Screenshots show required information
- ☐ Explanation is 200-300 words
- ☐ Configuration summary is filled out
- ☐ Document is proofread for spelling/grammar
- ☐ File name follows submission guidelines
- ☐ All personal/sensitive information redacted if required

---

**End of Submission Document**

---

# 📊 Submission Guidelines

## File Naming Convention

```
Activity2_FirstnameLastname_Date.pdf

Example:
Activity2_JohnDoe_20231210.pdf
```

## Document Format

- **Preferred:** PDF (ensures consistent formatting)
- **Alternative:** Microsoft Word (.docx)
- **Maximum file size:** 10 MB
- **Screenshot format:** PNG or JPEG (embedded in document)

## Screenshot Requirements

### Technical Specifications
- **Resolution:** Minimum 1280x720 pixels
- **Format:** PNG (preferred) or JPEG
- **Quality:** High resolution, clear text
- **Content:** Full browser window showing URL bar

### What to Include
1. **Screenshot 1:** S3 login page
   - Full browser window
   - S3 URL clearly visible
   - Complete interface visible

2. **Screenshot 2:** Cognito Hosted UI
   - Authentication page
   - Cognito domain visible
   - Login form clear

3. **Screenshot 3:** Tasks page after login
   - Authenticated interface
   - User email visible
   - S3 URL in address bar

### What NOT to Include
- ❌ Personal information (unless required)
- ❌ AWS account numbers (redact if visible)
- ❌ Sensitive configuration data
- ❌ Browser bookmarks/history
- ❌ Desktop background (crop if needed)

## Explanation Note Requirements

### Length
- **Minimum:** 200 words
- **Maximum:** 300 words
- **Optimal:** 250 words

### Content Requirements
Must cover:
1. ✅ What S3 static website hosting is
2. ✅ How it works (technical explanation)
3. ✅ Authentication flow with Cognito
4. ✅ Benefits observed
5. ✅ Personal experience/reflections

### Writing Style
- Clear and concise
- Technical but accessible
- First-person perspective acceptable
- Professional tone
- Proper grammar and spelling

## Grading Criteria

### S3 Website URL (20 points)
- ✅ URL is valid and accessible (10 pts)
- ✅ Website loads correctly (5 pts)
- ✅ All functionality works (5 pts)

### Screenshots (30 points)
- ✅ All 3 screenshots provided (15 pts)
- ✅ Screenshots show required content (10 pts)
- ✅ Screenshots are clear and professional (5 pts)

### Explanation (30 points)
- ✅ Technical accuracy (10 pts)
- ✅ Completeness (covers all topics) (10 pts)
- ✅ Clarity and writing quality (10 pts)

### Implementation (20 points)
- ✅ Correct S3 configuration (5 pts)
- ✅ Proper bucket policy (5 pts)
- ✅ Working authentication flow (5 pts)
- ✅ Professional presentation (5 pts)

**Total: 100 points**

---

## Common Mistakes to Avoid

### Technical Mistakes
- ❌ S3 URL not publicly accessible
- ❌ Bucket policy missing or incorrect
- ❌ Cognito callback URLs not updated
- ❌ JavaScript configuration errors
- ❌ CSS files not uploaded

### Documentation Mistakes
- ❌ Missing screenshots
- ❌ Low-quality or unclear screenshots
- ❌ Explanation too short or off-topic
- ❌ Typos and grammatical errors
- ❌ Missing configuration details
- ❌ Incorrect file naming

### Submission Mistakes
- ❌ Submitting after deadline
- ❌ Wrong file format
- ❌ Broken or incorrect URL
- ❌ Plagiarized content
- ❌ Missing student information

---

## Tips for Success

### Before Starting
- ✅ Read all documentation thoroughly
- ✅ Watch tutorial videos if available
- ✅ Set up AWS account properly
- ✅ Have all prerequisite information ready

### During Implementation
- ✅ Follow steps in order
- ✅ Test after each major phase
- ✅ Take notes of all IDs and URLs
- ✅ Save configuration values
- ✅ Check console for errors

### For Documentation
- ✅ Take screenshots as you go
- ✅ Write explanation in own words
- ✅ Proofread before submitting
- ✅ Verify all links work
- ✅ Check file size and format

### Final Verification
- ✅ Test S3 URL in incognito mode
- ✅ Test on different browser
- ✅ Verify all screenshots are included
- ✅ Check word count on explanation
- ✅ Submit with time to spare

---

## Late Submission Policy

Check with your instructor for:
- Late submission penalties
- Extension request procedures
- Technical issue reporting
- Resubmission policies

---

## Academic Integrity

### Acceptable
- ✅ Using provided guides and documentation
- ✅ Consulting AWS documentation
- ✅ Asking instructor/TA for help
- ✅ Working through problems with classmates
- ✅ Using online resources for understanding concepts

### Not Acceptable
- ❌ Copying another student's submission
- ❌ Sharing your submission with others
- ❌ Using someone else's AWS resources
- ❌ Plagiarizing explanation text
- ❌ Submitting fake screenshots

---

## Support and Resources

### If You Need Help

1. **Technical Issues:**
   - Check troubleshooting guide
   - Review error messages in browser console
   - Verify all configuration values

2. **Documentation Questions:**
   - Re-read relevant sections
   - Check example templates
   - Review rubric/requirements

3. **AWS Issues:**
   - Check AWS service status
   - Verify free tier limits
   - Review IAM permissions

4. **Getting Assistance:**
   - Email instructor with specific error messages
   - Attend office hours
   - Post in course discussion forum (without sharing answers)
   - Use official AWS support (if available)

---

**Good luck with your submission! 🎉**

Remember: Quality over speed. Take time to understand concepts and create thorough documentation.
