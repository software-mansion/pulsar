import React from 'react';
import { View } from 'react-native';
import { StateSwipe } from './StateSwipe';
import { StateTap } from './StateTap';

interface Props {
  children?: React.ReactNode;
  state: number;
}

function OnboardingOverlay({ style, children, state }: Props & { style?: React.ComponentProps<typeof View>['style'] }) {
  return (<>
    {state === 1 && <StateTap>{children}</StateTap>}
    {state === 2 && <StateSwipe>{children}</StateSwipe>}
    {state === 3 && children}
  </>);
};

export default OnboardingOverlay;