import { Card, Upload, Input, Button, Form, Col } from "antd";
import { LoadingOutlined, PlusOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { NFTStorage } from "nft.storage/dist/bundle.esm.min.js";
import { useContractLoader } from "eth-hooks";
import Account from "../components/Account";
import { Transactor } from "../helpers";
import { NFT_STORAGE_KEY, DEFAULT_CONTRACT_NAME } from "../constants";

async function mintNFT({ contract, ownerAddress, provider, gasPrice, setStatus, image, name, description }) {
  // First we use the nft.storage client library to add the image and metadata to IPFS / Filecoin
  const client = new NFTStorage({ token: NFT_STORAGE_KEY });
  setStatus("Uploading to nft.storage...");
  const metadata = await client.store({
    name,
    description,
    image,
  });
  setStatus(`Upload complete! Minting token with metadata URI: ${metadata.url}`);

  // scaffold-eth's Transactor helper gives us a nice UI popup when a transaction is sent
  const transactor = Transactor(provider, gasPrice);
  const tx = await transactor(contract.mint(ownerAddress, metadata.url));

  if (!tx) {
    setStatus("Transaction failed... is the contract deployed?");
    return;
  }

  setStatus("Blockchain transaction sent, waiting confirmation...");

  // Wait for the transaction to be confirmed, then get the token ID out of the emitted Transfer event.
  const receipt = await tx.wait();
  let tokenId = null;
  console.log("tx receipt:", receipt);
  for (const event of receipt.events) {
    if (event.event !== "Transfer") {
      continue;
    }
    tokenId = event.args.tokenId.toString();
    break;
  }
  setStatus(`Minted token #${tokenId}`);
  return tokenId;
}

export default function Minter({ contract, signer, provider, gasPrice }) {
  const address = contract ? contract.address : "";

  const [file, setFile] = useState(null);
  const [previewURL, setPreviewURL] = useState(null);
  const [nftName, setName] = useState("");
  const [description, setDescription] = useState("");
  const [minting, setMinting] = useState(false);
  const [status, setStatus] = useState("");
  const [tokenId, setTokenId] = useState(null);

  const beforeUpload = (file, fileList) => {
    console.log(file, fileList);
    setFile(file);
    setPreviewURL(URL.createObjectURL(file));
    return false;
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Choose image</div>
    </div>
  );

  const uploadView = (
    <div>
      Drop an image file or click below to select.
      <Upload
        name="avatar"
        accept=".jpeg,.jpg,.png,.gif"
        listType="picture-card"
        className="avatar-uploader"
        showUploadList={false}
        action="https://www.mocky.io/v2/5cc8019d300000980a055e76"
        beforeUpload={beforeUpload}
      >
        {uploadButton}
      </Upload>
    </div>
  );

  const preview = previewURL ? <img src={previewURL} style={{ maxWidth: "800px" }} /> : <div />;

  const nameField = (
    <Form.Item label="Name">
      <Input
        placeholder="Enter a name for your NFT"
        onChange={e => {
          setName(e.target.value);
        }}
      />
    </Form.Item>
  );

  const descriptionField = (
    <Form.Item label="Description">
      <Input.TextArea
        placeholder="Enter a description"
        onChange={e => {
          setDescription(e.target.value);
        }}
      />
    </Form.Item>
  );

  const mintEnabled = file != null && !!nftName;

  const startMinting = () => {
    console.log(`minting nft with name ${nftName}`);
    setMinting(true);
    signer.getAddress().then(ownerAddress => {
      mintNFT({
        contract,
        provider,
        ownerAddress,
        gasPrice,
        setStatus,
        name: nftName,
        image: file,
        description,
      }).then(newTokenId => {
        setMinting(false);
        console.log("minting complete. Token id:", newTokenId);
        setTokenId(newTokenId);
      });
    });
  };

  const mintButton = (
    <Form.Item>
      <Button type="primary" disabled={!mintEnabled} onClick={startMinting}>
        {minting ? <LoadingOutlined /> : "Mint!"}
      </Button>
    </Form.Item>
  );

  const minterForm = (
    <div style={{ margin: "auto", width: "70vw" }}>
      <Card title={<div>Mint an NFT!</div>} size="large" style={{ marginTop: 25, width: "100%" }} loading={false}>
        <Form labelCol={{ span: 2 }}>
          {file == null && uploadView}
          {preview}
          {nameField}
          {descriptionField}
          {mintButton}
          {status}
        </Form>
      </Card>
    </div>
  );

  return minterForm;
}
