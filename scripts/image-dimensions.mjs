export function imageDimensions(data) {
  if (data.length >= 24 && data.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
    return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
  }
  if (data.length >= 10 && /^GIF8[79]a$/.test(data.toString('ascii', 0, 6))) {
    return { width: data.readUInt16LE(6), height: data.readUInt16LE(8) };
  }
  if (data.length >= 30 && data.toString('ascii', 0, 4) === 'RIFF' && data.toString('ascii', 8, 12) === 'WEBP') {
    const type = data.toString('ascii', 12, 16);
    if (type === 'VP8X') return { width: data.readUIntLE(24, 3) + 1, height: data.readUIntLE(27, 3) + 1 };
    if (type === 'VP8 ') return { width: data.readUInt16LE(26) & 16383, height: data.readUInt16LE(28) & 16383 };
    if (type === 'VP8L' && data[20] === 47) {
      const bits = data.readUInt32LE(21);
      return { width: (bits & 16383) + 1, height: ((bits >>> 14) & 16383) + 1 };
    }
  }
  if (data[0] === 255 && data[1] === 216) {
    let offset = 2;
    while (offset + 4 <= data.length) {
      if (data[offset++] !== 255) break;
      while (data[offset] === 255) offset++;
      const marker = data[offset++];
      if (marker === 217 || marker === 218) break;
      if (marker === 1 || (marker >= 208 && marker <= 215)) continue;
      const size = data.readUInt16BE(offset);
      if (size < 2 || offset + size > data.length) break;
      if ([192, 193, 194, 195, 197, 198, 199, 201, 202, 203, 205, 206, 207].includes(marker) && size >= 7) {
        return { width: data.readUInt16BE(offset + 5), height: data.readUInt16BE(offset + 3) };
      }
      offset += size;
    }
  }
  const svg = /<svg\b[^>]*>/i.exec(data.toString('utf8'))?.[0];
  if (svg) {
    const width = /\bwidth=["']([\d.]+)(?:px)?["']/i.exec(svg)?.[1];
    const height = /\bheight=["']([\d.]+)(?:px)?["']/i.exec(svg)?.[1];
    if (width && height) return { width: Number(width), height: Number(height) };
    const viewBox = /\bviewBox=["']([^"']+)["']/i.exec(svg)?.[1].trim().split(/[\s,]+/).map(Number);
    if (viewBox?.length === 4 && viewBox[2] > 0 && viewBox[3] > 0) return { width: viewBox[2], height: viewBox[3] };
  }
  return null;
}
