import React, { useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import { Button } from 'react-bootstrap';
import Web3 from 'web3';

const PurchaseModelButton = ({ modelId }) => {
  const { contract, account, web3 } = useContext(Web3Context);

  const handlePurchase = async () => {
    try {

      const weiBalance = await web3.eth.getBalance(account);
      const ethBalance = Web3.utils.fromWei(weiBalance, 'ether');

      // Get the model price in Wei
      const model = await contract.methods.models(modelId).call();
      const modelPriceInWei = model.price;
      
      // Proceed with the purchase transaction
      await contract.methods.purchaseModel(modelId).send({
        from: account,
        value: modelPriceInWei,
      });
    } catch (err) {
      console.error('Error purchasing model:', err);
    }
  };

  return (
    <Button
      onClick={handlePurchase}
      variant="primary"
      style={{ padding: '10px 20px', marginTop: '10px' }}
    >
      Purchase Model
    </Button>
  );
};

export default PurchaseModelButton;
