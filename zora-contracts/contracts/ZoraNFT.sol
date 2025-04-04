// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ZoraNFT is ERC1155, Ownable {
    string public name;
    string public symbol;
    mapping(uint256 => string) private _tokenURIs;

    constructor(string memory _name, string memory _symbol) ERC1155("") Ownable(msg.sender) {
        name = _name;
        symbol = _symbol;
    }

    function mint(
        address to,
        uint256 tokenId,
        uint256 amount,
        string memory tokenURI
    ) public onlyOwner {
        _mint(to, tokenId, amount, "");
        _tokenURIs[tokenId] = tokenURI;
    }

    function setURI(uint256 tokenId, string memory tokenURI) public onlyOwner {
        _tokenURIs[tokenId] = tokenURI;
    }

    function uri(uint256 tokenId) public view override returns (string memory) {
        string memory tokenURI = _tokenURIs[tokenId];
        return bytes(tokenURI).length > 0 ? tokenURI : super.uri(tokenId);
    }
} 