# AWS Serverless Task Tracker - Deployment Script
# This script helps deploy frontend files to S3 and update configuration

param(
    [Parameter(Mandatory=$false)]
    [string]$BucketName,
    
    [Parameter(Mandatory=$false)]
    [string]$UserPoolId,
    
    [Parameter(Mandatory=$false)]
    [string]$ClientId,
    
    [Parameter(Mandatory=$false)]
    [string]$CognitoDomain,
    
    [Parameter(Mandatory=$false)]
    [string]$ApiEndpoint,
    
    [Parameter(Mandatory=$false)]
    [switch]$UploadOnly,
    
    [Parameter(Mandatory=$false)]
    [switch]$Help
)

# Color output functions
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

function Show-Help {
    Write-ColorOutput "`n=== AWS Serverless Task Tracker - Deployment Script ===" "Cyan"
    Write-ColorOutput "`nThis script helps you deploy and configure your serverless task tracker.`n" "White"
    
    Write-ColorOutput "USAGE:" "Yellow"
    Write-ColorOutput "  .\deploy.ps1 -BucketName <name> [options]`n" "White"
    
    Write-ColorOutput "PARAMETERS:" "Yellow"
    Write-ColorOutput "  -BucketName      Your S3 bucket name (required for upload)" "White"
    Write-ColorOutput "  -UserPoolId      Cognito User Pool ID (e.g., us-east-1_XXXXXXXXX)" "White"
    Write-ColorOutput "  -ClientId        Cognito App Client ID" "White"
    Write-ColorOutput "  -CognitoDomain   Cognito Domain URL" "White"
    Write-ColorOutput "  -ApiEndpoint     API Gateway Invoke URL" "White"
    Write-ColorOutput "  -UploadOnly      Only upload files, skip configuration" "White"
    Write-ColorOutput "  -Help            Show this help message`n" "White"
    
    Write-ColorOutput "EXAMPLES:" "Yellow"
    Write-ColorOutput "  # Configure and upload" "Gray"
    Write-ColorOutput "  .\deploy.ps1 -BucketName taskfrontend2291 -UserPoolId us-east-1_abc123 -ClientId xyz789 -CognitoDomain https://mydomain.auth.us-east-1.amazoncognito.com -ApiEndpoint https://api123.execute-api.us-east-1.amazonaws.com/prod`n" "White"
    
    Write-ColorOutput "  # Only upload files (configuration already done)" "Gray"
    Write-ColorOutput "  .\deploy.ps1 -BucketName taskfrontend2291 -UploadOnly`n" "White"
    
    Write-ColorOutput "BEFORE RUNNING:" "Yellow"
    Write-ColorOutput "  1. Complete AWS setup (DynamoDB, Cognito, Lambda, API Gateway)" "White"
    Write-ColorOutput "  2. Install and configure AWS CLI" "White"
    Write-ColorOutput "  3. Ensure you have correct permissions" "White"
    Write-ColorOutput "  4. Read COMPLETE-SETUP-MANUAL.md for detailed instructions`n" "White"
}

# Show help if requested
if ($Help) {
    Show-Help
    exit 0
}

# Banner
Write-ColorOutput "`n╔════════════════════════════════════════════════════════╗" "Cyan"
Write-ColorOutput "║   AWS Serverless Task Tracker - Deployment Script    ║" "Cyan"
Write-ColorOutput "╚════════════════════════════════════════════════════════╝`n" "Cyan"

# Check if AWS CLI is installed
Write-ColorOutput "[1/6] Checking AWS CLI installation..." "Yellow"
try {
    $awsVersion = aws --version 2>&1
    Write-ColorOutput "✓ AWS CLI found: $awsVersion" "Green"
} catch {
    Write-ColorOutput "✗ AWS CLI not found. Please install AWS CLI first." "Red"
    Write-ColorOutput "  Download from: https://aws.amazon.com/cli/" "Yellow"
    exit 1
}

# Check AWS credentials
Write-ColorOutput "`n[2/6] Checking AWS credentials..." "Yellow"
try {
    $identity = aws sts get-caller-identity 2>&1
    if ($LASTEXITCODE -eq 0) {
        $identityObj = $identity | ConvertFrom-Json
        Write-ColorOutput "✓ AWS credentials configured" "Green"
        Write-ColorOutput "  Account: $($identityObj.Account)" "Gray"
        Write-ColorOutput "  User: $($identityObj.Arn)" "Gray"
    } else {
        throw "Not configured"
    }
} catch {
    Write-ColorOutput "✗ AWS credentials not configured. Run 'aws configure' first." "Red"
    exit 1
}

