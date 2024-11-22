const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const uploadFileToS3 = async (folder, file, params) => {
  const { region, accessKeyId, secretAccessKey, bucket } = params;

  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  const uploadParams = {
    Bucket: bucket,
    Key: `${folder}/${file.name}`,
    Body: file.body, // Ensure this is a valid Buffer or Stream
    ContentType: file.type,
  };

  try {
    const command = new PutObjectCommand(uploadParams);
    const data = await s3Client.send(command);

    if (data.$metadata.httpStatusCode === 200) {
      console.log("File uploaded successfully:", data);
      return `https://${uploadParams.Bucket}.s3.amazonaws.com/${uploadParams.Key}`;
    }

    throw new Error("Failed to upload file");
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    if (error.response) {
      console.error("AWS Response:", error.response);
    }
    throw error; // Let the caller handle the error
  }
};

module.exports = uploadFileToS3 ;
