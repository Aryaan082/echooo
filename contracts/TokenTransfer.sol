// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract TokenTransfer {
    mapping(address => uint256) public owedERC20Taxes;
    address public owner;
    bytes4 private constant SELECTOR_TRANSFER =
        bytes4(keccak256(bytes("transfer(address,uint256)")));
    bytes4 private constant SELECTOR_TRANSFER_FROM =
        bytes4(keccak256(bytes("transferFrom(address,address,uint256)")));

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
            abi.encodeWithSelector(SELECTOR_TRANSFER, _to, _value)
        );
        require(
            success && (data.length == 0 || abi.decode(data, (bool))),
            "TokenTransfer:_safeTransfer: _safeTransfer failed"
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
            "TokenTransfer:_safeTransferFrom: _safeTransferFrom failed"
        );
    }

    function sendEther(address receiver) external payable {
        // Hardcode the tax here to save gas (100 - 1) = 99
        (bool success, ) = payable(receiver).call{
            value: (msg.value * 99) / 100
        }("");
        require(success, "TokenTransfer:sendEther: Failed to send Ether");
    }

    function sendEtherGroup(
        address[] calldata receivers,
        uint256[] calldata etherAmounts
    ) external payable {
        require(
            receivers.length == etherAmounts.length,
            "TokenTransfer:sendEtherGroup: Receivers and etherAmounts must be same length."
        );

        uint256 arraySize = receivers.length;
        for (uint256 idx = 0; idx < arraySize; ) {
            // Hardcode the tax here to save gas (100 - 1) = 99
            (bool success, ) = receivers[idx].call{
                value: (etherAmounts[idx] * 99) / 100
            }("");
            require(success, "TokenTransfer:sendEther: Failed to send Ether");
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
            "TokenTransfer:sendERC20TokenGroup: Receivers and etherAmounts must be same length."
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
            "TokenTransfer:sendERC20TokenGroup: Amount of tokens transfered is greater than tax owed"
        );
    }

    function collectTaxEther() external {
        require(
            msg.sender == owner,
            "TokenTransfer:collectTaxEther: Caller must be the contract owner"
        );
        (bool success, ) = payable(owner).call{value: address(this).balance}(
            ""
        );
        require(success, "TokenTransfer:collectTaxEther: Failed to send Ether");
    }

    function collectTaxERC20Tokens(address token) external {
        require(
            msg.sender == owner,
            "TokenTransfer:collectTaxERC20Tokens: Caller must be the contract owner"
        );
        require(
            owedERC20Taxes[token] > 0,
            "TokenTransfer:ERC20Tokens: No tokens of this type are owed to the owner"
        );
        _safeTransfer(token, owner, owedERC20Taxes[token]);
    }
}
