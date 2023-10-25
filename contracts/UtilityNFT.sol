// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract UtilityNft is ERC721Upgradeable, OwnableUpgradeable {
    event Activated(address sender, uint256 tokenId);

    struct Utility {
        bool activated;
    }

    bool public activated;
    uint256 public tokenCounter;
    string private baseURI;
    mapping(uint256 => Utility) public tokens;

    modifier unactivated(uint256 tokenId) {
        require(!tokens[tokenId].activated, "Already activated");
        _;
    }

    function initialize(string memory name_, string memory symbol_, string memory baseURI_) external initializer {
        __ERC721_init(name_, symbol_);
        __Ownable_init();
        activated = false;
        tokenCounter = 0;
        baseURI = baseURI_;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function mint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }

    function activate(uint256 tokenId) public unactivated(tokenId) {
        require(ownerOf(tokenId) == msg.sender, "Only owner can activate NFT");
        tokens[tokenId].activated = true;
        emit Activated(msg.sender, tokenId);
    }

    function isActivated(uint256 tokenId) public view returns (bool) {
        return tokens[tokenId].activated;
    }
    
    function _beforeTokenTransfer(address from, address to, uint256 tokenId, uint256 batchSize) internal override unactivated(tokenId) {
        require(batchSize == 1, "Batch size must be 1");
        super._beforeTokenTransfer(from, to, tokenId, 1);
    }
}
