import { createFileRoute } from '@tanstack/react-router'
import { Authenticated, useQuery, useMutation } from 'convex/react'
import { api } from '../../convex/_generated/api'
import { useState, useRef } from 'react'

export const Route = createFileRoute('/demo/file-upload')({
  component: FileUploadDemo,
})

function FileUploadDemo() {
  const agents = useQuery(api.agents.getAgentsForUser)
  const firstAgent = agents?.[0]
  
  const generateUploadUrl = useMutation(api.files.generateUploadUrl)
  const saveFileMetadata = useMutation(api.files.saveFileMetadata)
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async () => {
    if (!selectedFile || !firstAgent) return

    setIsUploading(true)
    setUploadStatus('Generating upload URL...')

    try {
      // Step 1: Get upload URL
      const postUrl = await generateUploadUrl()
      setUploadStatus('Uploading file...')

      // Step 2: Upload file to Convex storage
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      })

      if (!result.ok) {
        throw new Error('Upload failed')
      }

      const { storageId } = await result.json()
      setUploadStatus('Saving metadata...')

      // Step 3: Save file metadata
      await saveFileMetadata({
        storageId,
        agentId: firstAgent._id,
        filename: selectedFile.name,
        contentType: selectedFile.type,
        size: selectedFile.size,
      })

      setUploadStatus('Upload successful!')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error) {
      console.error('Upload error:', error)
      setUploadStatus(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Authenticated>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">File Upload Demo</h1>
            
            {!firstAgent ? (
              <div className="text-center py-8">
                <p className="text-gray-600">
                  You need to create an agent first to test file uploads.
                </p>
                <a 
                  href="/dashboard/agents/new" 
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Create Agent
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-gray-600 mb-4">
                    Testing file upload with agent: <strong>{firstAgent.name}</strong>
                  </p>
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="mt-4">
                      <label htmlFor="file-upload" className="cursor-pointer">
                        <span className="mt-2 block text-sm font-medium text-gray-900">
                          Select a file to upload
                        </span>
                        <input
                          id="file-upload"
                          ref={fileInputRef}
                          type="file"
                          className="sr-only"
                          accept=".pdf,.doc,.docx,.txt"
                          onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                        />
                        <span className="mt-2 block text-sm text-gray-500">
                          PDF, DOC, DOCX, TXT up to 10MB
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {selectedFile && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">Selected File:</h3>
                    <div className="text-sm text-gray-600">
                      <p><strong>Name:</strong> {selectedFile.name}</p>
                      <p><strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p><strong>Type:</strong> {selectedFile.type}</p>
                    </div>
                  </div>
                )}

                {uploadStatus && (
                  <div className={`p-4 rounded-lg ${
                    uploadStatus.includes('successful') ? 'bg-green-50 text-green-700' :
                    uploadStatus.includes('failed') ? 'bg-red-50 text-red-700' :
                    'bg-blue-50 text-blue-700'
                  }`}>
                    {uploadStatus}
                  </div>
                )}

                <div className="flex justify-end">
                  <button
                    onClick={handleFileUpload}
                    disabled={!selectedFile || isUploading}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Task 5.1 Status</h2>
              <div className="flex items-center text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                Convex File Storage Setup Complete
              </div>
            </div>
          </div>
        </div>
      </div>
    </Authenticated>
  )
} 