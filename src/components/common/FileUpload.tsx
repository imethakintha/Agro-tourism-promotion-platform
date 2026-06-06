import React, { useState } from 'react';
import { Upload, X, Loader2, FileText, CheckCircle, Image as ImageIcon } from 'lucide-react';
import { uploadFile } from '../../services/providerService';

interface FileUploadProps {
  label: string;
  onUpload: (url: string) => void;
  accept?: string;
  helperText?: string; // අලුතෙන් දැම්මා: පොඩි විස්තරයක් යටින් පෙන්වන්න (උදා: JPG, PNG only)
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  label, 
  onUpload, 
  accept = "image/*,.pdf",
  helperText = "Supported formats: PDF, JPG, PNG (Max 5MB)"
}) => {
  const [uploading, setUploading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null); // ගොනුවේ නම පෙන්වන්න
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // සරල validation එකක්
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('File is too large. Max size is 5MB.');
        return;
    }

    setUploading(true);
    setError(null);
    setFileName(file.name);

    try {
      const url = await uploadFile(file);
      setFileUrl(url);
      onUpload(url);
    } catch (err) {
      setError('Upload failed. Please check your connection and try again.');
      setFileName(null);
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = () => {
    setFileUrl(null);
    setFileName(null);
    onUpload('');
    setError(null);
  };

  return (
    <div className="mb-6 font-sans group">
      <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">
        {label}
      </label>
      
      {!fileUrl ? (
        <div className={`
            relative border-2 border-dashed rounded-2xl p-6 transition-all duration-300 text-center
            ${error ? 'border-red-300 bg-red-50' : 'border-gray-300 bg-gray-50 hover:bg-primary/5 hover:border-primary/50'}
        `}>
           <input 
            type="file" 
            id={`file-${label}`} 
            className="hidden" 
            onChange={handleFileChange}
            accept={accept}
            disabled={uploading}
           />
           
           <label 
             htmlFor={`file-${label}`} 
             className={`flex flex-col items-center justify-center w-full h-full ${!uploading && 'cursor-pointer'}`}
           >
             {uploading ? (
               <div className="flex flex-col items-center animate-pulse">
                 <Loader2 className="h-10 w-10 text-primary animate-spin mb-3" />
                 <span className="text-sm font-medium text-primary">Uploading secure file...</span>
               </div>
             ) : (
               <>
                 <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                    <Upload className="h-6 w-6 text-primary" />
                 </div>
                 <span className="text-sm font-medium text-gray-700">
                    Click to upload
                 </span>
                 <span className="text-xs text-gray-400 mt-1">
                    {helperText}
                 </span>
               </>
             )}
           </label>
        </div>
      ) : (
        // --- Success State (File Uploaded) ---
        <div className="relative flex items-center p-4 bg-white border border-green-200 rounded-2xl shadow-sm group-hover:shadow-md transition-shadow">
           {/* Icon based on file type (Mock logic) */}
           <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mr-3">
              {accept.includes('image') ? <ImageIcon size={20} className="text-green-600"/> : <FileText size={20} className="text-green-600"/>}
           </div>
           
           <div className="flex-1 min-w-0 mr-2">
              <p className="text-sm font-bold text-gray-800 truncate">
                 {fileName || "Uploaded Document"}
              </p>
              <p className="text-xs text-green-600 flex items-center mt-0.5">
                 <CheckCircle size={10} className="mr-1" /> Upload Complete
              </p>
           </div>

           <button 
             type="button" 
             onClick={handleRemove} 
             className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
             title="Remove file"
           >
             <X size={18} />
           </button>
        </div>
      )}

      {error && (
          <p className="text-xs font-medium text-red-500 mt-2 flex items-center ml-1 animate-fade-in">
             <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></span>
             {error}
          </p>
      )}
    </div>
  );
};

export default FileUpload;