import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import Web3 from 'web3';

const ListModel = ({ contract, account, fetchModels }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState(null);
  const web3 = new Web3(); // Initialize Web3 if needed

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission

    try {
      const priceInWei = web3.utils.toWei(price, 'ether');
      try {
        const receipt = await contract.methods.listModel(name, description, price)
          .send({ from: account, value: price });
      } catch (error) {
          console.error("Error listing model:", error);
      }

      // Clear form fields
      setName('');
      setDescription('');
      setPrice('');

      fetchModels();
    } catch (err) {
      console.error('Error listing model:', err);
      setError('Error listing model: ' + err.message);
    }
  };

  return (
    <>
      {error && <Alert variant="danger">{error}</Alert>}
      <h3 className="my-4">List a New Model</h3>
      <Form onSubmit={handleSubmit} className='border border-3 border-primary rounded-4 p-4 my-5'>
        <Form.Group controlId="formModelName">
          <Form.Label>Model Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter model name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formDescription">
          <Form.Label>Description</Form.Label>
          <Form.Control
            type="text"
            placeholder="Enter description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </Form.Group>
        <Form.Group controlId="formPrice">
          <Form.Label>Price (in WEI)</Form.Label>
          <Form.Control
            type="number"
            placeholder="Enter price in WEI"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </Form.Group>
        <Button className='my-4' variant="primary" type="submit">
          List Model
        </Button>
      </Form>
    </>
  );
};

export default ListModel;
