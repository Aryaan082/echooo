// MessagingPage.js -> Receive messages
export const GQL_QUERY_MESSAGE_LOG_INIT = `
query ($senderAddress: String!, $receiverAddress: String!, $recentTimestamp: BigInt!) {
  messages(            
    orderBy: timestamp
    orderDirection: asc
    where: {
      from_in: [$senderAddress, $receiverAddress],
      receiver_in: [$senderAddress, $receiverAddress]
      timestamp_gte: $recentTimestamp
    }        
  ) {
    from
    senderMessage
    receiverMessage
    timestamp
  }
}
`;

export const GQL_QUERY_MESSAGE_LOG_INTERVAL = `
query ($senderAddress: String!, $receiverAddress: String!, $recentMessageTimestamp: BigInt!) {
  messages(            
    orderBy: timestamp
    orderDirection: asc
    where: {
      from_in: [$senderAddress, $receiverAddress],
      receiver_in: [$senderAddress, $receiverAddress]
      timestamp_gt: $recentMessageTimestamp
    }

  ) {
    from
    senderMessage
    receiverMessage
    timestamp
    messageType
  }
}
`;

export const GQL_QUERY_IDENTITY_TIMESTAMP_RECENT = `
query ($senderAddress: String!) {
  identities(
    where: {from: $senderAddress}
    first: 1
    orderBy: timestamp
    orderDirection: desc
  ) {
    communicationAddress
    timestamp
  }
}
`;

// MessageSender.js -> Send messages
export const GQL_QUERY_GET_COMMUNICATION_ADDRESS = `
query ($receiverAddress: String!) {
  identities(where: {from: $receiverAddress}, first: 1, orderBy: timestamp, orderDirection: desc) {
    communicationAddress,
    timestamp     
  }
}
`;

// MessagePage.js -> Get unknown message senders
export const GQL_QUERY_GET_UNKNOWN_SENDERS = `
query ($knownSenders: [String]!, $receiverAddress: String!, $recentMessageTimestamp: BigInt!) {
  messages(where: {
    from_not_in: $knownSenders, 
    receiver: $receiverAddress
  	timestamp_gt: $recentMessageTimestamp   
  }
  ) {
    receiver
    timestamp
    from
  }
}
`;