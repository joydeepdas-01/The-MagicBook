// High performance scanline flood-fill algorithm with outline-aware tolerance

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export function hexToRgb(hex: string): RGB {
  let clean = hex.replace('#', '');
  if (clean.length === 3) {
    clean = clean.split('').map((c) => c + c).join('');
  }
  const num = parseInt(clean, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('');
}

// Scanline queue flood fill
export function scanlineFloodFill(
  ctx: CanvasRenderingContext2D,
  startX: number,
  startY: number,
  fillColorHex: string,
  tolerance = 45
): boolean {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;

  if (startX < 0 || startX >= width || startY < 0 || startY >= height) {
    return false;
  }

  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  // Check if click was directly on a dark outline pixel (lum < 60)
  // If so, look around in a small 3px radius to find the adjacent non-outline region
  let targetX = startX;
  let targetY = startY;
  let startIndex = (startY * width + startX) * 4;
  let startLum = 0.299 * data[startIndex] + 0.587 * data[startIndex + 1] + 0.114 * data[startIndex + 2];

  if (startLum < 65) {
    let found = false;
    for (let r = 1; r <= 4 && !found; r++) {
      for (let dy = -r; dy <= r && !found; dy++) {
        for (let dx = -r; dx <= r && !found; dx++) {
          const nx = startX + dx;
          const ny = startY + dy;
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const nIdx = (ny * width + nx) * 4;
            const nLum = 0.299 * data[nIdx] + 0.587 * data[nIdx + 1] + 0.114 * data[nIdx + 2];
            if (nLum >= 75) {
              targetX = nx;
              targetY = ny;
              startIndex = nIdx;
              startLum = nLum;
              found = true;
            }
          }
        }
      }
    }
    if (!found) {
      return false; // Surrounded by pure black
    }
  }

  const startR = data[startIndex];
  const startG = data[startIndex + 1];
  const startB = data[startIndex + 2];
  const fillRgb = hexToRgb(fillColorHex);

  // If pixel is already the same color, skip
  if (
    Math.abs(startR - fillRgb.r) < 5 &&
    Math.abs(startG - fillRgb.g) < 5 &&
    Math.abs(startB - fillRgb.b) < 5
  ) {
    return false;
  }

  const tolSq = tolerance * tolerance * 3;
  const visited = new Uint8Array(width * height);

  function matchesTarget(idx: number): boolean {
    const r = data[idx];
    const g = data[idx + 1];
    const b = data[idx + 2];

    // Check if pixel is too dark (black line boundary)
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    if (lum < 65) return false;

    // Check distance to start color
    const dr = r - startR;
    const dg = g - startG;
    const db = b - startB;
    return (dr * dr + dg * dg + db * db) <= tolSq;
  }

  // Queue of [x, y] coordinates
  const queue: Int32Array = new Int32Array(width * height * 2);
  let qHead = 0;
  let qTail = 0;

  queue[qTail++] = targetX;
  queue[qTail++] = targetY;
  visited[targetY * width + targetX] = 1;

  while (qHead < qTail) {
    const x = queue[qHead++];
    const y = queue[qHead++];

    // Find extent to left
    let leftX = x;
    while (leftX > 0) {
      const nextX = leftX - 1;
      const pIdx = y * width + nextX;
      if (visited[pIdx] || !matchesTarget(pIdx * 4)) break;
      leftX = nextX;
      visited[pIdx] = 1;
    }

    // Find extent to right
    let rightX = x;
    while (rightX < width - 1) {
      const nextX = rightX + 1;
      const pIdx = y * width + nextX;
      if (visited[pIdx] || !matchesTarget(pIdx * 4)) break;
      rightX = nextX;
      visited[pIdx] = 1;
    }

    // Fill current horizontal span
    for (let i = leftX; i <= rightX; i++) {
      const pIdx = (y * width + i) * 4;
      data[pIdx] = fillRgb.r;
      data[pIdx + 1] = fillRgb.g;
      data[pIdx + 2] = fillRgb.b;
      data[pIdx + 3] = 255;
      visited[y * width + i] = 1;
    }

    // Scan line above and line below for next spans
    for (const nextY of [y - 1, y + 1]) {
      if (nextY < 0 || nextY >= height) continue;

      let inSpan = false;
      for (let i = leftX; i <= rightX; i++) {
        const pIdx = nextY * width + i;
        if (!visited[pIdx] && matchesTarget(pIdx * 4)) {
          if (!inSpan) {
            visited[pIdx] = 1;
            queue[qTail++] = i;
            queue[qTail++] = nextY;
            inSpan = true;
          }
        } else {
          inSpan = false;
        }
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return true;
}
