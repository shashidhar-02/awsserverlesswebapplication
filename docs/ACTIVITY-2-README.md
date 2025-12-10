# Activity 2: Frontend + S3 Deployment - Documentation Index

## 📚 Available Documentation

This folder contains comprehensive documentation for Activity 2: Frontend + S3 Deployment.

---

## 📄 Document Overview

### 1. **ACTIVITY-2-S3-FRONTEND-DEPLOYMENT.md** (Main Guide)
**Purpose:** Complete step-by-step manual setup guide  
**Audience:** Beginners  
**Time to Complete:** ~1.5-2 hours  
**Pages:** ~50 pages

**What's Included:**
- ✅ Detailed AWS Cognito Hosted UI setup
- ✅ Complete frontend file code (HTML, CSS, JavaScript)
- ✅ S3 bucket creation and configuration
- ✅ Static website hosting setup
- ✅ Authentication flow explanation
- ✅ Comprehensive troubleshooting guide
- ✅ Understanding S3 hosting concepts
- ✅ Security best practices

**When to Use:**
- First time setting up S3 + Cognito Hosted UI
- Need detailed explanations of each step
- Want to understand the "why" behind each action
- Troubleshooting issues

---

### 2. **ACTIVITY-2-QUICKSTART-CHECKLIST.md** (Quick Reference)
**Purpose:** Fast-track checklist for Activity 2  
**Audience:** Users who need quick reference  
**Time to Complete:** ~1-1.5 hours  
**Pages:** ~15 pages

**What's Included:**
- ✅ 55-point step-by-step checklist
- ✅ Quick configuration reference
- ✅ Time estimates for each phase
- ✅ Quick troubleshooting tips
- ✅ Configuration values template
- ✅ Files checklist

**When to Use:**
- Already familiar with AWS Console
- Need quick task tracking
- Want to work efficiently
- Use alongside main guide as checklist

---

### 3. **ACTIVITY-2-SUBMISSION-TEMPLATE.md** (Submission Guide)
**Purpose:** Template and guidelines for assignment submission  
**Audience:** Students preparing submission  
**Time to Complete:** ~30 minutes  
**Pages:** ~30 pages

**What's Included:**
- ✅ Complete submission document template
- ✅ Screenshot requirements and specifications
- ✅ Explanation note template and examples
- ✅ Grading criteria breakdown
- ✅ File naming conventions
- ✅ Common mistakes to avoid
- ✅ Academic integrity guidelines

**When to Use:**
- Preparing final submission
- Understanding submission requirements
- Checking what's needed before submission
- Creating professional documentation

---

## 🚀 Getting Started

### For First-Time Users

**Recommended Workflow:**

1. **Read Main Guide First** (`ACTIVITY-2-S3-FRONTEND-DEPLOYMENT.md`)
   - Understand concepts
   - Learn AWS services involved
   - Review architecture

2. **Use Checklist While Working** (`ACTIVITY-2-QUICKSTART-CHECKLIST.md`)
   - Track progress
   - Don't miss any steps
   - Stay organized

3. **Prepare Submission** (`ACTIVITY-2-SUBMISSION-TEMPLATE.md`)
   - Use template
   - Follow guidelines
   - Submit professionally

---

### For Experienced Users

**Fast Track:**

1. **Skim Main Guide** for AWS commands and code snippets
2. **Follow Checklist** to complete setup quickly
3. **Use Submission Template** for documentation

---

## 📋 Prerequisites

Before starting Activity 2, ensure you have:

### Completed
- ✅ **Activity 1** (DynamoDB + Cognito User Pool setup)
- ✅ **Step 1**: DynamoDB table created
- ✅ **Step 2**: Cognito User Pool configured

### Ready
- ✅ User Pool ID
- ✅ App Client ID
- ✅ AWS Region noted
- ✅ Test user created (optional but recommended)

### Tools
- ✅ AWS Console access
- ✅ Text editor (VS Code, Notepad++, etc.)
- ✅ Web browser (Chrome, Firefox, Edge)
- ✅ Screenshot tool

---

## 🎯 Activity 2 Objectives

By completing this activity, you will:

### Build
1. ✅ Simple HTML/CSS/JavaScript frontend for Task Tracker
2. ✅ Responsive login interface
3. ✅ Authentication callback handler
4. ✅ Tasks management interface

### Deploy
1. ✅ Create S3 bucket
2. ✅ Configure static website hosting
3. ✅ Set up bucket policies
4. ✅ Upload frontend files

