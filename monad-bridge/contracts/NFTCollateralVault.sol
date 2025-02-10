// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFTCollateralVault is Ownable {
    struct Collateral {
        address nftAddress;
        uint256 tokenId;
        address owner;
        uint256 loanAmount;
        bool isActive;
    }

    mapping(uint256 => Collateral) public collaterals;
    uint256 public collateralCounter;

    event NFTDeposited(
        address indexed user,
        address indexed nftAddress,
        uint256 tokenId,
        uint256 loanAmount
    );
    event NFTWithdrawn(address indexed user, uint256 indexed collateralId);

    function depositNFT(
        address nftAddress,
        uint256 tokenId,
        uint256 loanAmount
    ) external {
        IERC721(nftAddress).transferFrom(msg.sender, address(this), tokenId);
        collateralCounter++;

        collaterals[collateralCounter] = Collateral({
            nftAddress: nftAddress,
            tokenId: tokenId,
            owner: msg.sender,
            loanAmount: loanAmount,
            isActive: true
        });

        emit NFTDeposited(msg.sender, nftAddress, tokenId, loanAmount);
    }

    function withdrawNFT(uint256 collateralId) external {
        require(collaterals[collateralId].owner == msg.sender, "Not NFT owner");
        require(collaterals[collateralId].isActive, "Collateral inactive");

        IERC721(collaterals[collateralId].nftAddress).transferFrom(
            address(this),
            msg.sender,
            collaterals[collateralId].tokenId
        );
        collaterals[collateralId].isActive = false;

        emit NFTWithdrawn(msg.sender, collateralId);
    }
}
