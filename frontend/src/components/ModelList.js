import React, { useEffect, useState, useContext, useCallback } from 'react';
import { Web3Context } from '../context/Web3Context';
import PurchaseModelButton from './PurchaseModelButton';
import Web3 from 'web3';
import { Container, Row, Col, Card, Button, Spinner, Alert, Modal } from 'react-bootstrap';
import RateModelForm from './RateModelForm';
import ListModel from './ListModelForm'; // Import the new ListModel component

const ModelList = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { contract, account } = useContext(Web3Context);
  const [showModal, setShowModal] = useState(false);
  const [selectedModel, setSelectedModel] = useState(null);
  const web3 = new Web3();

  const fetchModels = useCallback(async () => {
    if (!contract) {
      console.log('Contract not yet initialized, returning early.');
      return;
    }

    setLoading(true);

    try {
      const totalModelsBigInt = await contract.methods.totalModels().call();
      const totalModels = Number(totalModelsBigInt);

      const modelsArray = await Promise.all(
        Array.from({ length: totalModels }, async (_, i) => {
          try {
            return await contract.methods.getModelDetails(i).call({ gas: 3000000 });
          } catch (innerErr) {
            console.error(`Error fetching model details for index ${i}:`, innerErr);
            return null;
          }
        })
      );

      const validModels = modelsArray.filter(model => model !== null);

      const formattedModels = validModels.map((model) => {
        const priceInEther = model[2] ? web3.utils.fromWei(model[2].toString(), 'ether') : 'N/A';
        const averageRating = model[4] ? (Number(model[4]) / 100).toFixed(2) : 'No rating yet'; // Convert back to float for display          
        const buyers = model[5];

        return {
          name: model[0],
          description: model[1],
          price: priceInEther,
          creator: model[3],
          averageRating: averageRating,
          buyers: buyers,
        };
      });

      setModels(formattedModels);
    } catch (err) {
      console.error('Error fetching total models:', err);
      setError('Error fetching models: ' + err.message);
    } finally {
      setLoading(false);
    }
  }, [contract, web3.utils]);

  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  const handleOpenModal = (model) => {
    setSelectedModel(model);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedModel(null);
  };

  if (loading) {
    return <div>Loading models...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Container>
      <h2 className="my-4">Available Models</h2>

      {loading && <Spinner animation="border" role="status"><span className="sr-only">Loading...</span></Spinner>}
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        {models.map((model, index) => (
          <Col key={index} md={4} className="mb-4">
            <Card>
              <Card.Body>
                <Card.Title>
                  Name: <span className="fw-bold">{model.name}</span>
                </Card.Title>
                <Card.Text>
                  Description: <span className="fw-bold">{model.description}</span>
                </Card.Text>
                <Card.Text>
                  Price: <span className="fw-bold">{model.price} ETH</span>
                </Card.Text>
                <Card.Text>
                  Average Rating: <span className="fw-bold">{model.averageRating && model.averageRating !== '0' ? model.averageRating : 'No rating yet'}</span>
                </Card.Text>

                <Button variant="info" onClick={() => handleOpenModal(model)}>
                  View Details
                </Button>
                <RateModelForm modelId={index} fetchModels={fetchModels} /> {/* Pass fetchModels as a prop */}
                <PurchaseModelButton modelId={index} />
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>


      {/* Move the List Model form to the ListModel component */}
      <ListModel contract={contract} account={account} fetchModels={fetchModels}/>

      {selectedModel && (
        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>Model Details: {selectedModel.name}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div><strong>Description:</strong> {selectedModel.description}</div>
            <div><strong>Price:</strong> {selectedModel.price} ETH</div>
            <div><strong>Creator:</strong> {selectedModel.creator}</div>
            <div><strong>Average Rating:</strong> {selectedModel.averageRating}</div>
            <div><strong>Buyers:</strong> {selectedModel.buyers.length > 0 ? selectedModel.buyers.join(', ') : 'No buyers yet'}</div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
};

export default ModelList;
