Add-Type -AssemblyName System.Drawing

$srcPath = "D:\Study Materials\My Projects\MagicBook\tmp\soft.png"
$src = [System.Drawing.Bitmap]::FromFile($srcPath)

$mipmapDirs = @{
    "magicbook-mobile\android\app\src\main\res\mipmap-mdpi"    = 48
    "magicbook-mobile\android\app\src\main\res\mipmap-hdpi"    = 72
    "magicbook-mobile\android\app\src\main\res\mipmap-xhdpi"   = 96
    "magicbook-mobile\android\app\src\main\res\mipmap-xxhdpi"  = 144
    "magicbook-mobile\android\app\src\main\res\mipmap-xxxhdpi" = 192
}

foreach ($entry in $mipmapDirs.GetEnumerator()) {
    $dir = $entry.Key
    $size = $entry.Value
    
    $dest = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

    $g.Clear([System.Drawing.Color]::Transparent)
    $g.DrawImage($src, 0, 0, $size, $size)
    $g.Dispose()

    # Save ic_launcher.png, ic_launcher_round.png, ic_launcher_foreground.png
    $dest.Save("$dir\ic_launcher.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Save("$dir\ic_launcher_round.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Save("$dir\ic_launcher_foreground.png", [System.Drawing.Imaging.ImageFormat]::Png)
    $dest.Dispose()

    Write-Host "Generated $dir icons ($size x $size)"
}

# Also generate web icons
Copy-Item $srcPath "magicbook-mobile\public\logo.png" -Force
Copy-Item $srcPath "magicbook-mobile\public\favicon.png" -Force

$src.Dispose()
Write-Host "All launcher and web icons successfully generated!"

