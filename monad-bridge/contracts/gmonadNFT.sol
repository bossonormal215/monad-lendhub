// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract GMonad is ERC721Enumerable, Ownable, ReentrancyGuard {
    using Strings for uint256;

    // Pyth price feed
    IPyth pyth; // Pyth contract instance
    bytes32 public ethUsdPriceFeedId; // Price feed ID for ETH/USD

    // Minting states
    enum MintingState {
        WhitelistMint,
        PublicMint
    }

    uint256 public constant MAX_SUPPLY = 555;
    uint256 public constant MAX_MINT_PER_TX = 5;

    //set Mint prices in USD
    uint256 public constant WhitelistMintPrice = 4 * 10 ** 15; // $40 equivalent
    uint256 public constant PublicMintPrice = 6 * 10 ** 15; // $50 equivalent

    bool public isRevealed = false;
    string private baseURI;
    string private notRevealedUri;
    mapping(uint256 => string) private _tokenMetadataHashes;
    uint256[] private availableTokenIds;

    // Royalty information
    address private _royaltyRecipient;
    uint96 private _royaltyPercentage; // In basis points (e.g., 100 = 1%)

    // Presale configuration
    mapping(address => bool) public whitelist;
    bool public isPresaleActive = false;
    bool public isPublicSaleActive = false;
    bool public paused = false;

    // Events
    event NFTMinted(address indexed minter, uint256 tokenId);
    event RevealStateChanged(bool isRevealed);
    event BaseURIChanged(string newBaseURI);
    event RoyaltiesSet(address indexed recipient, uint96 percentage);
    event SaleStateChanged(string saleType, bool state);

    constructor(
        address _pythAddress,
        bytes32 _ethUsdPriceFeedId
    ) ERC721("G MONAD", "GMONAD") /*Ownable(msg.sender)*/ {
        pyth = IPyth(_pythAddress);
        ethUsdPriceFeedId = _ethUsdPriceFeedId;

        _transferOwnership(msg.sender);
        // Initialize available token IDs
        for (uint256 i = 1; i <= MAX_SUPPLY; i++) {
            availableTokenIds.push(i);
        }

        // Set default royalty recipient and percentage
        _royaltyRecipient = msg.sender; // Deployer as the royalty recipient
        _royaltyPercentage = 1000; // 10% in basis points (1000 basis points = 10%)
    }

    // // Function to initialize pyth oracles
    // function initializePyth(
    //     address _pythAddress,
    //     bytes32 _ethUsdPriceFeedId
    // ) external onlyOwner {
    //     pyth = IPyth(_pythAddress);
    //     ethUsdPriceFeedId = _ethUsdPriceFeedId;
    // }

    // get Any token price
    function getTokenPrice(
        bytes32 _tokenPriceFeedId
    ) public view returns (uint256) {
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(
            _tokenPriceFeedId,
            100
        );

        require(price.price > 0, "Price not valid");
        return uint256(int256(price.price)) / 1e8; // Return the price in the smallest unit (e.g., wei)
    }

    // Function to get the current ETH price from Pyth
    function getEthUsdPrice() public view returns (uint256) {
        PythStructs.Price memory price = pyth.getPriceNoOlderThan(
            ethUsdPriceFeedId,
            100
        );

        require(price.price > 0, "Price not valid");
        return uint256(int256(price.price)) / 1e8; // Return the price in the smallest unit (e.g., wei)
    }

    // updateprice to bypass stalling
    /**
     * @dev Updates the price feeds from the Pyth Oracle.
     * @param pythPriceUpdate The price update data from Pyth.
     */
    function updatePrice(bytes[] memory pythPriceUpdate) public payable {
        uint256 updateFee = pyth.getUpdateFee(pythPriceUpdate);
        pyth.updatePriceFeeds{value: updateFee}(pythPriceUpdate);
    }

    function removeTokenIds(uint256 start, uint256 end) external onlyOwner {
        require(start > 0 && end >= start, "Invalid range");
        require(end <= MAX_SUPPLY, "Range exceeds max supply");

        for (uint256 tokenId = start; tokenId <= end; tokenId++) {
            for (uint256 i = 0; i < availableTokenIds.length; i++) {
                if (availableTokenIds[i] == tokenId) {
                    // Replace the found token ID with the last ID in the array
                    availableTokenIds[i] = availableTokenIds[
                        availableTokenIds.length - 1
                    ];
                    // Remove the last element
                    availableTokenIds.pop();
                    break;
                }
            }
        }
    }

    // Public mint function
    function mint(uint256 quantity) public payable nonReentrant whenNotPaused {
        uint256 currentEthPriceInUsd = getEthUsdPrice();
        uint256 mintPriceInEth = (PublicMintPrice * 1e18) /
            currentEthPriceInUsd;
        uint256 totalMintPrice = mintPriceInEth * quantity;

        require(isPublicSaleActive, "Public sale is not active");
        require(quantity > 0, "Must mint at least one token");
        require(
            quantity <= MAX_MINT_PER_TX,
            "Exceeds max mint per transaction"
        );
        require(
            totalSupply() + quantity <= MAX_SUPPLY,
            "Would exceed max supply"
        );

        require(msg.value >= totalMintPrice, "Insufficient payment");

        // Select a random index
        for (uint256 i = 0; i < quantity; i++) {
            uint256 randomIndex = uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, i))
            ) % availableTokenIds.length;
            uint256 tokenId = availableTokenIds[randomIndex];

            // Remove the selected token ID from the available list
            availableTokenIds[randomIndex] = availableTokenIds[
                availableTokenIds.length - 1
            ];
            availableTokenIds.pop();

            _safeMint(msg.sender, tokenId);
            emit NFTMinted(msg.sender, tokenId);
        }
    }

    // Whitelist mint function
    function whitelistMint(
        uint256 quantity
    ) public payable nonReentrant whenNotPaused {
        uint256 currentEthPriceInUsd = getEthUsdPrice();
        uint256 mintPriceInWei = (WhitelistMintPrice * 1e18) /
            currentEthPriceInUsd;
        uint256 totalMintPriceInWei = mintPriceInWei * quantity;

        require(isPresaleActive, "Presale is not active");
        require(whitelist[msg.sender], "Not whitelisted");
        require(quantity > 0, "Must mint at least one token");
        require(
            quantity <= MAX_MINT_PER_TX,
            "Exceeds max mint per transaction"
        );
        require(
            totalSupply() + quantity <= MAX_SUPPLY,
            "Would exceed max supply"
        );

        require(
            msg.value >= totalMintPriceInWei,
            "Insufficient payment: Send Enough ETH"
        );

        // Select a random index
        for (uint256 i = 0; i < quantity; i++) {
            uint256 randomIndex = uint256(
                keccak256(abi.encodePacked(block.timestamp, msg.sender, i))
            ) % availableTokenIds.length;
            uint256 tokenId = availableTokenIds[randomIndex];

            // Remove the selected token ID from the available list
            availableTokenIds[randomIndex] = availableTokenIds[
                availableTokenIds.length - 1
            ];
            availableTokenIds.pop();

            _safeMint(msg.sender, tokenId);
            whitelist[msg.sender] = false; // Remove from whitelist after minting
            emit NFTMinted(msg.sender, tokenId);
        }
    }

    // Admin functions
    function addToWhitelist(address[] calldata addresses) public onlyOwner {
        for (uint256 i = 0; i < addresses.length; i++) {
            whitelist[addresses[i]] = true;
        }
    }

    function togglePresale() external onlyOwner {
        isPresaleActive = !isPresaleActive;
        emit SaleStateChanged("Presale", isPresaleActive);
    }

    function togglePublicSale() external onlyOwner {
        isPublicSaleActive = !isPublicSaleActive;
        emit SaleStateChanged("Public", isPublicSaleActive);
    }

    function reveal() external onlyOwner {
        isRevealed = true;
        emit RevealStateChanged(true);
    }

    function unreveal() external onlyOwner {
        isRevealed = false;
        emit RevealStateChanged(false);
    }

    function setBaseURI(string memory _newBaseURI) external onlyOwner {
        baseURI = _newBaseURI;
        emit BaseURIChanged(_newBaseURI);
    }

    function setTokenMetadataHash(
        uint256 tokenId,
        string memory hash
    ) external onlyOwner {
        require(_exists(tokenId), "Token does not exist");
        _tokenMetadataHashes[tokenId] = hash;
    }

    function setNotRevealedURI(
        string memory _notRevealedURI
    ) external onlyOwner {
        notRevealedUri = _notRevealedURI;
    }

    // View functions
    function tokenURI(
        uint256 tokenId
    ) public view override returns (string memory) {
        require(_exists(tokenId), "Token does not exist");

        if (!isRevealed) {
            return notRevealedUri;
        }

        string memory hash = _tokenMetadataHashes[tokenId];
        require(bytes(hash).length > 0, "Metadata hash not set");

        return string(abi.encodePacked(baseURI, hash));

        return "";
    }

    // Withdrawal function
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdraw failed");
    }

    modifier whenNotPaused() {
        require(!paused, "Contract is paused");
        _;
    }

    function togglePaused() external onlyOwner {
        paused = !paused;
    }
}
