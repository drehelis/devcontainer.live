#!/bin/bash
set -eo pipefail

readonly DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly ROOT_DIR="$(dirname "$DIR")"
mkdir -p "$ROOT_DIR/public/data"

readonly FEATURES_FILE="$ROOT_DIR/public/data/features.json"
readonly TEMPLATES_FILE="$ROOT_DIR/public/data/templates.json"
readonly IMAGE_TAGS_FILE="$ROOT_DIR/public/data/imageTags.json"

ensure_installed() {
    local pkg="$1"
    command -v "$pkg" &> /dev/null && return
    echo "$pkg could not be found. Installing via apt-get..."
    local apt_cmd="apt-get"
    command -v sudo &> /dev/null && apt_cmd="sudo apt-get"
    DEBIAN_FRONTEND=noninteractive $apt_cmd update && $apt_cmd install -y "$pkg"
}

if ! command -v skopeo &> /dev/null; then
    ensure_installed skopeo
fi

if ! command -v jq &> /dev/null; then
    ensure_installed jq
fi

if ! command -v curl &> /dev/null; then
    ensure_installed jq
fi

readonly TMP_DIR=$(mktemp -d)
trap 'rm -rf "$TMP_DIR"' EXIT

echo "Fetching devcontainer index via skopeo..."
skopeo copy docker://ghcr.io/devcontainers/index:latest "dir:$TMP_DIR/index-collection"

BLOB_DIGEST=$(jq -r '.layers[] | select(.annotations["org.opencontainers.image.title"] == "devcontainer-index.json") | .digest' "$TMP_DIR/index-collection/manifest.json")

if [ -z "$BLOB_DIGEST" ] || [ "$BLOB_DIGEST" == "null" ]; then
    echo "Could not parse blob digest from manifest.json"
    exit 1
fi

BLOB_HASH=${BLOB_DIGEST#sha256:}
INDEX_FILE="$TMP_DIR/index-collection/$BLOB_HASH"

if [ ! -f "$INDEX_FILE" ]; then
    echo "Index file blob not found: $INDEX_FILE"
    exit 1
fi

JQ_FILTER='
  def map_item($c; $ociRef; $categoryName):
    (if (.id | index("/")) then .id else "\($ociRef)/\(.id)" end) as $baseId |
    (if .majorVersion then ":\(.majorVersion)" else "" end) as $versionSuffix |
    {
      id: "\($baseId)\($versionSuffix)",
      name: (.name // .id),
      description: .description,
      options: .options,
      category: $categoryName,
      documentationURL: (.documentationURL // $c.sourceInformation.repository)
    };

  [ .collections[]? | . as $c | 
    ($c.sourceInformation.ociReference // "") as $ociRef | 
    ($c.sourceInformation.name // "Other") as $categoryName | 
    .[$type][]? | map_item($c; $ociRef; $categoryName) ]
'

echo "Extracting features..."
jq --arg type "features" "$JQ_FILTER" "$INDEX_FILE" > "$FEATURES_FILE"
echo "Wrote features to $FEATURES_FILE"

echo "Extracting templates..."
jq --arg type "templates" "$JQ_FILTER" "$INDEX_FILE" > "$TEMPLATES_FILE"
echo "Wrote templates to $TEMPLATES_FILE"

echo "Fetching list of published baseline devcontainer images from MCR..."
CATALOG_JSON=$(curl -sL "https://mcr.microsoft.com/v2/_catalog") || {
  echo "Failed to fetch MCR catalog."
  exit 1
}

IMAGE_NAMES=$(printf '%s\n' "$CATALOG_JSON" | jq -r '.repositories[] | select(startswith("devcontainers/"))') || {
  echo "Failed to parse MCR catalog JSON."
  exit 1
}

mapfile -t IMAGES <<<"$IMAGE_NAMES"

if [ ${#IMAGES[@]} -eq 0 ] || [ -z "${IMAGES[0]}" ]; then
  echo "No devcontainer images found in MCR catalog; aborting to avoid writing incomplete imageTags.json."
  exit 1
fi

echo "Iterating dynamically discovered images: ${IMAGES[*]}"

{
  echo "{"
  for i in "${!IMAGES[@]}"; do
    img="${IMAGES[$i]}"
    echo -n "  \"$img\": "
    
    # Fetch tags, parse them, extract the tags array, reverse and take first 50.
    TAGS_JSON=$(curl -sL "https://mcr.microsoft.com/v2/$img/tags/list" | jq -c '.tags | reverse | .[0:50]' 2>/dev/null || echo "[]")
    
    if [ -z "$TAGS_JSON" ] || [ "$TAGS_JSON" == "null" ]; then
        TAGS_JSON="[]"
    fi

    echo -n "$TAGS_JSON"

    if [ $i -lt $((${#IMAGES[@]} - 1)) ]; then
      echo ","
    else
      echo ""
    fi
  done
  echo "}"
} > "$IMAGE_TAGS_FILE"

# Prettify the JSON
jq . "$IMAGE_TAGS_FILE" > "$IMAGE_TAGS_FILE.tmp" && mv "$IMAGE_TAGS_FILE.tmp" "$IMAGE_TAGS_FILE"

echo "Wrote image tags to $IMAGE_TAGS_FILE"
