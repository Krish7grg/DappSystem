// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MilestoneFunding {
    address public owner;
    uint256 public goal;
    uint256 public deadline;
    uint256 public totalFunds;
    bool public goalReached;
    bool public campaignClosed;
    uint256 public currentMilestone;

    struct Milestone {
        string description;
        uint256 amount;
        bool approved;
        bool paid;
        bool votingOpen;
        uint256 yesVotes;
        uint256 noVotes;
    }

    Milestone[] public milestones;

    mapping(address => uint256) public contributions;
    mapping(uint256 => mapping(address => bool)) public hasVoted;

    event ContributionReceived(address indexed contributor, uint256 amount);
    event RefundClaimed(address indexed contributor, uint256 amount);
    event MilestoneVotingStarted(uint256 indexed milestoneId);
    event MilestoneApproved(uint256 indexed milestoneId);
    event MilestoneRejected(uint256 indexed milestoneId);
    event MilestonePaid(uint256 indexed milestoneId, uint256 amount);
    event CampaignClosed(bool goalReached);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this");
        _;
    }

    modifier campaignActive() {
        require(block.timestamp < deadline, "Campaign deadline passed");
        require(!campaignClosed, "Campaign closed");
        _;
    }

    modifier validMilestone(uint256 _milestoneId) {
        require(_milestoneId < milestones.length, "Invalid milestone");
        _;
    }

    constructor(
        uint256 _goal,
        uint256 _durationInDays,
        string[] memory _descriptions,
        uint256[] memory _amounts
    ) {
        require(_goal > 0, "Goal must be greater than zero");
        require(_durationInDays > 0, "Duration must be greater than zero");
        require(_descriptions.length > 0, "At least one milestone required");
        require(_descriptions.length == _amounts.length, "Milestone data mismatch");

        owner = msg.sender;
        goal = _goal;
        deadline = block.timestamp + (_durationInDays * 1 days);

        uint256 totalMilestoneAmount;

        for (uint256 i = 0; i < _descriptions.length; i++) {
            require(bytes(_descriptions[i]).length > 0, "Milestone description required");
            require(_amounts[i] > 0, "Milestone amount must be greater than zero");

            milestones.push(
                Milestone({
                    description: _descriptions[i],
                    amount: _amounts[i],
                    approved: false,
                    paid: false,
                    votingOpen: false,
                    yesVotes: 0,
                    noVotes: 0
                })
            );

            totalMilestoneAmount += _amounts[i];
        }

        require(totalMilestoneAmount == _goal, "Milestone amounts must equal goal");
    }

    function _contribute() internal campaignActive {
        require(msg.value > 0, "Must send ETH");
        require(!goalReached, "Funding goal already reached");

        contributions[msg.sender] += msg.value;
        totalFunds += msg.value;

        if (totalFunds >= goal) {
            goalReached = true;
        }

        emit ContributionReceived(msg.sender, msg.value);
    }

    function contribute() public payable {
        _contribute();
    }

    receive() external payable {
        _contribute();
    }

    function startMilestoneVoting(uint256 _milestoneId)
        external
        onlyOwner
        validMilestone(_milestoneId)
    {
        require(goalReached, "Goal not reached yet");
        require(!campaignClosed, "Campaign closed");
        require(_milestoneId == currentMilestone, "Only current milestone allowed");

        Milestone storage milestone = milestones[_milestoneId];

        require(!milestone.paid, "Milestone already paid");
        require(!milestone.approved, "Milestone already approved");
        require(!milestone.votingOpen, "Voting already open");

        milestone.votingOpen = true;

        emit MilestoneVotingStarted(_milestoneId);
    }

    function voteOnMilestone(uint256 _milestoneId, bool _approve)
        external
        validMilestone(_milestoneId)
    {
        require(goalReached, "Goal not reached yet");
        require(!campaignClosed, "Campaign closed");
        require(contributions[msg.sender] > 0, "Only contributors can vote");

        Milestone storage milestone = milestones[_milestoneId];

        require(_milestoneId == currentMilestone, "Not current milestone");
        require(milestone.votingOpen, "Voting not open");
        require(!milestone.paid, "Milestone already paid");
        require(!hasVoted[_milestoneId][msg.sender], "Already voted");

        hasVoted[_milestoneId][msg.sender] = true;

        uint256 votingWeight = contributions[msg.sender];

        if (_approve) {
            milestone.yesVotes += votingWeight;
        } else {
            milestone.noVotes += votingWeight;
        }
    }

    function finalizeMilestoneVote(uint256 _milestoneId)
        external
        onlyOwner
        validMilestone(_milestoneId)
    {
        require(goalReached, "Goal not reached yet");
        require(!campaignClosed, "Campaign closed");
        require(_milestoneId == currentMilestone, "Not current milestone");

        Milestone storage milestone = milestones[_milestoneId];

        require(milestone.votingOpen, "Voting not open");
        require(!milestone.paid, "Milestone already paid");

        milestone.votingOpen = false;

        if (milestone.yesVotes > milestone.noVotes) {
            milestone.approved = true;
            emit MilestoneApproved(_milestoneId);
        } else {
            emit MilestoneRejected(_milestoneId);
        }
    }

    function releaseMilestonePayment(uint256 _milestoneId)
        external
        onlyOwner
        validMilestone(_milestoneId)
    {
        require(goalReached, "Goal not reached yet");
        require(!campaignClosed, "Campaign closed");
        require(_milestoneId == currentMilestone, "Not current milestone");

        Milestone storage milestone = milestones[_milestoneId];

        require(milestone.approved, "Milestone not approved");
        require(!milestone.paid, "Milestone already paid");
        require(address(this).balance >= milestone.amount, "Insufficient balance");

        milestone.paid = true;

        (bool success, ) = payable(owner).call{value: milestone.amount}("");
        require(success, "Transfer failed");

        emit MilestonePaid(_milestoneId, milestone.amount);

        currentMilestone++;

        if (currentMilestone == milestones.length) {
            campaignClosed = true;
            emit CampaignClosed(true);
        }
    }

    function claimRefund() external {
        require(block.timestamp > deadline || campaignClosed, "Refunds unavailable");
        require(!goalReached, "Goal was reached");

        uint256 contributedAmount = contributions[msg.sender];
        require(contributedAmount > 0, "No contribution found");

        contributions[msg.sender] = 0;

        (bool success, ) = payable(msg.sender).call{value: contributedAmount}("");
        require(success, "Refund failed");

        emit RefundClaimed(msg.sender, contributedAmount);
    }

    function closeCampaign() external onlyOwner {
        require(!campaignClosed, "Campaign already closed");
        require(block.timestamp > deadline || currentMilestone == milestones.length, "Cannot close yet");

        campaignClosed = true;

        emit CampaignClosed(goalReached);
    }

    function getMilestoneCount() external view returns (uint256) {
        return milestones.length;
    }

    function getMilestone(uint256 _milestoneId)
        external
        view
        validMilestone(_milestoneId)
        returns (
            string memory description,
            uint256 amount,
            bool approved,
            bool paid,
            bool votingOpen,
            uint256 yesVotes,
            uint256 noVotes
        )
    {
        Milestone memory m = milestones[_milestoneId];
        return (
            m.description,
            m.amount,
            m.approved,
            m.paid,
            m.votingOpen,
            m.yesVotes,
            m.noVotes
        );
    }
}