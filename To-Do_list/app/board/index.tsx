// Vecchia route — redirige alla nuova lista board
import { Redirect } from 'expo-router';
export default function OldBoardRedirect() {
  return <Redirect href={'/(tabs)/boards' as any} />;
}
