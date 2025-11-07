# Script to fix React.forwardRef TypeScript syntax in all JSX files
$uiPath = ".\src\components\ui"

# Get all .jsx files
$jsxFiles = Get-ChildItem -Path $uiPath -Filter "*.jsx" -File

foreach ($file in $jsxFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Remove TypeScript generic types from React.forwardRef
    # Pattern: React.forwardRef<...type stuff...>(
    # Replace with: React.forwardRef(
    $content = $content -replace 'React\.forwardRef<[^>]+,\s*[^>]+>\(', 'React.forwardRef('
    
    # Also handle single-line generics
    $content = $content -replace 'React\.forwardRef<[^>]+>\(', 'React.forwardRef('
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.Name)"
    }
}

Write-Host "`nAll React.forwardRef TypeScript syntax has been removed!"
