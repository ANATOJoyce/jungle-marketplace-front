interface CloudinaryUploadWidget {
  open: () => void;
}

interface Cloudinary {
  createUploadWidget: (
    options: any,
    callback: (error: any, result: any) => void
  ) => CloudinaryUploadWidget;
}

interface Window {
  cloudinary: Cloudinary;
}
