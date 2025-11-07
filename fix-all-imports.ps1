# Fix all corrupted imports in JSX files
$srcPath = ".\src"
$jsxFiles = Get-ChildItem -Path $srcPath -Filter "*.jsx" -Recurse -File

$fixCount = 0

foreach ($file in $jsxFiles) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Fix: import * from "..." -> import * as React from "..."
    if ($content -match 'import \* from "react"') {
        $content = $content -replace 'import \* from "react"', 'import * as React from "react"'
    }
    
    # Fix: import * from "@radix-ui/..." -> import * as XPrimitive from "@radix-ui/..."
    $content = $content -replace 'import \* from "@radix-ui/react-label"', 'import * as LabelPrimitive from "@radix-ui/react-label"'
    $content = $content -replace 'import \* from "@radix-ui/react-accordion"', 'import * as AccordionPrimitive from "@radix-ui/react-accordion"'
    $content = $content -replace 'import \* from "@radix-ui/react-alert-dialog"', 'import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"'
    $content = $content -replace 'import \* from "@radix-ui/react-avatar"', 'import * as AvatarPrimitive from "@radix-ui/react-avatar"'
    $content = $content -replace 'import \* from "@radix-ui/react-checkbox"', 'import * as CheckboxPrimitive from "@radix-ui/react-checkbox"'
    $content = $content -replace 'import \* from "@radix-ui/react-context-menu"', 'import * as ContextMenuPrimitive from "@radix-ui/react-context-menu"'
    $content = $content -replace 'import \* from "@radix-ui/react-dialog"', 'import * as DialogPrimitive from "@radix-ui/react-dialog"'
    $content = $content -replace 'import \* from "@radix-ui/react-dropdown-menu"', 'import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu"'
    $content = $content -replace 'import \* from "@radix-ui/react-hover-card"', 'import * as HoverCardPrimitive from "@radix-ui/react-hover-card"'
    $content = $content -replace 'import \* from "@radix-ui/react-menubar"', 'import * as MenubarPrimitive from "@radix-ui/react-menubar"'
    $content = $content -replace 'import \* from "@radix-ui/react-navigation-menu"', 'import * as NavigationMenuPrimitive from "@radix-ui/react-navigation-menu"'
    $content = $content -replace 'import \* from "@radix-ui/react-popover"', 'import * as PopoverPrimitive from "@radix-ui/react-popover"'
    $content = $content -replace 'import \* from "@radix-ui/react-progress"', 'import * as ProgressPrimitive from "@radix-ui/react-progress"'
    $content = $content -replace 'import \* from "@radix-ui/react-radio-group"', 'import * as RadioGroupPrimitive from "@radix-ui/react-radio-group"'
    $content = $content -replace 'import \* from "@radix-ui/react-scroll-area"', 'import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area"'
    $content = $content -replace 'import \* from "@radix-ui/react-select"', 'import * as SelectPrimitive from "@radix-ui/react-select"'
    $content = $content -replace 'import \* from "@radix-ui/react-separator"', 'import * as SeparatorPrimitive from "@radix-ui/react-separator"'
    $content = $content -replace 'import \* from "@radix-ui/react-slider"', 'import * as SliderPrimitive from "@radix-ui/react-slider"'
    $content = $content -replace 'import \* from "@radix-ui/react-switch"', 'import * as SwitchPrimitive from "@radix-ui/react-switch"'
    $content = $content -replace 'import \* from "@radix-ui/react-tabs"', 'import * as TabsPrimitive from "@radix-ui/react-tabs"'
    $content = $content -replace 'import \* from "@radix-ui/react-toast"', 'import * as ToastPrimitive from "@radix-ui/react-toast"'
    $content = $content -replace 'import \* from "@radix-ui/react-toggle"', 'import * as TogglePrimitive from "@radix-ui/react-toggle"'
    $content = $content -replace 'import \* from "@radix-ui/react-toggle-group"', 'import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group"'
    $content = $content -replace 'import \* from "@radix-ui/react-tooltip"', 'import * as TooltipPrimitive from "@radix-ui/react-tooltip"'
    $content = $content -replace 'import \* from "recharts"', 'import * as Recharts from "recharts"'
    
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        Write-Host "Fixed: $($file.FullName)"
        $fixCount++
    }
}

Write-Host "`nFixed $fixCount files!"