### Configure
1. ✅ Enable Cognito Hosted UI
2. ✅ Set up OAuth 2.0 flows
3. ✅ Configure callback URLs
4. ✅ Implement redirect-based authentication

### Submit
1. ✅ S3 website URL
2. ✅ 3 screenshots (login, Cognito UI, tasks page)
3. ✅ 200-300 word explanation of S3 hosting

---

## 📁 Frontend Files Structure

After completing Activity 2, your frontend folder will contain:

```
frontend/
├── index.html          # Login page (updated for Cognito Hosted UI)
├── callback.html       # Authentication callback handler (NEW)
├── tasks.html          # Main application (updated with auth check)
├── styles.css          # Login page styles (NEW/UPDATED)
├── task-styles.css     # Tasks page styles
├── app.js              # (Not used in Activity 2)
└── task-app.js         # (Not used in Activity 2)
```

### Files to Update/Create

**Update These:**
- ☐ `index.html` - Change to Cognito Hosted UI login
- ☐ `tasks.html` - Add authentication check

**Create These:**
- ☐ `callback.html` - NEW file for OAuth callback
- ☐ `styles.css` - NEW styles for login page (or update existing)
- ☐ `task-styles.css` - Ensure this exists for tasks page

---

## 🔧 Configuration Values You'll Need

### From Activity 1 (Cognito)
```
User Pool ID: us-east-1_XXXXXXXXX
App Client ID: 5a6b7c8d9e0f1g2h3i4j5k6l7m
Region: us-east-1
```

### New in Activity 2 (Cognito Hosted UI)
```
Cognito Domain: tasktracker-yourname-12345
Hosted UI URL: https://tasktracker-yourname-12345.auth.us-east-1.amazoncognito.com
```

### New in Activity 2 (S3)
```
Bucket Name: tasktracker-frontend-yourname-12345
S3 Website URL: http://tasktracker-frontend-yourname-12345.s3-website-us-east-1.amazonaws.com
```

---

## ⏱️ Time Estimates

| Phase | Task | Time |
|-------|------|------|
| **Phase 1** | Configure Cognito Hosted UI | 15 min |
| **Phase 2** | Prepare Frontend Files | 20 min |
| **Phase 3** | Create S3 Bucket | 10 min |
| **Phase 4** | Upload Files | 5 min |
| **Phase 5** | Enable Static Hosting | 5 min |
| **Phase 6** | Configure Bucket Policy | 5 min |
| **Phase 7** | Update Cognito URLs | 5 min |
| **Phase 8** | Test Website | 10 min |
| **Phase 9** | Capture Screenshots | 5 min |
| **Phase 10** | Write Explanation | 15 min |
| **Phase 11** | Prepare Submission | 10 min |
| **Total** | | **~1.5-2 hours** |

---

## ✅ Success Criteria

Your Activity 2 is complete when:

### Technical
- ✅ S3 bucket created and configured correctly
- ✅ Static website hosting enabled
- ✅ Bucket policy allows public read access
- ✅ All frontend files uploaded to S3
- ✅ Cognito Hosted UI domain created
- ✅ OAuth flows configured properly
- ✅ Callback URLs match S3 URL

### Functional
- ✅ S3 website URL accessible in browser
- ✅ Login page loads with proper styling
- ✅ "Sign In with Cognito" redirects to Cognito UI
- ✅ Can login with test credentials
- ✅ Redirects to tasks page after login
- ✅ User email displays on tasks page
- ✅ Logout button works

### Documentation
- ✅ All 3 screenshots captured and labeled
- ✅ Explanation note written (200-300 words)
- ✅ Submission document formatted professionally
- ✅ S3 URL verified working before submission

---

## 🔍 Troubleshooting Quick Reference

### Common Issues

**"403 Forbidden" on S3 URL**
→ Check bucket policy, verify public access unblocked

**"Invalid redirect_uri" in Cognito**
→ Verify callback URL in Cognito matches S3 URL exactly

**Blank page after login**
→ Open browser console (F12), check JavaScript errors

**CSS not loading**
→ Verify CSS files uploaded, check file names match

**Can't create bucket**
→ Bucket names are globally unique, try different name

---

## 📞 Getting Help

### Documentation Resources
1. Read relevant section in main guide
2. Check troubleshooting section
3. Review example screenshots/code

### Technical Support
1. Check browser console for errors (F12)
2. Verify all configuration values
3. Test in incognito/private window
4. Ask instructor/TA with specific error messages

