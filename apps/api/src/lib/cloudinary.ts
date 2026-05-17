import { v2 as cloudinary } from 'cloudinary'

// Configured lazily — if env vars missing, upload calls will fail with a clear error
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME ?? '',
  api_key: process.env.CLOUDINARY_API_KEY ?? '',
  api_secret: process.env.CLOUDINARY_API_SECRET ?? '',
  secure: true,
})

export { cloudinary }
