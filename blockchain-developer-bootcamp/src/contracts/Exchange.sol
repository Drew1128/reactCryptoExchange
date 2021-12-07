pragma solidity ^0.5.0;

import "./Token.sol";
    
    // todo:
    // [X] set the fee acount 
    // [] deposit ether 
    // [] withdraw ether 
    // [] withdraw tokens
    // [] check balances
    // [] make order 
    // [] cancel order
    // [] fill order
    // [] charge fees
    

import "openzeppelin-solidity/contracts/math/SafeMath.sol"; 

contract Exchange {
// variables
    address public feeAccount; // the account that recieves the exchange fees
    uint256 public feePercent; // the fee percentage 

    constructor (address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount; // 
        feePercent = _feePercent;
    }

    function depositToken(address _token, uint _amount) public {
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        // send tokens to this contracts
        // manage deposits - update balance
        // emit event

    }
  
    
    
    }