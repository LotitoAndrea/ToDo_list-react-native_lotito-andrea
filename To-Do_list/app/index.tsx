// Entry point dell'app — reindirizza alla Board Kanban

import { Redirect } from 'expo-router';

export default function Index() {
  return <Redirect href="/board" />;
}
