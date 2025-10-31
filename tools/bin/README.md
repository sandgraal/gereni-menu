# Portable Image Optimizer Binaries

This directory is reserved for Linux builds of the image conversion tools used by the menu build scripts.

## Expected executables

Place the following binaries in this folder and commit them to the repository:

- `cwebp` (from the [libwebp](https://developers.google.com/speed/webp/download) project)
- `avifenc` (from the [libavif](https://github.com/AOMediaCodec/libavif) project)

Make sure each file is executable (`chmod +x`).

## Installation Instructions

### Option 1: Static Builds (Recommended)

Static builds bundle all dependencies and run standalone without requiring shared libraries. This is the simplest approach for offline CI environments.

#### For avifenc

1. **Build from source with static linking:**
   ```bash
   git clone https://github.com/AOMediaCodec/libavif.git
   cd libavif
   mkdir build && cd build
   cmake .. -DBUILD_SHARED_LIBS=OFF -DAVIF_CODEC_AOM=ON
   make
   cp avifenc /path/to/gereni-menu/tools/bin/
   ```

2. **Or download a static release** (if available):
   - Check the [libavif releases page](https://github.com/AOMediaCodec/libavif/releases) for static binary artifacts
   - Extract `avifenc` and copy to `tools/bin/`

#### For cwebp

1. Download the latest x86_64 Linux tarball from [libwebp downloads](https://developers.google.com/speed/webp/download)
2. Extract the `bin/cwebp` file
3. Copy to `tools/bin/`

Most libwebp prebuilt binaries are statically linked and work out of the box.

### Option 2: Dynamic Builds with Shared Libraries

If you must use dynamically-linked prebuilt binaries (e.g., from the official libavif release bundles), you need to stage the required shared libraries alongside the executable.

#### For avifenc (dynamically linked)

1. **Download the prebuilt Linux binary bundle** from [libavif releases](https://github.com/AOMediaCodec/libavif/releases)
2. **Extract ALL required files:**
   ```bash
   # Extract the release archive
   tar -xzf libavif-*.tar.gz
   cd libavif-*/
   
   # Copy the executable
   cp bin/avifenc /path/to/gereni-menu/tools/bin/
   
   # Copy ALL shared libraries
   mkdir -p /path/to/gereni-menu/tools/bin/lib
   cp -r lib/* /path/to/gereni-menu/tools/bin/lib/
   ```

3. **Create a wrapper script** to set `LD_LIBRARY_PATH`:
   ```bash
   cat > /path/to/gereni-menu/tools/bin/avifenc-wrapper.sh << 'EOF'
   #!/bin/bash
   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
   export LD_LIBRARY_PATH="${SCRIPT_DIR}/lib:${LD_LIBRARY_PATH}"
   exec "${SCRIPT_DIR}/avifenc" "$@"
   EOF
   chmod +x /path/to/gereni-menu/tools/bin/avifenc-wrapper.sh
   ```

4. **Update scripts to use the wrapper** or set `LD_LIBRARY_PATH` before calling `avifenc`

#### Required shared libraries for avifenc

Dynamically-linked `avifenc` typically requires:
- `libavif.so.*`
- `libaom.so.*`
- `libdav1d.so.*` (optional, for decoding)
- `librav1e.so.*` (optional, for encoding)
- Standard system libraries (`libc`, `libm`, etc.)

You can verify dependencies with:
```bash
ldd tools/bin/avifenc
```

### Verification

After staging the binaries, verify they work:

```bash
# For static builds or after staging dynamic libraries
./tools/bin/cwebp -version
./tools/bin/avifenc --version

# Or if using the wrapper
./tools/bin/avifenc-wrapper.sh --version
```

After copying the binaries (and libraries if needed) into this directory, commit them to the repository so automated tools can run without additional package installations.
