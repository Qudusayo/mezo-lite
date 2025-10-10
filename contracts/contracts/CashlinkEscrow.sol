// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CashlinkEscrow is ReentrancyGuard {
    IERC20 public immutable token;

    struct Cashlink {
        address creator;
        uint256 amount;
        bool claimed;
    }

    mapping(bytes32 => Cashlink) public cashlinks;

    event CashlinkCreated(
        bytes32 indexed hash,
        address indexed creator,
        uint256 amount
    );
    event CashlinkClaimed(bytes32 indexed hash, address indexed claimer);
    event CashlinkRevoked(bytes32 indexed hash, address indexed creator);

    /**
     * @notice Initialize escrow with a specific ERC20 token (e.g. USDT)
     * @param _token Address of the ERC20 token
     */
    constructor(address _token) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }

    /**
     * @notice Create a cashlink by locking tokens with a unique claim hash
     * @param amount Amount to lock
     * @param claimHash keccak256 hash of the claim secret
     */
    function createCashlink(
        uint256 amount,
        bytes32 claimHash
    ) external nonReentrant {
        require(amount > 0, "Amount must be greater than zero");
        require(cashlinks[claimHash].amount == 0, "Cashlink already exists");

        require(
            token.transferFrom(msg.sender, address(this), amount),
            "Token transfer failed"
        );

        cashlinks[claimHash] = Cashlink({
            creator: msg.sender,
            amount: amount,
            claimed: false
        });

        emit CashlinkCreated(claimHash, msg.sender, amount);
    }

    /**
     * @notice Claim tokens using the secret code
     * @param claimCode The secret string used to generate the claim hash
     */
    function claim(string memory claimCode) external nonReentrant {
        bytes32 claimHash = keccak256(abi.encodePacked(claimCode));
        Cashlink storage link = cashlinks[claimHash];

        require(link.amount > 0, "Invalid claim code");
        require(!link.claimed, "Already claimed");

        link.claimed = true;
        token.transfer(msg.sender, link.amount);

        emit CashlinkClaimed(claimHash, msg.sender);
    }

    /**
     * @notice Revoke unclaimed cashlink (only creator)
     * @param claimHash Hash of the claim code
     */
    function revoke(bytes32 claimHash) external nonReentrant {
        Cashlink storage link = cashlinks[claimHash];

        require(link.amount > 0, "Invalid cashlink");
        require(!link.claimed, "Already claimed");
        require(link.creator == msg.sender, "Not creator");

        uint256 amount = link.amount;
        link.claimed = true; // prevent reuse
        token.transfer(msg.sender, amount);

        emit CashlinkRevoked(claimHash, msg.sender);
    }
}
