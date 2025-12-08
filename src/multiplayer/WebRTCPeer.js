export class WebRTCPeer {
  constructor(peerId, initiator = false) {
    this.peerId = peerId;
    this.initiator = initiator;
    this.connection = null;
    this.dataChannel = null;

    this.onOfferCallback = null;
    this.onAnswerCallback = null;
    this.onIceCandidateCallback = null;
    this.onMessageCallback = null;
    this.onReadyCallback = null;

    this.iceQueue = [];
    this.isReady = false;

    this.setupConnection();
  }

  setupConnection() {
    const config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ]
    };

    this.connection = new RTCPeerConnection(config);

    // Handle ICE candidates
    this.connection.onicecandidate = (event) => {
      if (event.candidate && this.onIceCandidateCallback) {
        this.onIceCandidateCallback(event.candidate);
      }
    };

    // Handle connection state changes
    this.connection.onconnectionstatechange = () => {
      console.log('Connection state:', this.connection.connectionState);

      if (this.connection.connectionState === 'connected') {
        this.isReady = true;
        if (this.onReadyCallback) {
          this.onReadyCallback();
        }
      } else if (this.connection.connectionState === 'failed' ||
                 this.connection.connectionState === 'closed') {
        console.error('Connection failed or closed');
      }
    };

    // Setup data channel
    if (this.initiator) {
      this.createDataChannel();
    } else {
      this.connection.ondatachannel = (event) => {
        this.dataChannel = event.channel;
        this.setupDataChannelHandlers();
      };
    }
  }

  createDataChannel() {
    this.dataChannel = this.connection.createDataChannel('gameData', {
      ordered: false,
      maxRetransmits: 0
    });

    this.setupDataChannelHandlers();
  }

  setupDataChannelHandlers() {
    if (!this.dataChannel) return;

    this.dataChannel.onopen = () => {
      console.log('Data channel opened with', this.peerId);
    };

    this.dataChannel.onclose = () => {
      console.log('Data channel closed with', this.peerId);
    };

    this.dataChannel.onerror = (error) => {
      console.error('Data channel error:', error);
    };

    this.dataChannel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (this.onMessageCallback) {
          this.onMessageCallback(data);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };
  }

  async createOffer() {
    try {
      const offer = await this.connection.createOffer();
      await this.connection.setLocalDescription(offer);

      if (this.onOfferCallback) {
        this.onOfferCallback(offer);
      }
    } catch (error) {
      console.error('Error creating offer:', error);
    }
  }

  async handleOffer(offer) {
    try {
      await this.connection.setRemoteDescription(new RTCSessionDescription(offer));

      // Process queued ICE candidates
      while (this.iceQueue.length > 0) {
        const candidate = this.iceQueue.shift();
        await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
      }

      const answer = await this.connection.createAnswer();
      await this.connection.setLocalDescription(answer);

      if (this.onAnswerCallback) {
        this.onAnswerCallback(answer);
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  async handleAnswer(answer) {
    try {
      await this.connection.setRemoteDescription(new RTCSessionDescription(answer));

      // Process queued ICE candidates
      while (this.iceQueue.length > 0) {
        const candidate = this.iceQueue.shift();
        await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  async handleIceCandidate(candidate) {
    try {
      if (this.connection.remoteDescription) {
        await this.connection.addIceCandidate(new RTCIceCandidate(candidate));
      } else {
        // Queue ICE candidates until remote description is set
        this.iceQueue.push(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  send(data) {
    if (this.dataChannel && this.dataChannel.readyState === 'open') {
      try {
        this.dataChannel.send(JSON.stringify(data));
      } catch (error) {
        console.error('Error sending data:', error);
      }
    }
  }

  close() {
    if (this.dataChannel) {
      this.dataChannel.close();
    }

    if (this.connection) {
      this.connection.close();
    }
  }

  onOffer(callback) {
    this.onOfferCallback = callback;
  }

  onAnswer(callback) {
    this.onAnswerCallback = callback;
  }

  onIceCandidate(callback) {
    this.onIceCandidateCallback = callback;
  }

  onMessage(callback) {
    this.onMessageCallback = callback;
  }

  onReady(callback) {
    this.onReadyCallback = callback;
  }
}
