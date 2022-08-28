// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "hardhat/console.sol";

contract RequestNFT {
    bytes public constant NAME = "RequestNFT";

    bytes32 private constant EIP712_DOMAIN =
        keccak256(
            "EIP712Domain(string name,uint256 chainId,address verifyingContract)"
        );
    bytes32 private constant BUY_TYPE_HASH =
        keccak256(
            "Buy(uint256 tokenAmount,uint256 tokenId,uint256 timeExpiry,address buyer,address seller,address tokenAddress,address NFTAddress)"
        );

    bytes4 private constant SELECTOR =
        bytes4(keccak256(bytes("transfer(address,uint256)")));
    bytes4 private constant SELECTOR_TRANSFER_FROM =
        bytes4(keccak256(bytes("transferFrom(address,address,uint256)")));

    event exchangeEvent(
        address indexed _buyer,
        address indexed _seller,
        Offer _offer
    );

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

    enum OfferState {
        ACTIVE,
        EXECUTED,
        CANCELLED
    }

    struct Offer {
        uint256 tokenAmount;
        uint256 tokenId;
        uint256 timeExpiry;
        address buyer;
        address seller;
        address tokenAddress;
        address NFTAddress;
    }

    mapping(uint256 => OfferState) private _offerStatus;

    function exchange(
        Offer calldata offer,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        uint256 offerId = _offerId(offer);
        bytes32 digest = _getOfferDigest(offer);

        require(
            msg.sender == offer.seller,
            "RequestNFT:exchange: caller must be the offer seller"
        );
        require(
            block.timestamp <= offer.timeExpiry,
            "RequestNFT:exchange: offer has expired"
        );
        require(
            IERC20(offer.tokenAddress).balanceOf(offer.buyer) >=
                offer.tokenAmount,
            "Request:NFT:exchange: balance of buyer is less than tokenAmount"
        );
        require(
            _offerStatus[offerId] == OfferState.ACTIVE,
            "Request:NFT:exchange: offer is no longer active."
        );

        address signer = ecrecover(digest, v, r, s);
        require(
            signer == offer.buyer,
            "RequestNFT:exchange: signer is invalid"
        );

        _offerStatus[offerId] = OfferState.EXECUTED;

        // TODO: could add a tax here
        // TODO: gas savings by replacing struct with raw parameters?
        _safeTransferFrom(
            offer.tokenAddress,
            offer.buyer,
            address(this),
            offer.tokenAmount
        );
        _safeTransfer(offer.tokenAddress, msg.sender, offer.tokenAmount);

        // is it better to use this over safe transfer?
        // the ERC20 standard can be messed with on the other side so we do additonal checks using safe transfer
        // IERC20(offer.tokenAddress).transferFrom(offer.buyer, offer.seller, offer.tokenAmount);
        IERC721(offer.NFTAddress).safeTransferFrom(
            msg.sender,
            offer.buyer,
            offer.tokenId
        );

        emit exchangeEvent(offer.buyer, msg.sender, offer);
    }

    function cancelOffer(
        Offer calldata offer,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        uint256 offerId = _offerId(offer);
        bytes32 digest = _getOfferDigest(offer);
        address signer = ecrecover(digest, v, r, s);
        require(signer == offer.buyer, "RequestNFT:cancelOffer: signer is invalid");

        _offerStatus[offerId] = OfferState.CANCELLED;
    }

    function getOfferStatus(Offer calldata offer)
        external
        view
        returns (OfferState)
    {
        if (block.timestamp <= offer.timeExpiry) {
            return OfferState.CANCELLED;
        }
        uint256 offerId = _offerId(offer);
        return _offerStatus[offerId];
    }

    function _getOfferDigest(Offer calldata offer)
        private
        view
        returns (bytes32)
    {
        bytes32 domainSeparator = keccak256(
            abi.encode(
                EIP712_DOMAIN,
                keccak256(NAME),
                block.chainid,
                address(this)
            )
        );

        bytes32 exchangeHash = keccak256(
            abi.encode(
                BUY_TYPE_HASH,
                offer.tokenAmount,
                offer.tokenId,
                offer.timeExpiry,
                offer.buyer,
                offer.seller,
                offer.tokenAddress,
                offer.NFTAddress
            )
        );

        bytes32 digest = keccak256(
            abi.encodePacked("\x19\x01", domainSeparator, exchangeHash)
        );

        return digest;
    }

    function _offerId(Offer calldata offer)
        public
        pure
        virtual
        returns (uint256)
    {
        return
            uint256(
                keccak256(
                    abi.encode(
                        offer.tokenAmount,
                        offer.tokenId,
                        offer.timeExpiry,
                        offer.buyer,
                        offer.seller,
                        offer.tokenAddress,
                        offer.NFTAddress
                    )
                )
            );
    }

    // TODO: add event?
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure returns (bytes4) {
        return
            bytes4(
                keccak256("onERC721Received(address,address,uint256,bytes)")
            );
    }
}
