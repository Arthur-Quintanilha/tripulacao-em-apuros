Add-Type -AssemblyName System.Drawing
$files = @('pirate_red','pirate_captain','pirate_green','pirate_brown','pirate_bald','pirate_blue','pirate_tattoo')
$base = 'c:\Users\Arthur\Desktop\UFOP\tripulacao_em_apuros\assets\pirate'

function Get-GapsX($bmp,[int]$x0,[int]$x1,[int]$y0,[int]$y1,[int]$minW){
  $cols = New-Object System.Collections.ArrayList
  $prev = $x0
  $inGap = $false
  $gapStart = 0
  for ($xi = $x0; $xi -le $x1; $xi++) {
    $occ = $false
    for ($yi = $y0; $yi -le $y1; $yi++) {
      if ($bmp.GetPixel($xi, $yi).A -gt 10) { $occ = $true; break }
    }
    if (-not $occ) {
      if (-not $inGap) { $gapStart = $xi; $inGap = $true }
    } else {
      if ($inGap) {
        $gapEnd = $xi - 1
        $gapW = $gapEnd - $gapStart + 1
        if ($gapW -ge $minW) {
          $colEnd = $gapStart - 1
          if (($colEnd - $prev + 1) -ge 40) { [void]$cols.Add(@($prev, $colEnd)) }
          $prev = $gapEnd + 1
        }
        $inGap = $false
      }
    }
  }
  if (($x1 - $prev + 1) -ge 40) { [void]$cols.Add(@($prev, $x1)) }
  return ,$cols.ToArray()
}

function Get-GapsY($bmp,[int]$y0,[int]$y1,[int]$minH){
  $rows = New-Object System.Collections.ArrayList
  $prev = $y0
  $inGap = $false
  $gapStart = 0
  for ($yi = $y0; $yi -le $y1; $yi++) {
    $occ = $false
    for ($xi = 0; $xi -lt $bmp.Width; $xi++) {
      if ($bmp.GetPixel($xi, $yi).A -gt 10) { $occ = $true; break }
    }
    if (-not $occ) {
      if (-not $inGap) { $gapStart = $yi; $inGap = $true }
    } else {
      if ($inGap) {
        $gapEnd = $yi - 1
        $gapH = $gapEnd - $gapStart + 1
        if ($gapH -ge $minH) {
          $rowEnd = $gapStart - 1
          if (($rowEnd - $prev + 1) -ge 80) { [void]$rows.Add(@($prev, $rowEnd)) }
          $prev = $gapEnd + 1
        }
        $inGap = $false
      }
    }
  }
  if (($y1 - $prev + 1) -ge 80) { [void]$rows.Add(@($prev, $y1)) }
  return ,$rows.ToArray()
}

function Get-BBox($bmp,[int]$x0,[int]$x1,[int]$y0,[int]$y1){
  $minx=9999; $miny=9999; $maxx=0; $maxy=0; $found=$false
  for ($yi=$y0; $yi -le $y1; $yi++) {
    for ($xi=$x0; $xi -le $x1; $xi++) {
      if ($bmp.GetPixel($xi,$yi).A -gt 10) {
        $found=$true
        if ($xi -lt $minx) { $minx=$xi }
        if ($yi -lt $miny) { $miny=$yi }
        if ($xi -gt $maxx) { $maxx=$xi }
        if ($yi -gt $maxy) { $maxy=$yi }
      }
    }
  }
  if (-not $found) { return $null }
  return @{ x=$minx; y=$miny; w=($maxx-$minx+1); h=($maxy-$miny+1) }
}

foreach($f in $files){
  $path = Join-Path $base "$f.png"
  $bmp = New-Object System.Drawing.Bitmap($path)
  $w = $bmp.Width; $h = $bmp.Height
  Write-Output "=== $f ${w}x${h} ==="
  $rows = Get-GapsY $bmp 0 ($h-1) 20
  Write-Output "rows: $(($rows | ForEach-Object { "$($_[0])..$($_[1])" }) -join ', ')"
  if($rows.Count -ge 3){
    $bands = @(
      @{name='down'; y0=$rows[0][0]; y1=$rows[0][1]; parts=2},
      @{name='side'; y0=$rows[1][0]; y1=$rows[1][1]; parts=3},
      @{name='up'; y0=$rows[2][0]; y1=$rows[2][1]; parts=2}
    )
    $fid=0
    foreach($band in $bands){
      $cols = Get-GapsX $bmp 0 ($w-1) $band.y0 $band.y1 8
      Write-Output "// $($band.name) cols=$($cols.Count)"
      foreach($col in $cols){
        $bb = Get-BBox $bmp $col[0] $col[1] $band.y0 $band.y1
        if($bb){ Write-Output "  frame $fid x=$($bb.x) y=$($bb.y) w=$($bb.w) h=$($bb.h)"; $fid++ }
      }
    }
  }
  $bmp.Dispose()
}
