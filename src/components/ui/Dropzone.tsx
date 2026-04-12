'use client'

import React, { useState, useRef } from 'react'
import { upload } from '@vercel/blob/client'

interface DropzoneProps {
  onUpload: (url: string) => void
  accept?: string
  maxSizeMB?: number
}

export function Dropzone({ onUpload, accept = "*/*", maxSizeMB = 70 }: DropzoneProps) {
  const [isHover, setIsHover] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setSuccess(false)
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Le fichier est trop volumineux. Maximum: ${maxSizeMB}MB`)
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    try {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const safeName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
      const filename = uniqueSuffix + '-' + safeName;

      const blob = await upload(filename, file, {
        access: 'public',
        handleUploadUrl: '/api/upload',
        onUploadProgress: (progressEvent) => {
           setUploadProgress(Math.round((progressEvent.loaded / progressEvent.total) * 100))
        }
      })
      
      setSuccess(true)
      onUpload(blob.url)
    } catch (e: any) {
      setError(e.message || "Erreur lors de l'upload")
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsHover(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  return (
    <div
      onClick={() => !isUploading && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsHover(true) }}
      onDragLeave={() => setIsHover(false)}
      onDrop={onDrop}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        isHover ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-gray-500 hover:border-gray-400 bg-black/10'
      } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
      style={{ borderColor: isHover ? 'var(--color-primary)' : '' }}
    >
      <input
        type="file"
        ref={inputRef}
        onChange={onChange}
        accept={accept}
        className="hidden"
      />
      {isUploading ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
          <p className="text-[var(--text-secondary)]">Téléversement en cours... {uploadProgress ? `${uploadProgress}%` : ''}</p>
          <div style={{ width: '100%', maxWidth: '200px', backgroundColor: '#e5e7eb', borderRadius: '999px', height: '10px' }}>
            <div style={{ backgroundColor: 'var(--color-primary)', height: '10px', borderRadius: '999px', width: `${uploadProgress}%`, transition: 'width 0.3s' }}></div>
          </div>
        </div>
      ) : success ? (
        <p className="text-green-500 font-medium">Fichier téléversé avec succès !</p>
      ) : (
        <div>
          <p className="font-medium text-[var(--color-primary)]">Cliquez ou glissez-déposez un fichier ici</p>
          <p className="text-sm text-[var(--text-secondary)] mt-2">
            Formats acceptés : {accept === '*/*' ? 'tous' : accept} (Max {maxSizeMB}MB)
          </p>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
    </div>
  )
}
