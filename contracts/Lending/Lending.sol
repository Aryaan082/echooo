// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract Lending {
    AggregatorV3Interface internal priceFeedLender;
    AggregatorV3Interface internal priceFeedBorrower;

    struct Offer {
        address borrower;
        address lender;
        address lenderToken;
        address borrowerToken;
        address chainlinkLenderFeed;
        address chainlinkBorrowerFeed;
        uint256 loanAmount;
        uint256 loanDuration;
        uint256 loanStartTime;
        uint256 interestRate;
    }

    Offer public offer;

    // mapping(address => int256) owedFunds;

    // TODO: probably save more gas by creating variables for items in Offer instead?
    constructor(Offer memory _offer) {
        offer = _offer;
        priceFeedLender = AggregatorV3Interface(_offer.chainlinkLenderFeed);
        priceFeedBorrower = AggregatorV3Interface(_offer.chainlinkBorrowerFeed);
    }

    // function getLatestPrice(AggregatorV3Interface priceFeed)
    //     internal
    //     returns (int256)
    // {
    //     (
    //         ,
    //         /*uint80 roundID*/
    //         int256 price, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
    //         ,
    //         ,

    //     ) = priceFeed.latestRoundData();
    //     return price;
    // }

    // function liquidate() public {
    //     // TODO: assign this as a global variable in constructor and set to zero in liquidate function to prevent reentrancy
    //     int256 totalCollateral = (2 * offer.loanAmount) +
    //         (offer.loanAmount * offer.interestRate);

    //     // TODO: figure loan proper equation here
    //     int256 currentCollateral = totalCollateral *
    //         getLatestPrice(priceFeedLender);
    //     // TODO: convert 1100 into 1.1 in wei
    //     require(
    //         currentCollateral > (offer.loanAmount * 1100),
    //         "Lending:liquidate: loan is not eligible for liquidation"
    //     );
    //     if (msg.sender == offer.lender) {
    //         owedFunds[msg.sender] = totalCollateral;
    //     } else {
    //         // TODO: send 10% to liquidator - use proper equation
    //         // TODO: can int256 be used?
    //         owedFunds[msg.sender] = totalCollateral * 100;
    //         // TODO: send 90% to owner - use proper equation
    //         owedFunds[offer.lender] = totalCollateral * 900;
    //     }
    // }

    // function collectFundsLender() public {
    //     require(
    //         block.timestamp < offer.loanDuration,
    //         "Lending:collectFunds: contract has not completed yet"
    //     );
    // }

    // function collectFundsBorrower() public {
    //     require(
    //         block.timestamp < offer.loanDuration,
    //         "Lending:collectFunds: contract has not completed yet"
    //     );
    //     int256 accruedInterest = (int256(offer.loanDuration) *
    //         offer.interestRate *
    //         offer.loanAmount);
    // }

    // function getLiquidationStatus() public {}
}
