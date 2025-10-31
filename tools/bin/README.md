# Portable Image Optimizer Binaries

This directory is reserved for static Linux builds of the image conversion tools used by the menu build scripts.

## Expected executables

Copy **actual executable files** for the following tools into this folder and commit them to the repository:

- `cwebp` (from the [libwebp](https://developers.google.com/speed/webp/download) project)
- `avifenc` (from the [libavif](https://github.com/AOMediaCodec/libavif) project)

> **Why they must live here:** the image automation that runs in CI is offline. If the binaries are not present in the repo, the conversion steps will fail. Dropping a text placeholder or symlink is not sufficient—the executables themselves must be committed.

After placing each binary, run `chmod +x tools/bin/<name>` so they remain executable.

## Suggested download sources

### cwebp
1. Download the latest x86_64 Linux tarball of libwebp (e.g. `libwebp-1.x.y-linux-x86-64.tar.gz`).
2. Extract the archive and copy `bin/cwebp` into `tools/bin/`.

### avifenc
1. Grab the prebuilt Linux bundle from the libavif releases page (`libavif-<version>-linux.tar.gz`).
2. Inside the archive, copy the bundled `avifenc` executable into `tools/bin/`.

If you already have the libavif source tree downloaded (as in the screenshot shared in the review), you can build `avifenc` locally with:

```bash
cmake -B build -S . -DCMAKE_BUILD_TYPE=Release -DAVIF_BUILD_APPS=ON -DAVIF_CODEC_AOM=ON
cmake --build build --target avifenc
cp build/avifenc tools/bin/avifenc  # adjust the source path if your build tree nests binaries under bin/ or Release/
```

That produces the standalone encoder binary that should then be committed alongside `cwebp`.

Once the two executables are in place, you can confirm they’re wired correctly by running:

```bash
./tools/bin/cwebp -version
./tools/bin/avifenc --version
```

Those commands should report valid version strings without needing any external dependencies.
Make sure each file is executable (`chmod +x`).

## Suggested download sources

1. Download the latest x86_64 Linux tarball of libwebp and extract the `bin/cwebp` file.
2. Download the libavif prebuilt Linux binary bundle and extract the `avifenc` executable.

After copying the binaries into this directory, commit them to the repository so automated tools can run without additional package installations.
