[CmdletBinding()]
param(
    [Parameter(Position = 0)]
    [ValidateSet('check', 'graph', 'probe-status', 'snapshot', 'runtime-check')]
    [string]$Command = 'check',

    [string]$Instance
)

$ErrorActionPreference = 'Stop'
$toolDirectory = Split-Path -Parent $MyInvocation.MyCommand.Path
$packRoot = Split-Path -Parent $toolDirectory
$auditScript = Join-Path $toolDirectory 'recipe-audit.mjs'
$snapshotScript = Join-Path $toolDirectory 'probe-snapshot.mjs'

function Require-Command([string]$Name) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "Required command '$Name' is not available on PATH."
    }
}

function Require-Instance {
    if ([string]::IsNullOrWhiteSpace($Instance)) {
        throw "-Instance is required for '$Command'. Pass the Minecraft instance root (the directory containing kubejs and mods)."
    }

    $script:resolvedInstance = (Resolve-Path -LiteralPath $Instance).Path
}

function Invoke-NodeSyntaxCheck {
    $scripts = Get-ChildItem -LiteralPath (Join-Path $packRoot 'kubejs') -Recurse -Filter '*.js' -File
    foreach ($script in $scripts) {
        & node --check $script.FullName
        if ($LASTEXITCODE -ne 0) {
            throw "JavaScript syntax check failed: $($script.FullName)"
        }
    }
    Write-Host "PASS JavaScript syntax ($($scripts.Count) files)"
}

function Test-PackwizManifest {
    Require-Command 'packwiz'
    Push-Location $packRoot
    try {
        $null = & packwiz list 2>&1
        if ($LASTEXITCODE -ne 0) {
            throw 'packwiz list failed.'
        }
    }
    finally {
        Pop-Location
    }
    Write-Host 'PASS Packwiz manifest'
}

Require-Command 'node'

switch ($Command) {
    'check' {
        Invoke-NodeSyntaxCheck
        Test-PackwizManifest
        & node $auditScript --root $packRoot --check
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    'graph' {
        $reportDirectory = Join-Path $packRoot 'reports'
        New-Item -ItemType Directory -Path $reportDirectory -Force | Out-Null
        $output = Join-Path $reportDirectory 'recipe-graph.mmd'
        & node $auditScript --root $packRoot --graph $output
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        Write-Host "WROTE $output"
    }
    'probe-status' {
        Require-Instance
        & node $snapshotScript --root $packRoot --instance $resolvedInstance --status
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    'snapshot' {
        Require-Instance
        & node $snapshotScript --root $packRoot --instance $resolvedInstance --write
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
    'runtime-check' {
        Require-Instance
        $expectedAdded = (& node $auditScript --root $packRoot --count-only)
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        & node (Join-Path $toolDirectory 'runtime-audit.mjs') --instance $resolvedInstance --expected-added $expectedAdded
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    }
}
