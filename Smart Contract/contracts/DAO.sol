// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.16;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; 
contract DAO is ERC20{
    constructor(uint initialSupply) ERC20("DAOtoken","DT"){
        _mint(msg.sender,initialSupply);
    }

    mapping(uint => mapping(address=>bool)) public hasVoted;

    event ProposalCreated(uint ProposalId, address proposer, string description, address target, uint amount);
    event Voted(uint256 proposalId, address voter, bool support, uint256 voterPower);
    event ProposalExecuted(uint256 proposalId);

    struct Proposal{
        address target;
        uint amount;
        address proposer;
        string description;
        uint votesFor;
        uint votesAgainst;
        bool executed;
    }

    Proposal[] public proposals;

    function propose( string memory _description,address _target,uint _amount) public  {
        proposals.push(Proposal({
            proposer:msg.sender,
            description: _description,
            votesFor:0,
            votesAgainst:0,
            executed:false,
            target:_target,
            amount:_amount
        }));
         emit ProposalCreated(proposals.length - 1, msg.sender, _description, _target, _amount);
    }



      function vote(uint proposalId, bool support)public{
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed,"Proposal already executed");
        require(balanceOf(msg.sender)>0,"No voting power");
        require(!hasVoted[proposalId][msg.sender],"already voted on this proposal");
        uint voterPower = balanceOf(msg.sender);
        if(support){
            proposal.votesFor += voterPower;
        }else{
            proposal.votesAgainst += voterPower;
        }
        hasVoted[proposalId][msg.sender]= true;
        emit Voted(proposalId, msg.sender, support, voterPower);
    } 

    function executeProposal(uint proposalId)public{
        Proposal storage proposal = proposals[proposalId];
        require(!proposal.executed,"Proposal already executed");
        require(proposal.votesFor>proposal.votesAgainst,"Not enough support to execute");
        payable(proposal.target).transfer(proposal.amount);
        proposal.executed = true;
        emit ProposalExecuted(proposalId);
    }

    function getProposal( uint proposalId)public view returns(Proposal memory){
        return proposals[proposalId];
    }

    function votingPower(address voter) public view returns(uint){
        return balanceOf(voter);
    }

}
