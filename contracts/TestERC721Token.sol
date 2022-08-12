// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract TestERC721Token is ERC721 {
    uint256 totalSupply;

    constructor() ERC721("TestNFT", "TNFT") {}

    function safeMint(address to) public {
        totalSupply += 1;
        _safeMint(to, totalSupply);
    }
}
