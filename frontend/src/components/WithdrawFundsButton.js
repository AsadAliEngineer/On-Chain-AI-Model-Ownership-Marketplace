import React, { useContext, useState } from 'react';
import { Web3Context } from '../context/Web3Context';
import { Button, Card, Alert, Spinner } from 'react-bootstrap';

const WithdrawFundsButton = () => {
  const { contract, account } = useContext(Web3Context); // Get the account from context
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false); // State for loading

  const handleWithdraw = async () => {
    setLoading(true); // Set loading to true
    setError(null); // Clear previous errors
    setSuccess(null); // Clear previous success messages

    const owner = await contract.methods.owner().call();
    console.log("Contract Owner:", owner);


    try {
      await contract.methods.withdrawFunds().send({ from: account }); // Use the connected account
      setSuccess('Withdrawal successful!');
    } catch (err) {
      console.error(err);
      setError('Failed to withdraw funds: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <Card className="mx-auto my-4" style={{ maxWidth: '350px' }}>
      <Card.Body className="text-center">
        <h4>Withdraw Funds</h4>
        <Button variant="success" onClick={handleWithdraw} className="mt-3" disabled={loading}>
          {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Withdraw Funds'}
        </Button>
        {success && <Alert variant="success" className="mt-3">{success}</Alert>}
        {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
      </Card.Body>
    </Card>
  );
};

export default WithdrawFundsButton;
