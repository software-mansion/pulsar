import { Image } from 'expo-image';
import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, Text, TouchableOpacity } from 'react-native';

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

const logo = require('@/assets/images/logo.png');

export default function HomeScreen() {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'waiting'>('disconnected');

  const handleOnConnect = () => {
    setConnectionStatus('waiting');
    setTimeout(() => {
      setConnectionStatus('connected');
    }, 2000);
  }

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
          <ThemedText style={styles.marginTop2X}>
            Connect your haptic device first. Pair it with the app now so you can test the presets.
          </ThemedText>

          {connectionStatus === 'connected' && <>
            <View style={[styles.marginTop4X, styles.infoBox]}>
              <ThemedText style={styles.infoBoxText}>You are connected with the browser!</ThemedText>
            </View>

            <TouchableOpacity style={styles.marginTop2X} onPress={() => setConnectionStatus('disconnected')}>
              <ThemedText style={styles.disconnect}>
                Disconnect
              </ThemedText>
            </TouchableOpacity>
          </>}

          {connectionStatus !== 'connected' && <>
            <Input placeholder='Connecting code' style={styles.marginTop4X} />
            <Button
              label='Connect'
              style={styles.marginTop3X}
              state={connectionStatus === 'waiting' ? 'loading' : 'default'}
              onPress={handleOnConnect}
            />
            <Collapsible title="How to connect a device? 🤔" style={styles.marginTop4X}>
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

          {/* <Link href="/modal">
            <Link.Trigger>
              <ThemedText type="subtitle">Step 2: Explore</ThemedText>
            </Link.Trigger>
            <Link.Preview />
            <Link.Menu>
              <Link.MenuAction title="Action" icon="cube" onPress={() => alert('Action pressed')} />
              <Link.MenuAction
                title="Share"
                icon="square.and.arrow.up"
                onPress={() => alert('Share pressed')}
              />
              <Link.Menu title="More" icon="ellipsis">
                <Link.MenuAction
                  title="Delete"
                  icon="trash"
                  destructive
                  onPress={() => alert('Delete pressed')}
                />
              </Link.Menu>
            </Link.Menu>
          </Link> */}

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
  marginTop1X: {
    marginTop: 5,
  },
  marginTop2X: {
    marginTop: 10,
  },
  marginTop3X: {
    marginTop: 15,
  },
  marginTop4X: {
    marginTop: 20,
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
  disconnect: {
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
});
