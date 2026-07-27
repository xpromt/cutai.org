#!/bin/bash
set -e
echo "=== Frontend ==="
curl -s -o /dev/null -w "HTTP %{http_code}\n" https://cutai.org/
echo "=== Health ==="
curl -s https://cutai.org/api/health
echo ""
echo "=== Score ==="
curl -s -X POST https://cutai.org/api/score \
  -H "Content-Type: application/json" \
  -d '{"text":"leveraging synergy and innovative solutions for the win"}'
echo ""
echo "=== Badge ==="
curl -s -o /dev/null -w "Badge SVG: HTTP %{http_code}, size: %{size_download} bytes\n" https://cutai.org/badge/test.svg
