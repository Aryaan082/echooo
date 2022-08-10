pragma solidity ^0.8.13;

contract WETH {
    string public name = "Wrapped ETH";
    string public symbol = "WETH";
    uint8 public decimals = 18;

    event Approval(
        address indexed _owner,
        address indexed _operator,
        uint256 _value
    );
    event Transfer(
        address indexed _owner,
        address indexed _receiver,
        uint256 _value
    );
    event Deposit(address indexed _receiver, uint256 _value);
    event Withdrawal(address indexed _owner, uint256 _value);

    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    receive() external payable {
        deposit();
    }

    function getWETH() public {
        balanceOf[msg.sender] += 10e18;
    }

    function deposit() public payable {
        balanceOf[msg.sender] += msg.value;
        emit Deposit(msg.sender, msg.value);
    }

    function withdraw(uint256 _value) public {
        require(balanceOf[msg.sender] >= _value);
        balanceOf[msg.sender] -= _value;
        payable(msg.sender).transfer(_value);
        emit Withdrawal(msg.sender, _value);
    }

    function totalSupply() public view returns (uint256) {
        return address(this).balance;
    }

    function approve(address _operator, uint256 _value) public returns (bool) {
        allowance[msg.sender][_operator] = _value;
        emit Approval(msg.sender, _operator, _value);
        return true;
    }

    function transfer(address _dst, uint256 _value) public returns (bool) {
        return transferFrom(msg.sender, _dst, _value);
    }

    function transferFrom(
        address _owner,
        address _receiver,
        uint256 _value
    ) public returns (bool) {
        require(balanceOf[_owner] >= _value);

        if (
            _owner != msg.sender &&
            allowance[_owner][msg.sender] != type(uint256).max
        ) {
            require(allowance[_owner][msg.sender] >= _value);
            allowance[_owner][msg.sender] -= _value;
        }

        balanceOf[_owner] -= _value;
        balanceOf[_receiver] += _value;

        emit Transfer(_owner, _receiver, _value);

        return true;
    }
}
