import { PinataSDK } from "pinata-web3"

// Initialize Pinata client
const pinataJwt = process.env.NEXT_PUBLIC_PINATA_JWT
const pinataGateway = process.env.NEXT_PUBLIC_PINATA_GATEWAY

if (!pinataJwt || !pinataGateway) {
  throw new Error('Pinata credentials are not configured')
}

const pinata = new PinataSDK({
  pinataJwt,
  pinataGateway
})

// Status types for Pinata uploads
type UploadStatus = 'Started' | 'PinningFailed' | 'InQueue' | 'DataCapExceed' | 'Complete'

export async function uploadToIPFS(file: Blob, filename: string): Promise<string> {
  try {
    // Create a File object from the Blob
    const fileObj = new File([file], filename, { type: file.type })
    
    // Upload the file to Pinata
    console.log(`Uploading file ${filename} to IPFS...`)
    const result = await pinata.upload.file(fileObj)
    
    console.log(`File uploaded successfully with CID: ${result.IpfsHash}`)
    return `https://${pinataGateway}/ipfs/${result.IpfsHash}/${filename}`
  } catch (error) {
    console.error('Error uploading to IPFS:', error)
    throw error
  }
}

export async function uploadMetadataToIPFS(metadata: any): Promise<string> {
  try {
    // Upload the metadata directly as JSON
    console.log('Uploading metadata to IPFS...')
    const result = await pinata.upload.json(metadata)
    
    console.log(`Metadata uploaded successfully with CID: ${result.IpfsHash}`)
    return `https://${pinataGateway}/ipfs/${result.IpfsHash}`
  } catch (error) {
    console.error('Error uploading metadata to IPFS:', error)
    throw error
  }
}