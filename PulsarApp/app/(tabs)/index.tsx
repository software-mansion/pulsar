import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, View, Alert, Keyboard } from 'react-native';
import * as Linking from 'expo-linking';
import { useDetourContext } from '@swmansion/react-native-detour';
import { usePostHog } from 'posthog-react-native';

import { ThemedText } from '@/components/themed-text';
import { SafeAreaView } from 'react-native-safe-area-context';
import Card from '@/components/Card';
import BasicLayout from '@/components/BasicLayout';
import Input from '@/components/Input';
import { Collapsible } from '@/components/ui/collapsible';
import Point from '@/components/Point';
import ConnectionIndicator from '@/components/ConnectionIndicator';
import { Margins } from '@/constants/theme';
import { SOCKET_SERVER_URL } from '@/constants/Connection';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Settings, Presets } from 'react-native-pulsar';
import { BaseButton } from 'react-native-gesture-handler';
import Button from '@/components/Button';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';

const logo = require('@/assets/images/logo.png');

type ConnectionState = 
  | 'INITIAL'              // Checking if token exists
  | 'DISCONNECTED'         // No connection
  | 'CONNECTING'           // Connecting to server
  | 'CONNECTED_TO_SERVER'  // Connected to server, waiting for browser
  | 'FULLY_CONNECTED'      // Connected to both server and browser
  | 'ERROR';               // Connection error

type ErrorType = 'INVALID_DATA' | 'CONNECTION_FAILED' | null;