# Check if frontend directory exists
Write-ColorOutput "`n[3/6] Checking frontend files..." "Yellow"
if (-not (Test-Path ".\frontend")) {
    Write-ColorOutput "✗ Frontend directory not found. Please run from project root." "Red"
    exit 1
}

$requiredFiles = @("index.html", "tasks.html", "task-app.js", "task-styles.css")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path ".\frontend\$file")) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-ColorOutput "✗ Missing required files:" "Red"
    foreach ($file in $missingFiles) {
        Write-ColorOutput "  - $file" "Red"
    }
    exit 1
}

Write-ColorOutput "✓ All required frontend files found" "Green"

# Update configuration if not upload-only mode
if (-not $UploadOnly) {
    Write-ColorOutput "`n[4/6] Updating configuration files..." "Yellow"
    
    # Prompt for values if not provided
    if (-not $UserPoolId) {
        $UserPoolId = Read-Host "Enter Cognito User Pool ID (e.g., us-east-1_XXXXXXXXX)"
    }
    
    if (-not $ClientId) {
        $ClientId = Read-Host "Enter Cognito App Client ID"
    }
    
    if (-not $CognitoDomain) {
        $CognitoDomain = Read-Host "Enter Cognito Domain (e.g., https://mydomain.auth.us-east-1.amazoncognito.com)"
    }
    
    if (-not $ApiEndpoint) {
        $ApiEndpoint = Read-Host "Enter API Gateway Endpoint (e.g., https://api123.execute-api.us-east-1.amazonaws.com/prod)"
    }
    
    if (-not $BucketName) {
        $BucketName = Read-Host "Enter S3 Bucket Name"
    }
    
    # Construct S3 website URL
    $S3WebsiteUrl = "http://$BucketName.s3-website-us-east-1.amazonaws.com/"
    
    Write-ColorOutput "  Updating task-app.js..." "Gray"
    $taskAppContent = Get-Content ".\frontend\task-app.js" -Raw
    $taskAppContent = $taskAppContent -replace "userPoolId: 'YOUR_USER_POOL_ID'", "userPoolId: '$UserPoolId'"
    $taskAppContent = $taskAppContent -replace "userPoolId: 'us-east-1_[a-zA-Z0-9]+'", "userPoolId: '$UserPoolId'"
    $taskAppContent = $taskAppContent -replace "clientId: 'YOUR_APP_CLIENT_ID'", "clientId: '$ClientId'"
    $taskAppContent = $taskAppContent -replace "clientId: '[a-zA-Z0-9]+'", "clientId: '$ClientId'"
    $taskAppContent = $taskAppContent -replace "apiEndpoint: 'YOUR_API_GATEWAY_URL'", "apiEndpoint: '$ApiEndpoint'"
    $taskAppContent = $taskAppContent -replace "apiEndpoint: 'https://[a-zA-Z0-9\-\.]+\.amazonaws\.com/prod'", "apiEndpoint: '$ApiEndpoint'"
    Set-Content ".\frontend\task-app.js" -Value $taskAppContent
    
    Write-ColorOutput "  Updating index.html..." "Gray"
    $indexContent = Get-Content ".\frontend\index.html" -Raw
    $indexContent = $indexContent -replace 'const COGNITO_DOMAIN = "YOUR_COGNITO_DOMAIN"', "const COGNITO_DOMAIN = `"$CognitoDomain`""
    $indexContent = $indexContent -replace 'const COGNITO_DOMAIN = "https://[a-zA-Z0-9\-]+\.auth\.[a-z0-9\-]+\.amazoncognito\.com"', "const COGNITO_DOMAIN = `"$CognitoDomain`""
    $indexContent = $indexContent -replace 'const CLIENT_ID = "YOUR_APP_CLIENT_ID"', "const CLIENT_ID = `"$ClientId`""
    $indexContent = $indexContent -replace 'const CLIENT_ID = "[a-zA-Z0-9]+"', "const CLIENT_ID = `"$ClientId`""
    $indexContent = $indexContent -replace 'const REDIRECT_URI = "YOUR_S3_WEBSITE_URL"', "const REDIRECT_URI = `"$S3WebsiteUrl`""
    $indexContent = $indexContent -replace 'const REDIRECT_URI = "http://[a-zA-Z0-9\-]+\.s3-website-[a-z0-9\-]+\.amazonaws\.com/"', "const REDIRECT_URI = `"$S3WebsiteUrl`""
    Set-Content ".\frontend\index.html" -Value $indexContent
    
    Write-ColorOutput "✓ Configuration files updated" "Green"
    Write-ColorOutput "  User Pool ID: $UserPoolId" "Gray"
    Write-ColorOutput "  Client ID: $ClientId" "Gray"
    Write-ColorOutput "  Cognito Domain: $CognitoDomain" "Gray"
    Write-ColorOutput "  API Endpoint: $ApiEndpoint" "Gray"
    Write-ColorOutput "  S3 Website URL: $S3WebsiteUrl" "Gray"
} else {
    Write-ColorOutput "`n[4/6] Skipping configuration update (UploadOnly mode)" "Yellow"
    
    if (-not $BucketName) {
        $BucketName = Read-Host "Enter S3 Bucket Name"
    }
}

