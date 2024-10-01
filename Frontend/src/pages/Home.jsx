import { ethers } from "ethers";  
import { ContractAddress, ABI as ContractABI } from "../utils/util";
import { useEffect, useState } from "react";

const Home = () => {
  const [daoContract, setDaoContract] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [proposalIndex, setProposalIndex] = useState(""); 
  const [support,setSupport]= useState(null);

  const connectToMetamask = async () => {
    try {
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      await provider.send("eth_requestAccounts", []);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const contract = new ethers.Contract(ContractAddress, ContractABI, signer);
      setDaoContract(contract);
      console.log(address);
    } catch (error) {
      console.error("Error connecting to MetaMask:", error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (daoContract) {
        const totalSupply = await daoContract.totalSupply();
        console.log('Total Token supply', ethers.utils.formatUnits(totalSupply, 18));
      }
    };
    fetchData();
  }, [daoContract]);

  // Fetch a specific proposal by index
  const fetchProposal = async () => {
    if (daoContract) {
      try {
        const index = parseInt(proposalIndex); // Convert input to integer
        const proposal = await daoContract.getProposal(index); // Fetch the proposal by index
        setProposals([proposal]); // Set proposals state with the fetched proposal
      } catch (error) {
        console.error("Error fetching proposal:", error);
      }
    } else {
      console.error("DAO contract not set. Please connect to MetaMask first.");
    }
  };

  const createProposal = async () => {
    const description = prompt("Enter proposal description:");
    const target = prompt("Enter target address:");
    const amount = prompt("Enter amount:");
    try {
      if (daoContract) {
        const amountInUnits = ethers.utils.parseUnits(amount, 18);
        const tx = await daoContract.propose(description, target, amountInUnits);
        await tx.wait();
        console.log("Proposal created", tx);
        await fetchProposal(); // Optionally refresh proposals after creating one
      } else {
        console.log("Proposal creation failed");
      }
    } catch (error) {
      console.error(error);
    }
  };

  const voteOnProposal = async () => {
    if (proposalIndex !== "" && support !== null) {
      try {
        if (daoContract) {
          const tx = await daoContract.vote(proposalIndex, support);
          await tx.wait();
          console.log(`Voted ${support ? 'for' : 'against'} proposal ${proposalIndex}`);
          await fetchProposal(); 
        } else {
          console.error("DAO contract not set. Please connect to MetaMask first.");
        }
      } catch (error) {
        console.error("Error voting on proposal:", error);
      }
    } else {
      console.error("Please enter a proposal ID and select a voting option.");
    }
  };


  const ExecuteProposal = async () => {
    if (proposalIndex !== "") {
      try {
        if (daoContract) {
          const tx = await daoContract.executeProposal(proposalIndex);
          await tx.wait();
          console.log(`Executed proposal ${proposalIndex}`);
          await fetchProposal(); 
        } else {
          console.error("Error executing");
        }
      } catch (error) {
        console.log(error);
      }
    } else {
      console.error("Please enter a proposal ID.");
    }
  };

  return (
    <div>
      <h1>Home</h1>

      <h1>Proposals</h1>
      <ul>
        {proposals.map((proposal, index) => (
          <li key={index}>
            <strong>Description:</strong> {proposal.description} <br />
            <strong>Target:</strong> {proposal.target} <br />
            <strong>Amount:</strong> {ethers.utils.formatUnits(proposal.amount, 18)} <br />
            <strong>Votes For:</strong> {proposal.votesFor.toString()} <br />
            <strong>Votes Against:</strong> {proposal.votesAgainst.toString()} <br />
          </li>
        ))}
      </ul>

      <div>
        <h1>Voting</h1>
        <div>
        <h2>Vote on Proposal</h2>
        <input
          type="number"
          value={proposalIndex}
          onChange={(e) => setProposalIndex(e.target.value)}
          placeholder="Enter Proposal ID"
        />
        <div>
          <button onClick={() => setSupport(true)}>Vote For</button>
          <button onClick={() => setSupport(false)}>Vote Against</button>
        </div>
        <button onClick={voteOnProposal}>Submit Vote</button>
      </div>
      </div>
      <div>
        <h1>Executing the Proposal</h1>
        <input
          type="text"
          value={proposalIndex}
          onChange={(e) => setProposalIndex(e.target.value)}
          placeholder="Enter proposal ID to execute"
        />
        <button onClick={ExecuteProposal}>Execute</button>
      </div>
      <div>
        <input 
          type="number" 
          value={proposalIndex} 
          onChange={(e) => setProposalIndex(e.target.value)} 
          placeholder="Enter proposal index"
        />
        <button onClick={fetchProposal}>Fetch Proposal</button>
      </div>
      
      <button onClick={connectToMetamask}>Connect to MetaMask</button>
      <button onClick={createProposal}>Create Proposal</button>
    </div>
  );
};

export default Home;
