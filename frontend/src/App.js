// src/App.js
import React from 'react';
import ModelList from './components/ModelList';
import WithdrawFundsButton from './components/WithdrawFundsButton';
import { Web3Provider } from './context/Web3Context';
import 'bootstrap/dist/css/bootstrap.min.css';
import CurrentAccountInfo from './components/CurrentAccountInfo';

const App = () => {
  return (
    <Web3Provider>
      <div className="container mt-5">
        <h1 className="text-center">AI Model Marketplace</h1>
        <CurrentAccountInfo/>
        <ModelList />
        <WithdrawFundsButton />
      </div>
    </Web3Provider>
  );
};

export default App;
