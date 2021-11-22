pragma solidity ^0.5.0;

import "openzeppelin-solidity/contracts/math/SafeMath.sol"; 

contract Token {
    using SafeMath for uint;

// variables
    string public name = "Drew Token";
    string public symbol = "Drew";
    uint256 public decimals = 18;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

 // events 
    event Transfer(address indexed from, address indexed to, uint256 value);

  

    constructor() public {
        totalSupply = 1000000 * (10 ** decimals);
        // assigned the total supply to the deployer 
        balanceOf[msg.sender] = totalSupply; 
    }

    function transfer(address _to, uint256 _value) public returns (bool success) {
       require(_to != address(0));
        require(balanceOf[msg.sender] >= _value);        
        balanceOf[msg.sender] = balanceOf[msg.sender].sub(_value);
        balanceOf[_to] = balanceOf[_to].add(_value);
        emit Transfer(msg.sender, _to, _value);
        return true;
    }

    // approve tokens 
    function approve(address _spender, uint256 _value) public returns (bool success){
        allowance[msg.sender][_spender] = _value;
    }


    // transfer tokens 









}