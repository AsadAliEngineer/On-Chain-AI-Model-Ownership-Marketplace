// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";  // Import ERC-20 standard from OpenZeppelin

contract AITU_Nurassyl is ERC20 {
    // Events to track transactions
    event TransactionInfo(
        address indexed sender,
        address indexed receiver,
        uint256 amount,
        uint256 timestamp
    );

    // Variables to store last transaction details
    address private lastSender;
    address private lastReceiver;
    uint256 private lastTimestamp;

    // Constructor to initialize the token with its name and symbol
    constructor() ERC20("AITU_Nurassyl_SE-2327_Token", "UTK") {
        // Mint 2000 tokens to the contract creator
        _mint(msg.sender, 2000 * 10 ** decimals());
    }

    // Override the transfer function to emit the custom transaction event
    function transfer(address recipient, uint256 amount)
        public
        override
        returns (bool)
    {
        bool success = super.transfer(recipient, amount);

        if (success) {
            lastSender = msg.sender;
            lastReceiver = recipient;
            lastTimestamp = block.timestamp;

            // Emit the custom event after a successful transfer
            emit TransactionInfo(msg.sender, recipient, amount, block.timestamp);
        }

        return success;
    }

    // Function to get the last transaction timestamp in human-readable format
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

    // Internal function to convert the timestamp into a human-readable format
    function _convertTimestampToReadableFormat(uint256 timestamp)
        internal
        pure
        returns (string memory)
    {
        return string(abi.encodePacked("Timestamp: ", uint2str(timestamp)));
    }

    // Internal function to convert uint256 to string
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
}
