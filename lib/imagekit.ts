const ENDPOINT = process.env.EXPO_PUBLIC_IMAGEKIT_ENDPOINT ?? ''
const PUBLIC_KEY = process.env.EXPO_PUBLIC_IMAGEKIT_PUBLIC_KEY ?? ''
const UPLOAD_URL = 'https://upload.imagekit.io/api/v1/files/upload'

export interface ImageKitUploadResult {
  fileId: string
  name: string
  url: string
  filePath: string
  width: number
  height: number
  size: number
}

export interface UploadProgress {
  loaded: number
  total: number
  percent: number
}

export async function uploadImage(
  localUri: string,
  fileName: string,
  folder = '/menu-items',
  onProgress?: (progress: UploadProgress) => void,
): Promise<ImageKitUploadResult> {
  const formData = new FormData()

  formData.append('file', {
    uri: localUri,
    type: 'image/jpeg',
    name: fileName,
  } as unknown as Blob)

  formData.append('fileName', fileName)
  formData.append('publicKey', PUBLIC_KEY)
  formData.append('folder', folder)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()

    xhr.open('POST', UPLOAD_URL)

    if (onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          onProgress({
            loaded: e.loaded,
            total: e.total,
            percent: Math.round((e.loaded / e.total) * 100),
          })
        }
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText) as ImageKitUploadResult)
      } else {
        reject(new Error(`ImageKit upload failed: ${xhr.status} ${xhr.responseText}`))
      }
    }

    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.ontimeout = () => reject(new Error('Upload timed out'))
    xhr.timeout = 60000

    xhr.send(formData)
  })
}

export async function deleteImage(fileId: string): Promise<void> {
  const response = await fetch(
    `https://api.imagekit.io/v1/files/${fileId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Basic ${btoa(PUBLIC_KEY + ':')}`,
      },
    },
  )

  if (!response.ok && response.status !== 404) {
    throw new Error(`ImageKit delete failed: ${response.status}`)
  }
}

export function transformUrl(
  url: string,
  opts: {
    width?: number
    height?: number
    quality?: number
    format?: 'auto' | 'webp' | 'jpg' | 'png'
    crop?: 'maintain_ratio' | 'force' | 'at_least' | 'at_max'
    focus?: 'auto' | 'face' | 'center'
  } = {},
): string {
  if (!url) return url

  const {
    width,
    height,
    quality = 80,
    format = 'auto',
    crop = 'maintain_ratio',
    focus = 'auto',
  } = opts

  const parts: string[] = []

  if (width) parts.push(`w-${width}`)
  if (height) parts.push(`h-${height}`)
  if (width || height) parts.push(`c-${crop}`)
  if (focus !== 'center') parts.push(`fo-${focus}`)
  parts.push(`q-${quality}`)
  parts.push(`f-${format}`)

  const transform = parts.join(',')

  return url.replace(ENDPOINT, `${ENDPOINT}/tr:${transform}`)
}

export const ImageKitFolders = {
  menuItems: '/menu-items',
  logos: '/branding/logos',
  covers: '/branding/covers',
} as const