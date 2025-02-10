// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MonadNameService is ERC721URIStorage, Ownable {
    struct Name {
        string name;
        address owner;
        uint256 expiration;
    }

    mapping(string => Name) public names;
    mapping(address => string) public addressToName;
    uint256 public constant REGISTRATION_FEE = 0.01 ether;
    uint256 public constant NAME_EXPIRATION = 365 days;

    event NameRegistered(
        string indexed name,
        address indexed owner,
        uint256 expiration
    );
    event NameRenewed(string indexed name, uint256 newExpiration);
    event NameTransferred(string indexed name, address indexed newOwner);

    constructor() ERC721("Monad Name Service", "MNS") {}

    // Register a new .mon name
    function registerName(string memory _name) external payable {
        require(msg.value >= REGISTRATION_FEE, "Insufficient fee");
        require(
            names[_name].owner == address(0) ||
                block.timestamp > names[_name].expiration,
            "Name already taken"
        );

        // Mint NFT for name ownership
        uint256 tokenId = uint256(keccak256(abi.encodePacked(_name)));
        _mint(msg.sender, tokenId);
        _setTokenURI(tokenId, _name);

        // Store name details
        names[_name] = Name(
            _name,
            msg.sender,
            block.timestamp + NAME_EXPIRATION
        );
        addressToName[msg.sender] = _name;

        emit NameRegistered(
            _name,
            msg.sender,
            block.timestamp + NAME_EXPIRATION
        );
    }

    // Renew an existing name
    function renewName(string memory _name) external payable {
        require(msg.value >= REGISTRATION_FEE, "Insufficient fee");
        require(names[_name].owner == msg.sender, "Not the owner");

        names[_name].expiration += NAME_EXPIRATION;
        emit NameRenewed(_name, names[_name].expiration);
    }

    // Transfer ownership of a name
    function transferName(string memory _name, address _newOwner) external {
        require(names[_name].owner == msg.sender, "Not the owner");

        names[_name].owner = _newOwner;
        addressToName[_newOwner] = _name;
        _transfer(
            msg.sender,
            _newOwner,
            uint256(keccak256(abi.encodePacked(_name)))
        );

        emit NameTransferred(_name, _newOwner);
    }

    // Resolve name to address
    function resolveName(string memory _name) external view returns (address) {
        return names[_name].owner;
    }

    // Reverse lookup: Get name from address
    function addressToNameLookup(
        address _user
    ) external view returns (string memory) {
        return addressToName[_user];
    }

    // Withdraw contract funds
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
