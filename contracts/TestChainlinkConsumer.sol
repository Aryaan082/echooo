// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract TestChainlinkConsumer {

    AggregatorV3Interface internal priceFeed;

    /**
     * Network: Fuji
     * Aggregator: ETH/USD
     * Address: 0x86d67c3D38D2bCeE722E601025C25a575021c6EA
     */
    constructor(address chainlinkPriceFeed) {
        priceFeed = AggregatorV3Interface(chainlinkPriceFeed);
    }

    /**
     * Returns the latest price
     */
    function getLatestPrice() public view returns (int) {
        (
            /*uint80 roundID*/,
            int price,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = priceFeed.latestRoundData();
        return price;
    }
}
