// src/components/ModelDetails.js
import React, { useEffect, useState, useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import RateModelForm from './RateModelForm';

const ModelDetails = ({ modelId }) => {
  const [details, setDetails] = useState(null);
  const { contract } = useContext(Web3Context);

  useEffect(() => {
    const fetchDetails = async () => {
      const modelDetails = await contract.methods.getModelDetails(modelId).call();
      setDetails(modelDetails);
    };

    fetchDetails();
  }, [contract, modelId]);

  return (
    <div>
      {details && (
        <div>
          <RateModelForm modelId={modelId} />
        </div>
      )}
    </div>
  );
};

export default ModelDetails;
