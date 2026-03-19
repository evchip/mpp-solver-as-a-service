// SPDX-License-Identifier: MIT
pragma solidity >=0.8.28;

import { WithdrawTrieVerifier } from "./WithdrawTrieVerifier.sol";

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
}

/// @title PolymarketEscrow
/// @notice Holds USDC for cross-chain Polymarket positions until solver proves CTF delivery.
///         Service fee is paid separately via MPP. Escrow only holds position funds.
contract PolymarketEscrow {
    struct Order {
        address user;
        address solver;
        uint256 amount;
        bytes32 tokenId;
        bytes32 recipientHash;
        uint256 deadline;
        bool settled;
    }

    IERC20 public immutable usdc;
    address public relayer;
    address public owner;

    mapping(bytes32 => Order) public orders;
    mapping(uint256 => bytes32) public roots;
    uint256 public nextBatchIndex;

    event Deposited(bytes32 indexed orderId, address indexed user, address indexed solver, uint256 amount);
    event RootCommitted(uint256 indexed batchIndex, bytes32 root);
    event Claimed(bytes32 indexed orderId, address indexed solver);
    event Refunded(bytes32 indexed orderId, address indexed user);

    error OrderExists();
    error OrderNotFound();
    error AlreadySettled();
    error NotExpired();
    error OnlyRelayer();
    error OnlyOwner();
    error InvalidProof();
    error TransferFailed();

    modifier onlyRelayer() {
        if (msg.sender != relayer) revert OnlyRelayer();
        _;
    }

    modifier onlyOwner() {
        if (msg.sender != owner) revert OnlyOwner();
        _;
    }

    constructor(address _usdc, address _relayer) {
        usdc = IERC20(_usdc);
        relayer = _relayer;
        owner = msg.sender;
    }

    function deposit(
        bytes32 orderId,
        address solver,
        uint256 amount,
        bytes32 tokenId,
        bytes32 recipientHash,
        uint256 deadline
    ) external {
        if (orders[orderId].user != address(0)) revert OrderExists();

        orders[orderId] = Order({
            user: msg.sender,
            solver: solver,
            amount: amount,
            tokenId: tokenId,
            recipientHash: recipientHash,
            deadline: deadline,
            settled: false
        });

        if (!usdc.transferFrom(msg.sender, address(this), amount)) revert TransferFailed();

        emit Deposited(orderId, msg.sender, solver, amount);
    }

    function commitRoot(uint256 batchIndex, bytes32 root) external onlyRelayer {
        require(batchIndex <= nextBatchIndex, "Invalid batch index");
        roots[batchIndex] = root;
        nextBatchIndex++;
        emit RootCommitted(batchIndex, root);
    }

    function claimWithProof(
        bytes32 orderId,
        uint256 batchIndex,
        uint256 position,
        bytes32 polygonTxHash,
        bytes memory proof
    ) external {
        Order storage order = orders[orderId];
        if (order.user == address(0)) revert OrderNotFound();
        if (order.settled) revert AlreadySettled();

        // Leaf format: keccak256(abi.encodePacked(keccak256(abi.encodePacked(orderId, polygonTxHash)), orderId))
        // Same pattern as T1XChainReader: keccak256(abi.encodePacked(resultHash, requestId))
        bytes32 resultHash = keccak256(abi.encodePacked(orderId, polygonTxHash));
        bytes32 leaf = keccak256(abi.encodePacked(resultHash, orderId));

        if (!WithdrawTrieVerifier.verifyMerkleProof(roots[batchIndex], leaf, position, proof)) {
            revert InvalidProof();
        }

        order.settled = true;

        if (!usdc.transfer(order.solver, order.amount)) revert TransferFailed();

        emit Claimed(orderId, order.solver);
    }

    function refund(bytes32 orderId) external {
        Order storage order = orders[orderId];
        if (order.user == address(0)) revert OrderNotFound();
        if (order.settled) revert AlreadySettled();
        if (block.timestamp <= order.deadline) revert NotExpired();

        order.settled = true;

        if (!usdc.transfer(order.user, order.amount)) revert TransferFailed();

        emit Refunded(orderId, order.user);
    }

    function setRelayer(address _relayer) external onlyOwner {
        relayer = _relayer;
    }
}
