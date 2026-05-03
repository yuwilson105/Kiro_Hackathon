import { router } from 'expo-router';

import { WelcomeFlow } from '@/components/demo/welcome-flow';

export default function DemoWelcomeScreen() {
  return <WelcomeFlow onExit={() => router.back()} />;
}
