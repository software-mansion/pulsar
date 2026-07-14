import Card from '@/components/Card';
import { ThemedText } from '@/components/themed-text';
import { Margins } from '@/constants/theme';

export default function PatternIsPlaying({ found, name }: { found: boolean; name: string }) {
  return (
    <Card style={Margins.marginTop4X} enableAnimation={true}>
      <ThemedText type="defaultSemiBold">
        {found ? `${name} is playing!` : 'Preset not found!'}
      </ThemedText>
    </Card>
  );
}
