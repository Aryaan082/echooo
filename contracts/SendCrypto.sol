// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SendCrypto {
    mapping(address => uint256) owedERC20Taxes;
    address owner;
    bytes4 private constant SELECTOR = bytes4(keccak256(bytes("transfer(address,uint256)")));
    bytes4 private constant SELECTOR_TRANSFER_FROM = bytes4(keccak256(bytes("transferFrom(address,address,uint256)")));

    constructor() {
        owner = msg.sender;
    }

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

    function approve(ERC20 token, uint256 amount) external {
        token._approve(msg.sender, address(this), amount);
    } 

    function sendEther(address receiver, uint256 etherAmount) external payable {
        // Hardcode the tax here to save gas (100 - 1) = 99
        require(
            msg.value >= etherAmount,
            "SendCrypto:sendEther: Amount of ETH specified must be equal to msg.value"
        );
        (bool success, ) = payable(receiver).call{
            value: (etherAmount * 99) / 100
        }("");
        require(success, "SendCrypto:sendEther: Failed to send Ether");
    }

    function sendEtherGroup(
        address[] calldata receivers,
        uint256[] calldata etherAmounts,
        uint256 etherTotalAmount
    ) external payable {
        require(
            receivers.length == etherAmounts.length,
            "SendCrypto:sendEtherGroup: Receivers and etherAmounts must be same length."
        );
        require(
            msg.value >= etherTotalAmount,
            "SendCrypto:sendEther: Amount of ETH specified must be GTE to msg.value"
        );

        uint256 arraySize = receivers.length;
        for (uint256 idx = 0; idx < arraySize; ) {
            // Hardcode the tax here to save gas (100 - 1) = 99
            (bool success, ) = receivers[idx].call{
                value: (etherAmounts[idx] * 99) / 100
            }("");
            require(success, "SendCrypto:sendEther: Failed to send Ether");
            unchecked {
                ++idx;
            }
        }
    }

    function sendERC20Token(
        address token,
        address receiver,
        uint256 tokenAmount
    ) external {
        _safeTransferFrom(token, msg.sender, address(this), tokenAmount);
        owedERC20Taxes[token] += (tokenAmount * 1) / 100;
        _safeTransfer(token, receiver, (tokenAmount * 99) / 100);
    }

    function sendERC20TokenGroup(
        address token,
        address[] calldata receivers,
        uint256[] calldata tokenAmounts,
        uint256 tokenTotalAmount
    ) external {
        require(
            receivers.length == tokenAmounts.length,
            "SendCrypto:sendERC20TokenGroup: Receivers and etherAmounts must be same length."
        );
        _safeTransferFrom(token, msg.sender, address(this), tokenTotalAmount);
        uint256 taxOwed = (tokenTotalAmount * 1) / 100;
        owedERC20Taxes[token] += taxOwed;
        uint256 arraySize = receivers.length;
        for (uint256 idx = 0; idx < arraySize; ) {
            tokenTotalAmount -= (tokenAmounts[idx] * 99) / 100;
            _safeTransfer(
                token,
                receivers[idx],
                (tokenAmounts[idx] * 99) / 100
            );
            unchecked {
                ++idx;
            }
        }
        require(
            tokenTotalAmount >= taxOwed,
            "SendCrypto:sendERC20TokenGroup: Amount of tokens transfered is greater than tax owed"
        );
    }

    function collectTaxEther() external {
        require(
            msg.sender == owner,
            "SendCrypto:collectTaxEther: Caller must be the contract owner"
        );
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "SendCrypto:collectTaxEther: Failed to send Ether");
    }

    function collectTaxERC20Tokens(address token) external {
        require(
            msg.sender == owner,
            "SendCrypto:collectTaxERC20Tokens: Caller must be the contract owner"
        );
        require(
            owedERC20Taxes[token] > 0,
            "SendCrypto:ERC20Tokens: No tokens of this type are owed to the owner"
        );
        _safeTransfer(token, owner, owedERC20Taxes[token]);
    }
}
