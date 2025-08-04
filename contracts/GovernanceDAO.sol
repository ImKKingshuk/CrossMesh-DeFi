// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract GovernanceDAO is Ownable {
    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint256 endTime;
        bool executed;
    }

    mapping(uint256 => Proposal) public proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public stakes; // Staked XFI for voting weight

    uint256 public proposalCount;
    uint256 public constant VOTING_PERIOD = 3 days;
    uint256 public constant MIN_STAKE = 1 ether; // Example: 1 XFI

    event Staked(address indexed user, uint256 amount);
    event ProposalCreated(uint256 indexed id, address proposer, string description);
    event Voted(uint256 indexed id, address voter, bool support, uint256 weight);
    event ProposalExecuted(uint256 indexed id);

    constructor() Ownable(msg.sender) {}

    // Stake native XFI for voting power
    function stake() external payable {
        uint256 amount = msg.value;
        require(amount >= MIN_STAKE, "Stake too small");
        stakes[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    // Create a proposal
    function createProposal(string memory description) external {
        require(stakes[msg.sender] > 0, "Must stake to propose");
        proposalCount++;
        proposals[proposalCount] = Proposal({
            id: proposalCount,
            proposer: msg.sender,
            description: description,
            yesVotes: 0,
            noVotes: 0,
            endTime: block.timestamp + VOTING_PERIOD,
            executed: false
        });
        emit ProposalCreated(proposalCount, msg.sender, description);
    }

    // Vote on a proposal (weighted by stake)
    function vote(uint256 proposalId, bool support) external {
        Proposal storage prop = proposals[proposalId];
        require(block.timestamp < prop.endTime, "Voting period ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");
        require(stakes[msg.sender] > 0, "Must stake to vote");

        uint256 weight = stakes[msg.sender];
        if (support) {
            prop.yesVotes += weight;
        } else {
            prop.noVotes += weight;
        }
        hasVoted[proposalId][msg.sender] = true;
        emit Voted(proposalId, msg.sender, support, weight);
    }

    // Execute proposal if passed (for MVP, just mark executed; real: call external functions)
    function executeProposal(uint256 proposalId) external onlyOwner {
        Proposal storage prop = proposals[proposalId];
        require(block.timestamp >= prop.endTime, "Voting period not ended");
        require(!prop.executed, "Already executed");
        require(prop.yesVotes > prop.noVotes, "Proposal did not pass");

        prop.executed = true;
        // Real execution: e.g., update strategies or transfer funds
        emit ProposalExecuted(proposalId);
    }

    // Unstake (after voting periods if needed)
    function unstake(uint256 amount) external {
        require(stakes[msg.sender] >= amount, "Insufficient stake");
        stakes[msg.sender] -= amount;
        payable(msg.sender).transfer(amount);
    }
}