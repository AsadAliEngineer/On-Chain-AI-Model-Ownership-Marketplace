#!/bin/bash

# Create necessary directories
mkdir -p src/components
mkdir -p src/context
mkdir -p src/abis

# Create frontend files
touch src/components/ListModelForm.js
touch src/components/ModelList.js
touch src/components/PurchaseModelButton.js
touch src/components/RateModelForm.js
touch src/components/ModelDetails.js
touch src/components/WithdrawFundsButton.js
touch src/context/Web3Context.js
touch src/App.js
touch src/index.js
touch src/abis/AIModelMarketplace.json

# Notify user
echo "Frontend project structure created successfully!"
