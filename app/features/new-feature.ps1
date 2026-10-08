param(
    [Parameter(Mandatory = $true)]
    [string]$Name
)

$FeatureName = $Name.ToLower()
$FeaturePath = Join-Path $PWD $FeatureName

# Prevent accidental overwrite
if (Test-Path $FeaturePath) {
    Write-Host "Feature '$FeatureName' already exists." -ForegroundColor Yellow
    exit 1
}

# Create directories
$Directories = @(
    "actions",
    "components",
    "services",
    "types"
)

foreach ($Directory in $Directories) {
    New-Item `
        -ItemType Directory `
        -Path (Join-Path $FeaturePath $Directory) `
        -Force | Out-Null
}

# Create files
New-Item `
    -ItemType File `
    -Path (Join-Path $FeaturePath "actions/index.ts") `
    -Force | Out-Null

New-Item `
    -ItemType File `
    -Path (Join-Path $FeaturePath "services/$FeatureName.service.ts") `
    -Force | Out-Null

New-Item `
    -ItemType File `
    -Path (Join-Path $FeaturePath "types/$FeatureName.types.ts") `
    -Force | Out-Null

Write-Host ""
Write-Host "Feature '$FeatureName' created successfully!" -ForegroundColor Green
Write-Host ""
Write-Host "$FeatureName/"
Write-Host "  actions/"
Write-Host "    index.ts"
Write-Host "  components/"
Write-Host "  services/"
Write-Host "    $FeatureName.service.ts"
Write-Host "  types/"
Write-Host "    $FeatureName.types.ts"