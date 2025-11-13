#!/bin/bash
while true; do
  ORDER_ID=$((RANDOM % 100 + 1))
  PRODUCT_ID=$((RANDOM % 50 + 1))

  curl -s -X POST http://localhost:4000/api/orders -H "Content-Type: application/json" -d "{\"productId\":$PRODUCT_ID,\"quantity\":5}"
  curl -s -X POST http://localhost:4000/api/payments -H "Content-Type: application/json" -d "{\"orderId\":$ORDER_ID,\"amount\":299.99}"
  curl -s -X POST http://localhost:4000/api/comments -H "Content-Type: application/json" -d "{\"text\":\"Auto order $ORDER_ID processed\",\"orderId\":$ORDER_ID}"

  sleep 1
done
