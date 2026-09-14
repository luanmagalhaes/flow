import { AppShell } from "@/components/layout/AppShell";
import { GameApp } from "@/components/game/GameApp";

export default function Home() {
  return (
    <AppShell>
      <GameApp />
    </AppShell>
  );
}
