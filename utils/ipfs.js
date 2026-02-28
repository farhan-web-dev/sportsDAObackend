import axios from "axios";
import FormData from "form-data";
import fs from "fs";

export const uploadBufferToIPFS = async (buffer, fileName) => {
  const data = new FormData();
  data.append("file", buffer, { filename: fileName });

  const res = await axios.post(
    "https://api.pinata.cloud/pinning/pinFileToIPFS",
    data,
    {
      maxBodyLength: Infinity,
      headers: {
        ...data.getHeaders(),
        pinata_api_key: process.env.PINATA_KEY,
        pinata_secret_api_key: process.env.PINATA_SECRET,
      },
    }
  );

  return `ipfs://${res.data.IpfsHash}`;
};
