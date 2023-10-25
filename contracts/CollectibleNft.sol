// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

contract CollectibleNft is ERC721Upgradeable, OwnableUpgradeable {
    
    uint256 public tokenCounter;
    string private baseURI;

    function initialize(string memory name_, string memory symbol_, string memory baseURI_) external initializer {
        __ERC721_init(name_, symbol_);
        __Ownable_init();
        tokenCounter = 0;
        baseURI = baseURI_;
    }

    function _baseURI() internal view override returns (string memory) {
        return baseURI;
    }

    function mint(address to, uint256 tokenId) public onlyOwner {
        _safeMint(to, tokenId);
    }
}
