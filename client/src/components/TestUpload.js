import React, { useState } from 'react';
import { FaUpload, FaCheck, FaTimes } from 'react-icons/fa';

const TestUpload = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/test/test-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.result);
      } else {
        setError(data.message || 'Upload failed');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto bg-dark-800 rounded-lg">
      <h2 className="text-xl font-bold text-white mb-4">Test Cloudinary Upload</h2>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-white mb-2">
            Select File
          </label>
          <input
            type="file"
            onChange={handleFileSelect}
            accept="image/*,video/*"
            className="block w-full text-sm text-dark-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-500 file:text-white hover:file:bg-primary-600"
          />
        </div>

        {file && (
          <div className="text-sm text-white">
            Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || uploading}
          className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {uploading ? (
            <>
              <FaUpload className="animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <FaUpload />
              Upload to Cloudinary
            </>
          )}
        </button>

        {error && (
          <div className="p-3 bg-red-500/20 border border-red-500/30 rounded text-red-400 flex items-center gap-2">
            <FaTimes />
            {error}
          </div>
        )}

        {result && (
          <div className="p-3 bg-green-500/20 border border-green-500/30 rounded text-green-400">
            <div className="flex items-center gap-2 mb-2">
              <FaCheck />
              Upload Successful!
            </div>
            <div className="text-sm space-y-1">
              <div>URL: <a href={result.url} target="_blank" rel="noopener noreferrer" className="underline">{result.url}</a></div>
              <div>Public ID: {result.public_id}</div>
              <div>Format: {result.format}</div>
              <div>Type: {result.resource_type}</div>
            </div>
            {result.resource_type === 'image' && (
              <img src={result.url} alt="Uploaded" className="mt-2 max-w-full h-auto rounded" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TestUpload;
