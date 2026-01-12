import * as Network from 'expo-network';
import { NativeModules } from 'react-native';

const { LanTransferModule } = NativeModules;

export const NetworkInfo = {
  getIpAddress: async (): Promise<string | null> => {
    try {
      // 优先使用原生模块获取精准 IP (Android & iOS)
      // 原生模块通常能更好地过滤掉 link-local (169.254) 和 loopback 地址
      if (LanTransferModule?.getIpAddress) {
        console.log('[NetworkInfo] Fetching IP from Native Module...');
        try {
          const nativeIp = await LanTransferModule.getIpAddress();
          if (nativeIp) {
            console.log('[NetworkInfo] Native IP:', nativeIp);
            return nativeIp;
          }
        } catch (nativeError) {
          console.warn('[NetworkInfo] Native getIpAddress failed, falling back to expo-network', nativeError);
        }
      }

      // 降级方案: 使用 expo-network
      const ip = await Network.getIpAddressAsync();
      
      // 简单过滤：如果是 link-local 地址，视为无效
      if (ip && ip.startsWith('169.254')) {
        console.warn('[NetworkInfo] Ignored link-local address:', ip);
        return null; 
      }
      
      return ip;
    } catch (e) {
      console.error('Failed to get IP address', e);
      return null;
    }
  }
};
