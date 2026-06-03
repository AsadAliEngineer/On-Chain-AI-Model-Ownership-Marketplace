// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol"; // Import the ERC-20 interface

contract AIModelMarketplace {
    
    // Model struct to store model details
    struct Model {
        string name;
        string description;
        uint256 price;  // Price in ERC-20 token units (not ETH)
        address payable seller;
        bool isSold;
    }
    
    // Mapping of model IDs to Model details
    mapping(uint256 => Model) public models;
    uint256 public modelCount;
    
    // ERC-20 Token address (The contract address of the token being used for purchase)
    IERC20 public erc20Token;
    
    // Events for tracking model listing and purchase actions
    event ModelListed(uint256 modelId, string name, address indexed seller, uint256 price);
    event ModelPurchased(uint256 modelId, address indexed buyer, uint256 price);

    // Constructor to initialize ERC-20 token address
    constructor(address _erc20Token) {
        erc20Token = IERC20(_erc20Token);
    }

    // Function to list a new AI model for sale
    function listModel(
        string memory _name,
        string memory _description,
        uint256 _price
    ) public {
        require(_price > 0, "Price must be greater than zero");
        
        modelCount++;
        models[modelCount] = Model({
            name: _name,
            description: _description,
            price: _price,
            seller: payable(msg.sender),
            isSold: false
        });

        emit ModelListed(modelCount, _name, msg.sender, _price);
    }

    // Function to purchase an AI model with ERC-20 tokens
    function purchaseModel(uint256 _modelId) public {
        Model storage model = models[_modelId];
        
        require(!model.isSold, "Model already sold");
        require(model.price > 0, "Model price is not set");
        
        // Transfer the ERC-20 tokens from buyer to seller
        uint256 priceInTokens = model.price;
        require(erc20Token.balanceOf(msg.sender) >= priceInTokens, "Insufficient token balance");
        require(erc20Token.transferFrom(msg.sender, model.seller, priceInTokens), "Token transfer failed");
        
        // Mark the model as sold
        model.isSold = true;

        emit ModelPurchased(_modelId, msg.sender, priceInTokens);
    }

    // Function to retrieve the details of a model
    function getModelDetails(uint256 _modelId) public view returns (
        string memory name,
        string memory description,
        uint256 price,
        address seller,
        bool isSold
    ) {
        Model memory model = models[_modelId];
        return (model.name, model.description, model.price, model.seller, model.isSold);
    }

    // Function to get the balance of ERC-20 tokens of a user
    function getUserBalance(address _user) public view returns (uint256) {
        return erc20Token.balanceOf(_user);
    }

    // Function to allow the contract owner to withdraw tokens
    function withdrawTokens(uint256 _amount) public {
        require(erc20Token.balanceOf(address(this)) >= _amount, "Insufficient contract balance");
        erc20Token.transfer(msg.sender, _amount);
    }
}
