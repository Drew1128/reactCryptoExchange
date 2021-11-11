pragma solidity ^0.5.0;

contract Token {
    string public name = "Drew Token";
    string public symbol = "Drew";
    uint256 public decimals = 18;
    uint256 public totalSupply;

    constructor() public {
        totalSupply = 1000000 * (10 ** decimals);
    }
}