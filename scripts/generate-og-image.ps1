# Builds public/og-image.jpg (1200x630) for link previews from existing assets.
# Usage: pwsh scripts/generate-og-image.ps1
Add-Type -AssemblyName System.Drawing

$root = Split-Path -Parent $PSScriptRoot
$bgPath = Join-Path $root 'src/assets/images/youth-group.jpg'
$logoPath = Join-Path $root 'src/assets/logo/church-logo.png'
$outPath = Join-Path $root 'public/og-image.jpg'

$W = 1200; $H = 630
$canvas = New-Object Drawing.Bitmap($W, $H)
$g = [Drawing.Graphics]::FromImage($canvas)
$g.SmoothingMode = 'AntiAlias'
$g.InterpolationMode = 'HighQualityBicubic'
$g.TextRenderingHint = 'AntiAliasGridFit'

# Background photo, cover-cropped.
$bg = [Drawing.Image]::FromFile($bgPath)
$scale = [Math]::Max($W / $bg.Width, $H / $bg.Height)
$dw = [int]($bg.Width * $scale); $dh = [int]($bg.Height * $scale)
$g.DrawImage($bg, [int](($W - $dw) / 2), [int](($H - $dh) / 2), $dw, $dh)
$bg.Dispose()

# Navy overlay for text legibility.
$g.FillRectangle((New-Object Drawing.SolidBrush (
  [Drawing.Color]::FromArgb(170, 31, 47, 104))), 0, 0, $W, $H)

$center = New-Object Drawing.StringFormat
$center.Alignment = 'Center'
$center.LineAlignment = 'Center'

# Logo on a white rounded chip (same treatment as the site footer).
$logo = [Drawing.Image]::FromFile($logoPath)
$chipW = 300; $chipH = 150; $chipX = ($W - $chipW) / 2; $chipY = 70; $radius = 24
$path = New-Object Drawing.Drawing2D.GraphicsPath
$path.AddArc($chipX, $chipY, $radius * 2, $radius * 2, 180, 90)
$path.AddArc($chipX + $chipW - $radius * 2, $chipY, $radius * 2, $radius * 2, 270, 90)
$path.AddArc($chipX + $chipW - $radius * 2, $chipY + $chipH - $radius * 2, $radius * 2, $radius * 2, 0, 90)
$path.AddArc($chipX, $chipY + $chipH - $radius * 2, $radius * 2, $radius * 2, 90, 90)
$path.CloseFigure()
$g.FillPath([Drawing.Brushes]::White, $path)
$pad = 22
$g.DrawImage($logo, $chipX + $pad, $chipY + $pad, $chipW - $pad * 2, $chipH - $pad * 2)
$logo.Dispose()

# Titles.
$white = [Drawing.Brushes]::White
$g.DrawString('CHRISTIAN CITY CHURCH',
  (New-Object Drawing.Font('Segoe UI', 34, [Drawing.FontStyle]::Bold)),
  $white, (New-Object Drawing.RectangleF(0, 250, $W, 60)), $center)
$g.DrawString('Youth',
  (New-Object Drawing.Font('Segoe UI', 130, [Drawing.FontStyle]::Bold)),
  $white, (New-Object Drawing.RectangleF(0, 300, $W, 190)), $center)
$g.DrawString('Growing Together in Faith & Fellowship',
  (New-Object Drawing.Font('Segoe UI', 36)),
  $white, (New-Object Drawing.RectangleF(0, 490, $W, 60)), $center)

# Save as JPEG quality 85.
$codec = [Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object { $_.MimeType -eq 'image/jpeg' }
$params = New-Object Drawing.Imaging.EncoderParameters(1)
$params.Param[0] = New-Object Drawing.Imaging.EncoderParameter(
  [Drawing.Imaging.Encoder]::Quality, 85)
$canvas.Save($outPath, $codec, $params)
$g.Dispose(); $canvas.Dispose()

Write-Output "Wrote $outPath ($((Get-Item $outPath).Length / 1KB -as [int]) KB)"
