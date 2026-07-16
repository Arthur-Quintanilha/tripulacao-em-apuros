Add-Type -AssemblyName System.Drawing
$files = @('pirate_red','pirate_captain','pirate_green','pirate_brown','pirate_bald','pirate_blue','pirate_tattoo')
$base = 'c:\Users\Arthur\Desktop\UFOP\tripulacao_em_apuros\assets\pirate'
$out = @()

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

function Split-Cells($x0,$x1,$parts){
  $w = $x1 - $x0 + 1
  $cells = @()
  for ($i = 0; $i -lt $parts; $i++) {
    $cx0 = $x0 + [int][math]::Floor($i * $w / $parts)
    $cx1 = $x0 + [int][math]::Floor(($i + 1) * $w / $parts) - 1
    $cells += ,@($cx0, $cx1)
  }
  return ,$cells
}

foreach($f in $files){
  $bmp = New-Object System.Drawing.Bitmap((Join-Path $base "$f.png"))
  $w = $bmp.Width - 1
  $h = $bmp.Height - 1
  $hThird = [int][math]::Floor($bmp.Height / 3)
  $bands = @(
    @{ name='down'; y0=0; y1=($hThird - 1); parts=2 },
    @{ name='side'; y0=$hThird; y1=(2 * $hThird - 1); parts=3 },
    @{ name='up'; y0=(2 * $hThird); y1=$h; parts=2 }
  )
  $out += "// $f"
  $fid = 0
  foreach($band in $bands){
    $cells = Split-Cells 0 $w $band.parts
    foreach($cell in $cells){
      $bb = Get-BBox $bmp $cell[0] $cell[1] $band.y0 $band.y1
      if($bb -and $bb.w -ge 30 -and $bb.h -ge 50){
        $out += "{ id: $fid, x: $($bb.x), y: $($bb.y), width: $($bb.w), height: $($bb.h) }, // $($band.name)"
        $fid++
      }
    }
  }
  $out += ""
  $bmp.Dispose()
}
$out | Set-Content 'c:\Users\Arthur\Desktop\UFOP\tripulacao_em_apuros\scripts\pirate-individual-frames.txt'
$out
