// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC1155/extensions/ERC1155URIStorage.sol";
import "@zoralabs/nft-drop-contracts/contracts/ZoraNFTCreator1155.sol";

contract ZoraNFT is ZoraNFTCreator1155, Ownable {
    using ERC1155URIStorage for ERC1155URIStorage.URIStorage;

    constructor() ZoraNFTCreator1155("Promraw NFT", "PNFT") Ownable(msg.sender) {}

    function mint(
        address to,
        uint256 tokenId,
        uint256 amount,
        string memory uri
    ) public onlyOwner {
        _mint(to, tokenId, amount, "");
        _setURI(tokenId, uri);
    }

    function setURI(uint256 tokenId, string memory uri) public onlyOwner {
        _setURI(tokenId, uri);
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        return super.uri(tokenId);
    }
} 