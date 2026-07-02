import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';
import AIModelMarketplace from './abis/AIModelMarketplace.json';
import AITU_Nurassyl from './abis/AITU_Nurassyl.json';

const App = () => {
  const [account, setAccount] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [models, setModels] = useState([]);
  const [contract, setContract] = useState(null);
  const [tokenContract, setTokenContract] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  
  const [modelName, setModelName] = useState('');
  const [modelDescription, setModelDescription] = useState('');
  const [modelPrice, setModelPrice] = useState('');

  // Connect to MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        await provider.send('eth_requestAccounts', []);
        const signer = provider.getSigner();
        const address = await signer.getAddress();
        setAccount(address);
        setIsConnected(true);
        
        // Initialize the contracts
        const networkId = await provider.getNetwork();
        const aiMarketplaceContract = new ethers.Contract(
          AIModelMarketplace.networks[networkId.chainId].address,
          AIModelMarketplace.abi,
          signer
        );
        const tokenContract = new ethers.Contract(
          AITU_Nurassyl.networks[networkId.chainId].address,
          AITU_Nurassyl.abi,
          signer
        );
        
        setContract(aiMarketplaceContract);
        setTokenContract(tokenContract);

        // Get the token balance
        const balance = await tokenContract.balanceOf(address);
        setTokenBalance(ethers.utils.formatUnits(balance, 'ether'));
      } catch (error) {
        console.error('Error connecting to MetaMask:', error);
      }
    } else {
      alert('Please install MetaMask to connect your wallet.');
    }
  };

  // Fetch models listed in the marketplace
  const fetchModels = async () => {
    if (contract) {
      const totalModels = await contract.totalModels();
      const modelList = [];
      
      for (let i = 0; i < totalModels; i++) {
        const model = await contract.models(i);
        modelList.push(model);
      }

      setModels(modelList);
    }
  };

  // List a new AI model
  const listModel = async () => {
    if (!modelName || !modelDescription || !modelPrice) {
      alert('Please provide all model details.');
      return;
    }
    
    if (contract && tokenContract) {
      try {
        const priceInTokens = ethers.utils.parseUnits(modelPrice, 'ether');
        await contract.listModel(modelName, modelDescription, priceInTokens, { value: priceInTokens });
        setModelName('');
        setModelDescription('');
        setModelPrice('');
        fetchModels(); // Refresh the list after listing
      } catch (error) {
        console.error('Error listing the model:', error);
      }
    }
  };

  // Purchase an AI model
  const purchaseModel = async (modelId, price) => {
    if (contract && tokenContract) {
      try {
        const priceInTokens = ethers.utils.parseUnits(price, 'ether');
        await tokenContract.approve(contract.address, priceInTokens);
        await contract.purchaseModel(modelId, { value: priceInTokens });
        fetchModels(); // Refresh the list after purchasing
      } catch (error) {
        console.error('Error purchasing model:', error);
      }
    }
  };

  useEffect(() => {
    if (isConnected) {
      fetchModels();
    }
  }, [isConnected, contract]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>AI Model Marketplace</h1>
        {!isConnected ? (
          <button onClick={connectWallet}>Connect MetaMask</button>
        ) : (
          <div>
            <p>Connected as: {account}</p>
            <p>Token Balance: {tokenBalance} UTK</p>
            <div>
              <h2>List a New Model</h2>
              <input
                type="text"
                placeholder="Model Name"
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
              />
              <textarea
                placeholder="Model Description"
                value={modelDescription}
                onChange={(e) => setModelDescription(e.target.value)}
              />
              <input
                type="text"
                placeholder="Price in UTK"
                value={modelPrice}
                onChange={(e) => setModelPrice(e.target.value)}
              />
              <button onClick={listModel}>List Model</button>
            </div>
            <h2>Available AI Models</h2>
            {models.length > 0 ? (
              models.map((model, index) => (
                <div key={index} className="model">
                  <h3>{model.name}</h3>
                  <p>{model.description}</p>
                  <p>Price: {ethers.utils.formatUnits(model.price, 'ether')} UTK</p>
                  <p>Seller: {model.seller}</p>
                  <button onClick={() => purchaseModel(index, ethers.utils.formatUnits(model.price, 'ether'))}>
                    Purchase
                  </button>
                </div>
              ))
            ) : (
              <p>No models available.</p>
            )}
          </div>
        )}
      </header>
    </div>
  );
};

export default App;
