// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract BoredApeYachtClubTest is ERC721 {
    uint256 totalSupply;
    string _baseTokenURI =
        "ipfs://QmeSjSinHpPnmXmspMjwiXyN6zS4E9zccariGR3jxcaWtq/";

    constructor() ERC721("BoredApeYachtClub", "BAYC") {}

    function safeMint(address to) public {
        totalSupply += 1;
        _safeMint(to, totalSupply);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }
}
