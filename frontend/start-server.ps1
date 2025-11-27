# Simple HTTP Server for Task Tracker Frontend
# This allows you to preview the frontend locally before deploying to AWS

$port = 8000
$path = Get-Location

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "  Task Tracker - Local Preview" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Starting web server..." -ForegroundColor Green
Write-Host "URL: http://localhost:$port" -ForegroundColor Yellow
Write-Host ""
Write-Host "IMPORTANT NOTES:" -ForegroundColor Red
Write-Host "1. The app will show login page but won't work fully until deployed to AWS" -ForegroundColor White
Write-Host "2. You need to configure AWS services (DynamoDB, Cognito, Lambda, API Gateway)" -ForegroundColor White
Write-Host "3. Then update app.js with your AWS credentials" -ForegroundColor White
Write-Host ""
Write-Host "To stop server: Press Ctrl+C" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Create HTTP listener
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()

Write-Host "Server is running! Opening browser..." -ForegroundColor Green
Start-Sleep -Seconds 1
Start-Process "http://localhost:$port"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Get requested file path
        $localPath = $request.Url.LocalPath
        if ($localPath -eq "/") { $localPath = "/index.html" }
        
        $filePath = Join-Path $path $localPath.TrimStart('/')
        
        # Serve file if exists
        if (Test-Path $filePath) {
            $content = [System.IO.File]::ReadAllBytes($filePath)
            
            # Set content type based on extension
            $extension = [System.IO.Path]::GetExtension($filePath)
            switch ($extension) {
                ".html" { $response.ContentType = "text/html" }
                ".css"  { $response.ContentType = "text/css" }
                ".js"   { $response.ContentType = "application/javascript" }
                ".json" { $response.ContentType = "application/json" }
                default { $response.ContentType = "text/plain" }
            }
            
            $response.ContentLength64 = $content.Length
            $response.OutputStream.Write($content, 0, $content.Length)
            
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] " -NoNewline -ForegroundColor Gray
            Write-Host "$($request.HttpMethod) $localPath " -NoNewline
            Write-Host "200 OK" -ForegroundColor Green
        }
        else {
            # 404 Not Found
            $response.StatusCode = 404
            $content = [System.Text.Encoding]::UTF8.GetBytes("404 - File Not Found: $localPath")
            $response.OutputStream.Write($content, 0, $content.Length)
            
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] " -NoNewline -ForegroundColor Gray
            Write-Host "$($request.HttpMethod) $localPath " -NoNewline
            Write-Host "404 NOT FOUND" -ForegroundColor Red
        }
        
        $response.Close()
    }
}
finally {
    $listener.Stop()
    Write-Host "`nServer stopped." -ForegroundColor Yellow
}
