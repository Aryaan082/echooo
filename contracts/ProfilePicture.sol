// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract ProfilePicture {
    mapping(address => string) private _addressToPfpMapping;

    function setProfilePicture(string calldata pfpPointer_) external {
        _addressToPfpMapping[msg.sender] = pfpPointer_;
    }

    function getProfilePicture(address user_)
        external
        view
        returns (string memory)
    {
        return _addressToPfpMapping[user_];
    }
}
