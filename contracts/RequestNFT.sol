// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract RequestNFT {       
    bytes public constant NAME = "RequestNFT";

    bytes32 private constant EIP712_DOMAIN  = keccak256("EIP712Domain(string name,uint256 chainId,address verifyingContract)");
    bytes32 private constant BUY_TYPE_HASH = keccak256("Buy(uint256 tokenAmount,uint256 tokenId,uint256 timeExpiry,address sender,address receiver,address tokenAddress,address NFTAddress)");    
    
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes("transfer(address,uint256)")));
    bytes4 private constant SELECTOR_TRANSFER_FROM = bytes4(keccak256(bytes("transferFrom(address,address,uint256)")));

    function _safeTransfer(
        address _contractAddress,
        address _to,
        uint256 _value
    ) private {
        // Error checking on transfer function
        (bool success, bytes memory data) = _contractAddress.call(
            abi.encodeWithSelector(SELECTOR, _to, _value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "SendCrypto:_safeTransfer: _safeTransfer failed"
        );
    }

    function _safeTransferFrom(
        address _token,
        address _from,
        address _to,
        uint256 _value
    ) private {
        // Error checking on transferFrom function
        (bool success, bytes memory data) = _token.call(
            abi.encodeWithSelector(SELECTOR_TRANSFER_FROM, _from, _to, _value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "SendCrypto:_safeTransferFrom: _safeTransferFrom failed"
        );
    }

    struct Offer {
        uint256 tokenAmount;
        uint256 tokenId;
        uint256 timeExpiry;
        address sender;
        address receiver;
        address tokenAddress;
        address NFTAddress;
    }

    constructor() {}    

    function exchange(Offer calldata offer, uint8 v, bytes32 r, bytes32 s) external {
        require(msg.sender == offer.receiver, "RequestNFT:exchange: caller must be the offer receiver");
        require(block.timestamp <= offer.timeExpiry, "RequestNFT:exchange: offer has expired");
        require(IERC20(offer.tokenAddress).balanceOf(offer.sender) >= offer.tokenAmount, "Request:NFT:exchange: balance of sender is less than tokenAmount");
        // TODO: additonal checks???
        bytes32 domainSeparator = keccak256(abi.encode(EIP712_DOMAIN, keccak256(NAME), block.chainid, address(this)));
        bytes32 exchangeHash = keccak256(abi.encode(BUY_TYPE_HASH, offer.tokenAmount, offer.tokenId, offer.timeExpiry, offer.sender, offer.receiver, offer.tokenAddress, offer.NFTAddress));
        bytes32 digest = keccak256(abi.encodePacked("\x19\x01", domainSeparator, exchangeHash));
        address signer = ecrecover(digest, v, r, s);
        require(signer != address(0), "RequestNFT:exchange: signer is invalid");
        
        // TODO: could add a tax here
        // TODO: gas savings by replacing struct with raw parameters?
        _safeTransferFrom(offer.tokenAddress, offer.sender, address(this), offer.tokenAmount);
        _safeTransfer(offer.tokenAddress, offer.receiver, offer.tokenAmount);
        
        // is it better to use this over safe transfer?
        // the ERC20 standard can be messed with on the other side so we do additonal checks using safe transfer
        // IERC20(offer.tokenAddress).transferFrom(offer.sender, offer.receiver, offer.tokenAmount);
        IERC721(offer.NFTAddress).safeTransferFrom(offer.sender, offer.receiver, offer.tokenId);

    }
   
    // TODO: add event?
    function onERC721Received(address, address, uint256, bytes calldata) external pure returns (bytes4) {
        return bytes4(keccak256("onERC721Received(address,address,uint256,bytes)"));
    }
}