export default function HomeScreen() {
  const posthog = usePostHog();
  const { link, clearLink } = useDetourContext();
  const [connectionState, setConnectionState] = useState<ConnectionState>('INITIAL');
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [hasToken, setHasToken] = useState(false);
  const [showPatternNotification, setShowPatternNotification] = useState(false);
  const [patternFound, setPatternFound] = useState(false);

  const [connectingCode, setConnectingCode] = useState('');
  const tokenRef = useRef('');
  const socketRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const patternNotificationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (link?.params?.code) {
      const code = String(link.params.code);
      setConnectingCode(code);
      posthog.capture('deep_link_connection_initiated', { has_code: true });
      handleOnConnect(false, code);
      clearLink();
    }
  }, [link]);

  useEffect(() => {
    Settings.enableSound(true);
    
    const subscription = Linking.addEventListener('url', ({ url }) => {
      handleDeepLink(url);
    });

    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    checkIfTokenExists()
      .then((hasToken) => {
        if (hasToken) {
          handleOnConnect(true, '');
        }
      });

    return () => {
      subscription.remove();
      socketRef.current?.close();
      socketRef.current = null;
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      if (patternNotificationTimeoutRef.current) {
        clearTimeout(patternNotificationTimeoutRef.current);
      }
    };
  }, []);

  const handleDeepLink = (url: string) => {
    const parsedUrl = Linking.parse(url);

    if (parsedUrl.queryParams?.code) {
      const code = parsedUrl.queryParams.code.toString();
      setConnectingCode(code);
      posthog.capture('deep_link_connection_initiated', {
        has_code: true,
      });
      handleOnConnect(false, code);
    }
  };

  const checkIfTokenExists = async () => {
    return AsyncStorage.getItem('connectionToken').then((token) => {
      setConnectionState('DISCONNECTED');
      if (token && token.length > 0) {
        tokenRef.current = token;
        setHasToken(true);
        return true;
      }
      return false;
    });
  }

  const handleOnConnect = (hasToken: boolean, code: string) => {
    setErrorType(null);
    const connectionCode = code?.trim() || connectingCode.trim();
    if (!hasToken && connectionCode.length === 0) {
      return;
    }

    const action = hasToken ? 'reuse_connection' : 'new_connection';
    const query = hasToken
      ? `type=receiver&action=${action}&token=${encodeURIComponent(tokenRef.current)}`
      : `type=receiver&action=${action}&code=${encodeURIComponent(connectionCode)}`;

    const socketUrl = `${SOCKET_SERVER_URL}?${query}`;

    if (socketRef.current) {
      socketRef.current.close();
      socketRef.current = null;
    }

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    setConnectionState('CONNECTING');

    posthog.capture('device_connection_initiated', {
      connection_action: action,
      has_existing_token: hasToken,
    });

    socket.onmessage = (event) => {
      const payload = typeof event.data === 'string' ? event.data : '';
      try {
        const json = JSON.parse(payload) as { type?: string; token?: string, message?: string };
        if (json.type === 'connection_established' && json.token) {
          AsyncStorage.setItem('connectionToken', json.token).then(() => {
            tokenRef.current = json.token ?? '';
            setHasToken(true);
          });
          setConnectionState('FULLY_CONNECTED');
          Presets.BreakingWave();
          posthog.capture('device_connected', {
            connection_type: 'new',
          });
        } else if (json.type === 'connection_restored') {
          setConnectionState('FULLY_CONNECTED');
          Presets.BreakingWave();
          posthog.capture('device_connected', {
            connection_type: 'restored',
          });
        } else if (json.type === 'peer_disconnected') {
          setConnectionState('CONNECTED_TO_SERVER');
        } else if (json.type === 'pong') {
          // keepalive response, no-op
        } else if (json.type === 'broadcast') {
          if (json.message) {
            const found = playPattern(json.message);
            showPatternReceivedNotification(found);
          }
        }
      } catch (err) {
        const error = err as Error;
        posthog.capture('$exception', {
          $exception_list: [
            {
              type: error.name ?? 'ParseError',
              value: error.message ?? 'Failed to parse server response',
              stacktrace: {
                type: 'raw',
                frames: error.stack ?? '',
              },
            },
          ],
          $exception_source: 'websocket_message',
        });
        Alert.alert('Connection Error', 'Received invalid response from server. Please try again.');
      }
    };

    socket.onopen = () => {
      setConnectionState('CONNECTED_TO_SERVER');
      pingIntervalRef.current = setInterval(() => {
        if (socketRef.current?.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ type: 'ping' }));
        }
      }, 25_000);
    };

    socket.onerror = () => {
      setConnectionState('ERROR');
      setErrorType('CONNECTION_FAILED');
      Presets.Chirp();
      posthog.capture('device_connection_failed', {
        error_type: 'CONNECTION_FAILED',
        connection_action: action,
      });
      Alert.alert('Connection Error', 'An error occurred while connecting. Please check your code and try again.');
    };

    socket.onclose = (e) => {
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
        pingIntervalRef.current = null;
      }
      if (e.code !== 1000) {
        setConnectionState('ERROR');
        setErrorType('INVALID_DATA');
        Presets.Chirp();
        posthog.capture('device_connection_failed', {
          error_type: 'INVALID_DATA',
          close_code: e.code,
          connection_action: action,
        });
      } else {
        setConnectionState('DISCONNECTED');
      }
    };
  }

  const handleDisconnect = () => {
    Presets.PowerDown();
    posthog.capture('device_disconnected', {
      previous_state: connectionState,
    });
    socketRef.current?.close();
    socketRef.current = null;
    if (pingIntervalRef.current) {
      clearInterval(pingIntervalRef.current);
      pingIntervalRef.current = null;
    }
    setConnectingCode('');
    setHasToken(false);
    setConnectionState('DISCONNECTED');
    setErrorType(null);
    AsyncStorage.removeItem('connectionToken');
  };

  const playPattern = (patternName: string): boolean => {
    if (patternName.includes('System')) {
      const key = patternName.replace('System', '');
      const systemPreset = (Presets.System as any)[key];
      if (typeof systemPreset === 'function') {
        systemPreset();
        return true;
      }
      const androidPreset = (Presets.System.Android as any)[key];
      if (typeof androidPreset === 'function') {
        androidPreset();
        return true;
      }
      return false;
    }
    const preset = (Presets as any)[patternName];
    if (typeof preset === 'function') {
      preset();
      return true;
    }
    return false;
  };

  const showPatternReceivedNotification = (found: boolean) => {
    if (patternNotificationTimeoutRef.current) {
      clearTimeout(patternNotificationTimeoutRef.current);
    }

    setPatternFound(found);
    setShowPatternNotification(true);

    patternNotificationTimeoutRef.current = setTimeout(() => {
      setShowPatternNotification(false);
      patternNotificationTimeoutRef.current = null;
    }, 1000);
  };

  const connectionStatus = () => {
    switch (connectionState) {
      case 'INITIAL':
      case 'CONNECTING':
      case 'CONNECTED_TO_SERVER':
        return 'waiting';
      case 'FULLY_CONNECTED':
        return 'connected';
      case 'DISCONNECTED':
      case 'ERROR':
      default:
        return 'disconnected';
    }
  }

  return <SafeAreaView>
    <BaseButton onPress={Keyboard.dismiss} rippleColor={'transparent'}>
      <BasicLayout>

        <View style={styles.titleContainer}>
          <ThemedText type="title">
            Welcome to Pulsar!
          </ThemedText>
          <Image source={logo} style={styles.logo} />
        </View>

        <View>
          <ConnectionIndicator status={connectionStatus()} style={styles.indicator} />

          <Card>
            <ThemedText type="subtitle">Connect device</ThemedText>
            <AdditionalInfo connectionState={connectionState} />

            {connectionState !== 'INITIAL' && 
              <InfoBox 
                connectionState={connectionState}
                errorType={errorType}
              />}

            {(hasToken && (connectionState === 'CONNECTED_TO_SERVER' || connectionState === 'FULLY_CONNECTED' || connectionState === 'CONNECTING')) &&
              <BaseButton
                style={Margins.marginTop2X}
                onPress={handleDisconnect}>
                <ThemedText style={styles.disconnect}>Disconnect</ThemedText>
              </BaseButton>}

            {(!hasToken || connectionState === 'DISCONNECTED' || connectionState === 'ERROR') && 
              <ConnectionForm 
                connectingCode={connectingCode} 
                setConnectingCode={setConnectingCode}
                handleOnConnect={handleOnConnect} 
                connectionState={connectionState}
                hasToken={hasToken}
              />}

          </Card>
        </View>

        {showPatternNotification && <PatternIsPlaying found={patternFound} />}

      </BasicLayout>
    </BaseButton>
  </SafeAreaView>
}

