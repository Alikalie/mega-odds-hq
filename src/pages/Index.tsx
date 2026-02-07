import { motion } from "framer-motion";
import { AppLayout } from "@/components/layout/AppLayout";
import { VipBanner } from "@/components/home/VipBanner";
import { TipCategoryGrid } from "@/components/home/TipCategoryGrid";
import { useTipCategories } from "@/hooks/useTipCategories";

const Index = () => {
  const { data: categories, isLoading } = useTipCategories();

  return (
    <AppLayout>
      <div className="flex flex-col min-h-[calc(100vh-8rem)]">
        {/* VIP Banner */}
        <VipBanner />

        {/* Categories Grid */}
        <div className="flex-1 px-4 py-6">
          <TipCategoryGrid
            categories={categories || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
