// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./NFTCollateralVault.sol";
import "./USDTLiquidityPool.sol";

contract LoanManager {
    IERC20 public usdt;
    NFTCollateralVault public vault;
    USDTLiquidityPool public liquidityPool;
    uint256 public interestRate = 10; // 10% interest

    struct Loan {
        address borrower;
        uint256 collateralId;
        uint256 amount;
        uint256 interest;
        bool isActive;
    }

    mapping(uint256 => Loan) public loans;
    uint256 public loanCounter;

    event LoanIssued(address indexed borrower, uint256 indexed collateralId, uint256 amount, uint256 interest);
    event LoanRepaid(address indexed borrower, uint256 indexed collateralId);

    constructor(address _usdt, address _vault, address _liquidityPool) {
        usdt = IERC20(_usdt);
        vault = NFTCollateralVault(_vault);
        liquidityPool = USDTLiquidityPool(_liquidityPool);
    }

    function issueLoan(uint256 collateralId, uint256 amount) external {
        require(liquidityPool.getUserDeposit(address(this)) >= amount, "Insufficient liquidity");
        
        vault.depositNFT(msg.sender, collateralId, amount);
        uint256 interest = (amount * interestRate) / 100;
        loanCounter++;

        loans[loanCounter] = Loan({
            borrower: msg.sender,
            collateralId: collateralId,
            amount: amount,
            interest: interest,
            isActive: true
        });

        liquidityPool.withdraw(amount);
        usdt.transfer(msg.sender, amount);

        emit LoanIssued(msg.sender, collateralId, amount, interest);
    }

    function repayLoan(uint256 loanId) external {
        require(loans[loanId].borrower == msg.sender, "Not loan owner");
        require(loans[loanId].isActive, "Loan inactive");

        uint256 totalOwed = loans[loanId].amount + loans[loanId].interest;
        usdt.transferFrom(msg.sender, address(this), totalOwed);
        vault.withdrawNFT(loans[loanId].collateralId);

        loans[loanId].isActive = false;
        liquidityPool.deposit(totalOwed); // Repay to pool

        emit LoanRepaid(msg.sender, loans[loanId].collateralId);
    }
}
