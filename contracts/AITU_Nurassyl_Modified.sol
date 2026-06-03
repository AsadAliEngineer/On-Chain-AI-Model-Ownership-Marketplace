// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; // Import ERC-20 standard from OpenZeppelin

contract AITU_Nurassyl_Modified is ERC20 {
    // Events for transaction tracking
    event TransactionInfo(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 timestamp
    );

    // Variables to store the last transaction details
    address private lastSender;
    address private lastReceiver;
    uint256 private lastTimestamp;

    // Constructor to initialize the token with its name and symbol
    constructor(uint256 initialSupply) ERC20("AITU_Nurassyl_SE-2327_Token", "UTK") {
        _mint(msg.sender, initialSupply * 10 ** decimals());
    }

    // Override the transfer function to include custom logic
    function transfer(address recipient, uint256 amount) public override returns (bool) {
        bool success = super.transfer(recipient, amount);

        if (success) {
            // Update the last transaction details
            lastSender = msg.sender;
            lastReceiver = recipient;
            lastTimestamp = block.timestamp;

            // Emit the custom event with transaction details
            emit TransactionInfo(msg.sender, recipient, amount, block.timestamp);
        }

        return success;
    }

    // Function to retrieve the last transaction's timestamp in a human-readable format
    function getLastTransactionTimestamp() public view returns (string memory) {
        uint256 ts = lastTimestamp;
        return _convertTimestampToReadableFormat(ts);
    }

    // Function to get the sender of the last transaction
    function getLastTransactionSender() public view returns (address) {
        return lastSender;
    }

    // Function to get the receiver of the last transaction
    function getLastTransactionReceiver() public view returns (address) {
        return lastReceiver;
    }

    // Internal function to convert timestamp to a human-readable format
    function _convertTimestampToReadableFormat(uint256 timestamp)
        internal
        pure
        returns (string memory)
    {
        return string(abi.encodePacked("Timestamp: ", uint2str(timestamp)));
    }

    // Internal function to convert uint256 to a string
    function uint2str(uint256 _i) internal pure returns (string memory) {
        if (_i == 0) {
            return "0";
        }
        uint256 j = _i;
        uint256 len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint256 k = len - 1;
        while (_i != 0) {
            bstr[k--] = bytes1(uint8(48 + (_i % 10)));
            _i /= 10;
        }
        return string(bstr);
    }

    // Function to mint new tokens
    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }

    // Function to burn tokens from a specific account
    function burn(address account, uint256 amount) public {
        _burn(account, amount);
    }

    // Function to allow the contract owner to burn tokens from the contract's balance
    function burnFromContract(uint256 amount) public {
        require(balanceOf(address(this)) >= amount, "Insufficient balance");
        _burn(address(this), amount);
    }

    // Function to allow the contract owner to withdraw tokens from the contract
    function withdrawTokens(uint256 amount) public {
        require(balanceOf(address(this)) >= amount, "Insufficient balance");
        _transfer(address(this), msg.sender, amount);
    }
}
