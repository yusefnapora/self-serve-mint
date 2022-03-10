//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;
pragma experimental ABIEncoderV2;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

/// @notice SelfServeMint is an ERC721 contract that allows anyone to mint an NFT by calling the `mint` function.
contract SelfServeMint is ERC721URIStorage {
  uint256 private _idCounter;

  constructor()
    ERC721("SelfServe", "SSRV") {
    }

  /// @notice Calling the mint function will create a new token and transfer it to the `to` address. 
  /// The `tokenURI` should resolve to a metadata JSON object describing the NFT, as described in EIP-721.
  function mint(address to, string memory tokenURI) public {
      uint tokenId = _idCounter++;
      _safeMint(to, tokenId);
      _setTokenURI(tokenId, tokenURI);
  }
}
