// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Echo {
    event MessageEvent(
        uint256 _messageType,
        address indexed _receiver,
        string _senderMessage,
        string _receiverMessage
    );
    event IdentityEvent(string _communicationKey);

    function logMessage(
        uint256 _messageType,
        address _receiver,
        string calldata _senderMessage,
        string calldata _receiverMessage
    ) external {
        emit MessageEvent(
            _messageType,
            _receiver,
            _senderMessage,
            _receiverMessage
        );
    }

    function logIdentity(string calldata _communicationKey) external {
        emit IdentityEvent(_communicationKey);
    }
}