### AWS Resources
- [S3 Static Website Hosting Docs](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Cognito Hosted UI Docs](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-app-integration.html)
- [OAuth 2.0 Guide](https://oauth.net/2/)

---

## 💡 Pro Tips

### Before Starting
- ✅ Read all documentation first
- ✅ Have all prerequisite information ready
- ✅ Set aside uninterrupted time (1.5-2 hours)
- ✅ Keep AWS Console and guides side-by-side

### During Work
- ✅ Follow steps in exact order
- ✅ Test after each major phase
- ✅ Take notes of all IDs and URLs
- ✅ Save configuration values immediately
- ✅ Check browser console for errors

### For Screenshots
- ✅ Take screenshots as you go
- ✅ Show full browser window with URL bar
- ✅ Ensure text is clear and readable
- ✅ Save with descriptive file names

### For Submission
- ✅ Write explanation in your own words
- ✅ Proofread before submitting
- ✅ Verify S3 URL works in different browser
- ✅ Submit before deadline with time buffer

---

## 📊 Grading Overview

| Component | Points | Key Requirements |
|-----------|--------|------------------|
| **S3 Website URL** | 20 | Working, accessible, functional |
| **Screenshots** | 30 | All 3 present, clear, complete |
| **Explanation** | 30 | 200-300 words, accurate, clear |
| **Implementation** | 20 | Correct configuration, working auth |
| **Total** | **100** | |

---

## 🎓 Learning Outcomes

After completing Activity 2, you will understand:

### Technical Skills
- ✅ S3 static website hosting
- ✅ Bucket policies and public access
- ✅ OAuth 2.0 authentication flows
- ✅ Cognito Hosted UI configuration
- ✅ JWT token handling
- ✅ Frontend-backend integration

### Cloud Concepts
- ✅ Serverless architecture
- ✅ Cloud storage services
- ✅ Identity and access management
- ✅ Static vs dynamic content
- ✅ Cost-effective hosting solutions

### Practical Experience
- ✅ AWS Console navigation
- ✅ Cloud resource configuration
- ✅ Debugging cloud applications
- ✅ Professional documentation

---

## 🔄 Next Steps

After completing Activity 2:

### Immediate
1. ✅ Test thoroughly in multiple browsers
2. ✅ Verify all submission requirements met
3. ✅ Submit assignment

### Future Activities
- **Activity 3**: API Gateway + Lambda integration
- **Activity 4**: Connecting frontend to backend APIs
- **Activity 5**: Full application deployment

### Optional Enhancements
- Add custom domain with Route 53
- Enable HTTPS with CloudFront
- Implement social login
- Add password reset functionality
- Improve UI/UX design

---

## 📝 Quick Start Commands

### Test Locally (Optional)
```powershell
cd frontend
python -m http.server 8000
```
Open: http://localhost:8000

### Verify Files Before Upload
```powershell
ls frontend | Select-Object Name
```

Should show:
- index.html
- callback.html
- tasks.html
- styles.css
- task-styles.css

---

## ✨ Document Version Information

**Last Updated:** December 2025  
**Version:** 1.0  
**Compatible With:**
- AWS Free Tier
- Cognito User Pools
- S3 Static Website Hosting
- OAuth 2.0 Authorization Code Flow

**Tested On:**
- Windows 10/11
- macOS
- Chrome, Firefox, Edge browsers

---

## 📖 Additional Resources

### Video Tutorials (Recommended)
- AWS S3 Static Website Hosting Tutorial
- Cognito Hosted UI Setup Guide
- OAuth 2.0 Flow Explanation

### Reading Materials
- AWS Documentation (linked in guides)
- OAuth 2.0 Specification
- JWT Token Structure

### Community Support
- AWS re:Post Forum
- Stack Overflow (aws-s3, amazon-cognito tags)
- Course discussion board

---

## 📧 Feedback

Found an issue in the documentation? Have suggestions for improvement?

- Report issues to your instructor
- Suggest improvements for next semester
- Help classmates in discussion forums

---

**Good luck with Activity 2! 🚀**

Remember: Take your time, follow the steps carefully, and don't hesitate to ask for help when needed.

---

**Quick Navigation:**
- [Main Guide →](ACTIVITY-2-S3-FRONTEND-DEPLOYMENT.md)
- [Checklist →](ACTIVITY-2-QUICKSTART-CHECKLIST.md)
- [Submission Template →](ACTIVITY-2-SUBMISSION-TEMPLATE.md)
