import React, { useRef } from 'react';
import { UploadCloud } from 'lucide-react';

export default function UploadBox({ title, description, onFileSelected }) {
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileSelected(e.target.files[0]);
    }
  };

  return (
    <div className="upload-box" onClick={() => fileInputRef.current.click()}>
      <div className="upload-icon-wrapper">
        <UploadCloud size={40} className="upload-icon" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      <button className="browse-btn">Browse Files</button>
      <input 
        type="file" 
        accept="image/*" 
        ref={fileInputRef} 
        style={{ display: 'none' }} 
        onChange={handleFileChange} 
      />
    </div>
  );
}
