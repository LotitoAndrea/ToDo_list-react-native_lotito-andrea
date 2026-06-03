// Entry point dell'app — reindirizza alla lista Board

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/(tabs)/boards" />;
}
