import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert } from 'react-native';
import * as Linking from 'expo-linking';

import { ThemedText } from '@/components/themed-text';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '@/components/Card';
import BasicLayout from '@/components/BasicLayout';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Collapsible } from '@/components/ui/collapsible';
import Point from '@/components/Point';
import { ExternalLink } from '@/components/external-link';
import ConnectionIndicator from '@/components/ConnectionIndicator';
import { Margins } from '@/constants/theme';
import { SOCKET_SERVER_URL } from '@/constants/Connection';
import AsyncStorage from "@react-native-async-storage/async-storage";

const logo = require('@/assets/images/logo.png');

export default function HomeScreen() {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'waiting'>('disconnected');
  const [isPaired, setIsPaired] = useState(false);
  const [connectingCode, setConnectingCode] = useState('');
  const socketRef = useRef<WebSocket | null>(null);
  const closureConnectionStatus = useRef(connectionStatus);

  useEffect(() => {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    handleOnConnect();

    return () => {
      subscription.remove();
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, []);

  const handleDeepLink = (url: string) => {
    const parsedUrl = Linking.parse(url);
    
    if (parsedUrl.queryParams?.code) {
      const code = parsedUrl.queryParams.code.toString();
      setConnectingCode(code);
      handleOnConnect();
    }
  };

  const handleOnConnect = () => {
    setConnectionStatus('waiting');
    closureConnectionStatus.current = 'waiting';
    setTimeout(() => {
      if (closureConnectionStatus.current === 'waiting') {
        console.log(closureConnectionStatus.current);
        setConnectionStatus('disconnected');
        Alert.alert('Connection Timeout', 'Unable to connect within the expected time. Please check your code and try again.');
      }
    }, 1000);

    AsyncStorage.getItem('connectionToken')
      .then((token) => {
        const code = connectingCode.trim();
        const canReuseToken = token && token.length > 0;
        if (canReuseToken) {
          setIsPaired(true);
        }
        if (!canReuseToken && code.length === 0) {
          closureConnectionStatus.current = 'disconnected';
          setConnectionStatus('disconnected');
          return;
        }

        const action = canReuseToken ? 'reuse_connection' : 'new_connection';
        const query = canReuseToken
          ? `type=receiver&action=${action}&token=${encodeURIComponent(token)}`
          : `type=receiver&action=${action}&code=${encodeURIComponent(code)}`;

        const socketUrl = `${SOCKET_SERVER_URL}?${query}`;

        if (socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
        }

        const socket = new WebSocket(socketUrl);
        socketRef.current = socket;

        socket.onmessage = (event) => {
          const payload = typeof event.data === 'string' ? event.data : '';
          try {
            const json = JSON.parse(payload) as { type?: string; token?: string };
            if (json.type === 'connection_established' && json.token) {
              AsyncStorage.setItem('connectionToken', json.token).then(() => {
                setConnectionStatus('connected');
                closureConnectionStatus.current = 'connected';
                setIsPaired(true);
              });
            } else if (json.type === 'connection_restored') {
              closureConnectionStatus.current = 'connected';
              setConnectionStatus('connected');
              setIsPaired(true);
            } else if (json.type === 'peer_disconnected') {
              closureConnectionStatus.current = 'disconnected';
              setConnectionStatus('disconnected');
            }
          } catch {
            Alert.alert('Connection Error', 'Received invalid response from server. Please try again.');
          }
        };

        socket.onerror = () => {
          Alert.alert('Connection Error', 'An error occurred while connecting. Please check your code and try again.');
          setConnectionStatus('disconnected');
          closureConnectionStatus.current = 'disconnected';
        };

        socket.onclose = () => {
          setConnectionStatus('disconnected');
          closureConnectionStatus.current = 'disconnected';
        };
      });
  }

  const handleDisconnect = () => {
    socketRef.current?.close();
    socketRef.current = null;
    setConnectionStatus('disconnected');
    setConnectingCode('');
    setIsPaired(false);
    AsyncStorage.removeItem('connectionToken');
  };

  return <SafeAreaView>
    <BasicLayout>

      <View style={styles.titleContainer}>
        <ThemedText type="title">
          Welcome to Pulsar!
        </ThemedText>
        <Image source={logo} style={styles.logo} />
      </View>

      <View>
        <ConnectionIndicator status={connectionStatus} style={styles.indicator} />

        <Card>
          <ThemedText type="subtitle">Connect device</ThemedText>
          <ThemedText style={Margins.marginTop2X}>
            Connect your haptic device first. Pair it with the app now so you can test the presets.
          </ThemedText>

          {isPaired && <>

            <View style={[Margins.marginTop4X, styles.infoBox]}>
              {connectionStatus === 'connected' ? (
                <ThemedText style={styles.infoBoxText}>You are connected with the browser!</ThemedText>
              ) : (
                <ThemedText style={styles.infoBoxTextFail}>Waiting for a browser connection...</ThemedText>
              )}
            </View>

            <TouchableOpacity
              style={Margins.marginTop2X}
              onPress={handleDisconnect}
            >
              <ThemedText style={styles.disconnect}>
                Disconnect
              </ThemedText>
            </TouchableOpacity>
          </>}

          {!isPaired && connectionStatus !== 'connected' && <>
            <Input 
              placeholder='Connecting code' 
              style={Margins.marginTop4X}
              value={connectingCode}
              onChangeText={setConnectingCode}
            />
            <Button
              label='Connect'
              style={Margins.marginTop3X}
              state={connectionStatus === 'waiting' ? 'loading' : 'default'}
              onClick={handleOnConnect}
            />
            <Collapsible title="How to connect a device? 🤔" style={Margins.marginTop4X}>
              <Point index={1}>
                <ThemedText>Download the PulsarApp for App Store or Play Store.</ThemedText>
              </Point>
              <Point index={2}>
                <ThemedText>Open Playground and find Device Connection section.</ThemedText>
              </Point>
              <Point index={3}>
                <ThemedText>
                  Type Paring code into PulsarApp and click Connect button. 
                  <ExternalLink href="https://docs.expo.dev/router/introduction">
                    <ThemedText type="link"> Test link.</ThemedText>
                  </ExternalLink>
                </ThemedText>
              </Point>
            </Collapsible>
          </>}

        </Card>
      </View>
    </BasicLayout>
  </SafeAreaView>
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 30,
    marginBottom: 30,
  },
  logo: {
    width: 50,
    height: 50,
    marginTop: -10,
  },
  indicator: {
    position: 'absolute',
    top: -12,
    right: -8,
  },

  infoBox: {
    padding: 10,
    backgroundColor: '#E1F3FA',
    borderRadius: 4,
  },
  infoBoxText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#57B495',
  },
  infoBoxTextFail: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6259',
  },
  disconnect: {
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
