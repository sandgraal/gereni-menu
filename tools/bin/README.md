# Portable Image Optimizer Binaries

This directory is reserved for static Linux builds of the image conversion tools used by the menu build scripts.

## Expected executables

Place the following binaries in this folder and commit them to the repository:

- `cwebp` (from the [libwebp](https://developers.google.com/speed/webp/download) project)
- `avifenc` (from the [libavif](https://github.com/AOMediaCodec/libavif) project)

Make sure each file is executable (`chmod +x`).

## Suggested download sources

1. Download the latest x86_64 Linux tarball of libwebp and extract the `bin/cwebp` file.
2. Download the libavif prebuilt Linux binary bundle and extract the `avifenc` executable.

After copying the binaries into this directory, commit them to the repository so automated tools can run without additional package installations.
