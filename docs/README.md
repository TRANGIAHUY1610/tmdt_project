# lá»‡nh cháº¡y sever
    cd backend
    npm run dev
# Productstore Project
http://localhost:5000/
http://localhost:5000/api/products
http://localhost:5000/health    
# Táº¥t cáº£ sÃ¡ch
curl "http://localhost:5000/api/products"

# PhÃ¢n trang
curl "http://localhost:5000/api/products?page=2&limit=5"

# TÃ¬m kiáº¿m
curl "http://localhost:5000/api/products?search=harry"

# Lá»c danh má»¥c
curl "http://localhost:5000/api/products?category=1"

# Káº¿t há»£p
curl "http://localhost:5000/api/products?page=1&limit=10&search=harry&category=1"
# GET /api/products/:id
curl "http://localhost:5000/api/products/1"
# POST /api/products (Táº¡o sÃ¡ch má»›i)
curl -X POST "http://localhost:5000/api/products" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "SÃ¡ch má»›i",
    "author": "TÃ¡c giáº£ má»›i",
    "price": 99000,
    "category_id": 1,
    "description": "MÃ´ táº£ sÃ¡ch má»›i",
    "stock_quantity": 50
  }'
#  PUT /api/products/:id (Cáº­p nháº­t sÃ¡ch)
    curl -X PUT "http://localhost:5000/api/products/1" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "SÃ¡ch Ä‘Ã£ cáº­p nháº­t",
        "price": 120000
    }'
# DELETE /api/products/:id
    bash
    curl -X DELETE "http://localhost:5000/api/products/1"
# GET /api/categories
    bash
    curl "http://localhost:5000/api/categories"
