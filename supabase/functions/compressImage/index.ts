import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { Image } from 'npm:imagescript@1.3.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Fetch the original image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return Response.json({ error: 'Failed to fetch image' }, { status: 400 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Decode the image
    const image = await Image.decode(new Uint8Array(imageBuffer));

    // Resize if image is too large (max width 1200px)
    const maxWidth = 1200;
    if (image.width > maxWidth) {
      const ratio = maxWidth / image.width;
      const newHeight = Math.floor(image.height * ratio);
      image.resize(maxWidth, newHeight);
    }

    // Encode as JPEG with 80% quality
    const compressedBuffer = await image.encodeJPEG(80);

    // Create a File object from the buffer
    const blob = new Blob([compressedBuffer], { type: 'image/jpeg' });
    const file = new File([blob], 'compressed.jpg', { type: 'image/jpeg' });

    // Upload the compressed image
    const result = await base44.integrations.Core.UploadFile({ file });

    return Response.json({ 
      compressedUrl: result.file_url,
      originalSize: imageBuffer.byteLength,
      compressedSize: compressedBuffer.byteLength,
      reduction: Math.round((1 - compressedBuffer.byteLength / imageBuffer.byteLength) * 100)
    });

  } catch (error) {
    console.error('Compression error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});