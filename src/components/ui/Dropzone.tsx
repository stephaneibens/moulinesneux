'use client'

import React, { useState, useRef } from 'react'

interface DropzoneProps {
  onUpload: (url: string) => void
  accept?: string
  maxSizeMB?: number
}

export function Dropzone({ onUpload, accept = "*/*", maxSizeMB = 70 }: DropzoneProps) {
  const [isHover, setIsHover] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
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
    try {
      const formData = new FormData()
      formData.append('file', file)
      
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || "Erreur lors de l'upload")
      }
      
      setSuccess(true)
      onUpload(data.url)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setIsUploading(false)
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
        <p className="text-[var(--text-secondary)]">Téléversement en cours...</p>
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
