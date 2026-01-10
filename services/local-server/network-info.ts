import * as Network from 'expo-network';

export const NetworkInfo = {
  getIpAddress: async (): Promise<string | null> => {
    try {
      const ip = await Network.getIpAddressAsync();
      return ip;
    } catch (e) {
      console.error('Failed to get IP address', e);
      return null;
    }
  }
};


