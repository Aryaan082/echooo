// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

contract Lending {
    struct Offer {
        address borrower;
        address lendedToken;
        uint256 loanAmount;
        uint256 loanDuration;
        uint256 interestRate;
    }


    constructor(Offer memory _offer) {

    }

    
}