# Verify bucket exists
Write-ColorOutput "`n[5/6] Verifying S3 bucket..." "Yellow"
try {
    aws s3 ls "s3://$BucketName" 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ S3 bucket exists: $BucketName" "Green"
    } else {
        Write-ColorOutput "✗ S3 bucket not found: $BucketName" "Red"
        Write-ColorOutput "  Please create the bucket first or check the name." "Yellow"
        exit 1
    }
} catch {
    Write-ColorOutput "✗ Error accessing S3 bucket: $BucketName" "Red"
    exit 1
}

# Upload files to S3
Write-ColorOutput "`n[6/6] Uploading files to S3..." "Yellow"
try {
    Write-ColorOutput "  Syncing frontend directory to s3://$BucketName/" "Gray"
    
    # Upload with proper content types
    aws s3 sync .\frontend\ "s3://$BucketName/" `
        --exclude "*.md" `
        --exclude ".git/*" `
        --exclude "*.ps1" `
        --exclude "DEPLOYMENT.md" `
        --exclude "start-server.ps1" `
        --cache-control "max-age=3600" `
        --metadata-directive REPLACE
    
    if ($LASTEXITCODE -eq 0) {
        Write-ColorOutput "✓ Files uploaded successfully" "Green"
    } else {
        Write-ColorOutput "✗ Error uploading files" "Red"
        exit 1
    }
    
    # Set correct content types for specific files
    Write-ColorOutput "  Setting content types..." "Gray"
    aws s3 cp "s3://$BucketName/index.html" "s3://$BucketName/index.html" --content-type "text/html" --metadata-directive REPLACE | Out-Null
    aws s3 cp "s3://$BucketName/tasks.html" "s3://$BucketName/tasks.html" --content-type "text/html" --metadata-directive REPLACE | Out-Null
    aws s3 cp "s3://$BucketName/task-app.js" "s3://$BucketName/task-app.js" --content-type "application/javascript" --metadata-directive REPLACE | Out-Null
    aws s3 cp "s3://$BucketName/task-styles.css" "s3://$BucketName/task-styles.css" --content-type "text/css" --metadata-directive REPLACE | Out-Null
    
    Write-ColorOutput "✓ Content types set" "Green"
    
} catch {
    Write-ColorOutput "✗ Error during upload: $_" "Red"
    exit 1
}

# Summary
Write-ColorOutput "`n╔════════════════════════════════════════════════════════╗" "Green"
Write-ColorOutput "║              Deployment Successful! 🎉                ║" "Green"
Write-ColorOutput "╚════════════════════════════════════════════════════════╝`n" "Green"

Write-ColorOutput "Your application is now deployed!" "White"
Write-ColorOutput "`nAccess your application at:" "Yellow"
Write-ColorOutput "  http://$BucketName.s3-website-us-east-1.amazonaws.com/`n" "Cyan"

Write-ColorOutput "Next Steps:" "Yellow"
Write-ColorOutput "  1. Navigate to the URL above" "White"
Write-ColorOutput "  2. Click 'Sign In with Cognito'" "White"
Write-ColorOutput "  3. Create a new account" "White"
Write-ColorOutput "  4. Verify your email" "White"
Write-ColorOutput "  5. Start managing tasks!`n" "White"

Write-ColorOutput "For testing and troubleshooting, see:" "Yellow"
Write-ColorOutput "  - COMPLETE-SETUP-MANUAL.md (Step 6: Integration & Testing)" "White"
Write-ColorOutput "  - CONFIGURATION-CHECKLIST.md (Verification section)`n" "White"

Write-ColorOutput "Need help? Check CloudWatch Logs for your Lambda functions.`n" "Gray"
