# Script to fix React.forwardRef TypeScript syntax in all JSX files (including multi-line)
$uiPath = ".\src\components\ui"

# Get all .jsx files
$jsxFiles = Get-ChildItem -Path $uiPath -Filter "*.jsx" -File

foreach ($file in $jsxFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove TypeScript generic types from React.forwardRef (multi-line pattern)
    # This handles cases where the generic types span multiple lines
    $content = $content -replace '(?s)React\.forwardRef<[^>]+>\s*\(', 'React.forwardRef('
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "`nAll React.forwardRef TypeScript syntax has been removed!"
