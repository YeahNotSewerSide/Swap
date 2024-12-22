"use client";
import { useConnect, useAccount, useDisconnect } from 'wagmi';

export function ConnectWallet() {
  const { connect, connectors } = useConnect();
  const { isConnected, address } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div>
        <p>Connected to {address}</p>
        <button onClick={() => disconnect()}>Disconnect</button>
      </div>
    );
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          
        >
          {connector.name}
          {!connector.ready && ' (unsupported)'}
        </button>
      ))}
    </div>
  );
}
