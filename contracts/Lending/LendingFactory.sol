// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "./Lending.sol";

contract LendingFactory is EIP712 {
    event LoanRequestAccepted(address loan, address lender, address borrower);

    constructor() EIP712("LendingFactory", "1") {}

    function setupLoan(
        Lending.Offer memory offer_,
        uint8 v,
        bytes32 r,
        bytes32 s
    ) external {
        bytes32 _offerDigest = _getOfferDigest(offer_);

        require(offer_.borrower == msg.sender);
        require(ecrecover(_offerDigest, v, r, s) == offer_.lender);

        Lending loan = new Lending(offer_);

        require(
            IERC20(offer_.lenderToken).transferFrom(
                offer_.lender,
                offer_.borrower,
                offer_.loanAmount
            )
        );
        require(
            IERC20(offer_.borrowerToken).transferFrom(
                offer_.borrower,
                address(loan),
                offer_.loanAmount * 2
            )
        );
        emit LoanRequestAccepted(address(loan), offer_.lender, offer_.borrower);
    }

    function _getOfferDigest(Lending.Offer memory offer_)
        private
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "Offer(address borrower,address lender,address lenderToken,address borrowerToken,address chainlinkLenderFeed,address chainlinkBorrowerFeed,uint256 loanAmount,uint256 loanDuration,uint256 loanStartTime,uint256 interestRate)"
                        ),
                        offer_.borrower,
                        offer_.lender,
                        offer_.lenderToken,
                        offer_.borrowerToken,
                        offer_.chainlinkLenderFeed,
                        offer_.chainlinkBorrowerFeed,
                        offer_.loanAmount,
                        offer_.loanDuration,
                        offer_.loanStartTime,
                        offer_.interestRate
                    )
                )
            );
    }
}
