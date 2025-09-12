#!/bin/bash

TOKEN="85f5e10431f69bc2a14046a13aabaefc660103b6de7a84f75c4b96181d03f0b5"
URL="https://rag.supermembers.co.kr"

echo "=== /prompts 엔드포인트 테스트 ==="
curl -X GET "$URL/prompts" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -v

echo -e "\n\n=== /qa/ 엔드포인트 테스트 (비교용) ==="
curl -X GET "$URL/qa/" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -v