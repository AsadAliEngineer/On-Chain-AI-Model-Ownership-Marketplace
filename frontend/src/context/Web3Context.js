import React, { createContext, useEffect, useState } from 'react';
import Web3 from 'web3';
import AIModelMarketplaceABI from '../abis/AImodelMarketplace.json';

const Web3Context = createContext();

const Web3Provider = ({ children }) => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initWeb3 = async () => {
      try {
        let web3Instance;

        // Check for MetaMask or existing provider
        if (window.ethereum) {
          web3Instance = new Web3(window.ethereum);
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          
          // Listen for account changes
          window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
              setAccount(accounts[0]);
            } else {
              setError('No accounts found. Please check MetaMask.');
            }
          });

          // Listen for network changes
          window.ethereum.on('chainChanged', (chainId) => {
            window.location.reload();
          });

        } else if (window.web3) {
          web3Instance = new Web3(window.web3.currentProvider);
        } else {
          // Fallback to Ganache or another local network
          web3Instance = new Web3('http://127.0.0.1:7545');
          setError('No MetaMask found. Using local network.');
        }

        setWeb3(web3Instance);

        // Get account and network details
        const accounts = await web3Instance.eth.getAccounts();
        if (accounts.length === 0) {
          setError('No accounts found. Please check MetaMask.');
        } else {
          setAccount(accounts[0]);
        }

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = AIModelMarketplaceABI.networks[networkId];

        // Check if contract is deployed on the network
        if (deployedNetwork) {
          const contractInstance = new web3Instance.eth.Contract(
            AIModelMarketplaceABI.abi,
            deployedNetwork.address,
          );

          setContract(contractInstance);
        } else {
          // console.log(AIModelMarketplaceABI.abi)
          console.log(deployedNetwork.address)
          setError('Contract not deployed on this network.');
          console.error('No contract deployed on this network');
        }

      } catch (err) {
        setError(`Error initializing Web3: ${err.message}`);
        console.error('Error initializing Web3:', err);
      }
    };

    initWeb3();
  }, []);

  return (
    <Web3Context.Provider value={{ web3, account, contract, error }}>
      {children}
      {error && <div className="error-message">{error}</div>}
    </Web3Context.Provider>
  );
};

export { Web3Provider, Web3Context };
