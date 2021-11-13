pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol"; 

contract Token {
    using SafeMath for uint;

    string public name = "Drew Token";
    string public symbol = "Drew";
    uint256 public decimals = 18;
    uint256 public totalSupply;

    // adding a global state variable to track balances of accounts
    mapping(address => uint256) public balanceOf;

    constructor() public {
        totalSupply = 1000000 * (10 ** decimals);
        // assigned the total supply to the deployer 
        balanceOf[msg.sender] = totalSupply; 
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        return true;
    }
}