#!/bin/bash
# Build KubeInvaders for amd64 and arm64 (aarch64), one architecture at a time,
# then push:
#   - one image per architecture:  <version>-amd64, <version>-arm64
#   - a multi-arch manifest:       <version>, latest, develop
#
#   ./dev-tools/push/push_multiarch_image.sh            # pushes v2.1.1
#   ./dev-tools/push/push_multiarch_image.sh v2.1.2     # pushes another version
#   ARCHS="arm64" ./dev-tools/push/push_multiarch_image.sh   # only one architecture
#
# Requires: podman logged in to docker.io (podman login docker.io).
# On Apple Silicon the amd64 image is built under emulation, so it is slower.

set -euo pipefail

VERSION="${1:-v2.1.3}"
REPO="${REPO:-docker.io/luckysideburn/kubeinvaders}"
ARCHS=(${ARCHS:-amd64 arm64})
TAGS=("$VERSION" "latest" "develop")
MANIFEST="localhost/kubeinvaders-multiarch:${VERSION}"

cd "$(dirname "$0")/../.."

if ! grep -q "version: ${VERSION}<" html/index.html; then
  echo "WARNING: html/index.html does not show 'version: ${VERSION}' in the footer"
fi

if ! podman login --get-login docker.io >/dev/null 2>&1; then
  echo "Not logged in to docker.io: run 'podman login docker.io' first"
  exit 1
fi

podman manifest rm "$MANIFEST" >/dev/null 2>&1 || true
podman manifest create "$MANIFEST"

for arch in "${ARCHS[@]}"; do
  image="${REPO}:${VERSION}-${arch}"
  echo "=== Building ${image} (linux/${arch})"
  podman build --platform "linux/${arch}" -t "$image" .

  built_arch=$(podman image inspect "$image" --format '{{.Architecture}}')
  if [ "$built_arch" != "$arch" ]; then
    echo "ERROR: ${image} was built for '${built_arch}' instead of '${arch}'"
    exit 1
  fi

  podman manifest add "$MANIFEST" "containers-storage:${image}"
done

echo "=== Architectures in the manifest:"
podman manifest inspect "$MANIFEST" | grep '"architecture"' | sort -u

for arch in "${ARCHS[@]}"; do
  echo "=== Pushing ${REPO}:${VERSION}-${arch}"
  podman push "${REPO}:${VERSION}-${arch}"
done

for tag in "${TAGS[@]}"; do
  echo "=== Pushing ${REPO}:${tag} (multi-arch)"
  podman manifest push --all "$MANIFEST" "docker://${REPO}:${tag}"
done

echo "Done: ${REPO}:{$(IFS=,; echo "${TAGS[*]}")} for ${ARCHS[*]}"
