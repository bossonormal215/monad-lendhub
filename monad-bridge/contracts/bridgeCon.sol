/*// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract PythBridge {
    address public admin;
    IPyth public pyth;
    mapping(bytes32 => bool) public processedTransfers; // Prevent replay attacks

    event Deposit(
        address indexed sender,
        uint256 amount,
        string destinationChain
    );
    event Withdraw(address indexed receiver, uint256 amount);

    constructor(address _pythAddress) {
        admin = msg.sender;
        pyth = IPyth(_pythAddress);
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }

    // Function to deposit ETH and trigger cross-chain transfer
    function depositETH(string memory destinationChain) external payable {
        require(msg.value > 0, "Must deposit ETH");
        emit Deposit(msg.sender, msg.value, destinationChain);
    }

    // Function to withdraw ETH (to be called by relayer after validation)
    function withdrawETH(
        address payable receiver,
        uint256 amount,
        bytes32 transferId
    ) external onlyAdmin {
        require(!processedTransfers[transferId], "Transfer already processed");
        processedTransfers[transferId] = true;
        receiver.transfer(amount);
        emit Withdraw(receiver, amount);
    }

    // Function to fetch ETH/USD price from Pyth Oracle
    function getETHPrice(bytes32 priceId) public view returns (int64) {
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(priceId, 100);

        require(price.price > 0, "Price not valid");
        return uint256(int256(price.price)) / 1e8; // Return the price in the smallest unit (e.g., wei)

        /* PythStructs.Price memory price = pyth.getPrice(priceId);
        return price.price; *
    }
}
*/