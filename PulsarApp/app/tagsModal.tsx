import { router } from 'expo-router';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { ThemedText } from '@/components/themed-text';
import { Tabs, Tab } from '@/components/Tabs';
import { TagDescription } from '@/components/TagDescription';
import { TagsInfo } from '@/constants/Tags';
import { Icon } from '@/components/Icon';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TagsModal() {

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <ThemedText type="subtitle">Preset tags</ThemedText>
          <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
            <Icon name="x" size={30} color="#001A72" />
          </TouchableOpacity>
        </View>
        
        <View style={styles.tabsContainer}>
          <Tabs defaultTab={0}>
            {TagsInfo.map((group, groupIndex) => (
              <Tab key={groupIndex} name={group.groupName}>
                <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                  {group.tags.map((tag, tagIndex) => (
                    <TagDescription
                      key={tagIndex}
                      name={tag.name}
                      description={tag.description}
                      usage={tag.usage}
                    />
                  ))}
                </ScrollView>
              </Tab>
            ))}
          </Tabs>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: 'white',
  },
  container: {
    flex: 1,
    paddingTop: 10,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 5,
  },
  closeButton: {
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 0,
  },
  tabsContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 15,
  },
});
