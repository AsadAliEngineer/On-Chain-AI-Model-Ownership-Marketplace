// src/components/CurrentAccountInfo.js
import React, { useContext, useEffect, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import Web3 from 'web3';
import { Card, Container, Alert } from 'react-bootstrap'; // Import React-Bootstrap components
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

const CurrentAccountInfo = () => {
  const { account, web3 } = useContext(Web3Context);
  const [balance, setBalance] = useState(null);
  const [accountName, setAccountName] = useState(undefined); // Initialize as undefined
  const [balanceError, setBalanceError] = useState(null); // State for balance errors

  useEffect(() => {
    const fetchAccountInfo = async () => {
      try {
        if (web3 && account) {
          // Reset error states
          setBalanceError(null);
          
          // Fetch balance
          try {
            const weiBalance = await web3.eth.getBalance(account);
            const ethBalance = Web3.utils.fromWei(weiBalance, 'ether');
            setBalance(ethBalance);
          } catch (err) {
            console.error('Balance fetch error:', err);
            setBalanceError('Error fetching balance. Please check your connection or account status.');
          }

          try {
            const ensName = await web3.eth.ens.getName(account);
            setAccountName(ensName?.name); // Set to undefined if name is not found
          } catch (err) {
            console.log('ENS name fetch error:', err.message);
          }
        }
      } catch (err) {
        console.error('General error:', err);
      }
    };

    fetchAccountInfo();
  }, [web3, account]);

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Card.Title className="text-center">Current Account</Card.Title>
          {balanceError && <Alert variant="danger">{balanceError}</Alert>} {/* Show balance error alert if any */}
          <Card.Text>
            <strong>Account Address:</strong> {account ? account : 'No account connected'}
          </Card.Text>
          <Card.Text>
            <strong>Account Name:</strong> {accountName !== undefined ? accountName : 'No name available'}
          </Card.Text>
          <Card.Text>
            <strong>Balance:</strong> {balance !== null ? `${balance} ETH` : 'Fetching balance...'}
          </Card.Text>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CurrentAccountInfo;
