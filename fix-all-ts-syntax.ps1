# Script to remove all remaining TypeScript syntax from JSX files
$uiPath = ".\src\components\ui"
$jsxFiles = Get-ChildItem -Path $uiPath -Filter "*.jsx" -File

foreach ($file in $jsxFiles) {
    $lines = Get-Content $file.FullName
    $newLines = @()
    $skipNext = 0
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # Check if line contains React.forwardRef with TypeScript generics
        if ($line -match 'React\.forwardRef<') {
            # Find the closing > and replace the whole generic part
            $genericStart = $line.IndexOf('<')
            $depth = 0
            $genericEnd = -1
            
            for ($j = $genericStart; $j -lt $line.Length; $j++) {
                if ($line[$j] -eq '<') { $depth++ }
                if ($line[$j] -eq '>') { 
                    $depth--
                    if ($depth -eq 0) {
                        $genericEnd = $j
                        break
                    }
                }
            }
            
            if ($genericEnd -gt 0) {
                # Single line generic - remove it
                $before = $line.Substring(0, $genericStart)
                $after = $line.Substring($genericEnd + 1)
                $newLines += $before + $after
            } else {
                # Multi-line generic - skip this and next lines until we find >
                $skipNext = 1
            }
        } elseif ($skipNext -gt 0) {
            # Skip lines that are part of multi-line generics
            if ($line -match '>\s*\(') {
                # Found the end - add the line without the generic part
                $newLines += $line -replace '^[^>]*>\s*', ''
                $skipNext = 0
            } else {
                $skipNext++
            }
        } else {
            $newLines += $line
        }
    }
    
    Set-Content -Path $file.FullName -Value $newLines
    Write-Host "Processed: $($file.Name)"
}

Write-Host "`nDone!"
