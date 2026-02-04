import { ReactNode, useState } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { InfoDialog } from "@/components/dialogs/InfoDialog";

interface AppLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  showInfo?: boolean;
}

export const AppLayout = ({
  children,
  showHeader = true,
  showNav = true,
  showInfo = true,
}: AppLayoutProps) => {
  const [infoOpen, setInfoOpen] = useState(false);

  return (
    <div className="app-container">
      {showHeader && (
        <Header showInfo={showInfo} onInfoClick={() => setInfoOpen(true)} />
      )}
      <main className="flex-1 pb-20">{children}</main>
      {showNav && <BottomNav />}
      <InfoDialog open={infoOpen} onOpenChange={setInfoOpen} />
    </div>
  );
};
