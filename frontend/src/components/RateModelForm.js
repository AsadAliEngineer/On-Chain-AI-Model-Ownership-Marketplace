import React, { useState, useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import { Alert, Form, Button } from 'react-bootstrap';

const RateModelForm = ({ modelId, fetchModels }) => {
  const [rating, setRating] = useState('');
  const [error, setError] = useState(null);
  const { contract, account } = useContext(Web3Context);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check rating value
    const numericRating = Number(rating);
    if (numericRating < 1 || numericRating > 5) {
      setError('Rating must be between 1 and 5');
      return;
    }

    const numericModelId = parseInt(modelId, 10);

    if (isNaN(numericModelId)) {
      setError('Model ID is invalid');
      return;
    }

    try {
      await contract.methods.rateModel(modelId, numericRating).send({ from: account });
      setRating(''); // Clear input after submission
      setError(null); // Clear error on successful submission
      fetchModels(); // Refresh the model list after a successful rating submission
    } catch (err) {
      console.error(err); // Log the full error to the console
      setError('Failed to submit rating: ' + (err.message || 'Unknown error'));
    }
  };

  return (
    <Form onSubmit={handleSubmit} className="my-4 p-3 border rounded shadow-sm bg-light">
      <Form.Group controlId="rating">
        <Form.Label>Rate Model (1-5)</Form.Label>
        <Form.Control
          type="number"
          placeholder="Enter rating"
          value={rating}
          onChange={(e) => setRating(e.target.value)}
          required
          min={1}
          max={5}
          className="mb-3"
        />
      </Form.Group>
      <Button variant="primary" type="submit" className="w-100">
        Rate Model
      </Button>
      {error && <Alert variant="danger" className="mt-2">{error}</Alert>}
    </Form>
  );
};

export default RateModelForm;
