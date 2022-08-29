// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Lending {
    AggregatorV3Interface internal priceFeedLender;
    AggregatorV3Interface internal priceFeedBorrower;

    enum State {
        RUNNING,
        LIQUIDATED,
        SUCCESSFUL
    }

    // TODO: reduce amount of parameters if possible
    struct Offer {
        address borrower;
        address lender;
        address lenderToken;
        address borrowerToken;
        address chainlinkLenderFeed;
        address chainlinkBorrowerFeed;
        uint256 loanAmount;
        uint256 totalCollateral;
        uint256 loanDuration;
        uint256 loanStartTime;
        uint256 interestRate;
    }

    Offer public offer;
    mapping(address => uint256) owedLenderToken;
    mapping(address => uint256) owedBorrowerToken;
    State public state;
    uint256 immutable public TOTAL_INTEREST;

    // modifier isLoan
    // TODO: probably save more gas by creating variables for items in Offer instead?
    constructor(Offer memory _offer) {
        offer = _offer;
        TOTAL_INTEREST = _offer.loanAmount * _offer.interestRate;
        priceFeedLender = AggregatorV3Interface(_offer.chainlinkLenderFeed);
        priceFeedBorrower = AggregatorV3Interface(_offer.chainlinkBorrowerFeed);
        state = State.RUNNING;
        
    }

    function getLatestPrice(AggregatorV3Interface priceFeed)
        internal
        returns (uint256)
    {
        (
            ,
            /*uint80 roundID*/
            int256 price,
            ,
            ,

        ) = /*uint startedAt*/
            /*uint timeStamp*/
            /*uint80 answeredInRound*/
            priceFeed.latestRoundData();

        if (price < 0) {
            return 0;
        } else {
            return uint256(price);
        }
    }

    function liquidate() external {
        // require(block.timestamp < offer.loanDuration, "Lending:liquidate: contract has already completed");
        require(
            state == State.RUNNING,
            "Lending: liquidate: must be in the 'running' state"
        );
        uint256 totalCollateral = offer.totalCollateral;  // on the factory contract side just should set collateral at (2 * offer.loanAmount) + (offer.loanAmount * offer.interestRate)

        bool isHealthFactor = calculateHealthFactor();

        // TODO: make 1 days a variable set by the factory contract which is the time at which liquidate can be called (1 day buffer time)
        // time period at which liquidation can be called
        uint256 timeDelta = offer.loanDuration + offer.loanStartTime;
        
        // liquidate if health factor is below 1.1 or time stamp is above timeDelta
        require(
            (isHealthFactor || (block.timestamp > timeDelta)), "Lending:liquidate: loan is not eligible for liquidation"
        );

        uint256 timeDeltaBorrower; 
        uint256 timeDeltaLender; 

        (timeDeltaBorrower, timeDeltaLender) = calculateTimeDelta();
        
        uint256 owedInterestBorrower = (timeDeltaBorrower / offer.loanDuration) * TOTAL_INTEREST;
        uint256 owedInterestLender = (timeDeltaLender / offer.loanDuration) * TOTAL_INTEREST;

        // prevent reentrancy
        offer.totalCollateral = 0;
        offer.interestRate = 0;
        offer.loanAmount = 0;

        // liquidation
        if (msg.sender == offer.lender) {                
            owedBorrowerToken[offer.borrower] += totalCollateral;
            owedLenderToken[offer.lender] += owedInterestLender;
            owedLenderToken[offer.borrower] += owedInterestBorrower;
        } else {
            // send 10% to liquidator
            owedBorrowerToken[msg.sender] += (totalCollateral * 10) / 100;
            // send 90% to owner
            owedBorrowerToken[offer.lender] += (totalCollateral * 90) / 100;
            
            owedLenderToken[offer.lender] += owedInterestLender;
            owedLenderToken[offer.borrower] += owedInterestBorrower;      
        }
       
        state = State.LIQUIDATED;
    }

    function payLoan() public {
        require(state == State.RUNNING, "Lending: payloan: must be in the 'running' state");
        require(msg.sender == offer.borrower, "Lending: payLoan: only borrower can pay loan");
        // TODO: check for amount in IERC20 contract?
        // TODO: is this bad to do?
        require(IERC20(offer.lenderToken).balanceOf(msg.sender) >= offer.loanAmount, "Lending:payLoan: amount of token owned must be more than the loan amount");
        require(IERC20(offer.lenderToken).allowance(msg.sender, address(this)) >= offer.loanAmount, "Lending:payLoan: amount owing must be more than loan amount");
        
        uint256 totalCollateral = offer.totalCollateral;
        
        uint256 timeDeltaBorrower; 
        uint256 timeDeltaLender; 

        (timeDeltaBorrower, timeDeltaLender) = calculateTimeDelta();

        uint256 owedInterestBorrower = (timeDeltaBorrower / offer.loanDuration) * TOTAL_INTEREST;
        uint256 owedInterestLender = (timeDeltaLender / offer.loanDuration) * TOTAL_INTEREST;
        
        uint256 loanAmountOwing = offer.loanAmount;
        require(IERC20(offer.borrowerToken).transferFrom(msg.sender, address(this), loanAmountOwing), "Lending:payLoan: transfer from borrower token failed");

        // prevent reentrancy
        offer.totalCollateral = 0;
        offer.interestRate = 0;
        offer.loanAmount = 0;

        owedBorrowerToken[offer.lender] = 0;
        owedBorrowerToken[offer.borrower] += loanAmountOwing;
        owedLenderToken[offer.lender] += totalCollateral + owedInterestLender;
        owedLenderToken[offer.borrower] += owedInterestBorrower;

        state = State.SUCCESSFUL;
    }

    function calculateHealthFactor() private returns (bool) {
        uint256 totalCollateral = offer.totalCollateral;
        uint256 loanAmount = offer.loanAmount;
        uint256 currentCollateral = totalCollateral * getLatestPrice(priceFeedBorrower); // CollateralToken * (ETH / CollateralToken)
        uint256 currentLoan = loanAmount * getLatestPrice(priceFeedLender); // LoanToken * (ETH / LoanToken)
        return (currentCollateral < (currentLoan * 110) / 100);
    }

    function calculateTimeDelta() private view returns (uint, uint) {
        uint256 timeDeltaBorrower = block.timestamp - offer.loanStartTime;
        uint256 timeDeltaLender;

        // account for underflow when loan duration is less than time delta borrower
        if (offer.loanDuration < timeDeltaBorrower) {
            timeDeltaLender = offer.loanDuration - timeDeltaBorrower;
        } else {
            timeDeltaBorrower = offer.loanDuration;
            timeDeltaLender = 0;
        }

        return (timeDeltaBorrower, timeDeltaLender);
    }
    function collectFunds() external {
        uint256 _owedBorrowerToken = owedBorrowerToken[msg.sender];
        uint256 _owedLenderToken = owedLenderToken[msg.sender];

        owedBorrowerToken[msg.sender] = 0;
        owedLenderToken[msg.sender] = 0;

        // TODO: use safeTransfer
        if (_owedBorrowerToken > 0) {
            require(
                IERC20(offer.borrowerToken).transfer(
                    msg.sender,
                    _owedBorrowerToken
                ),
                "Lending:collectFunds: transfering borrower token failed"
            );
        }

        if (_owedLenderToken > 0) {
            require(
                IERC20(offer.lenderToken).transfer(
                    msg.sender,
                    _owedLenderToken
                ),
                "Lending:collectFunds: transfering lender token failed"
            );
        }
    }

    function increaseCollateral(uint256 _amount) external {
        require(
            state == State.RUNNING,
            "Lending: increaseCollateral: must be in the 'running' state"
        );
        require(
            offer.borrower == msg.sender,
            "Lending: increaseCollateral: only borrower can increase collateral"
        );
        require(
            offer.totalCollateral + _amount >=
                IERC20(offer.borrowerToken).balanceOf(address(this))
        );
        offer.totalCollateral = IERC20(offer.borrowerToken).balanceOf(
            address(this)
        );
    }
}
