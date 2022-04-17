// SPDX-License-Identifier: MIT
pragma solidity 0.8.12;

contract MTKN {
    string public name;
    string public symbol;
    uint8 public decimals;
    uint256 public totalSupply;
    
    mapping(address => uint) _balances;
    mapping(address => mapping(address => uint)) _allowed;

    event Transfer(address indexed _from, address indexed _to, uint _value);
    event Approval(address indexed _owner, address indexed _spender, uint _value);

    constructor(
        string memory _name,
        string memory _symbol,
        uint8 _decimals,
        uint256 _totalSupply
    ) {
        name = _name;
        symbol = _symbol;
        decimals = _decimals;
        totalSupply = _totalSupply * (10 ** _decimals);
        _balances[msg.sender] = totalSupply; 
    }

    function balanceOf(address _owner) public view returns(uint256 balance) {
        return _balances[_owner];
    }

    function allowance(address _owner, address _spender) public view returns(uint256 remaining) {
        return _allowed[_owner][_spender];
    }

    function _transfer(address _from, address _to, uint _value) private {
        require(_balances[_from] >= _value, "Not enough tokens");
        require(_from != address(0), "Transfer of tokens from zero address is not allowed");
        require(_to != address(0), "Transfer of tokens to zero address is not allowed");

        _balances[_from] -= _value;
        _balances[_to] += _value;

        emit Transfer(_from, _to, _value);
    }

    function transfer(address _to, uint _value) public returns(bool success) {
        _transfer(msg.sender, _to, _value);

        return true;
    }

    function approve(address _spender, uint _value) public returns(bool success) {
        require(_spender != msg.sender, "_spender and _owner cannot be a same address");
        require(msg.sender != address(0), "Approval of tokens from zero address is not allowed");
        require(_spender != address(0), "Approval of tokens to zero address is not allowed");

        _allowed[msg.sender][_spender] = _value;

        emit Approval(msg.sender, _spender, _value);

        return true;
    }

    function transferFrom(address _from, address _to, uint _value) public returns(bool success) {
        require(_allowed[_from][msg.sender] >= _value, "Not enough allowance");

        _allowed[_from][msg.sender] -= _value;
        _transfer(_from, _to, _value);

        return true;
    }
}