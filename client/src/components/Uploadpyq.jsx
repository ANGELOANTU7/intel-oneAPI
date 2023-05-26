import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Lottie from 'lottie-react';
import animationData from '../assets/101391-online-test.json';
import { Link } from 'react-router-dom';

function Uploadpyq({ moduleNumber }) {
  const [numNotes, setNumNotes] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [fadeOut, setFadeOut] = useState(false); // New state to control fading out

  const handleNumNotesChange = (event) => {
    const count = parseInt(event.target.value, 10);
    setNumNotes(count);
    setSelectedFiles(new Array(count).fill(null));
    setUploadSuccess(false);
  };

  const handleFileChange = (index, event) => {
    const file = event.target.files[0];
    const updatedFiles = [...selectedFiles];
    updatedFiles[index] = file;
    setSelectedFiles(updatedFiles);
    setUploadSuccess(false);
  };

  const handleUpload = () => {
    if (selectedFiles.some((file) => file === null)) {
      return;
    }

    setUploading(true);

    const promises = selectedFiles.map((file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const fileContents = reader.result;
          const blob = new Blob([fileContents], { type: file.type });
          const filePath = `Local_Storage/notes_pdf/module_${moduleNumber}/${file.name}`;

          saveFileLocally(filePath, blob)
            .then(() => {
              resolve();
            })
            .catch((error) => {
              console.error('Error saving file:', error);
              reject(error);
            });
        };

        reader.readAsArrayBuffer(file);
      });
    });

    Promise.all(promises)
      .then(() => {
        setUploadSuccess(true);
        setUploading(false);
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          setFadeOut(true); // Set fadeOut state to true after the success message
        }, 10000); // Set timeout for 10 seconds
      })
      .catch((error) => {
        console.error('Error uploading files:', error);
        setUploading(false);
      });
  };

  const saveFileLocally = (filePath, file) => {
    return new Promise((resolve, reject) => {
      const virtualLink = document.createElement('a');
      virtualLink.href = URL.createObjectURL(file);
      virtualLink.download = filePath;
      virtualLink.addEventListener('load', () => {
        URL.revokeObjectURL(virtualLink.href);
        resolve();
      });
      virtualLink.addEventListener('error', (error) => {
        reject(error);
      });
      document.body.appendChild(virtualLink);
      virtualLink.click();
      document.body.removeChild(virtualLink);
    });
  };

  const handleUploadAnother = () => {
    setSelectedFiles(new Array(numNotes).fill(null));
    setUploadSuccess(false);
    setShowSuccessMessage(false);
    setFadeOut(false);
  };

  const renderUploadInputs = () => {
    const inputs = [];

    for (let i = 0; i < numNotes; i++) {
      inputs.push(
        <div key={`upload-input-${i}`}>
          <label>PYQ {i + 1} :</label>
          <input
            type="file"
            accept="application/pdf"
            className="mb-4 rounded-md px-3"
            onChange={(event) => handleFileChange(i, event)}
          />
        </div>
      );
    }

    return inputs;
  };

  return (
    <div className="flex flex-col items-center justify-center w-screen h-screen text-center bg-gradient-to-tr from-violet-700 via-green-600 to-green-400">
      {!fadeOut && (
        <motion.div
          className="bg-violet-900 text-white py-6 px-6 mt-8 mb-8 rounded-lg shadow-lg justify-center items-center flex flex-col"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Lottie animationData={animationData} style={{ width: 400, height: 300 }} />
          <h1 className="text-3xl font-bold mb-4">Upload PYQ  {moduleNumber}</h1>
          {!uploadSuccess ? (
            <>
              <label htmlFor="num-notes" className="block font-medium mb-2">
                Number of PYQs to upload:
              </label>
              <input
                type="number"
                id="num-notes"
                min={0}
                value={numNotes}
                onChange={handleNumNotesChange}
                className="border border-gray-300 rounded-md px-3 py-2 mb-4"
              />
              {renderUploadInputs()}
              <motion.button
                className={`bg-green-500 text-white py-2 px-6 rounded-lg ml-4 ${
                  uploading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={uploading || selectedFiles.some((file) => file === null)}
                onClick={handleUpload}
                whileHover={!uploading ? { scale: 1.05 } : {}}
                whileTap={!uploading ? { scale: 0.95 } : {}}
              >
                {uploading ? 'Uploaded' : 'Upload'}
              </motion.button>
              <Link to="/uploadsyllabus" className="bg-green-500 text-white py-3 px-6 ml-4 rounded-lg mt-4">
                Next
              </Link>
            </>
          ) : (
            <>
              {showSuccessMessage && (
                <motion.div
                  className="text-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  Successfully Uploaded!
                </motion.div>
              )}
              <motion.button
                className="bg-green-500 text-white py-2 px-6 rounded-lg mt-4"
                onClick={handleUploadAnother}
              >
                Upload Another
              </motion.button>
              <Link to="/uploadpyq" className="text-blue-500 underline mt-4">
                Next
              </Link>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default Uploadpyq;