export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  format: string;
  resourceType: string;
}

class CloudinaryService {
  private cloudName: string;
  private uploadPreset: string;

  constructor() {
    this.cloudName = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME || 'demo-firstaid-cloud';
    this.uploadPreset = (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET || 'first_aid_unsigned';
  }

  /**
   * Upload an image file to Cloudinary.
   * If unconfigured, generates a secure object URL or placeholder preview.
   */
  async uploadMedia(file: File, folder: 'profiles' | 'hospitals' | 'licenses' | 'chat' = 'profiles'): Promise<CloudinaryUploadResult> {
    const isConfigured = (import.meta as any).env?.VITE_CLOUDINARY_CLOUD_NAME && (import.meta as any).env?.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (isConfigured) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);
        formData.append('folder', `first_aid_hospital/${folder}`);

        const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`, {
          method: 'POST',
          body: formData
        });

        if (!response.ok) {
          throw new Error(`Cloudinary upload failed: ${response.statusText}`);
        }

        const data = await response.json();
        return {
          secureUrl: data.secure_url,
          publicId: data.public_id,
          format: data.format,
          resourceType: data.resource_type
        };
      } catch (err) {
        console.warn('Cloudinary API upload failed. Using local browser preview:', err);
      }
    }

    // Fallback URL generator for local demo mode
    const mockObjectUrl = URL.createObjectURL(file);
    return {
      secureUrl: mockObjectUrl,
      publicId: `mock_${folder}_${Date.now()}`,
      format: file.type.split('/')[1] || 'jpeg',
      resourceType: 'image'
    };
  }

  /**
   * Generates optimized Cloudinary image URLs with transformation flags
   */
  getTransformedUrl(publicId: string, options: { width?: number; height?: number; crop?: string } = {}): string {
    if (publicId.startsWith('http') || publicId.startsWith('blob:')) {
      return publicId;
    }
    const { width = 400, height = 400, crop = 'fill' } = options;
    return `https://res.cloudinary.com/${this.cloudName}/image/upload/c_${crop},w_${width},h_${height},q_auto,f_auto/${publicId}`;
  }
}

export const cloudinaryService = new CloudinaryService();
