// All keys are stored in Vercel env
// Initialize ElevenLabs
const { ElevenLabsClient } = require("elevenlabs");
const { v4: uuid } = require("uuid");
const elevenLabs = new ElevenLabsClient({
  apiKey: process.env.ELEVENLABS_API_KEY,
});

// Initialize Cloudinary
const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});


// Function to generate and upload audio without saving locally
async function streamAudioToCloudinary(text, voice) { // default ElevenLabs voice ID
  
    try {
    console.log(`About to stream audio from ElevenLabs to Cloudinary.`);

    // Generate the audio stream using ElevenLabs
    const audioStream = await elevenLabs.generate({
      voice, 
      model_id: "eleven_turbo_v2_5",
      text,
    });

    return await new Promise((resolve, reject) => {
      // Use Cloudinary's upload_stream method to stream directly
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'video',
          public_id: `vercel-audio-stream-test`,
          folder: `Outputs`,
          overwrite: true,
        },
        (error, result) => {
          if (error) {
            console.error('Error uploading to Cloudinary:', error);
            return reject(error);
          }
          console.log('Audio uploaded successfully:', result.public_id);
          resolve(result.public_id);
        }
      );

      // Pipe the audio stream directly to the Cloudinary upload stream
      audioStream.pipe(uploadStream);

      // Error handling for the streams
      uploadStream.on('error', (err) => reject(err));
      audioStream.on('error', (err) => reject(err));
    });
  } catch (error) {
    console.error('Failed to generate and upload audio:', error);
    throw error;
  }
}

// Usage example (mock test)
streamAudioToCloudinary("Hello World", "'nPczCjzI2devNBz1zQrb'") //default Eleven Labs voice ID
  .then(console.log)
  .catch(console.error);