function AdditionalInfo({ connectionState }: { connectionState: ConnectionState }) {
  const getMessage = () => {
    switch (connectionState) {
      case 'INITIAL':
        return 'Checking device connection...';
      case 'FULLY_CONNECTED':
        return 'Everything is ready, you can start testing the presets.';
      default:
        return 'Connect your haptic device first. Pair it with the app now so you can test the presets.';
    }
  };

  return (
    <ThemedText style={Margins.marginTop2X}>
      {getMessage()}
    </ThemedText>
  );
}

function ConnectionForm({
  connectingCode, 
  setConnectingCode,
  handleOnConnect,
  connectionState,
  hasToken,
}: {
  connectingCode: string;
  setConnectingCode: (code: string) => void;
  handleOnConnect: (hasToken: boolean, code: string) => void;
  connectionState: ConnectionState;
  hasToken: boolean;
}) {
  const [applyAnimation, setApplyAnimation] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setApplyAnimation(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);
  return (<Animated.View layout={applyAnimation ? LinearTransition : undefined}>
    <Input 
      placeholder='Connecting code' 
      style={Margins.marginTop4X}
      value={connectingCode}
      onChangeText={setConnectingCode}
    />
    <Button
      label='Connect'
      style={Margins.marginTop3X}
      state={connectionState === 'CONNECTING' ? 'loading' : 'default'}
      onClick={() => handleOnConnect(hasToken, connectingCode)}
    />
    <Collapsible title="How to connect a device? 🤔" style={Margins.marginTop4X}>
      <Point index={1}>
        <ThemedText>
          Open Pulsar documentation on Presets playground and find Device Connection section.
        </ThemedText>
      </Point>
      <Point index={2}>
        <ThemedText>
          Scan QR code or type Pairing code into PulsarApp and click Connect button.
        </ThemedText>
      </Point>
      <Point index={3}>
        <ThemedText>
          Select one of the presets on the website and experience the haptics right on your device.
        </ThemedText>
      </Point>
    </Collapsible>
  </Animated.View>);
}

function InfoBox({ connectionState, errorType }: { connectionState: ConnectionState; errorType: ErrorType }) {
  const getInfoBoxContent = () => {
    switch (connectionState) {
      case 'CONNECTING':
        return { text: 'Connecting to server...', style: styles.infoBoxTextDefault };
      case 'CONNECTED_TO_SERVER':
        return { text: 'Waiting for browser connection...', style: styles.infoBoxTextWaiting };
      case 'FULLY_CONNECTED':
        return { text: 'You are connected with the browser!', style: styles.infoBoxText };
      case 'ERROR':
        const errorMessage = errorType === 'INVALID_DATA' 
          ? 'Invalid data. Please try again.' 
          : 'Unable to connect with the server!';
        return { text: errorMessage, style: styles.infoBoxTextFail };
      default:
        return null;
    }
  };

  const content = getInfoBoxContent();
  
  if (!content) {
    return null;
  }

  return (
    <Animated.View style={[Margins.marginTop4X, styles.infoBox]} entering={FadeIn} exiting={FadeOut}>
      <ThemedText style={content.style}>{content.text}</ThemedText>
    </Animated.View>
  );
}

function PatternIsPlaying({ found }: { found: boolean }) {
  return (
    <Card style={Margins.marginTop4X} enableAnimation={true}>
      <ThemedText type="defaultSemiBold">
        {found ? 'New pattern received!' : 'Preset not found!'}
      </ThemedText>
    </Card>
  );
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
  infoBoxTextDefault: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#001A72',
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
  infoBoxTextWaiting: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffac59',
  },
  disconnect: {
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
