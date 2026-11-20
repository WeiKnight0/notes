import struct
import sys
import zlib
from pathlib import Path

SIGNATURE = b'\x89PNG\r\n\x1a\n'


def chunk(kind, data):
    return struct.pack('>I', len(data)) + kind + data + struct.pack('>I', zlib.crc32(kind + data))


def optimize(path):
    original = path.read_bytes()
    if not original.startswith(SIGNATURE):
        raise ValueError(f'Invalid PNG: {path}')
    chunks = []
    offset = 8
    while offset < len(original):
        size = struct.unpack_from('>I', original, offset)[0]
        end = offset + size + 12
        kind = original[offset + 4:offset + 8]
        data = original[offset + 8:end - 4]
        if end > len(original) or zlib.crc32(kind + data) != struct.unpack_from('>I', original, end - 4)[0]:
            raise ValueError(f'Invalid PNG chunk: {path}')
        chunks.append((kind, data, original[offset:end]))
        offset = end
    if any(kind == b'acTL' for kind, _, _ in chunks):
        return len(original), len(original)
    raw = zlib.decompress(b''.join(data for kind, data, _ in chunks if kind == b'IDAT'))
    candidates = []
    for strategy in (zlib.Z_DEFAULT_STRATEGY, zlib.Z_FILTERED, zlib.Z_RLE):
        encoder = zlib.compressobj(9, zlib.DEFLATED, 15, 9, strategy)
        candidates.append(encoder.compress(raw) + encoder.flush())
    compressed = min(candidates, key=len)
    if zlib.decompress(compressed) != raw:
        raise ValueError(f'PNG data changed: {path}')
    result = bytearray(SIGNATURE)
    inserted = False
    for kind, _, encoded in chunks:
        if kind != b'IDAT':
            result.extend(encoded)
        elif not inserted:
            result.extend(chunk(b'IDAT', compressed))
            inserted = True
    if len(result) >= len(original):
        return len(original), len(original)
    path.write_bytes(result)
    return len(original), len(result)


if __name__ == '__main__':
    if len(sys.argv) < 2:
        raise SystemExit('Usage: python scripts/optimize-png.py <file-or-directory> [...]')
    files = set()
    for target in map(Path, sys.argv[1:]):
        files.update(target.rglob('*.png') if target.is_dir() else [target])
    before = after = changed = 0
    for path in sorted(files):
        old, new = optimize(path)
        before += old
        after += new
        changed += new < old
    saving = (1 - after / before) * 100 if before else 0
    print(f'{changed}/{len(files)} PNGs optimized: {before} -> {after} bytes ({saving:.1f}% saved). Pixel data unchanged.')
