pragma solidity ^0.5.0;

import "./Token.sol";
    
    // todo:
    // [X] set the fee acount 
    // [X] deposit ether 
    // [X] withdraw ether 
    // [X] withdraw tokens
    // [X] check balances
    // [X] make order 
    // [] cancel order
    // [] fill order
    // [] charge fees
    

import "openzeppelin-solidity/contracts/math/SafeMath.sol"; 

contract Exchange {
    using SafeMath for uint;
// variables
    address public feeAccount; // the account that recieves the exchange fees
    uint256 public feePercent; // the fee percentage 
    address constant ETHER = address(0); // store ether in tokens mapping with blank address 
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public orderCancelled;
    uint256 public orderCount;

// events 
    event Deposit (address token, address user, uint256 amount, uint256 balance);
    event Withdraw (address token, address user, uint256 amount, uint256 balance);
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
     event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

// structs 
    struct _Order{
        uint256 id; 
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

// a way to model the order
// a way to store the order
// add the order to storage

    constructor (address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount; // 
        feePercent = _feePercent;
    }

    // Fallback: reverts is Ether is sent to this smart contract by mistake
    function( ) external {
        revert();
    }

    function depositEther() payable public {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);
        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);

    }

    function withdrawEther( uint _amount ) public {
        require(tokens[ETHER][msg.sender] >= _amount);
         tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
         msg.sender.transfer(_amount);
         emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
    }

    function depositToken(address _token, uint _amount) public {
        require(_token != ETHER); // Dont allow ether deposits 
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);

    }

    function withdrawToken (address _token, uint256 _amount) public {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);
        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender, _amount));
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function balanceOf (address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }
  
    function makeOrder (address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public {
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now); // now is expressed in epoch timestamps
        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
    }

    function cancelOrder(uint256 _id) public {
        _Order storage _order = orders[_id];
        require(address(_order.user) == msg.sender); // must be your own order
        require(_order.id == _id); // the order must exist
        orderCancelled[_id] = true;
        emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, now);

    }
    
    }