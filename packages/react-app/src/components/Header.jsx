import { PageHeader } from "antd";
import React from "react";

// displays a page header

export default function Header() {
  return (
    <a href="https://github.com/yusefnapora/self-serve-mint" target="_blank" rel="noopener noreferrer">
      <PageHeader
        title="🌿 Self Serve Mint 🌿"
        subTitle="An ERC-721 NFT contract that anyone can use to mint NFTs."
        style={{ cursor: "pointer" }}
      />
    </a>
  );
}
